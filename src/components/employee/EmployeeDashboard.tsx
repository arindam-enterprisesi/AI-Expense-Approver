
/**
 * EmployeeDashboard component displays all proposals for the current employee.
 *
 * Props:
 *  - proposals: Array of Proposal objects
 *  - onDeleteProposal: (optional) Callback to delete a proposal
 *  - employeeId: Employee ID
 *  - employeeName: Employee name
 *  - employeeEmail: Employee email
 *  - department: Employee department
 *  - onProposalCreated: Callback when proposal is created from Gmail
 *
 * Features:
 *  - Shows summary stats (total, pending, approved, total amount)
 *  - Lists all proposals with status, actions, and links
 *  - Gmail integration for auto-syncing receipts
 *  - Allows creation of new reports
 */
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Proposal } from '@/pages/Index';
import { GmailSyncWidget } from './GmailSyncWidget';

interface EmployeeDashboardProps {
  proposals: Proposal[];
  onDeleteProposal?: (proposalId: string) => void;
  employeeId?: string;
  employeeName?: string;
  employeeEmail?: string;
  department?: string;
  onProposalCreated?: (proposal: Proposal) => void;
}



export function EmployeeDashboard({
  proposals,
  onDeleteProposal,
  employeeId = 'emp001',
  employeeName = 'Employee',
  employeeEmail = 'employee@company.com',
  department = 'Sales',
  onProposalCreated,
}: EmployeeDashboardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'partially_approved':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'partially_approved':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'under_review' || p.status === 'draft').length,
    approved: proposals.filter(p => p.status === 'approved' || p.status === 'partially_approved').length,
    totalAmount: proposals.reduce((sum, p) => sum + p.totalAmount, 0)
  };

  // console.log("Proposals:", proposals);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reimbursements</h1>
          <p className="text-gray-600 mt-1">Manage your expense reimbursement reports</p>
        </div>
        <Link to="/create-proposal">
          <Button className="bg-[#5ABA47] hover:bg-[#4a9c3a] text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </Link>
      </div>

      {/* Gmail Sync Widget */}
      <GmailSyncWidget
        employeeId={employeeId}
        employeeName={employeeName}
        employeeEmail={employeeEmail}
        department={department}
        onProposalCreated={(proposal) => {
          if (onProposalCreated) {
            onProposalCreated(proposal);
          }
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[#5ABA47]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-[#5ABA47]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#5ABA47]" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
              <p className="text-gray-600 mb-4">Create your first reimbursement report to get started.</p>
              <Link to="/create-proposal">
                <Button className="bg-[#5ABA47] hover:bg-[#4a9c3a] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="border border-gray-200 rounded-lg p-6 hover:border-[#5ABA47] hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <Link to={`/proposal/${proposal.id}`} className="block">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(proposal.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{proposal.tripPurpose}</h3>
                        <p className="text-sm text-gray-600">{proposal.tripLocation}</p>
                      </div>
                    </div>
                    </Link>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(proposal.status)}>
                        {proposal.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {proposal.status === 'draft' && (
                        <Link to={`/edit-proposal/${proposal.id}`}>
                          <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-800">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      {onDeleteProposal && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-800"
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm('Are you sure you want to delete this report?')) {
                              onDeleteProposal(proposal.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <Link to={`/proposal/${proposal.id}`} className="block">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="ml-2 font-medium">${proposal.totalAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Receipts:</span>
                        <span className="ml-2 font-medium">{proposal.receipts.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Trip Dates:</span>
                        <span className="ml-2 font-medium">
                          {new Date(proposal.tripDates.start).toLocaleDateString()} - {new Date(proposal.tripDates.end).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <span className="ml-2 font-medium">
                          {proposal.submittedAt ? new Date(proposal.submittedAt).toLocaleDateString() : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
