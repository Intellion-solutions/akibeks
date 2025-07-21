
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Activity } from "lucide-react";
import { supabase } from "@/lib/db-client";

interface AuditLogEntry {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  user_id?: string;
  changes: any;
  timestamp: string;
}

const AuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll create mock audit log data since we don't have audit logging set up in the database
    const mockAuditLogs: AuditLogEntry[] = [
      {
        id: "1",
        action: "CREATE",
        table_name: "invoices",
        record_id: "INV000001",
        user_id: "admin",
        changes: { status: "draft", total_amount: 15000 },
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: "2",
        action: "UPDATE",
        table_name: "invoices",
        record_id: "INV000001",
        user_id: "admin",
        changes: { status: "sent" },
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      },
      {
        id: "3",
        action: "CREATE",
        table_name: "clients",
        record_id: "client_001",
        user_id: "admin",
        changes: { full_name: "John Doe", phone: "+254700000000" },
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      },
      {
        id: "4",
        action: "DELETE",
        table_name: "invoice_items",
        record_id: "item_001",
        user_id: "admin",
        changes: { description: "Deleted item", amount: 5000 },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      }
    ];

    setTimeout(() => {
      setAuditLogs(mockAuditLogs);
      setLoading(false);
    }, 500);
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "default";
      case "UPDATE": return "secondary";
      case "DELETE": return "destructive";
      default: return "outline";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0">
                <Badge variant={getActionColor(log.action) as any}>
                  {log.action}
                </Badge>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {log.table_name}
                  </span>
                  <span className="text-gray-500">·</span>
                  <span className="text-sm text-gray-600">
                    {log.record_id}
                  </span>
                </div>
                
                {log.changes && (
                  <div className="mt-1 text-xs text-gray-500">
                    Changes: {JSON.stringify(log.changes)}
                  </div>
                )}
                
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <User className="w-3 h-3 mr-1" />
                  <span className="mr-3">{log.user_id || 'System'}</span>
                  <Clock className="w-3 h-3 mr-1" />
                  <span title={formatTimestamp(log.timestamp)}>
                    {getTimeAgo(log.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {auditLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recent activity found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLog;
