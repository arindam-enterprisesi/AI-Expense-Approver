/**
 * useGmailIntegration Hook
 * Provides React hook for Gmail operations and receipt syncing
 */

import { useState, useCallback } from 'react';
import { gmailService, GmailEmail, GmailAttachment } from '@/services/gmail.service';
import { receiptDetector, DetectReceiptResult } from '@/services/receipt-detector';
import { toast } from '@/hooks/use-toast';

export interface GmailSyncState {
  isLoading: boolean;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  error: string | null;
  emails: GmailEmail[];
  receipts: DetectReceiptResult[];
  processedCount: number;
  totalCount: number;
}

export interface GmailSyncOptions {
  maxEmails?: number;
  autoProcess?: boolean;
  minConfidence?: number;
}

export function useGmailIntegration(options: GmailSyncOptions = {}) {
  const {
    maxEmails = 15,
    autoProcess = true,
    minConfidence = 0.4,
  } = options;

  const [state, setState] = useState<GmailSyncState>({
    isLoading: false,
    isAuthenticating: false,
    isAuthenticated: gmailService.isAuthenticated(),
    error: null,
    emails: [],
    receipts: [],
    processedCount: 0,
    totalCount: 0,
  });

  /**
   * Authenticate with Gmail
   */
  const authenticate = useCallback(async () => {
    setState(prev => ({ ...prev, isAuthenticating: true, error: null }));
    try {
      gmailService.initiateOAuthFlow();
      toast({
        title: "Redirecting to Google",
        description: "You'll be redirected to Google to authorize Gmail access",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: errorMessage,
      }));
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, []);

  /**
   * Handle OAuth callback
   */
  const handleOAuthCallback = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isAuthenticating: true, error: null }));
    try {
      const success = await gmailService.exchangeCodeForToken(code);
      if (success) {
        setState(prev => ({
          ...prev,
          isAuthenticating: false,
          isAuthenticated: true,
        }));
        toast({
          title: "Success",
          description: "Gmail account connected successfully",
        });
        return true;
      } else {
        throw new Error('Failed to exchange code for token');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OAuth callback failed';
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: errorMessage,
      }));
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, []);

  /**
   * Fetch receipt emails from Gmail
   */
  const syncEmails = useCallback(async () => {
    if (!gmailService.isAuthenticated()) {
      setState(prev => ({
        ...prev,
        error: 'Not authenticated. Please authenticate with Gmail first.',
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const emails = await gmailService.fetchReceiptEmails(maxEmails);
      setState(prev => ({
        ...prev,
        emails,
        totalCount: emails.length,
      }));

      toast({
        title: "Emails Synced",
        description: `Found ${emails.length} emails with potential receipts`,
      });

      if (autoProcess) {
        await processReceiptAttachments(emails);
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync emails';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast({
        title: "Sync Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [maxEmails, autoProcess]);

  /**
   * Process receipt attachments from synced emails
   */
  const processReceiptAttachments = useCallback(async (emailsOverride?: GmailEmail[]) => {
    const emailsToProcess = emailsOverride ?? state.emails;

    if (emailsToProcess.length === 0) {
      setState(prev => ({
        ...prev,
        error: 'No emails to process. Sync emails first.',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Extract all attachments
      const attachments = await gmailService.extractReceiptAttachments(emailsToProcess);

      // Create email metadata map for subject matching
      const emailMetadata = new Map(
        emailsToProcess.map(email => [email.id, email.subject])
      );

      // Detect receipts
      const detectedReceipts = receiptDetector.detectReceiptsInBatch(
        attachments,
        emailMetadata
      );

      // Filter by confidence threshold
      const confirmedReceipts = detectedReceipts.filter(
        r => r.confidence >= minConfidence
      );

      setState(prev => ({
        ...prev,
        receipts: confirmedReceipts,
        processedCount: confirmedReceipts.filter(r => r.isReceipt).length,
        isLoading: false,
      }));

      toast({
        title: "Processing Complete",
        description: `Detected ${confirmedReceipts.filter(r => r.isReceipt).length} receipts out of ${attachments.length} attachments`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process attachments';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast({
        title: "Processing Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [state.emails, minConfidence]);

  const resetReceipts = useCallback(() => {
    setState(prev => ({
      ...prev,
      receipts: [],
      processedCount: 0,
    }));
  }, []);

  /**
   * Get receipt attachment for preview
   */
  const getReceiptPreviewUrl = useCallback((result: DetectReceiptResult): string => {
    try {
      if (result.fileType === 'image') {
        return receiptDetector.attachmentToOCRFormat(result.attachment);
      } else {
        // For PDFs, use object URL
        const blob = gmailService.attachmentToBlob(result.attachment);
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error('Error generating preview URL:', error);
      return '';
    }
  }, []);

  /**
   * Get OCR-ready format for receipt processing
   */
  const getOCRFormat = useCallback((result: DetectReceiptResult): string => {
    if (result.fileType !== 'image') {
      throw new Error('Only images can be processed with OCR');
    }
    return receiptDetector.attachmentToOCRFormat(result.attachment);
  }, []);

  /**
   * Extract metadata from receipt filename
   */
  const extractMetadata = useCallback((result: DetectReceiptResult) => {
    return receiptDetector.extractMetadataFromFilename(result.attachment.filename);
  }, []);

  /**
   * Logout from Gmail
   */
  const logout = useCallback(() => {
    gmailService.logout();
    setState({
      isLoading: false,
      isAuthenticating: false,
      isAuthenticated: false,
      error: null,
      emails: [],
      receipts: [],
      processedCount: 0,
      totalCount: 0,
    });
    toast({
      title: "Logged Out",
      description: "Disconnected from Gmail",
    });
  }, []);

  /**
   * Check current authentication status
   */
  const refreshAuthStatus = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAuthenticated: gmailService.isAuthenticated(),
    }));
  }, []);

  return {
    // State
    state,
    
    // Actions
    authenticate,
    handleOAuthCallback,
    syncEmails,
    processReceiptAttachments,
    resetReceipts,
    logout,
    refreshAuthStatus,
    
    // Utils
    getReceiptPreviewUrl,
    getOCRFormat,
    extractMetadata,
  };
}
