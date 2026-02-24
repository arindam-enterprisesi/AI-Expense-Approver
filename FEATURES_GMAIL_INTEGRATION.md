# Gmail Integration Feature Documentation

## Feature Overview

The Gmail integration feature enables automatic receipt extraction and expense proposal creation directly from employee Gmail inboxes. This reduces manual data entry and accelerates the reimbursement process.

### Key Capabilities

✅ **Gmail Account Connection** - OAuth 2.0 secure authentication  
✅ **Automatic Receipt Detection** - ML-powered attachment classification  
✅ **Batch Processing** - Process multiple receipts at once  
✅ **Receipt Preview** - Preview images before proposal creation  
✅ **Metadata Extraction** - Auto-extract date, vendor, amount from filenames  
✅ **Proposal Auto-Creation** - Generate draft proposals instantly  
✅ **Confidence Scoring** - Know which receipts are high confidence  

## Architecture

### High-Level Flow

```
Employee Dashboard
    │
    ├─→ Gmail Auth (OAuth 2.0)
    │       └─→ Secure token storage
    │
    ├─→ Email Sync
    │       └─→ Fetch emails with attachments
    │
    ├─→ Receipt Detection
    │       └─→ Classify attachments (receipt/non-receipt)
    │       └─→ Confidence scoring
    │
    ├─→ Preview & Select
    │       └─→ Display detected receipts
    │       └─→ Employee selects which to include
    │
    └─→ Proposal Creation
            └─→ Auto-populate receipt data
            └─→ Generate proposal draft
            └─→ Employee fills trip details
            └─→ Submit for AI analysis

```

## Component Architecture

### 1. GmailSyncWidget Component
**File**: `src/components/employee/GmailSyncWidget.tsx`

The main UI component that orchestrates the entire flow.

**Features**:
- OAuth connection button
- Email sync trigger
- Receipt list with selection
- Receipt preview modal
- Proposal creation button

**Props**:
```typescript
{
  employeeId: string;              // Employee ID
  employeeName: string;            // Employee name
  employeeEmail: string;           // Gmail address
  department: string;              // Department
  onProposalCreated?: (proposal: Proposal) => void;  // Callback on proposal creation
}
```

**State Management**:
- Uses `useGmailIntegration` hook for all operations
- Manages selected receipts locally
- Handles preview dialog state

### 2. Gmail Service
**File**: `src/services/gmail.service.ts`

Handles all Gmail API interactions.

**Key Methods**:

```typescript
// OAuth Flow
initiateOAuthFlow(): void
exchangeCodeForToken(code: string): Promise<boolean>
refreshAccessToken(): Promise<boolean>

// Email Operations
fetchReceiptEmails(maxResults: number): Promise<GmailEmail[]>
getMessageDetails(messageId: string): Promise<GmailEmail | null>

// Attachments
extractReceiptAttachments(emails: GmailEmail[]): Promise<GmailAttachment[]>
getAttachmentData(messageId: string, partId: string): Promise<Uint8Array>

// Utilities
isAuthenticated(): boolean
logout(): void
attachmentToBlob(attachment: GmailAttachment): Blob
attachmentToDataUrl(attachment: GmailAttachment): string
```

**Search Query**:
```
filename:pdf OR 
filename:jpg OR 
filename:png OR 
filename:jpeg OR 
has:attachment receipt OR 
receipt OR 
expense OR 
reimbursement
```

### 3. Receipt Detector Service
**File**: `src/services/receipt-detector.ts`

Intelligently identifies receipt attachments.

**Key Methods**:

```typescript
// Detection
detectReceipt(attachment: GmailAttachment, emailSubject?: string): DetectReceiptResult
detectReceiptsInBatch(attachments: GmailAttachment[]): DetectReceiptResult[]

// Processing
attachmentToOCRFormat(attachment: GmailAttachment): string
extractMetadataFromFilename(filename: string): {vendor?, date?, category?}

// Validation
validateAttachment(attachment: GmailAttachment): {valid: boolean, error?: string}
```

**Detection Algorithm**:

