import { UserRole, Proposal, Receipt } from '@/pages/Index';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'proposal' | 'receipt' | 'user' | 'system';
  entityId: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

export interface AppState {
  currentUser: UserRole;
  proposals: Proposal[];
  auditTrail: AuditEntry[];
  lastUpdated: string;
}

const STORAGE_KEY = 'ai-expense-approver-state';

class StorageService {
  private state: AppState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        return {
          ...parsedState,
          auditTrail: parsedState.auditTrail || []
        };
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }

    // Return default state with sample data
    return {
      currentUser: 'employee',
      proposals: [
        {
          id: '1',
          employeeId: 'emp001',
          employeeName: 'John Doe',
          // employeeEmail: 'john.doe@xyz.com',
          employeeEmail: 'expensemanager.ai@gmail.com',
          department: 'Sales',
          tripPurpose: 'Client Meeting - Q4 Partnership Discussion',
          tripLocation: 'San Francisco, CA',
          tripDates: {
            start: '2024-01-15',
            end: '2024-01-17'
          },
          receipts: [
            {
              id: 'r1',
              description: 'Flight from NYC to SFO',
              amount: 450,
              category: 'Transportation',
              date: '2024-01-15',
              image: '/ReceiptPlaceholder.png',
              aiStatus: 'accepted',
              aiJustification: 'Flight cost is within company policy limits for cross-country travel.'
            },
            {
              id: 'r2',
              description: 'Hotel - Marriott Downtown',
              amount: 280,
              category: 'Accommodation',
              date: '2024-01-15',
              image: '/ReceiptPlaceholder.png',
              aiStatus: 'accepted',
              aiJustification: 'Hotel rate is reasonable for San Francisco business district.'
            },
            {
              id: 'r3',
              description: 'Client Dinner at Fine Restaurant',
              amount: 185,
              category: 'Meals',
              date: '2024-01-16',
              image: '/ReceiptPlaceholder.png',
              aiStatus: 'rejected',
              aiJustification: 'Meal exceeds $150 limit. Approved for $150, excess $35 not covered.'
            }
          ],
          totalAmount: 915,
          status: 'under_review',
          aiOverallStatus: 'partial',
          aiOverallJustification: 'Most expenses approved. One meal partially approved due to policy limits.',
          createdAt: '2024-01-14',
          submittedAt: '2024-01-14'
        }
      ],
      auditTrail: [],
      lastUpdated: new Date().toISOString()
    };
  }

  private saveState(): void {
    try {
      this.state.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }

  private addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
    const auditEntry: AuditEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    this.state.auditTrail.push(auditEntry);
    
    // Keep only last 1000 audit entries to prevent storage overflow
    if (this.state.auditTrail.length > 1000) {
      this.state.auditTrail = this.state.auditTrail.slice(-1000);
    }
  }

  // Getters
  getCurrentUser(): UserRole {
    return this.state.currentUser;
  }

  getProposals(): Proposal[] {
    return this.state.proposals;
  }

  getAuditTrail(): AuditEntry[] {
    return this.state.auditTrail;
  }

  getState(): AppState {
    return { ...this.state };
  }

  // User management
  setCurrentUser(role: UserRole): void {
    const oldRole = this.state.currentUser;
    this.state.currentUser = role;
    
    this.addAuditEntry({
      userId: 'system',
      userName: 'System',
      action: 'user_role_changed',
      entityType: 'user',
      entityId: 'current_user',
      oldValue: oldRole,
      newValue: role,
      description: `User role changed from ${oldRole} to ${role}`
    });
    
    this.saveState();
  }

  // Proposal management
  addProposal(proposal: Proposal): void {
    this.state.proposals.push(proposal);
    
    this.addAuditEntry({
      userId: proposal.employeeId,
      userName: proposal.employeeName,
      action: 'proposal_created',
      entityType: 'proposal',
      entityId: proposal.id,
      newValue: proposal,
      description: `New proposal created: ${proposal.tripPurpose}`
    });
    
    this.saveState();
  }

  updateProposal(proposalId: string, updates: Partial<Proposal>, userId: string = 'system', userName: string = 'System'): void {
    const proposalIndex = this.state.proposals.findIndex(p => p.id === proposalId);
    if (proposalIndex === -1) return;

    const oldProposal = { ...this.state.proposals[proposalIndex] };
    this.state.proposals[proposalIndex] = { ...oldProposal, ...updates };
    const newProposal = this.state.proposals[proposalIndex];

    // Track specific changes
    Object.keys(updates).forEach(key => {
      if (oldProposal[key as keyof Proposal] !== newProposal[key as keyof Proposal]) {
        this.addAuditEntry({
          userId,
          userName,
          action: 'proposal_updated',
          entityType: 'proposal',
          entityId: proposalId,
          oldValue: { [key]: oldProposal[key as keyof Proposal] },
          newValue: { [key]: newProposal[key as keyof Proposal] },
          description: `Proposal ${key} changed from ${JSON.stringify(oldProposal[key as keyof Proposal])} to ${JSON.stringify(newProposal[key as keyof Proposal])}`
        });
      }
    });

    this.saveState();
  }

  // Receipt management
  updateReceipt(proposalId: string, receiptId: string, updates: Partial<Receipt>, userId: string = 'system', userName: string = 'System'): void {
    const proposal = this.state.proposals.find(p => p.id === proposalId);
    if (!proposal) return;

    const receiptIndex = proposal.receipts.findIndex(r => r.id === receiptId);
    if (receiptIndex === -1) return;

    const oldReceipt = { ...proposal.receipts[receiptIndex] };
    proposal.receipts[receiptIndex] = { ...oldReceipt, ...updates };
    const newReceipt = proposal.receipts[receiptIndex];

    // Track receipt changes
    Object.keys(updates).forEach(key => {
      if (oldReceipt[key as keyof Receipt] !== newReceipt[key as keyof Receipt]) {
        this.addAuditEntry({
          userId,
          userName,
          action: 'receipt_updated',
          entityType: 'receipt',
          entityId: receiptId,
          oldValue: { [key]: oldReceipt[key as keyof Receipt] },
          newValue: { [key]: newReceipt[key as keyof Receipt] },
          description: `Receipt ${key} changed for \"${oldReceipt.description}\"`
        });
      }
    });

    this.saveState();
  }

  // Audit trail queries
  getAuditTrailForProposal(proposalId: string): AuditEntry[] {
    return this.state.auditTrail.filter(entry => 
      entry.entityId === proposalId || 
      (entry.entityType === 'receipt' && this.state.proposals.find(p => 
        p.id === proposalId && p.receipts.some(r => r.id === entry.entityId)
      ))
    );
  }

  getRecentActivity(limit: number = 50): AuditEntry[] {
    return this.state.auditTrail
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Data export/import
  exportData(): string {
    return JSON.stringify(this.state, null, 2);
  }

  importData(data: string): boolean {
    try {
      const importedState = JSON.parse(data);
      // Validate basic structure
      if (importedState.proposals && importedState.currentUser && importedState.auditTrail) {
        this.state = importedState;
        this.addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'data_imported',
          entityType: 'system',
          entityId: 'app',
          description: 'Application data imported from external source'
        });
        this.saveState();
        return true;
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
    return false;
  }

  // Delete proposal
  deleteProposal(proposalId: string, userId: string = 'system', userName: string = 'System'): void {
    const proposalIndex = this.state.proposals.findIndex(p => p.id === proposalId);
    if (proposalIndex === -1) return;

    const deletedProposal = this.state.proposals[proposalIndex];
    this.state.proposals.splice(proposalIndex, 1);

    this.addAuditEntry({
      userId,
      userName,
      action: 'proposal_deleted',
      entityType: 'proposal',
      entityId: proposalId,
      oldValue: deletedProposal,
      description: `Proposal deleted: ${deletedProposal.tripPurpose}`
    });

    this.saveState();
  }

  // Clear all data
  clearAllData(): void {
    this.addAuditEntry({
      userId: 'system',
      userName: 'System',
      action: 'data_cleared',
      entityType: 'system',
      entityId: 'app',
      description: 'All application data cleared'
    });
    
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadState();
  }
}

// Export singleton instance
// Export singleton instance for use throughout the app
export const storageService = new StorageService();
