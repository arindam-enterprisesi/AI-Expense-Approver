# Gmail Integration Setup Guide

This document provides step-by-step instructions to set up Gmail integration for automatic receipt syncing.

## Overview

The Gmail integration allows employees to:
- Connect their Gmail accounts securely
- Auto-detect receipt attachments (images and PDFs)
- Automatically extract receipt metadata
- Create expense proposals with a single click

## Prerequisites

- A Google Cloud Console account
- Access to create and configure OAuth 2.0 credentials
- The application running on `http://localhost:8080` (for development)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it (e.g., "AI Travel Expense Manager")
4. Click "Create"

## Step 2: Enable Gmail API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Gmail API"
3. Click on "Gmail API"
4. Click **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth Client ID**
3. If prompted, configure the OAuth consent screen first:
   - Go to **APIs & Services** → **OAuth Consent Screen**
   - Choose **External** (if not available in your organization)
   - Fill in the required fields:
     - App name: "AI Travel Expense Manager"
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes by clicking **Add or Remove Scopes**
   - Search for and add:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
   - Save and continue

4. Back to Credentials, click **Create Credentials** → **OAuth Client ID**
5. Select **Web application**
6. Name it: "AI Expense App"
7. Under **Authorized redirect URIs**, add:
   - `http://localhost:8080/gmail-callback`
   - `http://localhost:8080/` (for production, add your domain)
8. Click **Create**
9. Copy the **Client ID** and **Client Secret** from the modal

## Step 4: Configure Environment Variables

Create a `.env.local` file in the project root with:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
VITE_GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting the Gemini API Key

1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Create an API key for the project
3. Restrict it to **Gemini API** (for security)
4. Copy the key to `VITE_GOOGLE_GEMINI_API_KEY`

## Step 5: Update Package Dependencies

The Gmail integration requires additional dependencies. The `package.json` has been updated with:

```bash
npm install
# or
bun install
```

This installs:
- `@googleapis/gmail` - Gmail API client
- `@google-cloud/local-auth` - Local authentication
- `@google-cloud/storage` - Cloud storage utilities

## Feature Architecture

### Components

- **GmailSyncWidget** (`src/components/employee/GmailSyncWidget.tsx`)
  - UI component for Gmail sync interface
  - Handles OAuth authentication flow
  - Displays detected receipts with preview
  - Creates proposals from selected receipts

### Services

- **GmailService** (`src/services/gmail.service.ts`)
  - Handles OAuth 2.0 authentication
  - Fetches emails with receipt-related keywords
  - Extracts attachment data
  - Manages token refresh and storage

- **ReceiptDetector** (`src/services/receipt-detector.ts`)
  - Detects receipt attachments using heuristics
  - Classifies file types (image/PDF)
  - Extracts metadata from filenames and content
  - Validates attachments before processing

- **AutoExpenseCreator** (`src/services/auto-expense-creator.ts`)
  - Creates expense proposals from detected receipts
  - Groups receipts by date for multi-trip proposals
  - Validates proposal data
  - Integrates with OCR for text extraction

### Hooks

- **useGmailIntegration** (`src/hooks/use-gmail.ts`)
  - React hook for Gmail operations
  - Manages sync state and loading
  - Provides utilities for receipt processing
  - Handles error management and user feedback

## Usage

### For Employees

1. **Navigate to Dashboard**
   - Go to Employee Dashboard
   - Look for "Gmail Integration" card

2. **Authenticate**
   - Click "Connect Gmail Account"
   - Authorize the app to access your Gmail
   - You'll be redirected back automatically

3. **Sync Receipts**
   - Click "Sync Emails"
   - App searches for emails with receipt attachments
   - Auto-detects and classifies attachments

4. **Review & Select**
   - Preview detected receipts
   - Check confidence scores
   - Select receipts to include in proposal

5. **Create Proposal**
   - Click "Create Proposal with X Receipt(s)"
   - Review and fill in trip details
   - Submit for approval

## Detection Algorithm

The receipt detector uses multiple heuristics:

1. **File Type Check**
   - Accepts: JPG, PNG, PDF only
   - Rejects: Documents, videos, archives

2. **Filename Analysis**
   - Detects receipt keywords: "receipt", "invoice", "expense"
   - Extracts vendor: "hotel", "flight", "restaurant", etc.
   - Extracts date if present

