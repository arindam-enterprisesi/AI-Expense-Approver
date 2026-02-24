# Gmail Integration - Architecture Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI Travel Expense Manager                           │
│                          React Application                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      Employee Dashboard Component                           │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │            GmailSyncWidget Component (NEW)                           │  │
│  │                                                                      │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │  OAuth Connection Panel                                    │   │  │
│  │  │  - Connect/Disconnect Button                              │   │  │
│  │  │  - Auth Status Badge                                      │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │  Email Sync Panel                                          │   │  │
│  │  │  - Sync Emails Button                                      │   │  │
│  │  │  - Email Count Display                                     │   │  │
│  │  │  - Loading Indicator                                       │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │  Receipt Detection Results                                 │   │  │
│  │  │  ┌────────────────────────────────────────────────────┐   │   │  │
│  │  │  │ ☑ Filename.pdf         Confidence: 85%    Preview │   │   │  │
│  │  │  │ ☑ Receipt-IMG.jpg      Confidence: 92%    Preview │   │   │  │
│  │  │  │ ☑ Statement.pdf        Confidence: 65%    Preview │   │   │  │
│  │  │  │ ☐ Document.pdf         Confidence: 25%    Preview │   │   │  │
│  │  │  └────────────────────────────────────────────────────┘   │   │  │
│  │  │  - Select All/None Toggle                                 │   │  │
│  │  │  - Create Proposal Button                                 │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │  Receipt Preview Modal (Overlay)                           │   │  │
│  │  │  - Display selected receipt image/PDF                      │   │  │
│  │  │  - Show metadata (filename, size, confidence)             │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                        ▲                                    │
│                                        │                                    │
│                          Uses: useGmailIntegration()                       │
│                                        │                                    │
└────────────────────────────────────────┼────────────────────────────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            ▼                            ▼                            ▼
        ┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
        │GmailService │         │ReceiptDetect │         │AutoExpensCreate │
        │(Service)    │         │(Service)     │         │(Service)        │
        └─────────────┘         └──────────────┘         └─────────────────┘
            │                         │                         │
            │                         │                         │
            ▼                         ▼                         ▼
        ┌──────────────────────────────────────────────────────────┐
        │              Browser LocalStorage                         │
        │  - OAuth Tokens (access, refresh)                        │
        │  - Token expiry time                                     │
        │  - User preferences                                      │
        └──────────────────────────────────────────────────────────┘
            │
            │
            ▼
        ┌──────────────────────────────────────────────────────────┐
        │         Google OAuth 2.0 / Gmail API                      │
        │  (Internet Connection Required)                           │
        └──────────────────────────────────────────────────────────┘
            │
            │
            ▼
        ┌──────────────────────────────────────────────────────────┐
        │              Employee's Gmail Account                     │
        │  - Inbox emails                                           │
        │  - Attachments (receipts, images, PDFs)                  │
        └──────────────────────────────────────────────────────────┘
