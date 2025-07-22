
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Mail,
  Phone,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Star,
  Activity,
  FileText,
  Settings,
  Download,
  Filter,
  Search,
  Bell,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Award,
  Briefcase,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { clientDb } from "@/lib/client-db";
import { formatDisplayAmount } from "@/lib/currency-utils";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  activeUsers: number;
  pendingQuotes: number;
  recentContacts: number;
  averageProjectValue: number;
  completionRate: number;
  clientSatisfaction: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'contact' | 'quote' | 'payment' | 'user';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  user?: string;
}

interface ProjectMetrics {
  name: string;
  completed: number;
  inProgress: number;
  planned: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  projects: number;
  target: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    activeUsers: 0,
    pendingQuotes: 0,
    recentContacts: 0,
    averageProjectValue: 0,
    completionRate: 0,
    clientSatisfaction: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const { toast } = useToast();

  // Mock data for dashboard
  const mockStats: DashboardStats = {
    totalProjects: 156,
    activeProjects: 23,
    completedProjects: 133,
    totalRevenue: 5200000000,
    monthlyRevenue: 450000000,
    totalClients: 89,
    activeUsers: 45,
    pendingQuotes: 12,
    recentContacts: 8,
    averageProjectValue: 33333333,
    completionRate: 95.2,
    clientSatisfaction: 4.8
  };

  const mockActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'project',
      title: 'Nairobi CBD Office Complex',
      description: 'Project marked as completed',
      timestamp: '2 hours ago',
      status: 'success',
      user: 'John Kamau'
    },
    {
      id: '2',
      type: 'contact',
      title: 'New Contact Submission',
      description: 'Sarah Wanjiku submitted a contact form for residential project',
      timestamp: '4 hours ago',
      status: 'info'
    },
    {
      id: '3',
      type: 'quote',
      title: 'Quote Request',
      description: 'Quote requested for Mombasa Port Expansion project',
      timestamp: '6 hours ago',
      status: 'warning',
      user: 'Mary Ochieng'
    },
    {
      id: '4',
      type: 'payment',
      title: 'Payment Received',
      description: 'KES 25,000,000 payment received for Westlands Estate',
      timestamp: '1 day ago',
      status: 'success'
    },
    {
      id: '5',
      type: 'user',
      title: 'New User Registration',
      description: 'Peter Mwangi registered as a new client',
      timestamp: '1 day ago',
      status: 'info'
    }
  ];

  const projectMetrics: ProjectMetrics[] = [
    { name: 'Commercial', completed: 45, inProgress: 8, planned: 12 },
    { name: 'Residential', completed: 38, inProgress: 6, planned: 9 },
    { name: 'Infrastructure', completed: 32, inProgress: 5, planned: 15 },
    { name: 'Industrial', completed: 18, inProgress: 4, planned: 8 }
  ];

  const revenueData: RevenueData[] = [
    { month: 'Jan', revenue: 380000000, projects: 12, target: 400000000 },
    { month: 'Feb', revenue: 420000000, projects: 15, target: 400000000 },
    { month: 'Mar', revenue: 350000000, projects: 11, target: 400000000 },
    { month: 'Apr', revenue: 480000000, projects: 18, target: 450000000 },
    { month: 'May', revenue: 520000000, projects: 20, target: 450000000 },
    { month: 'Jun', revenue: 450000000, projects: 16, target: 450000000 }
  ];

  const clientDistribution = [
    { name: 'Government', value: 35, color: '#3B82F6' },
    { name: 'Private Companies', value: 45, color: '#10B981' },
    { name: 'Individual Clients', value: 20, color: '#F59E0B' }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
        setRecentActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Building2 className="h-4 w-4" />;
      case 'contact':
        return <Mail className="h-4 w-4" />;
      case 'quote':
        return <FileText className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your projects.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatDisplayAmount(stats.monthlyRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% from last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  {stats.activeProjects} in progress
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Client Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{stats.clientSatisfaction}/5.0</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <Star className="h-3 w-3 mr-1" />
                  Excellent rating
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
                <p className="text-xl font-bold text-gray-900">{stats.pendingQuotes}</p>
              </div>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Project Value</p>
                <p className="text-xl font-bold text-gray-900">{formatDisplayAmount(stats.averageProjectValue)}</p>
              </div>
              <Award className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
            <CardDescription>Monthly revenue vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip 
                  formatter={(value: number) => [formatDisplayAmount(value), 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#EF4444" 
                  fill="none" 
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Project Distribution
            </CardTitle>
            <CardDescription>Projects by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectMetrics} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="inProgress" fill="#3B82F6" name="In Progress" />
                <Bar dataKey="planned" fill="#F59E0B" name="Planned" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Client Distribution and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Client Distribution</CardTitle>
            <CardDescription>Breakdown by client type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientDistribution.map((client, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: client.color }}
                    ></div>
                    <span className="text-sm font-medium">{client.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{client.value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={clientDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {clientDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      {activity.user && (
                        <span className="text-xs text-blue-600">by {activity.user}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Activities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used administrative functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/admin/projects">
                <Building2 className="h-6 w-6" />
                <span className="text-xs">Projects</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/admin/clients">
                <Users className="h-6 w-6" />
                <span className="text-xs">Clients</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/admin/quotes">
                <FileText className="h-6 w-6" />
                <span className="text-xs">Quotes</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/admin/contacts">
                <Mail className="h-6 w-6" />
                <span className="text-xs">Contacts</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/admin/reports">
                <BarChart3 className="h-6 w-6" />
                <span className="text-xs">Reports</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/admin/settings">
                <Settings className="h-6 w-6" />
                <span className="text-xs">Settings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
