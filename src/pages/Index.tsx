
/**
 * Index.tsx is the main entry point for routing and dashboard logic.
 *
 * Features:
 *  - Handles user role switching (employee/admin)
 *  - Loads and manages proposals from local storage
 *  - Renders dashboards and pages for both roles
 *  - Provides types for Proposal and Receipt used throughout the app
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { EmployeeDashboard } from '@/components/employee/EmployeeDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import AdminMarkdownViewer from '@/components/admin/AdminMarkdownViewer';
import { AuditTrail } from '@/components/admin/AuditTrail';
import { CreateProposal } from '@/components/employee/CreateProposal';
import { EditProposal } from '@/components/employee/EditProposal';
import { ProposalDetails } from '@/components/shared/ProposalDetails';
import { storageService } from '@/lib/storage';
import AdminSampleReport from '@/components/admin/AdminSampleReport';
import { GmailCallback } from './GmailCallback';
import { LandingPage } from './LandingPage';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';

// User roles for dashboard switching
export type UserRole = 'employee' | 'admin';

/**
 * Receipt type for expense items in a proposal.
 */
export interface Receipt {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  image: string;
  aiStatus: 'accepted' | 'rejected' | 'partial' | 'pending';
  aiJustification: string;
  ocrRawText?: string;
  ocrProcessed?: boolean;
  adminOverride?: 'accepted' | 'rejected' | 'partial';
  adminNotes?: string;
  notes?: string;
  paymentMethod?: 'personal' | 'corporate' | 'cash';
}

/**
 * Proposal type for a travel reimbursement request.
 */
export interface Proposal {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  tripPurpose: string;
  tripLocation: string;
  tripDates: {
    start: string;
    end: string;
  };
  tripType: String;
  multiCityDetails: String;
  receipts: Receipt[];
  totalAmount: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'partially_approved';
  aiOverallStatus: 'accepted' | 'rejected' | 'partial' | 'pending';
  aiOverallJustification: string;
  adminDecision?: 'approved' | 'rejected' | 'partially_approved';
  adminNotes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
}

/**
 * Main dashboard and routing component.
 * Handles user state, proposal state, and navigation.
 */
const Index = () => {
  const [currentUser, setCurrentUser] = useState<UserRole>('employee');
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const state = storageService.getState();
    setCurrentUser(state.currentUser);
    setProposals(state.proposals);
  }, []);

  // Switch user role and persist to storage
  const handleSetCurrentUser = (role: UserRole) => {
    setCurrentUser(role);
    storageService.setCurrentUser(role);
  };

  // Add a new proposal and persist to storage
  const addProposal = (proposal: Proposal) => {
    setProposals(prev => [...prev, proposal]);
    storageService.addProposal(proposal);
  };

  const updateProposal = (proposalId: string, updates: Partial<Proposal>) => {
    setProposals(prev =>
      prev.map(p => p.id === proposalId ? { ...p, ...updates } : p)
    );
    // Get current user info for audit trail
    const proposal = proposals.find(p => p.id === proposalId);
    const userId = currentUser === 'admin' ? 'admin001' : proposal?.employeeId || 'unknown';
    const userName = currentUser === 'admin' ? 'Admin User' : proposal?.employeeName || 'Unknown User';

    storageService.updateProposal(proposalId, updates, userId, userName);
  };

  const deleteProposal = (proposalId: string) => {
    setProposals(prev => prev.filter(p => p.id !== proposalId));
    const proposal = proposals.find(p => p.id === proposalId);
    const userId = currentUser === 'admin' ? 'admin001' : proposal?.employeeId || 'unknown';
    const userName = currentUser === 'admin' ? 'Admin User' : proposal?.employeeName || 'Unknown User';

    storageService.deleteProposal(proposalId, userId, userName);
  };

  const handleEditProposal = (proposal: Proposal) => {
    updateProposal(proposal.id, proposal);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes - No Authentication Required */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/gmail-callback" element={<GmailCallback />} />

        {/* Protected Routes - With Navbar */}
        <Route
          path="/*"
          element={
            <>
              <Navbar currentUser={currentUser} setCurrentUser={handleSetCurrentUser} />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route
                    path="dashboard"
                    element={
                      currentUser === 'employee' ? (
                        <EmployeeDashboard
                          proposals={proposals.filter(p => p.employeeId === 'emp001')}
                          onDeleteProposal={deleteProposal}
                          employeeId="emp001"
                          employeeName="John Doe"
                          // employeeEmail="john.doe@xyz.com"
                          employeeEmail="expensemanager.ai@gmail.com"
                          department="Sales"
                          onProposalCreated={addProposal}
                        />
                      ) : (
                        <AdminDashboard
                          proposals={proposals.filter(p => p.status !== 'draft')}
                          updateProposal={updateProposal}
                        />
                      )
                    }
                  />
                  {/* Admin Markdown Viewer Route */}
                  <Route path="admin/sample-statement" element={<AdminSampleReport />} />
                  <Route path="admin/markdown-viewer" element={<AdminMarkdownViewer />} />
                  <Route
                    path="create-proposal"
                    element={<CreateProposal onSubmit={addProposal} />}
                  />
                  <Route
                    path="edit-proposal/:id"
                    element={
                      <EditProposal
                        proposals={proposals}
                        onSubmit={handleEditProposal}
                      />
                    }
                  />
                  <Route
                    path="proposal/:id"
                    element={
                      <ProposalDetails
                        proposals={proposals}
                        currentUser={currentUser}
                        updateProposal={updateProposal}
                      />
                    }
                  />
                  <Route
                    path="audit"
                    element={<AuditTrail />}
                  />
                </Routes>
              </main>
            </>
          }
        />
      </Routes>
    </div>
  );
};

export default Index;