```

## Component Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    1. AUTHENTICATION FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

User Clicks              Browser              Google               Firebase
"Connect Gmail"       Redirects              OAuth                Tokens
    │                   │                     │                      │
    ├──────────────────►│                     │                      │
    │                   │                     │                      │
    │                   ├────────────────────►│                      │
    │                   │                     │                      │
    │                   │  [User Grants      │                      │
    │                   │   Permissions]     │                      │
    │                   │                     │                      │
    │                   │◄────────────────────┤                      │
    │                   │  Auth Code          │                      │
    │                   │                     │                      │
    │                   ├────────────────────►│                      │
    │                   │  Code Exchange      ├─────────────────────►│
    │                   │                     │                      │
    │◄──────────────────┤                     │◄─────────────────────┤
    │  Redirect         │  Tokens             │  Access/Refresh      │
    │  to App           │                     │  Tokens              │
    │                   │                     │                      │

GmailSyncWidget
    │
    ├─► handleOAuthCallback(code)
    │       │
    │       └─► GmailService.exchangeCodeForToken(code)
    │               │
    │               └─► OAuth Server exchanges code for tokens
    │
    ├─► Save tokens to localStorage
    │
    └─► Display authenticated state


┌─────────────────────────────────────────────────────────────────────────────┐
│                    2. EMAIL SYNC & RECEIPT DETECTION                         │
└─────────────────────────────────────────────────────────────────────────────┘

User Clicks                 Component              Services               Gmail
"Sync Emails"              Flow                                          API
    │                       │                         │                   │
    ├──────────────────────►│                         │                   │
    │                       │ syncEmails()            │                   │
    │                       ├────────────────────────►│                   │
    │                       │                         │ getAccessToken()  │
    │                       │                         ├──────────────────►│
    │                       │                         │◄──────────────────┤
    │                       │                         │  Access Token OK  │
    │                       │                         │                   │
    │                       │                         ├──────────────────►│
    │                       │                         │ Search emails:    │
    │                       │                         │ has:attachment    │
    │                       │                         │ filename:pdf etc. │
    │                       │                         │◄──────────────────┤
    │                       │                         │  Email IDs        │
    │                       │                         │                   │
    │                       │                         ├──────────────────►│
    │                       │                         │ Fetch each        │
    │                       │                         │ message details   │
    │                       │                         │◄──────────────────┤
    │                       │                         │  Full emails      │
    │                       │                         │  with headers     │
    │                       │                         │  and parts        │
    │                       │◄────────────────────────┤                   │
    │                       │  Array<GmailEmail>      │                   │
    │                       │                         │                   │
    │                       ├─────────────────────────────────────────────┤
    │                       │ processReceiptAttachments()                 │
    │                       │   ├─ getAttachmentData() for each           │
    │                       │   │     (downloads binary data)             │
    │                       │   │                                          │
    │                       │   └─ detectReceiptsInBatch()                │
    │                       │       ├─ Analyze filenames                  │
    │                       │       ├─ Check email subjects               │
    │                       │       ├─ Score confidence                   │
    │                       │       └─ Return DetectReceiptResult[]       │
    │                       │                                              │
    │◄──────────────────────┤                                              │
    │ Receipts displayed    │                                              │
    │ with previews         │                                              │


┌─────────────────────────────────────────────────────────────────────────────┐
│                    3. PROPOSAL CREATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

User Selects Receipts           Component              Services
& Clicks "Create Proposal"      Flow
    │                            │
    ├───────────────────────────►│
    │                            │ Selected receipts
    │                            │ from component state
    │                            │
    │                            ├──→ autoExpenseCreator.
    │                            │    createMinimalProposal()
    │                            │    ├─ createReceiptFromDetection()
    │                            │    │  ├─ extractMetadataFromFilename()
    │                            │    │  ├─ Generate Receipt object
    │                            │    │  └─ Return Receipt[]
    │                            │    │
    │                            │    └─ Generate Proposal object
    │                            │       ├─ Unique ID
    │                            │       ├─ Employee info
    │                            │       ├─ Receipt array
    │                            │       ├─ Total amount
    │                            │       ├─ Status: "draft"
    │                            │       └─ AI Status: "pending"
    │                            │
    │                            ├──→ Validate proposal
    │                            │    ├─ Check required fields
    │                            │    ├─ Verify amounts
    │                            │    └─ Return validation result
    │                            │
    │                            ├──→ onProposalCreated(proposal)
    │                            │
    │◄───────────────────────────┤
    │ Proposal created,          │
    │ Added to dashboard         │
    │                            │


┌─────────────────────────────────────────────────────────────────────────────┐
│                    4. DATA PROCESSING PIPELINE                               │
└─────────────────────────────────────────────────────────────────────────────┘

Raw Email              Email Processing           Receipt Detection           Proposal
Attachment            Pipeline                    & Scoring                   Generation
    │                     │                            │                           │
    │ (JPG/PNG/PDF)       │                            │                           │
    │                     │ Extract                    │                           │
    ├────────────────────►│ ├─ MIME type               │                           │
    │                     │ ├─ Filename                │                           │
    │                     │ ├─ Size                    │                           │
    │                     │ └─ Binary data             │                           │
    │                     │                            │                           │
    │                     ├────────────────────────────┤                           │
    │                     │                            │ Analyze                   │
    │                     │                            │ ├─ Filename pattern       │
    │                     │                            │ ├─ Vendor detection       │
    │                     │                            │ ├─ Date extraction        │
    │                     │                            │ ├─ Confidence score       │
    │                     │                            │ └─ Category mapping       │
    │                     │                            │                           │
    │                     │                            ├──────────────────────────►│
    │                     │                            │  DetectReceiptResult     │
    │                     │                            │  {                        │
    │                     │                            │    isReceipt: bool        │
    │                     │                            │    confidence: 0-1        │
    │                     │                            │    reason: string         │
    │                     │                            │    metadata: {            │
    │                     │                            │      vendor?              │
    │                     │                            │      date?                │
    │                     │                            │      category?            │
    │                     │                            │    }                      │
    │                     │                            │  }                        │
    │                     │                            │                           │
    │                     │                            │                           │ Create
    │                     │                            │                           │ ├─ Receipt obj
    │                     │                            │                           │ ├─ Amount calc
    │                     │                            │                           │ ├─ Date assign
    │                     │                            │                           │ └─ Proposal obj
    │                     │                            │                           │
    │                     │                            │                           ►
    │                     │                            │                  Proposal {
    │                     │                            │                    id
    │                     │                            │                    employeeId
    │                     │                            │                    receipts[]
    │                     │                            │                    totalAmount
    │                     │                            │                    status
    │                     │                            │                  }
```

## Detection Algorithm Flow Diagram

