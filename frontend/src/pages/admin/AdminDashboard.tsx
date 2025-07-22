
import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  AlertCircle,
  CheckCircle,
  Activity,
  FileText,
  Download,
  Bell,
  BarChart3,
  Target,
  Award,
  Eye,
  Plus
} from "lucide-react";
import { Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEO/SEOHead";

// Types
interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  activeClients: number;
  pendingTasks: number;
  completedTasks: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ProjectData {
  name: string;
  status: string;
  progress: number;
  value: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    activeClients: 0,
    pendingTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Mock data - in production, fetch from API
  const mockRevenueData: RevenueData[] = useMemo(() => [
    { month: 'Jan', revenue: 2500000, expenses: 1800000, profit: 700000 },
    { month: 'Feb', revenue: 2800000, expenses: 1900000, profit: 900000 },
    { month: 'Mar', revenue: 3200000, expenses: 2100000, profit: 1100000 },
    { month: 'Apr', revenue: 2900000, expenses: 2000000, profit: 900000 },
    { month: 'May', revenue: 3500000, expenses: 2200000, profit: 1300000 },
    { month: 'Jun', revenue: 4100000, expenses: 2400000, profit: 1700000 },
  ], []);

  const mockProjectData: ProjectData[] = useMemo(() => [
    { name: 'Westlands Office Complex', status: 'In Progress', progress: 75, value: 25000000 },
    { name: 'Karen Residential Estate', status: 'Planning', progress: 30, value: 18000000 },
    { name: 'Industrial Park Phase 2', status: 'In Progress', progress: 60, value: 35000000 },
    { name: 'Shopping Mall Renovation', status: 'Completed', progress: 100, value: 12000000 },
    { name: 'Hospital Expansion', status: 'In Progress', progress: 45, value: 28000000 },
  ], []);

  const mockStats: DashboardStats = useMemo(() => ({
    totalProjects: 24,
    activeProjects: 12,
    completedProjects: 8,
    totalRevenue: 125000000,
    monthlyRevenue: 4100000,
    totalClients: 45,
    activeClients: 23,
    pendingTasks: 18,
    completedTasks: 156,
  }), []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
      } catch (error) {
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
  }, [mockStats, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'On Hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pieChartData = useMemo(() => [
    { name: 'Active', value: stats.activeProjects, color: '#3B82F6' },
    { name: 'Completed', value: stats.completedProjects, color: '#10B981' },
    { name: 'Planning', value: stats.totalProjects - stats.activeProjects - stats.completedProjects, color: '#F59E0B' },
  ], [stats]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <>
      <SEOHead 
        title="Admin Dashboard"
        description="AKIBEKS Engineering Solutions administrative dashboard with project overview, revenue analytics, and business metrics."
        noindex={true}
        nofollow={true}
      />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your projects.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm" asChild>
              <Link to="/admin/projects">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
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

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% from last month
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.monthlyRevenue)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +23% from last month
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.activeClients}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5% from last month
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Revenue Trends
                  </CardTitle>
                  <CardDescription>Monthly revenue and profit analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.8} />
                      <Area type="monotone" dataKey="profit" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.8} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Project Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Project Distribution
                  </CardTitle>
                  <CardDescription>Current project status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Projects
                </CardTitle>
                <CardDescription>Latest project updates and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProjectData.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{project.name}</h4>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Progress: {project.progress}%</span>
                            <span>Value: {formatCurrency(project.value)}</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>Manage all your engineering projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Project management features coming soon</p>
                  <Button asChild>
                    <Link to="/admin/projects">Go to Projects</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Project Success Rate</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Client Satisfaction</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">On-Time Delivery</span>
                      <span className="font-medium">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Pending Tasks</span>
                    <Badge variant="destructive">{stats.pendingTasks}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Review structural drawings</p>
                        <p className="text-xs text-gray-600">Due: Tomorrow</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Client meeting preparation</p>
                        <p className="text-xs text-gray-600">Due: Today</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Site inspection scheduled</p>
                        <p className="text-xs text-gray-600">Due: Next week</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Completed Tasks</span>
                    <Badge variant="default">{stats.completedTasks}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">MEP system design completed</p>
                        <p className="text-xs text-gray-600">Completed: Yesterday</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Permit applications submitted</p>
                        <p className="text-xs text-gray-600">Completed: 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Budget approval received</p>
                        <p className="text-xs text-gray-600">Completed: 3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminDashboard;