1. **File Type Validation**
   - Accepts: image/jpeg, image/png, application/pdf
   - Rejects: documents, videos, archives

2. **Exclusion Patterns**
   - Filters out: resumes, CVs, contracts, presentations
   - Pattern matching against filename

3. **Receipt Keywords**
   - Searches filename and email subject
   - Keywords: receipt, invoice, expense, bill, hotel, flight, etc.

4. **Confidence Scoring**
   - Base confidence: 0.1 (10%) for valid file types
   - Filename patterns: +40%
   - Subject keywords: +30%
   - Special filename prefixes: +30%
   - PDF bonus: +20%
   - Total max: 1.0 (100%)

5. **Metadata Extraction**
   - **Date**: Extracts YYYY-MM-DD or MM-DD-YYYY from filename
   - **Vendor**: Matches against: hotel, flight, airline, uber, taxi, restaurant, gas, parking
   - **Category**: Maps vendor to expense category

### 4. Auto Expense Creator Service
**File**: `src/services/auto-expense-creator.ts`

Generates proposals from detected receipts.

**Key Methods**:

```typescript
// Proposal Generation
createReceiptFromDetection(detection: DetectReceiptResult, ocrText?: string): Receipt
createMinimalProposal(detections: DetectReceiptResult[], options: AutoExpenseOptions): Proposal
batchCreateProposals(detectionsByTrip: Map<string, DetectReceiptResult[]>): Proposal[]

// Receipt Grouping
groupReceiptsByDateRange(detections: DetectReceiptResult[], daysBetweenTrips?: number): Map<string, DetectReceiptResult[]>

// Validation
validateProposal(proposal: Proposal): {valid: boolean, errors: string[]}
```

**Proposal Generation Logic**:

1. Creates receipt object with:
   - Description from filename/vendor
   - Amount (extracted from filename or OCR)
   - Category (mapped from vendor)
   - Date (from filename or current date)
   - Auto-detected metadata

2. Generates proposal with:
   - Unique proposal ID
   - Employee information
   - Trip date range (auto-filled with current date)
   - Calculated total amount
   - Status: "draft"
   - AI status: "pending"

### 5. useGmailIntegration Hook
**File**: `src/hooks/use-gmail.ts`

React hook providing state management and operations.

**State**:
```typescript
{
  isLoading: boolean;              // Sync/processing loading state
  isAuthenticating: boolean;       // OAuth flow state
  isAuthenticated: boolean;        // Auth status
  error: string | null;            // Error message
  emails: GmailEmail[];            // Fetched emails
  receipts: DetectReceiptResult[]; // Detected receipts
  processedCount: number;          // Count of detected receipts
  totalCount: number;              // Total emails processed
}
```

**Methods**:
```typescript
authenticate(): Promise<void>                      // Initiate OAuth
handleOAuthCallback(code: string): Promise<boolean> // Handle redirect
syncEmails(): Promise<boolean>                     // Fetch emails
processReceiptAttachments(): Promise<void>        // Detect receipts
logout(): void                                    // Disconnect

// Utilities
getReceiptPreviewUrl(result: DetectReceiptResult): string
getOCRFormat(result: DetectReceiptResult): string
extractMetadata(result: DetectReceiptResult): object
refreshAuthStatus(): void
```

**Options**:
```typescript
{
  maxEmails?: number;      // Default: 15 (max emails to fetch)
  autoProcess?: boolean;   // Default: true (auto-detect receipts)
  minConfidence?: number;  // Default: 0.4 (40% confidence threshold)
}
```

## Data Structures

### GmailEmail Interface
```typescript
{
  id: string;                    // Gmail message ID
  threadId: string;              // Gmail thread ID
  from: string;                  // Sender email
  to: string;                    // Recipient email
  subject: string;               // Email subject
  date: string;                  // Email date
  snippet: string;               // Email preview
  parts?: EmailPart[];           // Message parts (attachments, body)
}
```

### GmailAttachment Interface
```typescript
{
  filename: string;              // Attachment filename
  mimeType: string;              // MIME type (image/pdf, etc.)
  data: Uint8Array;              // Binary attachment data
  messageId: string;             // Source email ID
  size?: number;                 // File size in bytes
}
```

