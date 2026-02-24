# Gmail Integration - Quick Reference Guide

## Files Created/Modified

### Core Services (New)
| File | Purpose | Key Classes |
|------|---------|-------------|
| `src/services/gmail.service.ts` | Gmail API & OAuth | `GmailService` |
| `src/services/receipt-detector.ts` | Receipt classification | `ReceiptDetector` |
| `src/services/auto-expense-creator.ts` | Proposal generation | `AutoExpenseCreator` |

### React Components (New)
| File | Purpose | Exports |
|------|---------|---------|
| `src/components/employee/GmailSyncWidget.tsx` | Gmail UI widget | `GmailSyncWidget` |

### Hooks (New)
| File | Purpose | Exports |
|------|---------|---------|
| `src/hooks/use-gmail.ts` | Gmail state & operations | `useGmailIntegration` |

### Components (Modified)
| File | Changes |
|------|---------|
| `src/components/employee/EmployeeDashboard.tsx` | Added Gmail widget integration, new props |
| `src/pages/Index.tsx` | Pass employee info to dashboard |

### Configuration
| File | Purpose |
|------|---------|
| `package.json` | Added @googleapis/gmail dependencies |
| `.env.example` | Environment variables template |
| `GMAIL_SETUP_GUIDE.md` | Complete setup instructions |
| `FEATURES_GMAIL_INTEGRATION.md` | Feature documentation |

## Key Integration Points

### 1. Authentication Flow
```
Employee → GmailSyncWidget → useGmailIntegration → GmailService
                                                       ↓
                                            Google OAuth 2.0
                                                       ↓
                                            Token stored in localStorage
```

### 2. Email & Receipt Sync
```
"Sync Emails" → GmailService.fetchReceiptEmails()
                    ↓
            Gmail API (keyword search)
                    ↓
            GmailService.extractReceiptAttachments()
                    ↓
            ReceiptDetector.detectReceiptsInBatch()
                    ↓
            Display in GmailSyncWidget
```

### 3. Proposal Creation
```
Select Receipts → GmailSyncWidget 
                    ↓
            AutoExpenseCreator.createMinimalProposal()
                    ↓
            Validate & Generate Proposal
                    ↓
            useGmailIntegration state update
                    ↓
            GmailSyncWidget.onProposalCreated() callback
                    ↓
            EmployeeDashboard.addProposal()
                    ↓
            Storage saved, displayed in dashboard
```

## Getting Started

### 1. Setup Environment
```bash
# Copy example env file
cp .env.example .env.local

# Add your Google credentials
# Edit .env.local with values from Google Cloud Console
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Configure Google Cloud
Follow steps in `GMAIL_SETUP_GUIDE.md`:
1. Create Google Cloud Project
2. Enable Gmail API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:8080/gmail-callback`
5. Copy Client ID and Secret to `.env.local`

### 4. Run Application
```bash
npm run dev
# or
bun run dev
```

### 5. Test Gmail Integration
1. Go to Employee Dashboard
2. Click "Connect Gmail Account"
3. Authorize the app
4. Click "Sync Emails"
5. Select receipts and create proposal

## Component Usage

### Using GmailSyncWidget

```tsx
import { GmailSyncWidget } from '@/components/employee/GmailSyncWidget';

<GmailSyncWidget
  employeeId="emp001"
  employeeName="John Doe"
  employeeEmail="john@company.com"
  department="Sales"
  onProposalCreated={(proposal) => {
    console.log('Proposal created:', proposal);
  }}
/>
```

### Using useGmailIntegration Hook

```tsx
import { useGmailIntegration } from '@/hooks/use-gmail';

function MyComponent() {
  const gmail = useGmailIntegration({
    maxEmails: 15,
    minConfidence: 0.4
  });

  return (
    <div>
      {!gmail.state.isAuthenticated ? (
        <button onClick={gmail.authenticate}>
          Connect Gmail
        </button>
      ) : (
        <button onClick={gmail.syncEmails}>
          Sync Emails
        </button>
      )}
    </div>
  );
}
```

## Configuration Reference

