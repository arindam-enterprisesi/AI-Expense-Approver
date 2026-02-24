/**
 * Receipt Detector Service
 * Detects receipt attachments and classifies them
 * Uses heuristics to identify receipt-related files
 */

import { GmailAttachment } from './gmail.service';

export interface DetectReceiptResult {
  attachment: GmailAttachment;
  isReceipt: boolean;
  confidence: number;
  fileType: 'image' | 'pdf' | 'unknown';
  reason: string;
}

class ReceiptDetector {
  private receiptKeywords = [
    'receipt', 'invoice', 'expense', 'bill', 'reimbursement',
    'charge', 'payment', 'hotel', 'flight', 'restaurant',
    'airline', 'uber', 'taxi', 'food', 'meal', 'gas',
    'parking', 'toll', 'train', 'bus', 'transaction'
  ];

  private receiptFilePatterns = [
    /receipt/i,
    /invoice/i,
    /expense/i,
    /bill/i,
    /itemized/i,
    /statement/i,
    /confirmation/i,
    /order/i,
  ];

  private nonReceiptPatterns = [
    /resume/i,
    /cv/i,
    /contract/i,
    /agreement/i,
    /document/i,
    /memo/i,
    /letter/i,
    /presentation/i,
  ];

  /**
   * Detect if an attachment is likely a receipt
   */
  detectReceipt(attachment: GmailAttachment, emailSubject: string = ''): DetectReceiptResult {
    const filename = attachment.filename.toLowerCase();
    const mimeType = attachment.mimeType;
    const fileType = this.classifyFileType(mimeType);

    // Must be an image or PDF
    if (!['image', 'pdf'].includes(fileType)) {
      return {
        attachment,
        isReceipt: false,
        confidence: 0,
        fileType,
        reason: `Unsupported file type: ${mimeType}`,
      };
    }

    // Check for non-receipt patterns (exclusions)
    for (const pattern of this.nonReceiptPatterns) {
      if (pattern.test(filename)) {
        return {
          attachment,
          isReceipt: false,
          confidence: 0,
          fileType,
          reason: `Filename matches non-receipt pattern: ${pattern.source}`,
        };
      }
    }

    let confidence = 0.1; // Base confidence for being image/PDF

    // Check filename for receipt patterns
    for (const pattern of this.receiptFilePatterns) {
      if (pattern.test(filename)) {
        confidence += 0.4;
        break;
      }
    }

    // Check email subject for receipt keywords
    const subjectLower = emailSubject.toLowerCase();
    for (const keyword of this.receiptKeywords) {
      if (subjectLower.includes(keyword)) {
        confidence += 0.3;
        break;
      }
    }

    // Bonus: common receipt file prefixes
    if (/^(receipt|invoice|bill|expense)[-_]/i.test(filename)) {
      confidence = Math.min(1.0, confidence + 0.3);
    }

    // PDF assumption for financial documents
    if (fileType === 'pdf' && confidence > 0.1) {
      confidence = Math.min(1.0, confidence + 0.2);
    }

    // Determine if it's a receipt based on confidence threshold
    const isReceipt = confidence >= 0.4;

    return {
      attachment,
      isReceipt,
      confidence,
      fileType,
      reason: isReceipt 
        ? `Receipt detected (confidence: ${(confidence * 100).toFixed(0)}%)`
        : `Not a receipt (confidence: ${(confidence * 100).toFixed(0)}%)`
    };
  }

  /**
   * Batch detect receipts from multiple attachments
   */
  detectReceiptsInBatch(
    attachments: GmailAttachment[],
    emailMetadata?: Map<string, string>
  ): DetectReceiptResult[] {
    return attachments.map(attachment => {
      const emailSubject = emailMetadata?.get(attachment.messageId) || '';
      return this.detectReceipt(attachment, emailSubject);
    });
  }

  /**
   * Classify file type based on MIME type
   */
  private classifyFileType(mimeType: string): 'image' | 'pdf' | 'unknown' {
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    if (mimeType === 'application/pdf') {
      return 'pdf';
    }
    return 'unknown';
  }

  /**
   * Extract OCR-ready format from attachment (for image processing)
   * Converts to base64 data URL for passing to OCR service
   */
  attachmentToOCRFormat(attachment: GmailAttachment): string {
    const fileType = this.classifyFileType(attachment.mimeType);
    if (fileType !== 'image') {
      throw new Error(`Cannot extract OCR from ${attachment.mimeType}. Only images are supported.`);
    }

    // Convert uint8array to base64
    const binary = String.fromCharCode.apply(null, Array.from(attachment.data));
    const base64 = btoa(binary);
    
    return `data:${attachment.mimeType};base64,${base64}`;
  }

  /**
   * Extract text metadata from filename (e.g., date, vendor)
   */
  extractMetadataFromFilename(filename: string): {
    vendor?: string;
    date?: string;
    category?: string;
  } {
    const metadata: {
      vendor?: string;
      date?: string;
      category?: string;
    } = {};

    // Try to extract date patterns (YYYY-MM-DD or MM-DD-YYYY)
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})/);
    if (dateMatch) {
      metadata.date = dateMatch[1];
    }

    // Try to extract vendor categories from filename
    const vendorMatch = filename.match(/(hotel|flight|airline|uber|taxi|restaurant|gas|parking)/i);
    if (vendorMatch) {
      metadata.vendor = vendorMatch[1];
      
      // Map vendor to category
      const categoryMap: { [key: string]: string } = {
        hotel: 'Accommodation',
        flight: 'Transportation',
        airline: 'Transportation',
        uber: 'Transportation',
        taxi: 'Transportation',
        restaurant: 'Meals',
        gas: 'Transportation',
        parking: 'Transportation',
      };
      metadata.category = categoryMap[vendorMatch[1].toLowerCase()];
    }

    return metadata;
  }

  /**
   * Validate attachment before processing
   */
  validateAttachment(attachment: GmailAttachment): { valid: boolean; error?: string } {
    // Check file size (max 25MB for Gmail API)
    if (attachment.size && attachment.size > 25 * 1024 * 1024) {
      return { valid: false, error: `File too large: ${(attachment.size / 1024 / 1024).toFixed(2)}MB (max 25MB)` };
    }

    // Check file type
    const fileType = this.classifyFileType(attachment.mimeType);
    if (!['image', 'pdf'].includes(fileType)) {
      return { valid: false, error: `Unsupported file type: ${attachment.mimeType}` };
    }

    // Check filename
    if (!attachment.filename) {
      return { valid: false, error: 'Attachment has no filename' };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const receiptDetector = new ReceiptDetector();
