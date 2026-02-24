
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock, User, MapPin, Calendar, DollarSign, Bot, Edit3 } from 'lucide-react';
import { Proposal, UserRole } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';

interface ProposalDetailsProps {
  proposals: Proposal[];
  currentUser: UserRole;
  updateProposal: (proposalId: string, updates: Partial<Proposal>) => void;
}

export function ProposalDetails({ proposals, currentUser, updateProposal }: ProposalDetailsProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const proposal = proposals.find(p => p.id === id);

  const [adminNotes, setAdminNotes] = useState(proposal?.adminNotes || '');
  const [editingReceipt, setEditingReceipt] = useState<string | null>(null);

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Report not found</h2>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'partial':
      case 'partially_approved':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'partial':
      case 'partially_approved':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleReceiptOverride = (receiptId: string, newStatus: 'accepted' | 'rejected' | 'partial') => {
    const updatedReceipts = proposal.receipts.map(receipt =>
      receipt.id === receiptId
        ? { ...receipt, adminOverride: newStatus }
        : receipt
    );

    updateProposal(proposal.id, { receipts: updatedReceipts });
    setEditingReceipt(null);

    toast({
      title: "Receipt Updated",
      description: "Receipt status has been overridden.",
    });
  };

  const handleFinalDecision = (decision: 'approved' | 'rejected' | 'partially_approved') => {
    updateProposal(proposal.id, {
      status: decision,
      adminDecision: decision,
      adminNotes,
      reviewedAt: new Date().toISOString()
    });

    toast({
      title: "Decision Submitted",
      description: `Report has been ${decision.replace('_', ' ')}.`,
    });

    navigate('/dashboard');
  };

  // const getAIReceiptStatus = (receiptId: string) => {
  //   // Find AI review matching this receipt
  //   const ai = proposal.aiAnalysis?.receipts_review?.find((r: any) => r.receipt_id === receiptId);
  //   return ai ? { status: ai.status, justification: ai.justification } : { status: undefined, justification: '' };
  // };

  const calculateApprovedAmount = () => {
    // Only include receipts with AI status "Accepted" from aiAnalysis
    if (proposal.receipts.length > 0) {
      if (proposal.aiAnalysis && Array.isArray(proposal.aiAnalysis.receipts_review)) {
        return proposal.receipts.reduce((sum, receipt) => {
          const ai = proposal.aiAnalysis.receipts_review.find((r: any) => r.receipt_id === receipt.id);
          if (ai && ai.status === 'Accepted') {
            return sum + receipt.amount;
          }
          return sum;
        }, 0);
      }
      // Fallback to legacy logic
      return proposal.receipts.reduce((sum, receipt) => {
        const status = receipt.adminOverride || receipt.aiStatus;
        if (status === 'accepted') {
          return sum + receipt.amount;
        } else if (status === 'partial') {
          return sum + (receipt.amount * 0.75);
        }
        return sum;
      }, 0);
    }else{
      return 0;
    }
  };

  // console.log("Proposal Details Rendered:", proposal.receipts[0]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{proposal.tripPurpose}</h1>
            <p className="text-gray-600 mt-1">Report #{proposal.id}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(proposal.status)}>
            {proposal.status.replace('_', ' ').toUpperCase()}
          </Badge>
          {currentUser === 'admin' && proposal.status === 'under_review' && (
            <div className="flex space-x-2">
              <Button
                onClick={() => handleFinalDecision('approved')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleFinalDecision('partially_approved')}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Partial
              </Button>
              <Button
                onClick={() => handleFinalDecision('rejected')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-[#5ABA47]" />
                Trip Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Purpose:</span>
                  <p className="mt-1 text-gray-900">{proposal.tripPurpose}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Location:</span>
                  <p className="mt-1 text-gray-900">{proposal.tripLocation}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Start Date:</span>
                  <p className="mt-1 text-gray-900">{new Date(proposal.tripDates.start).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">End Date:</span>
                  <p className="mt-1 text-gray-900">{new Date(proposal.tripDates.end).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-blue-500" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(proposal.aiOverallStatus)}
                <Badge className={getStatusColor((proposal.aiOverallStatus).toLocaleLowerCase())}>
                  AI Recommendation: {proposal.aiOverallStatus.toUpperCase()}
                </Badge>
              </div>
              <p className="text-gray-700">{proposal.aiOverallJustification}</p>
            </CardContent>
          </Card>

          {/* Receipts */}
          <Card>
            <CardHeader>
              <CardTitle>Receipts ({proposal.receipts?.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.receipts.length > 0 && proposal?.receipts?.map((receipt) => (
                  <div key={receipt.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={receipt.image}
                          alt="Receipt"
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{receipt.description}</h4>
                          <p className="text-sm text-gray-600">{receipt.category} • {new Date(receipt.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">${receipt.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* AI Decision */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Bot className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-700">AI Decision</span>
                          <Badge className={getStatusColor(receipt.aiStatus.toLocaleLowerCase())}>
                            {receipt.aiStatus.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-700">{receipt.aiJustification}</p>
                        
                      </div>
                      {/* Employee Notes */}
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-700">Notes</span>
                        </div>
                        <p className="text-sm text-yellow-700">{receipt?.notes}</p>
                      </div>

                      {/* Admin Override */}
                      {currentUser === 'admin' && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Edit3 className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-green-700">Admin Override</span>
                            </div>
                            {editingReceipt === receipt.id ? (
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleReceiptOverride(receipt.id, 'accepted')}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleReceiptOverride(receipt.id, 'partial')}
                                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1"
                                >
                                  Partial
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleReceiptOverride(receipt.id, 'rejected')}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingReceipt(receipt.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                          {receipt.adminOverride ? (
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(receipt.adminOverride)}
                              <Badge className={getStatusColor(receipt.adminOverride)}>
                                {receipt.adminOverride.toUpperCase()}
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-sm text-green-600">No override applied</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          {currentUser === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={4}
                  className="w-full"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-[#5ABA47]" />
                Employee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${proposal.employeeName}`}
                  alt={proposal.employeeName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{proposal.employeeName}</p>
                  <p className="text-sm text-gray-600">{proposal.employeeEmail}</p>
                  <p className="text-sm text-gray-600">{proposal.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-[#5ABA47]" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Requested:</span>
                <span className="font-semibold">${proposal.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">AI Approved:</span>
                <span className="font-semibold text-green-600">${calculateApprovedAmount().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Receipts:</span>
                <span className="font-semibold">{proposal.receipts.length}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Recommended Amount:</span>
                <span className="text-[#5ABA47]">${calculateApprovedAmount().toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-[#5ABA47]" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#5ABA47] rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-gray-600">{new Date(proposal.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {proposal.submittedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-xs text-gray-600">{new Date(proposal.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {proposal.reviewedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Reviewed</p>
                    <p className="text-xs text-gray-600">{new Date(proposal.reviewedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