### Environment Variables
```env
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=xxx
VITE_GOOGLE_GEMINI_API_KEY=xxx
```

### Hook Options
```typescript
useGmailIntegration({
  maxEmails: 15,           // How many emails to fetch
  autoProcess: true,       // Auto-detect receipts after sync
  minConfidence: 0.4       // Minimum confidence threshold (0-1)
})
```

### Widget Props
```typescript
<GmailSyncWidget
  employeeId="string"                    // Required
  employeeName="string"                  // Required
  employeeEmail="string"                 // Required
  department="string"                    // Required
  onProposalCreated={(proposal) => {}}   // Optional callback
/>
```

## Receipt Detection Confidence Levels

- **90-100%**: High confidence receipt (filename pattern match + subject match)
- **70-89%**: Good confidence (receipt keyword + PDF)
- **50-69%**: Fair confidence (filename pattern or subject keyword)
- **30-49%**: Low confidence (image file with slight keyword match)
- **<30%**: Rejected (below default threshold of 40%)

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Missing Google API Key" | Add `VITE_GOOGLE_GEMINI_API_KEY` to `.env.local` |
| OAuth redirect fails | Verify `http://localhost:8080` is in authorized URIs |
| No emails found | Ensure Gmail has emails with receipt keywords/attachments |
| Receipts not detected | Check confidence threshold, try lower `minConfidence` |
| Token expired | Automatically refreshed; if not, try reconnecting |
| File type unsupported | Only JPG, PNG, PDF supported |

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Employee Dashboard                        │
│                   (index.tsx)                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │   GmailSyncWidget          │
            │   (Component)              │
            └────────┬───────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
    ┌─────────────┐      ┌──────────────────┐
    │useGmailInt. │      │ReceiptDetector   │
    │(Hook)       │      │(Service)         │
    └──────┬──────┘      └────────┬─────────┘
           │                     │
           ▼                     ▼
     ┌──────────────┐    ┌──────────────┐
     │GmailService  │    │Attachment    │
     │(OAuth & API) │    │Classification│
     └──────┬───────┘    └──────────────┘
            │
            ▼
    ┌───────────────────┐
    │ Google Gmail API  │
    └───────────────────┘
            │
            ▼
    ┌───────────────────┐
    │ Employee's Gmail  │
    │ Inbox             │
    └───────────────────┘
            ▲
            │
        Receipts & 
        Attachments
```

## Proposal Creation Flow

```
Detected Receipts
      │
      ▼
┌────────────────────────┐
│ AutoExpenseCreator     │
├────────────────────────┤
│ createMinimalProposal() │
└────────┬───────────────┘
         │
         ├─→ Extract metadata from filenames
         │
         ├─→ Create Receipt objects
         │
         ├─→ Calculate total amount
         │
         └─→ Generate Proposal object

Proposal {
  id: "prop_xxx"
  employeeId: "emp001"
  status: "draft"
  receipts: [...]
  totalAmount: $xxx
}
         │
         ▼
    Storage & 
    Dashboard
    Display
```

## Performance Notes

- **Small files** (< 5MB): ~500ms per file
- **Batch 10 receipts**: ~5 seconds total
- **Sync + detect**: ~3-8 seconds
- **Timeout**: 30 seconds (auto-fail)

## Security Checklist

- [ ] Client Secret only in env file
- [ ] Never commit `.env.local`
- [ ] Use HTTPS in production
- [ ] Consider token expiration
- [ ] Validate all user input
- [ ] Review Gmail scopes needed

## Next Steps

1. **Setup**: Follow `GMAIL_SETUP_GUIDE.md`
2. **Test**: Connect Gmail and sync receipts
3. **Customize**: Adjust receipt detection thresholds
4. **Deploy**: Add production credentials
5. **Monitor**: Track errors and performance
6. **Enhance**: Add features from enhancement list

## Additional Resources

- [Gmail API Docs](https://developers.google.com/gmail/api)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- `FEATURES_GMAIL_INTEGRATION.md` - Detailed feature documentation
- `GMAIL_SETUP_GUIDE.md` - Setup instructions

---

**Version**: 1.0.0  
**Last Updated**: February 2024
