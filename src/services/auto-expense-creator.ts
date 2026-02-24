/**
 * Auto Expense Creator Service
 * Automatically creates expense proposals from detected receipts
 */

import { Proposal, Receipt } from '@/pages/Index';
import { DetectReceiptResult } from '@/services/receipt-detector';
import { receiptDetector } from '@/services/receipt-detector';
import { toast } from '@/hooks/use-toast';

export interface AutoExpenseOptions {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  autoSubmit?: boolean;
  defaultTripPurpose?: string;
  defaultTripLocation?: string;
}

class AutoExpenseCreator {
  /**
   * Create a receipt from detected result
   */
  createReceiptFromDetection(
    detection: DetectReceiptResult,
    ocrText?: string
  ): Omit<Receipt, 'id'> {
    const metadata = receiptDetector.extractMetadataFromFilename(
      detection.attachment.filename
    );

    // Try to extract amount from OCR text
    let amount = 0;
    if (ocrText) {
      const amountMatch = ocrText.match(/(?:total|amount|price|cost)[\s:]*\$?([\d.]+)/i);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1]);
      }
    }

    // Parse date from OCR or filename
    let receiptDate = new Date().toISOString().split('T')[0];
    if (metadata.date) {
      receiptDate = metadata.date;
    } else if (ocrText) {
      const dateMatch = ocrText.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/);
      if (dateMatch) {
        receiptDate = dateMatch[1];
      }
    }

    return {
      description: metadata.vendor || detection.attachment.filename,
      amount,
      category: metadata.category || 'Other',
      date: receiptDate,
      image: detection.attachment.filename,
      aiStatus: 'pending',
      aiJustification: '',
      ocrRawText: ocrText || '',
      ocrProcessed: !!ocrText,
      paymentMethod: 'personal',
    };
  }

  /**
   * Create a minimal proposal from detected receipts
   * Can be used as a template for employee to fill in trip details
   */
  createMinimalProposal(
    detections: DetectReceiptResult[],
    options: AutoExpenseOptions,
    receiptsWithOCR: Map<string, string> = new Map()
  ): Proposal {
    const receipts: Receipt[] = detections
      .filter(d => d.isReceipt)
      .map((detection, index) => ({
        id: `receipt_${Date.now()}_${index}`,
        ...this.createReceiptFromDetection(
          detection,
          receiptsWithOCR.get(detection.attachment.messageId)
        ),
      }));

    const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);

    // Generate proposal ID
    const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: proposalId,
      employeeId: options.employeeId,
      employeeName: options.employeeName,
      employeeEmail: options.employeeEmail,
      department: options.department,
      tripPurpose: options.defaultTripPurpose || 'Business Expense',
      tripLocation: options.defaultTripLocation || 'Not Specified',
      tripDates: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      tripType: 'single',
      multiCityDetails: '',
      receipts,
      totalAmount,
      status: 'draft',
      aiOverallStatus: 'pending',
      aiOverallJustification: 'Auto-created from Gmail receipts. Pending review.',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Batch create proposals for multiple receipt groups
   */
  batchCreateProposals(
    detectionsByTrip: Map<string, DetectReceiptResult[]>,
    options: AutoExpenseOptions,
    receiptsWithOCR: Map<string, string> = new Map()
  ): Proposal[] {
    const proposals: Proposal[] = [];

    detectionsByTrip.forEach((detections, tripKey) => {
      const proposal = this.createMinimalProposal(
        detections,
        options,
        receiptsWithOCR
      );
      proposals.push(proposal);
    });

    return proposals;
  }

  /**
   * Group receipts by date range (for trip-based grouping)
   */
  groupReceiptsByDateRange(
    detections: DetectReceiptResult[],
    daysBetweenTrips: number = 7
  ): Map<string, DetectReceiptResult[]> {
    const groups = new Map<string, DetectReceiptResult[]>();

    // Sort by date
    const sortedDetections = [...detections].sort((a, b) => {
      const metadata_a = receiptDetector.extractMetadataFromFilename(a.attachment.filename);
      const metadata_b = receiptDetector.extractMetadataFromFilename(b.attachment.filename);
      const dateA = new Date(metadata_a.date || '1970-01-01').getTime();
      const dateB = new Date(metadata_b.date || '1970-01-01').getTime();
      return dateA - dateB;
    });

    let currentGroup: DetectReceiptResult[] = [];
    let lastDate: Date | null = null;

    for (const detection of sortedDetections) {
      const metadata = receiptDetector.extractMetadataFromFilename(
        detection.attachment.filename
      );
      if (!metadata.date) continue;

      const currentDate = new Date(metadata.date);

      if (lastDate) {
        const daysDiff = Math.floor(
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff > daysBetweenTrips) {
          // Start new group
          if (currentGroup.length > 0) {
            const tripKey = `trip_${lastDate.toISOString().split('T')[0]}`;
            groups.set(tripKey, currentGroup);
          }
          currentGroup = [detection];
        } else {
          currentGroup.push(detection);
        }
      } else {
        currentGroup.push(detection);
      }

      lastDate = currentDate;
    }

    // Add final group
    if (currentGroup.length > 0) {
      const tripKey = `trip_${lastDate?.toISOString().split('T')[0] || 'unknown'}`;
      groups.set(tripKey, currentGroup);
    }

    return groups;
  }

  /**
   * Validate proposal before saving
   */
  validateProposal(proposal: Proposal): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!proposal.employeeId) errors.push('Missing employee ID');
    if (!proposal.employeeName) errors.push('Missing employee name');
    if (!proposal.department) errors.push('Missing department');
    if (!proposal.tripPurpose || proposal.tripPurpose === 'Business Expense') {
      errors.push('Trip purpose should be specified');
    }
    if (proposal.receipts.length === 0) {
      errors.push('At least one receipt is required');
    }
    if (proposal.totalAmount <= 0) {
      errors.push('Total amount must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const autoExpenseCreator = new AutoExpenseCreator();