3. **Email Subject Analysis**
   - Scores based on receipt-related keywords
   - Contextual matching with attachment filenames

4. **Confidence Scoring**
   - Base: 10% for valid file types
   - +40% for receipt filename match
   - +30% for receipt keyword in subject
   - +30% for filename pattern match
   - +20% bonus for PDF files

5. **Minimum Threshold**
   - Default: 40% confidence required
   - Configurable via `minConfidence` option

## Data Flow

```
Gmail Inbox
    ↓
[sync request]
    ↓
Gmail API fetches emails with attachments
    ↓
Receipt Detector analyzes each attachment
    ↓
Confidence scoring and classification
    ↓
Display to employee with previews
    ↓
Employee selects receipts
    ↓
AutoExpenseCreator creates proposal
    ↓
OCR processes images for text extraction
    ↓
AI analyzes proposal and receipts
    ↓
Proposal saved to local storage
    ↓
Admin review and approval
```

## Security Considerations

1. **OAuth Tokens**
   - Stored in browser localStorage
   - Refresh tokens used for long-term access
   - Tokens expire after 1 hour (default OAuth timing)
   - Automatic refresh before expiration

2. **API Keys**
   - Never exposed in client-side requests for sensitive APIs
   - Use environment variables for secure storage
   - Google API handles rate limiting

3. **Email Access**
   - Limited to receipt-related emails
   - Read-only access by default
   - Employee can disconnect any time

4. **Data Privacy**
   - Receipts processed client-side when possible
   - No server storage of email data
   - User can delete proposals and logs

## Troubleshooting

### "Not authenticated with Gmail"
- Ensure you've connected your account
- Check if session has expired - reconnect
- Clear browser cache if issues persist

### "Failed to fetch emails"
- Verify Gmail API is enabled in Google Cloud Console
- Check Client ID and Secret in `.env.local`
- Ensure email has attachments
- Check internet connectivity

### "Receipt detection confidence too low"
- Attachment filename should include receipt keywords
- Email subject should mention expense/receipt
- Supported formats: JPG, PNG, PDF only
- Try adjusting `minConfidence` in hook options

### OAuth Redirect Issues
- Production URL must be added to authorized redirect URIs
- For localhost, ensure exactly `http://localhost:8080`
- Clear cookies if switching between environments

## Configuration Options

### GmailSyncWidget Props

```typescript
interface GmailSyncWidgetProps {
  employeeId: string;           // Required
  employeeName: string;         // Required
  employeeEmail: string;        // Required
  department: string;           // Required
  onProposalCreated?: (proposal: Proposal) => void;
}
```

### useGmailIntegration Options

```typescript
interface GmailSyncOptions {
  maxEmails?: number;           // Default: 15 (max emails to fetch)
  autoProcess?: boolean;        // Default: true (auto-detect receipts)
  minConfidence?: number;       // Default: 0.4 (40%)
}
```

## Testing

### Development Testing

1. Use test Gmail accounts
2. Upload sample receipts to test emails
3. Verify receipt detection confidence
4. Test proposal creation flow
5. Verify data in local storage

### Sample Email Setup

Create test emails with:
- Subject: "Travel Reimbursement - Q4 2024 Trip"
- Attachments: expense receipt images/PDFs
- Test both high and low confidence scenarios

## Production Deployment

### Pre-Deployment Checklist

- [ ] Google Cloud project created
- [ ] OAuth 2.0 credentials configured
- [ ] Production domain added to authorized redirect URIs
- [ ] Environment variables set for production
- [ ] HTTPS enabled on production domain
- [ ] Rate limiting configured
- [ ] Error monitoring in place

### Deployment Steps

1. Update `.env.production` with production credentials
2. Add production domain to Google OAuth
3. Build the application: `bun run build`
4. Deploy to production server
5. Update redirect URI if needed
6. Test end-to-end with real Gmail account

## Future Enhancements

- [ ] Receipt OCR text extraction pre-loading
- [ ] Multi-threaded attachment processing
- [ ] Receipt duplicate detection
- [ ] Automatic amount extraction and categorization
- [ ] Scheduled background sync
- [ ] Integration with backend API
- [ ] Support for Google Drive attachments
- [ ] Email template standardization

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review Google Cloud Console for API errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

## References

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
