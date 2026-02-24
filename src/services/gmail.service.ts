/**
 * Gmail Service Module
 * Handles Gmail API authentication and email operations
 * Supports OAuth 2.0 based authentication
 */

export interface GmailEmail {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  parts?: EmailPart[];
}

export interface EmailPart {
  mimeType: string;
  filename?: string;
  data?: string;
  size?: number;
  attachmentId?: string;
}

export interface GmailAttachment {
  filename: string;
  mimeType: string;
  data: Uint8Array;
  messageId: string;
  size?: number;
}

class GmailService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiryTime: number = 0;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = import.meta.env.VITE_GMAIL_REDIRECT_URI || 'http://localhost:8080/gmail-callback';
    
    // Load tokens from localStorage if available
    this.loadTokensFromStorage();
  }

  /**
   * Initialize OAuth flow by redirecting to Google
   */
  initiateOAuthFlow(): void {
    if (!this.clientId) {
      throw new Error('Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to .env');
    }

    const scope = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ].join(' ');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');

    window.location.href = authUrl.toString();
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string): Promise<boolean> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.expiryTime = Date.now() + (data.expires_in * 1000);

      this.saveTokensToStorage();
      return true;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.expiryTime = Date.now() + (data.expires_in * 1000);

      this.saveTokensToStorage();
      return true;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return false;
    }
  }

  /**
   * Ensure valid access token before making API calls
   */
  private async ensureValidToken(): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    // Refresh if token expires in next 5 minutes
    if (Date.now() > this.expiryTime - 300000) {
      return await this.refreshAccessToken();
    }

    return true;
  }

  /**
   * Fetch emails from inbox with receipt-related keywords
   */
  async fetchReceiptEmails(maxResults: number = 10): Promise<GmailEmail[]> {
    if (!await this.ensureValidToken()) {
      throw new Error('Not authenticated with Gmail');
    }

    const query = 'filename:pdf OR filename:jpg OR filename:png OR filename:jpeg OR has:attachment receipt OR receipt OR expense OR reimbursement';

    try {
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.statusText}`);
      }

      const data = await response.json();
      const messages = data.messages || [];

      // Fetch full message details for each email
      const emails = await Promise.all(
        messages.map((msg: any) => this.getMessageDetails(msg.id))
      );

      return emails.filter((email): email is GmailEmail => email !== null);
    } catch (error) {
      console.error('Error fetching receipt emails:', error);
      throw error;
    }
  }

  /**
   * Get full message details including headers and parts
   */
  private async getMessageDetails(messageId: string): Promise<GmailEmail | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch message: ${response.statusText}`);
      }

      const data = await response.json();
      const headers = data.payload.headers || [];

      const getHeader = (name: string) => {
        const header = headers.find((h: any) => h.name === name);
        return header?.value || '';
      };

      return {
        id: data.id,
        threadId: data.threadId,
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        snippet: data.snippet,
        parts: this.extractParts(data.payload),
      };
    } catch (error) {
      console.error(`Error fetching message ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Extract all parts from email payload (body + attachments)
   */
  private extractParts(payload: any): EmailPart[] {
    const parts: EmailPart[] = [];

    const walk = (part: any) => {
      if (!part) return;

      if (part.parts) {
        part.parts.forEach((child: any) => walk(child));
      }

      const body = part.body || {};
      const hasContent = part.filename || body.attachmentId || body.data;

      if (hasContent) {
        parts.push({
          mimeType: part.mimeType,
          filename: part.filename,
          data: body.data,
          size: body.size,
          attachmentId: body.attachmentId,
        });
      }
    };

    walk(payload);
    return parts;
  }

  /**
   * Download attachment data
   */
  async getAttachmentData(messageId: string, attachmentId: string): Promise<Uint8Array> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch attachment: ${response.statusText}`);
      }

      const data = await response.json();
      return this.decodeBase64ToBytes(data.data);
    } catch (error) {
      console.error(`Error fetching attachment ${attachmentId}:`, error);
      throw error;
    }
  }

  /**
   * Extract receipt attachments from emails
   */
  async extractReceiptAttachments(emails: GmailEmail[]): Promise<GmailAttachment[]> {
    const attachments: GmailAttachment[] = [];
    const receiptMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    for (const email of emails) {
      if (!email.parts) continue;

      for (const part of email.parts) {
        if (receiptMimeTypes.includes(part.mimeType) && part.filename) {
          try {
            let data: Uint8Array | null = null;

            if (part.data) {
              data = this.decodeBase64ToBytes(part.data);
            } else if (part.attachmentId) {
              data = await this.getAttachmentData(email.id, part.attachmentId);
            }

            if (!data) {
              console.warn(`Attachment data missing for ${part.filename}`);
              continue;
            }

            attachments.push({
              filename: part.filename,
              mimeType: part.mimeType,
              data,
              messageId: email.id,
              size: part.size,
            });
          } catch (error) {
            console.error(`Failed to download attachment ${part.filename}:`, error);
          }
        }
      }
    }

    return attachments;
  }

  private decodeBase64ToBytes(data: string): Uint8Array {
    const binaryString = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && Date.now() < this.expiryTime;
  }

  /**
   * Logout and clear tokens
   */
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiryTime = 0;
    localStorage.removeItem('gmail_tokens');
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokensToStorage(): void {
    const tokens = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiryTime: this.expiryTime,
    };
    localStorage.setItem('gmail_tokens', JSON.stringify(tokens));
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage(): void {
    try {
      const stored = localStorage.getItem('gmail_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.expiryTime = tokens.expiryTime;
      }
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
    }
  }

  /**
   * Convert attachment data to blob for image preview
   */
  attachmentToBlob(attachment: GmailAttachment): Blob {
    return new Blob([attachment.data], { type: attachment.mimeType });
  }

  /**
   * Convert attachment to data URL for preview
   */
  attachmentToDataUrl(attachment: GmailAttachment): string {
    const blob = this.attachmentToBlob(attachment);
    return URL.createObjectURL(blob);
  }
}

// Export singleton instance
export const gmailService = new GmailService();
