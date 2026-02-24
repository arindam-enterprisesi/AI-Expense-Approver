
/**
 * EditProposal component wraps CreateProposal for editing an existing proposal.
 *
 * Props:
 *  - proposals: Array of Proposal objects
 *  - onSubmit: Callback to save the updated proposal
 *
 * Looks up the proposal by id from route params and passes it to CreateProposal.
 */
import { useParams, Navigate } from 'react-router-dom';
import { CreateProposal } from './CreateProposal';
import { Proposal } from '@/pages/Index';

interface EditProposalProps {
  proposals: Proposal[];
  onSubmit: (proposal: Proposal) => void;
}

export function EditProposal({ proposals, onSubmit }: EditProposalProps) {
  const { id } = useParams();
  const proposal = proposals.find(p => p.id === id);

  if (!proposal) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <CreateProposal
      onSubmit={onSubmit}
      initialProposal={proposal}
      isEditing={true}
    />
  );
}