### DetectReceiptResult Interface
```typescript
{
  attachment: GmailAttachment;   // The attachment
  isReceipt: boolean;            // Receipt classification
  confidence: number;            // Confidence score (0-1)
  fileType: 'image' | 'pdf' | 'unknown';
  reason: string;                // Explanation for result
}
```

### Proposal Generation
```typescript
{
  id: string;                    // Unique proposal ID
  employeeId: string;            // Employee ID
  employeeName: string;          // Employee name
  employeeEmail: string;         // Employee email
  department: string;            // Department
  tripPurpose: string;          // Trip purpose or "Gmail Auto-Captured Expenses"
  tripLocation: string;         // Trip location (not specified initially)
  tripDates: {                  // Trip date range
    start: string;              // ISO date
    end: string;                // ISO date
  };
  receipts: Receipt[];          // Auto-generated receipts
  totalAmount: number;          // Sum of receipt amounts
  status: 'draft';              // Always starts as draft
  aiOverallStatus: 'pending';   // Awaits AI analysis
  createdAt: string;            // Creation timestamp
}
```

## User Workflows

### Workflow 1: Complete Receipt Sync

1. **Employee clicks "Connect Gmail Account"**
   - `GmailSyncWidget` calls `authenticate()`
   - Redirected to Google OAuth consent screen
   - User grants permissions

2. **OAuth Callback**
  - Browser redirected to `http://localhost:8080/gmail-callback?code=...`
   - `handleOAuthCallback()` exchanges code for tokens
   - Tokens stored in localStorage

3. **Employee clicks "Sync Emails"**
   - `syncEmails()` fetches emails with receipt keywords
   - Up to 15 emails fetched concurrently
   - Total time: ~3-5 seconds

4. **Auto-Detection (if enabled)**
   - `processReceiptAttachments()` downloads all attachments
   - `ReceiptDetector` analyzes each file
   - Confidence scoring applied
   - Results displayed with preview thumbnails

5. **Employee Selects Receipts**
   - Checkboxes for each receipt
   - Can preview images/PDFs
   - "Select All" option available

6. **Create Proposal**
   - Clicks "Create Proposal"
   - `AutoExpenseCreator` generates proposal
   - Receipt data auto-populated
   - Proposal added to dashboard

7. **Complete Proposal**
   - Employee fills in trip details
   - Reviews auto-populated amounts
   - Submits for AI analysis
   - Admin reviews and approves

### Workflow 2: Smart Receipt Grouping

For employees with multiple trips:

```typescript
// Group by date ranges (default: 7 day gaps)
const groups = autoExpenseCreator.groupReceiptsByDateRange(receipts, 7);

// Creates separate proposals per trip:
// { "trip_2024-01-15": [receipt1, receipt2], ... }
// { "trip_2024-02-20": [receipt3, receipt4], ... }
```

## Error Handling

### Authentication Errors
- **"Not authenticated"**: User needs to connect Gmail
- **"Token refresh failed"**: Session expired, reconnect
- **"OAuth callback failed"**: Check Client ID/Secret

### Email Sync Errors
- **"Failed to fetch emails"**: Check Gmail API enabled
- **"No emails to process"**: No matching emails found
- **"Attachment download failed"**: File too large or corrupt

### Receipt Detection Errors
- **"Unsupported file type"**: Only JPG, PNG, PDF supported
- **"File too large"**: Max 25MB (Gmail limit)
- **"Confidence too low"**: Adjust minConfidence threshold

### Proposal Creation Errors
- **"At least one receipt required"**: Select receipts first
- **"Missing required fields"**: Check employee info
- **"Validation failed"**: Check receipt amounts > 0

## Security & Privacy

### Token Management
- Access tokens: 1 hour expiration
- Refresh tokens: Stored in localStorage
- Auto-refresh: 5 minutes before expiration
- Logout: Clears all stored tokens

### Data Handling
- Attachments downloaded to browser only
- Never stored on server
- User can delete proposals anytime
- Audit trail tracks all actions

