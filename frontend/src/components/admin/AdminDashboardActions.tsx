
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Users, 
  ClipboardList, 
  Calendar, 
  Download, 
  Send, 
  Plus,
  BarChart3,
  Settings,
  Bell,
  Search,
  Filter
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminDashboardActions = () => {
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    toast({
      title: "Action Triggered",
      description: `${action} functionality is now active`,
    });
  };

  const quickActions = [
    {
      title: "Create Invoice",
      description: "Generate new professional invoice",
      icon: FileText,
      color: "bg-blue-500",
      action: () => window.location.href = "/admin/invoices",
    },
    {
      title: "Add Client",
      description: "Register new client information",
      icon: Users,
      color: "bg-green-500",
      action: () => window.location.href = "/admin/clients",
    },
    {
      title: "New Project",
      description: "Start a new project timeline",
      icon: ClipboardList,
      color: "bg-purple-500",
      action: () => window.location.href = "/admin/projects",
    },
    {
      title: "Schedule Visit",
      description: "Book site visit appointment",
      icon: Calendar,
      color: "bg-orange-500",
      action: () => handleQuickAction("Site Visit Scheduling"),
    }
  ];

  const recentActivities = [
    {
      action: "Invoice INV000123 created",
      time: "2 hours ago",
      status: "success"
    },
    {
      action: "New client John Doe added",
      time: "4 hours ago", 
      status: "info"
    },
    {
      action: "Project timeline updated",
      time: "6 hours ago",
      status: "warning"
    },
    {
      action: "Payment received KSh 50,000",
      time: "1 day ago",
      status: "success"
    }
  ];

  const pendingTasks = [
    {
      task: "Review pending invoices",
      priority: "high",
      count: 5
    },
    {
      task: "Follow up overdue payments",
      priority: "high",
      count: 3
    },
    {
      task: "Update project status",
      priority: "medium",
      count: 8
    },
    {
      task: "Client document review",
      priority: "low",
      count: 12
    }
  ];

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-24 p-4 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                onClick={action.action}
              >
                <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Bulk Actions</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction("Bulk Invoice Generation")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Bulk Invoices
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction("Mass Email Sending")}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Mass Emails
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction("Data Export")}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">System Tools</h3>
            <Settings className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction("System Backup")}
            >
              <Download className="w-4 h-4 mr-2" />
              Backup System
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction("Notification Settings")}
            >
              <Bell className="w-4 h-4 mr-2" />
              Manage Notifications
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              asChild
            >
              <Link to="/admin/settings">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Search & Filter</h3>
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction("Advanced Search")}
            >
              <Search className="w-4 h-4 mr-2" />
              Advanced Search
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction("Filter Options")}
            >
              <Filter className="w-4 h-4 mr-2" />
              Custom Filters
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              asChild
            >
              <Link to="/admin/reports">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Reports
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Activities and Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <Badge 
                    variant={activity.status === 'success' ? 'default' : activity.status === 'warning' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{task.task}</p>
                    <Badge 
                      variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}
                      className="text-xs mt-1"
                    >
                      {task.priority} priority
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">{task.count}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="ml-2"
                      onClick={() => handleQuickAction(`${task.task} Management`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardActions;
