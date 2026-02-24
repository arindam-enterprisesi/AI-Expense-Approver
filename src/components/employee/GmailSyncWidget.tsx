/**
 * GmailSyncWidget Component
 * Provides UI for syncing receipts from Gmail inbox
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGmailIntegration } from '@/hooks/use-gmail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader, Mail, AlertCircle, CheckCircle2, Zap, Image as ImageIcon } from 'lucide-react';
import { DetectReceiptResult } from '@/services/receipt-detector';
import { Proposal, Receipt } from '@/pages/Index';
import { autoExpenseCreator, AutoExpenseOptions } from '@/services/auto-expense-creator';

export interface GmailSyncWidgetProps {
  onProposalCreated?: (proposal: Proposal) => void;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
}

export function GmailSyncWidget({
  onProposalCreated,
  employeeId,
  employeeName,
  employeeEmail,
  department,
}: GmailSyncWidgetProps) {
  const navigate = useNavigate();
  const gmail = useGmailIntegration({
    maxEmails: 15,
    autoProcess: true,
    minConfidence: 0.3,
  });

  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<DetectReceiptResult | null>(null);

  // Check for OAuth callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code && !gmail.state.isAuthenticated) {
      gmail.handleOAuthCallback(code).then(success => {
        if (success) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }, []);

  const handleSelectReceipt = (index: number) => {
    const newSelected = new Set(selectedReceipts);
    const receiptId = `receipt_${index}`;
    
    if (newSelected.has(receiptId)) {
      newSelected.delete(receiptId);
    } else {
      newSelected.add(receiptId);
    }
    
    setSelectedReceipts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedReceipts.size === gmail.state.receipts.length) {
      setSelectedReceipts(new Set());
    } else {
      const all = new Set(
        gmail.state.receipts.map((_, i) => `receipt_${i}`)
      );
      setSelectedReceipts(all);
    }
  };

  const handleCreateProposal = async () => {
    if (selectedReceipts.size === 0) {
      return;
    }

    setIsCreatingProposal(true);

    try {
      // Get selected receipts
      const selectedDetections = gmail.state.receipts.filter(
        (_, i) => selectedReceipts.has(`receipt_${i}`)
      );

      const prefilledReceipts = selectedDetections.map((detection, index) => {
        const base = autoExpenseCreator.createReceiptFromDetection(detection);
        const imageUrl = detection.fileType === 'image'
          ? gmail.getReceiptPreviewUrl(detection)
          : '/ReceiptPlaceholder.png';

        return {
          id: `gmail_${Date.now()}_${index}`,
          description: base.description || detection.attachment.filename,
          amount: base.amount || 0,
          category: base.category || 'Other',
          date: base.date || '',
          image: imageUrl,
          notes: base.notes || '',
          ocrRawText: base.ocrRawText || '',
          ocrProcessed: false,
          paymentMethod: base.paymentMethod || 'personal',
          aiStatus: 'pending' as const,
          aiJustification: '',
        };
      });

      // Extract trip purpose from receipts (use categories or descriptions)
      const inferTripPurpose = (): string => {
        // Collect all categories and descriptions
        const categories = prefilledReceipts.map(r => r.category).filter(Boolean);
        const descriptions = prefilledReceipts.map(r => r.description).filter(Boolean);
        
        // If we have specific categories, use them to infer purpose
        const categorySet = new Set(categories.map(c => c.toLowerCase()));
        
        if (categorySet.has('lodging') || categorySet.has('hotel')) {
          return 'Business Trip with Accommodation';
        } else if (categorySet.has('transportation') || categorySet.has('flight') || categorySet.has('travel')) {
          return 'Business Travel';
        } else if (categorySet.has('meals') || categorySet.has('food')) {
          return 'Business Meals';
        } else if (categorySet.has('conference') || categorySet.has('training')) {
          return 'Conference/Training Event';
        }
        
        // Use first receipt's description as fallback
        if (descriptions.length > 0) {
          const firstDesc = descriptions[0];
          // Extract meaningful part (remove file extensions, dates)
          const cleanDesc = firstDesc
            .replace(/\.(pdf|jpg|jpeg|png)$/i, '')
            .replace(/\d{4}-\d{2}-\d{2}/g, '')
            .trim();
          
          if (cleanDesc && cleanDesc.length > 3 && cleanDesc !== 'Gmail Auto-Captured Expenses') {
            return `Expense: ${cleanDesc.substring(0, 50)}`;
          }
        }
        
        // Final fallback
        return categories.length > 0 
          ? `${categories[0]} Expenses`
          : 'Business Expenses';
      };

      const validDates = prefilledReceipts
        .map(r => r.date)
        .filter(Boolean)
        .map(d => new Date(d))
        .filter(d => !isNaN(d.getTime()));

      // Start date is the earliest receipt date
      const startDate = validDates.length
        ? new Date(Math.min(...validDates.map(d => d.getTime()))).toISOString().split('T')[0]
        : '';
      
      // End date is 2 days after the start date
      const endDate = validDates.length
        ? (() => {
            const start = new Date(Math.min(...validDates.map(d => d.getTime())));
            const end = new Date(start);
            end.setDate(end.getDate() + 2); // Add 2 days
            return end.toISOString().split('T')[0];
          })()
        : '';

      const prefillProposal: Proposal = {
        id: `gmail_draft_${Date.now()}`,
        employeeId,
        employeeName,
        employeeEmail,
        department,
        tripPurpose: inferTripPurpose(),
        tripLocation: '',
        tripDates: {
          start: startDate,
          end: endDate,
        },
        tripType: 'single',
        multiCityDetails: '',
        receipts: prefilledReceipts,
        totalAmount: prefilledReceipts.reduce((sum, r) => sum + (typeof r.amount === 'string' ? parseFloat(r.amount) : r.amount), 0),
        status: 'draft',
        aiOverallStatus: 'pending',
        aiOverallJustification: '',
        createdAt: new Date().toISOString(),
      };

      // Reset selections and navigate to Create Proposal with prefilled data
      setSelectedReceipts(new Set());
      gmail.resetReceipts();
      navigate('/create-proposal', { state: { prefillProposal } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create proposal';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsCreatingProposal(false);
    }
  };

  const handleShowPreview = (receipt: DetectReceiptResult) => {
    setPreviewReceipt(receipt);
    setShowPreview(true);
  };

  if (!gmail.state.isAuthenticated) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Gmail Integration
          </CardTitle>
          <CardDescription>
            Connect your Gmail account to automatically sync receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={gmail.authenticate}
            disabled={gmail.state.isAuthenticating}
            className="w-full bg-[#5ABA47] hover:bg-[#4a9c3a] text-white"
            size="lg"
          >
            {gmail.state.isAuthenticating ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <img src="/google-gmail-svgrepo-com.svg" alt="Gmail" className="w-5 h-5 mr-2" />
            )}
            {gmail.state.isAuthenticating ? 'Connecting...' : 'Connect Gmail Account'}
          </Button>
          <p className="text-sm text-gray-600 mt-4">
            We'll securely access your inbox to find receipts and attachments with your permission.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Gmail Receipt Sync
            </span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Connected
            </Badge>
          </CardTitle>
          <CardDescription>
            {employeeEmail}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gmail.state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{gmail.state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={gmail.syncEmails}
              disabled={gmail.state.isLoading}
              className="flex-1 bg-[#5ABA47] hover:bg-[#4a9c3a] text-white"
            >
              {gmail.state.isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              {gmail.state.isLoading ? 'Syncing...' : 'Sync Emails'}
            </Button>
            <Button
              onClick={gmail.logout}
              variant="outline"
            >
              Disconnect
            </Button>
          </div>

          {gmail.state.totalCount > 0 && (
            <div className="text-sm text-gray-600 space-y-2">
              <p>📧 Found {gmail.state.totalCount} email(s) with attachments</p>
              <p>📄 Processing receipts...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {gmail.state.receipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Detected Receipts ({gmail.state.receipts.length})
            </CardTitle>
            <CardDescription>
              Select receipts to create an expense proposal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Select All */}
              <div className="flex items-center gap-2 p-2 border-b pb-3">
                <Checkbox
                  checked={selectedReceipts.size === gmail.state.receipts.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  Select All ({selectedReceipts.size}/{gmail.state.receipts.length})
                </span>
              </div>

              {/* Receipt Items */}
              {gmail.state.receipts.map((receipt, index) => (
                <div
                  key={`receipt_${index}`}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={selectedReceipts.has(`receipt_${index}`)}
                    onCheckedChange={() => handleSelectReceipt(index)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {receipt.fileType === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                      ) : (
                        <span className="text-sm font-medium text-red-600">PDF</span>
                      )}
                      <p className="font-medium text-sm truncate">
                        {receipt.attachment.filename}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={receipt.isReceipt ? 'default' : 'secondary'}
                        className={receipt.isReceipt ? 'bg-green-100 text-green-800' : ''}
                      >
                        {receipt.isReceipt ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {receipt.isReceipt ? 'Receipt' : 'Not a Receipt'}
                      </Badge>
                      
                      <span className="text-xs text-gray-500">
                        Confidence: {(receipt.confidence * 100).toFixed(0)}%
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShowPreview(receipt)}
                        className="ml-auto"
                      >
                        Preview
                      </Button>
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-1">
                      {receipt.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedReceipts.size > 0 && (
              <Button
                onClick={handleCreateProposal}
                disabled={isCreatingProposal}
                className="w-full bg-[#5ABA47] hover:bg-[#4a9c3a] text-white"
                size="lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isCreatingProposal ? 'Submitting...' : `Submit for Review (${selectedReceipts.size} Receipt(s))`}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewReceipt?.attachment.filename}</DialogTitle>
            <DialogDescription>
              Confidence: {(previewReceipt?.confidence || 0) * 100}%
            </DialogDescription>
          </DialogHeader>
          
          {previewReceipt && (
            <div className="space-y-4">
              {previewReceipt.fileType === 'image' ? (
                <img
                  src={gmail.getReceiptPreviewUrl(previewReceipt)}
                  alt="Receipt preview"
                  className="w-full border rounded-lg max-h-96 object-contain"
                />
              ) : (
                <div className="border rounded-lg p-8 text-center text-gray-600">
                  <p>📄 PDF Preview</p>
                  <p className="text-sm mt-2">
                    PDF preview not available in this view
                  </p>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                <p><strong>File:</strong> {previewReceipt.attachment.filename}</p>
                <p><strong>Type:</strong> {previewReceipt.fileType.toUpperCase()}</p>
                <p><strong>Size:</strong> {(previewReceipt.attachment.size || 0) / 1024}KB</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