### OAuth Scopes
- `gmail.readonly`: Read email and attachments
- `gmail.modify`: Mark emails as read (optional)
- No ability to send emails or access other data

## Performance Considerations

### Optimization Strategies

1. **Parallel Processing**
   - Fetch all attachments concurrently
   - Detect multiple receipts simultaneously
   - Process metadata in batch

2. **Caching**
   - Cache email list for quick refresh
   - Store receipt previews as data URLs
   - Reuse confidence scores

3. **Lazy Loading**
   - Load attachment data on-demand
   - Generate previews only when requested
   - Defer OCR processing until needed

### Performance Metrics

Typical operation times:
- Email sync: 2-5 seconds (15 emails)
- Attachment download: 1-3 seconds (10 attachments)
- Receipt detection: <1 second
- Proposal creation: <500ms

## Testing Checklist

- [ ] Gmail authentication works
- [ ] Token refresh succeeds
- [ ] Email search finds receipt emails
- [ ] Attachment download completes
- [ ] Receipt detection classifies correctly
- [ ] Confidence scores make sense
- [ ] PDF preview works
- [ ] Image preview works
- [ ] Proposal creation generates valid data
- [ ] Proposal appears in dashboard
- [ ] Logout clears tokens
- [ ] AI analysis works on auto-proposals
- [ ] Admin can review auto-proposals

## Future Enhancements

### Phase 2: Advanced Detection
- [ ] OCR text extraction (Tesseract already installed)
- [ ] Amount detection from OCR
- [ ] Vendor & merchant name detection
- [ ] Receipt barcode/QR code scanning

### Phase 3: Automation
- [ ] Scheduled automatic syncs
- [ ] Email labels for processed items
- [ ] Duplicate receipt detection
- [ ] Fraud detection using AI

### Phase 4: Integration
- [ ] Backend API integration
- [ ] Multi-user deployment
- [ ] Payment method tracking
- [ ] Bulk export functionality
- [ ] Mobile native app support

## Troubleshooting Guide

### Common Issues & Solutions

**Issue**: "VITE_GOOGLE_CLIENT_ID is not configured"
- **Solution**: Check `.env.local` has correct value

**Issue**: OAuth redirect fails
- **Solution**: Verify `http://localhost:8080` in authorized URIs

**Issue**: No emails found
- **Solution**: Ensure Gmail has emails with attachments with receipt keywords

**Issue**: Receipts not detected
- **Solution**: Check filename contains receipt keywords, increase minConfidence

**Issue**: "Unsupported file type"
- **Solution**: Only JPG, PNG, PDF supported. Convert other formats.

**Issue**: Proposal amounts are zero
- **Solution**: Filename must contain vendor or OCR amounts, or manually edit

## Code Examples

### Using the Hook Directly

```typescript
import { useGmailIntegration } from '@/hooks/use-gmail';

function MyComponent() {
  const gmail = useGmailIntegration({
    maxEmails: 20,
    minConfidence: 0.35
  });

  const handleSync = async () => {
    const success = await gmail.syncEmails();
    if (success) {
      console.log(`Found ${gmail.state.receipts.length} receipts`);
    }
  };

  return (
    <button onClick={handleSync} disabled={gmail.state.isLoading}>
      Sync Emails
    </button>
  );
}
```

### Creating Proposals Programmatically

```typescript
import { autoExpenseCreator } from '@/services/auto-expense-creator';
import { receiptDetector } from '@/services/receipt-detector';

// Assuming you have detected receipts
const detections = [/* receipt detection results */];

const proposal = autoExpenseCreator.createMinimalProposal(
  detections,
  {
    employeeId: 'emp001',
    employeeName: 'John Doe',
    employeeEmail: 'john@company.com',
    department: 'Sales',
    defaultTripPurpose: 'Q4 2024 Conference',
    defaultTripLocation: 'San Francisco, CA'
  }
);

// Validate before saving
const validation = autoExpenseCreator.validateProposal(proposal);
if (validation.valid) {
  // Save to storage
  storageService.addProposal(proposal);
}
```

---

**Last Updated**: February 2024  
**Maintainer**: Development Team  
**Version**: 1.0.0
