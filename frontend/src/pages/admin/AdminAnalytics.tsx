import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Globe,
  Phone,
  Mail,
  FileText,
  Calculator,
  Briefcase,
  Settings,
  Search
} from "lucide-react";
import { db } from "@/lib/db-client";

interface AnalyticsData {
  totalRevenue: number;
  totalProjects: number;
  activeClients: number;
  completionRate: number;
  monthlyRevenue: { month: string; revenue: number; projects: number }[];
  projectStatus: { status: string; count: number; percentage: number }[];
  clientSatisfaction: { rating: number; count: number; percentage: number }[];
  topClients: { name: string; projects: number; revenue: number }[];
  recentActivities: { type: string; description: string; date: string; user: string }[];
  kpis: {
    revenueGrowth: number;
    projectGrowth: number;
    clientRetention: number;
    avgProjectValue: number;
    teamUtilization: number;
    onTimeDelivery: number;
  };
}

const AdminAnalytics = () => {
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalyticsData();
    }
  }, [isAuthenticated, dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAnalytics: AnalyticsData = {
        totalRevenue: 25000000,
        totalProjects: 156,
        activeClients: 89,
        completionRate: 94.5,
        monthlyRevenue: [
          { month: 'Jan', revenue: 1800000, projects: 12 },
          { month: 'Feb', revenue: 2200000, projects: 15 },
          { month: 'Mar', revenue: 2100000, projects: 14 },
          { month: 'Apr', revenue: 2800000, projects: 18 },
          { month: 'May', revenue: 3200000, projects: 21 },
          { month: 'Jun', revenue: 2900000, projects: 19 },
          { month: 'Jul', revenue: 3500000, projects: 23 },
          { month: 'Aug', revenue: 3100000, projects: 20 },
          { month: 'Sep', revenue: 2700000, projects: 17 },
          { month: 'Oct', revenue: 3400000, projects: 22 },
          { month: 'Nov', revenue: 3800000, projects: 25 },
          { month: 'Dec', revenue: 4200000, projects: 28 }
        ],
        projectStatus: [
          { status: 'Completed', count: 89, percentage: 57 },
          { status: 'In Progress', count: 45, percentage: 29 },
          { status: 'Planning', count: 15, percentage: 10 },
          { status: 'On Hold', count: 7, percentage: 4 }
        ],
        clientSatisfaction: [
          { rating: 5, count: 67, percentage: 75 },
          { rating: 4, count: 18, percentage: 20 },
          { rating: 3, count: 4, percentage: 4 },
          { rating: 2, count: 1, percentage: 1 },
          { rating: 1, count: 0, percentage: 0 }
        ],
        topClients: [
          { name: 'TechCorp Solutions', projects: 12, revenue: 3500000 },
          { name: 'BuildMax Ltd', projects: 8, revenue: 2800000 },
          { name: 'Urban Development', projects: 6, revenue: 2200000 },
          { name: 'Green Estates', projects: 5, revenue: 1900000 },
          { name: 'Future Holdings', projects: 4, revenue: 1600000 }
        ],
        recentActivities: [
          { type: 'project_completed', description: 'Office Complex Project completed', date: '2024-01-15', user: 'John Doe' },
          { type: 'invoice_paid', description: 'Invoice INV-2024-001 paid by TechCorp', date: '2024-01-15', user: 'System' },
          { type: 'new_client', description: 'New client GreenTech added', date: '2024-01-14', user: 'Sarah Johnson' },
          { type: 'quote_sent', description: 'Quotation sent to BuildMax Ltd', date: '2024-01-14', user: 'Mike Chen' },
          { type: 'milestone_reached', description: 'Shopping Mall 75% milestone reached', date: '2024-01-13', user: 'System' }
        ],
        kpis: {
          revenueGrowth: 23.5,
          projectGrowth: 18.2,
          clientRetention: 92.3,
          avgProjectValue: 160000,
          teamUtilization: 87.5,
          onTimeDelivery: 94.8
        }
      };

      setAnalyticsData(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invoice_paid': return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'new_client': return <Users className="w-4 h-4 text-purple-500" />;
      case 'quote_sent': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'milestone_reached': return <Target className="w-4 h-4 text-indigo-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onLogout={logout} />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onLogout={logout} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7_days">Last 7 days</SelectItem>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                <SelectItem value="last_90_days">Last 90 days</SelectItem>
                <SelectItem value="last_12_months">Last 12 months</SelectItem>
                <SelectItem value="this_year">This year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={fetchAnalyticsData} disabled={loading}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
            </Button>
            
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(analyticsData.kpis.revenueGrowth)}
                    <span className={`text-sm font-medium ${getGrowthColor(analyticsData.kpis.revenueGrowth)}`}>
                      {analyticsData.kpis.revenueGrowth}%
                    </span>
                    <span className="text-xs text-gray-500">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalProjects}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(analyticsData.kpis.projectGrowth)}
                    <span className={`text-sm font-medium ${getGrowthColor(analyticsData.kpis.projectGrowth)}`}>
                      {analyticsData.kpis.projectGrowth}%
                    </span>
                    <span className="text-xs text-gray-500">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.activeClients}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm font-medium text-green-500">{analyticsData.kpis.clientRetention}%</span>
                    <span className="text-xs text-gray-500">retention rate</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.completionRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm font-medium text-green-500">{analyticsData.kpis.onTimeDelivery}%</span>
                    <span className="text-xs text-gray-500">on-time delivery</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="w-5 h-5 mr-2" />
                    Monthly Revenue Trend
                  </CardTitle>
                  <CardDescription>Revenue and project count over the last 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.monthlyRevenue.slice(-6).map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">{formatCurrency(data.revenue)}</span>
                              <span className="text-xs text-gray-500">{data.projects} projects</span>
                            </div>
                            <Progress value={(data.revenue / Math.max(...analyticsData.monthlyRevenue.map(m => m.revenue))) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Project Status Distribution
                  </CardTitle>
                  <CardDescription>Current status of all projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.projectStatus.map((status, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{status.status}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{status.count}</span>
                            <span className="text-xs text-gray-500">({status.percentage}%)</span>
                          </div>
                        </div>
                        <Progress value={status.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Project Value</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(analyticsData.kpis.avgProjectValue)}</p>
                    </div>
                    <Calculator className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Team Utilization</p>
                      <p className="text-xl font-bold text-gray-900">{analyticsData.kpis.teamUtilization}%</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Client Retention</p>
                      <p className="text-xl font-bold text-gray-900">{analyticsData.kpis.clientRetention}%</p>
                    </div>
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Detailed revenue breakdown and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(analyticsData.totalRevenue)}</div>
                        <div className="text-sm text-green-700">Total Revenue</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(analyticsData.kpis.avgProjectValue)}</div>
                        <div className="text-sm text-blue-700">Avg Project Value</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{analyticsData.kpis.revenueGrowth}%</div>
                        <div className="text-sm text-purple-700">Growth Rate</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Monthly Revenue Breakdown</h4>
                      {analyticsData.monthlyRevenue.slice(-6).map((data, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900 w-12">{data.month}</div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{formatCurrency(data.revenue)}</span>
                              <span className="text-xs text-gray-500">{data.projects} projects</span>
                            </div>
                            <Progress value={(data.revenue / Math.max(...analyticsData.monthlyRevenue.map(m => m.revenue))) * 100} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Revenue Sources</CardTitle>
                  <CardDescription>Highest value clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topClients.map((client, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-600">{client.projects} projects</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{formatCurrency(client.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Status Overview</CardTitle>
                  <CardDescription>Current status distribution of all projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.projectStatus.map((status, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status.status === 'Completed' ? 'bg-green-500' :
                            status.status === 'In Progress' ? 'bg-blue-500' :
                            status.status === 'Planning' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`} />
                          <span className="font-medium text-gray-900">{status.status}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-900">{status.count}</span>
                          <Badge variant="secondary">{status.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators for projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">On-Time Delivery Rate</span>
                        <span className="text-sm font-bold text-green-600">{analyticsData.kpis.onTimeDelivery}%</span>
                      </div>
                      <Progress value={analyticsData.kpis.onTimeDelivery} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Team Utilization</span>
                        <span className="text-sm font-bold text-blue-600">{analyticsData.kpis.teamUtilization}%</span>
                      </div>
                      <Progress value={analyticsData.kpis.teamUtilization} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Project Growth Rate</span>
                        <span className="text-sm font-bold text-purple-600">{analyticsData.kpis.projectGrowth}%</span>
                      </div>
                      <Progress value={Math.min(analyticsData.kpis.projectGrowth * 2, 100)} className="h-2" />
                    </div>

                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{analyticsData.totalProjects}</div>
                          <div className="text-sm text-gray-600">Total Projects</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{analyticsData.projectStatus.find(s => s.status === 'Completed')?.count || 0}</div>
                          <div className="text-sm text-gray-600">Completed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Satisfaction</CardTitle>
                  <CardDescription>Client feedback and satisfaction ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.clientSatisfaction.map((rating, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex items-center gap-1 w-20">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{rating.count} clients</span>
                            <span className="text-sm text-gray-500">{rating.percentage}%</span>
                          </div>
                          <Progress value={rating.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">4.7</div>
                      <div className="text-sm text-green-700">Average Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Clients</CardTitle>
                  <CardDescription>Clients by project count and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topClients.map((client, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-600">{client.projects} projects</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{formatCurrency(client.revenue)}</div>
                          <div className="text-sm text-gray-600">Total Revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest system activities and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="p-2 rounded-full bg-gray-100">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{activity.description}</div>
                          <div className="text-sm text-gray-600">by {activity.user}</div>
                          <div className="text-xs text-gray-500 mt-1">{new Date(activity.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Platform health and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">System Uptime</span>
                        <span className="text-sm font-bold text-green-600">99.9%</span>
                      </div>
                      <Progress value={99.9} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Average Response Time</span>
                        <span className="text-sm font-bold text-blue-600">245ms</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">User Satisfaction</span>
                        <span className="text-sm font-bold text-purple-600">96.2%</span>
                      </div>
                      <Progress value={96.2} className="h-2" />
                    </div>

                    <div className="pt-4 border-t grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-gray-900">1,247</div>
                        <div className="text-sm text-gray-600">Active Users</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-gray-900">15.2GB</div>
                        <div className="text-sm text-gray-600">Data Processed</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminAnalytics;
