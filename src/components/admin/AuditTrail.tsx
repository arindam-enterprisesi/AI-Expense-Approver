import { useState } from 'react';
import { storageService, AuditEntry } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, FileText, Receipt, Settings, Download, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AuditTrailProps {
  proposalId?: string;
}

export const AuditTrail = ({ proposalId }: AuditTrailProps) => {
  const [filter, setFilter] = useState<string>('all');
  const [limit, setLimit] = useState<number>(50);

  const auditEntries = proposalId 
    ? storageService.getAuditTrailForProposal(proposalId)
    : storageService.getRecentActivity(limit);

  const filteredEntries = auditEntries.filter(entry => {
    if (filter === 'all') return true;
    return entry.entityType === filter || entry.action === filter;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user_role_changed':
        return <User className="h-4 w-4" />;
      case 'proposal_created':
      case 'proposal_updated':
        return <FileText className="h-4 w-4" />;
      case 'receipt_updated':
        return <Receipt className="h-4 w-4" />;
      case 'data_imported':
      case 'data_cleared':
        return <Settings className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'proposal_created':
        return 'bg-green-100 text-green-800';
      case 'proposal_updated':
        return 'bg-blue-100 text-blue-800';
      case 'receipt_updated':
        return 'bg-yellow-100 text-yellow-800';
      case 'user_role_changed':
        return 'bg-purple-100 text-purple-800';
      case 'data_cleared':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleExportData = () => {
    try {
      const data = storageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-expense-approver-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: "Application data has been exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export application data.",
        variant: "destructive"
      });
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all application data? This action cannot be undone.')) {
      storageService.clearAllData();
      window.location.reload();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {proposalId ? 'Report Activity' : 'Audit Trail'}
          </CardTitle>
          {!proposalId && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="destructive" size="sm" onClick={handleClearData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>
        
        {!proposalId && (
          <div className="flex gap-4 mt-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="proposal">Reports</SelectItem>
                <SelectItem value="receipt">Receipts</SelectItem>
                <SelectItem value="user">User Changes</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">Last 25</SelectItem>
                <SelectItem value="50">Last 50</SelectItem>
                <SelectItem value="100">Last 100</SelectItem>
                <SelectItem value="500">Last 500</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No audit entries found.
              </p>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                >
                  <div className="mt-1">
                    {getActionIcon(entry.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={getActionColor(entry.action)}>
                        {entry.action.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {entry.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2">{entry.description}</p>
                    
                    {entry.oldValue && entry.newValue && (
                      <div className="text-xs space-y-1">
                        <div className="flex gap-4">
                          <div className="text-red-600">
                            <span className="font-medium">Old:</span> {JSON.stringify(entry.oldValue)}
                          </div>
                          <div className="text-green-600">
                            <span className="font-medium">New:</span> {JSON.stringify(entry.newValue)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                      <span>Entity: {entry.entityType}</span>
                      <span>•</span>
                      <span>ID: {entry.entityId}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};