```
Attachment Received
        │
        ▼
┌──────────────────────────────┐
│  Validate File Type          │
│  - Check MIME type           │
│  - Supported: JPG/PNG/PDF    │
└──────────┬───────────────────┘
           │
           ├─► NO: Return isReceipt=false
           │
           ▼
    YES (0.1 base confidence)
           │
           ▼
┌──────────────────────────────┐
│  Check Exclusion Patterns    │
│  - Resume, CV, Contract      │
│  - Presentation, Document    │
└──────────┬───────────────────┘
           │
           ├─► MATCH: Return isReceipt=false (0.0 confidence)
           │
           ▼
    NO MATCH
           │
           ▼
┌──────────────────────────────┐
│  Filename Analysis           │
│  - Check receipt keywords    │
│  - Pattern matching          │
│  - Extract metadata          │
└──────────┬───────────────────┘
           │
           ├─► Keyword match: +0.4
           ├─► Pattern match: +0.3
           └─► PDF bonus: +0.2
           │
           ▼ (cumulative score)
┌──────────────────────────────┐
│  Subject Line Analysis       │
│  - Receipt keywords          │
│  - Expense context           │
└──────────┬───────────────────┘
           │
           ├─► Keyword match: +0.3
           │
           ▼ (cumulative score)
┌──────────────────────────────┐
│  Calculate Final Score       │
│  - Sum all factors           │
│  - Cap at 1.0 (100%)        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Apply Threshold             │
│  - Default: 0.4 (40%)        │
│  - Configurable              │
└──────────┬───────────────────┘
           │
           ├─► Score < 0.4: Return isReceipt=false
           │
           └─► Score >= 0.4: Return isReceipt=true
                  │
                  ▼
           DetectReceiptResult with:
           - isReceipt = true
           - confidence = calculated score
           - reason = explanation
           - metadata = extracted data
```

## Receipt Metadata Extraction Flow

```
Filename: "Hotel_2024-01-15_Marriott_SFO_$285.99.pdf"
                │
                ▼
        ┌───────────────────┐
        │ Extract Date      │
        │ Pattern:          │
        │ YYYY-MM-DD        │
        └────────┬──────────┘
                 │
                 ▼ Found: "2024-01-15"
                 └─► Metadata.date = "2024-01-15"
                 │
        ┌────────┴────────┐
        │ Extract Vendor  │
        │ Known patterns: │
        │ Hotel, Flight   │
        │ Restaurant, etc │
        └────────┬────────┘
                 │
                 ▼ Found: "Hotel", "Marriott"
                 └─► Metadata.vendor = "Hotel"
                 │
        ┌────────┴────────┐
        │ Map Category    │
        │ Vendor → Cat    │
        │ Hotel → Acc.    │
        │ Flight → Trans. │
        └────────┬────────┘
                 │
                 ▼ Mapped
                 └─► Metadata.category = "Accommodation"
                 │
        ┌────────┴──────────────┐
        │ Extract Amount        │
        │ Patterns:             │
        │ $XXX.XX               │
        │ Amount: XXX.XX        │
        └────────┬──────────────┘
                 │
                 ▼ Found: "$285.99"
                 └─► Metric.amount = 285.99
                 │
                 ▼
        Final Metadata:
        {
          date: "2024-01-15",
          vendor: "Hotel",
          category: "Accommodation",
          amount: 285.99
        }
```

## State Management Flow

```
useGmailIntegration Hook State
        │
        ├─────────────────┬────────────── ─────┬─────────┬──────────────┐
        │                 │                     │         │              │
        ▼                 ▼                     ▼         ▼              ▼
    isAuthenticated   isLoading           emails[]   receipts[]    processCount
        │                 │                 │         │              │
        │ Initial: false  │ Initial: false  │         │              │
        │                 │                 │         │              │
        │ After Auth OK   │ During sync     │         │              │
        │ → true          │ → true          │         │              │
        │                 │ After complete  │         │              │
        │                 │ → false         │         │              │
        │                 │                 │         │              │
        │                 │             Updates   Updates from      Updates
        │                 │             via       processReceipts   count
        │                 │             syncEmails() call          of docs
        │                 │                 │
        ▼                 ▼                 ▼         ▼
    Conditions        Triggers          useState  useState
    for showing       loading              │         │
    connect/disc.     spinners         Component Component
    buttons           updates         rendering  rendering
        │                 │                 │         │
        └─────────────────┴─────────────────┴─────────┘
                          │
                          ▼
                    Trigger re-renders
                    in GmailSyncWidget
                          │
                          ▼
                    Update UI display
```

---

These diagrams show:
1. **System Architecture** - Overall component structure
2. **Data Flow** - How data moves through the system
3. **Component Interactions** - Communication between major parts
4. **Detection Algorithm** - Receipt classification logic
5. **Metadata Extraction** - How data is parsed from filenames
6. **State Management** - React state changes during operations

Each diagram can be referenced to understand how different parts of the Gmail integration work together.
