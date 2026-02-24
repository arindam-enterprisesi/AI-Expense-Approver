# AI Expense Approver Documentation

## Overview

AI Expense Approver is a modern web application for managing, submitting, and reviewing travel reimbursement proposals. It leverages AI (Google Gemini via LangChain) to automate the initial review of expense reports, providing justifications and policy checks before final admin approval.

---

## Main Features

- **Employee Dashboard**: Submit, edit, and track travel reimbursement proposals.
- **Admin Dashboard**: Review, approve, or reject proposals with AI-assisted recommendations.
- **AI Integration**: Uses Google Gemini (via LangChain) to analyze proposals and receipts for policy compliance.
- **OCR Integration**: Extracts text from uploaded receipt images to reduce manual entry.
- **Audit Trail**: All actions (proposal changes, role switches, data imports) are logged for transparency.
- **Local Storage**: All data is persisted in the browser for demo and offline use.

---

## Key Processes

### 1. Proposal Submission (Employee)
- Employee fills out trip details and uploads receipts.
- OCR extracts text from receipts (optional, for convenience).
- Proposal can be saved as draft or submitted for review.
- On submission, the proposal is sent to the AI for analysis.
- AI returns a structured assessment (per-receipt and overall), which is attached to the proposal.

### 2. AI Analysis
- The AI receives the proposal, SOW, and policy documents as context.
- It reviews each receipt for compliance (amount, category, policy limits).
- Returns a JSON with status and justification for each receipt and an overall summary.

### 3. Admin Review
- Admin sees all proposals, with AI recommendations and justifications.
- Admin can override AI decisions, add notes, and approve/reject/partially approve proposals.
- All admin actions are logged in the audit trail.

### 4. Audit Trail
- Every significant action (proposal creation, update, deletion, role change, data import/export) is logged.
- Audit entries include timestamp, user, action, and a description.

---

## Main Code Files

- **src/pages/Index.tsx**: Main dashboard, routing, and state management for user roles and proposals.
- **src/components/employee/CreateProposal.tsx**: Handles proposal creation, receipt management, OCR, and AI submission.
- **src/hooks/ai-workflow.ts**: Integrates with LangChain and Google Gemini for proposal analysis.
- **src/lib/storage.ts**: Manages all persistent state and audit trail in localStorage.

---

## Technologies Used
- React (with hooks)
- TypeScript
- LangChain (for prompt and LLM orchestration)
- Google Gemini (AI model)
- Tailwind CSS (UI styling)
- React Query (data management)
- LocalStorage (persistence)

---

## Extending the App
- To add new policy rules, update the policy document in `src/assets/` and the prompt logic in `ai-workflow.ts`.
- To support new user roles or workflows, extend the types and dashboard logic in `Index.tsx`.
- For production, replace localStorage with a backend API and secure authentication.

---

## Security & Privacy
- No data leaves the browser in this demo version.
- For real deployments, ensure API keys are secured and sensitive data is handled according to company policy.

---

## Contact & Support
For questions or contributions, please contact the project maintainer or open an issue in the repository.
