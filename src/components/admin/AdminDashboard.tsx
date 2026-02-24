
/**
 * AdminDashboard component displays all proposals for admin review and approval.
 *
 * Props:
 *  - proposals: Array of Proposal objects
 *  - updateProposal: Callback to update a proposal (approve/reject/notes)
 *
 * Features:
 *  - Shows summary stats (total, pending, approved, rejected, total amount)
 *  - Allows filtering/searching proposals by status, employee, or trip
 *  - Lists all proposals with status, AI status, and actions
 *  - Used for admin review and approval flows
 */
import { useState } from 'react';
import { Shield, Search, Filter, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Proposal } from '@/pages/Index';

interface AdminDashboardProps {
  proposals: Proposal[];
  updateProposal: (proposalId: string, updates: Partial<Proposal>) => void;
}

export function AdminDashboard({ proposals, updateProposal }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.tripPurpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.tripLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'under_review').length,
    approved: proposals.filter(p => p.status === 'approved' || p.status === 'partially_approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
    totalAmount: proposals.reduce((sum, p) => sum + p.totalAmount, 0)
  };

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
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const getAIStatusIcon = (aiStatus: string) => {
    switch (aiStatus) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-[#5ABA47]" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Review and manage employee reimbursement reports</p>
        </div>
        <div>
        <Link to="/admin/sample-statement">
          <Button variant="outline" className="ml-4">View Sample Statement</Button>
        </Link>
        <Link to="/admin/markdown-viewer">
          <Button variant="outline" className="ml-4">View Admin Docs</Button>
        </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-[#5ABA47]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Shield className="h-8 w-8 text-[#5ABA47]" />
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

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
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

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by employee name, trip purpose, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#5ABA47] focus:outline-none focus:ring-1 focus:ring-[#5ABA47]"
              >
                <option value="all">All Status</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="partially_approved">Partially Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-[#5ABA47]" />
            Reports for Review ({filteredProposals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProposals.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map((proposal) => (
                <Link key={proposal.id} to={`/proposal/${proposal.id}`}>
                  <div className="border border-gray-200 rounded-lg p-6 hover:border-[#5ABA47] hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${proposal.employeeName}`}
                          alt={proposal.employeeName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{proposal.employeeName}</h3>
                          <p className="text-sm text-gray-600">{proposal.department} • {proposal.employeeEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          {getAIStatusIcon(proposal.aiOverallStatus)}
                          <span>AI: {proposal.aiOverallStatus.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900">{proposal.tripPurpose}</h4>
                      <p className="text-sm text-gray-600">{proposal.tripLocation}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">AI Analysis:</span>
                        <div className="flex items-center space-x-1">
                          {getAIStatusIcon(proposal.aiOverallStatus)}
                          <span className="text-xs font-medium">
                            {proposal.receipts.filter(r => r.aiStatus === 'accepted').length}A / 
                            {proposal.receipts.filter(r => r.aiStatus === 'partial').length}P / 
                            {proposal.receipts.filter(r => r.aiStatus === 'rejected').length}R
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
