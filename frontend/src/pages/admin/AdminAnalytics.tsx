import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Award,
  Clock,
  MapPin,
  Download,
  RefreshCw
} from "lucide-react";
import SEOHead from "@/components/SEO/SEOHead";
import { db, withFallback } from '@/lib/database';

interface AnalyticsData {
  revenue: {
    monthly: Array<{ month: string; revenue: number; target: number; profit: number }>;
    yearly: Array<{ year: string; revenue: number; growth: number }>;
  };
  projects: {
    status: Array<{ name: string; value: number; color: string }>;
    completion: Array<{ month: string; completed: number; started: number }>;
    types: Array<{ type: string; count: number; revenue: number }>;
  };
  clients: {
    acquisition: Array<{ month: string; new: number; retained: number }>;
    satisfaction: Array<{ category: string; score: number }>;
    geographic: Array<{ region: string; count: number; revenue: number }>;
  };
  performance: {
    kpis: Array<{ metric: string; current: number; target: number; trend: 'up' | 'down' }>;
    efficiency: Array<{ department: string; efficiency: number; capacity: number }>;
  };
}

const AdminAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('12months');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Mock analytics data (in production, fetch from API)
      const mockData: AnalyticsData = {
        revenue: {
          monthly: [
            { month: 'Jan', revenue: 2500000, target: 2200000, profit: 750000 },
            { month: 'Feb', revenue: 2800000, target: 2400000, profit: 840000 },
            { month: 'Mar', revenue: 3200000, target: 2600000, profit: 960000 },
            { month: 'Apr', revenue: 2900000, target: 2800000, profit: 870000 },
            { month: 'May', revenue: 3500000, target: 3000000, profit: 1050000 },
            { month: 'Jun', revenue: 4100000, target: 3200000, profit: 1230000 },
            { month: 'Jul', revenue: 3800000, target: 3400000, profit: 1140000 },
            { month: 'Aug', revenue: 4200000, target: 3600000, profit: 1260000 },
            { month: 'Sep', revenue: 3900000, target: 3800000, profit: 1170000 },
            { month: 'Oct', revenue: 4500000, target: 4000000, profit: 1350000 },
            { month: 'Nov', revenue: 4800000, target: 4200000, profit: 1440000 },
            { month: 'Dec', revenue: 5200000, target: 4500000, profit: 1560000 }
          ],
          yearly: [
            { year: '2020', revenue: 28000000, growth: 0 },
            { year: '2021', revenue: 32000000, growth: 14.3 },
            { year: '2022', revenue: 38000000, growth: 18.8 },
            { year: '2023', revenue: 42000000, growth: 10.5 },
            { year: '2024', revenue: 47000000, growth: 11.9 }
          ]
        },
        projects: {
          status: [
            { name: 'Completed', value: 45, color: '#10B981' },
            { name: 'In Progress', value: 28, color: '#3B82F6' },
            { name: 'Planning', value: 18, color: '#F59E0B' },
            { name: 'On Hold', value: 9, color: '#EF4444' }
          ],
          completion: [
            { month: 'Jan', completed: 8, started: 12 },
            { month: 'Feb', completed: 10, started: 14 },
            { month: 'Mar', completed: 12, started: 16 },
            { month: 'Apr', completed: 9, started: 13 },
            { month: 'May', completed: 14, started: 18 },
            { month: 'Jun', completed: 16, started: 20 }
          ],
          types: [
            { type: 'Residential', count: 35, revenue: 18500000 },
            { type: 'Commercial', count: 22, revenue: 24800000 },
            { type: 'Industrial', count: 15, revenue: 21200000 },
            { type: 'Infrastructure', count: 8, revenue: 12500000 }
          ]
        },
        clients: {
          acquisition: [
            { month: 'Jan', new: 8, retained: 45 },
            { month: 'Feb', new: 12, retained: 48 },
            { month: 'Mar', new: 15, retained: 52 },
            { month: 'Apr', new: 10, retained: 55 },
            { month: 'May', new: 18, retained: 58 },
            { month: 'Jun', new: 22, retained: 62 }
          ],
          satisfaction: [
            { category: 'Quality', score: 4.8 },
            { category: 'Timeline', score: 4.5 },
            { category: 'Communication', score: 4.7 },
            { category: 'Value', score: 4.6 },
            { category: 'Overall', score: 4.7 }
          ],
          geographic: [
            { region: 'Nairobi', count: 45, revenue: 28500000 },
            { region: 'Mombasa', count: 25, revenue: 18200000 },
            { region: 'Kisumu', count: 18, revenue: 12800000 },
            { region: 'Nakuru', count: 12, revenue: 8500000 }
          ]
        },
        performance: {
          kpis: [
            { metric: 'Project Success Rate', current: 94, target: 95, trend: 'up' },
            { metric: 'Client Retention', current: 88, target: 85, trend: 'up' },
            { metric: 'Profit Margin', current: 28, target: 30, trend: 'down' },
            { metric: 'On-Time Delivery', current: 92, target: 90, trend: 'up' },
            { metric: 'Team Utilization', current: 85, target: 80, trend: 'up' },
            { metric: 'Cost Efficiency', current: 76, target: 80, trend: 'down' }
          ],
          efficiency: [
            { department: 'Design', efficiency: 92, capacity: 85 },
            { department: 'Construction', efficiency: 88, capacity: 95 },
            { department: 'Engineering', efficiency: 94, capacity: 80 },
            { department: 'Project Mgmt', efficiency: 89, capacity: 90 },
            { department: 'Quality Assurance', efficiency: 96, capacity: 75 }
          ]
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalRevenue = () => {
    if (!analyticsData) return 0;
    return analyticsData.revenue.monthly.reduce((sum, month) => sum + month.revenue, 0);
  };

  const calculateGrowthRate = () => {
    if (!analyticsData) return 0;
    const currentYear = analyticsData.revenue.yearly[analyticsData.revenue.yearly.length - 1];
    return currentYear.growth;
  };

  if (loading || !analyticsData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Analytics Dashboard - Admin Panel"
        description="Comprehensive business analytics and performance metrics dashboard."
        noindex={true}
        nofollow={true}
      />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive business intelligence and performance metrics</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="2years">Last 2 Years</option>
            </select>
            <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotalRevenue())}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{calculateGrowthRate()}% from last year
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analyticsData.projects.status.find(s => s.name === 'In Progress')?.value || 0}
                  </p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Activity className="h-3 w-3 mr-1" />
                    28 in progress
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Client Satisfaction</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analyticsData.clients.satisfaction.find(s => s.category === 'Overall')?.score || 0}/5
                  </p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Award className="h-3 w-3 mr-1" />
                    Excellent rating
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {analyticsData.performance.kpis.find(k => k.metric === 'Project Success Rate')?.current || 0}%
                  </p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Target className="h-3 w-3 mr-1" />
                    Above target
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue vs Target</CardTitle>
                  <CardDescription>Track monthly performance against targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={analyticsData.revenue.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.8} />
                      <Area type="monotone" dataKey="target" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Yearly Growth Trend</CardTitle>
                  <CardDescription>Revenue growth over the years</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={analyticsData.revenue.yearly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                  <CardDescription>Current status of all projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={analyticsData.projects.status}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.projects.status.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Completion Trend</CardTitle>
                  <CardDescription>Monthly project completions vs new starts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={analyticsData.projects.completion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#10B981" name="Completed" />
                      <Bar dataKey="started" fill="#3B82F6" name="Started" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Types Performance</CardTitle>
                <CardDescription>Revenue and count by project type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analyticsData.projects.types.map((type) => (
                    <div key={type.type} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900">{type.type}</h4>
                      <p className="text-2xl font-bold text-blue-600">{type.count}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(type.revenue)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Acquisition</CardTitle>
                  <CardDescription>New vs retained clients over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={analyticsData.clients.acquisition}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="retained" stackId="1" stroke="#10B981" fill="#10B981" />
                      <Area type="monotone" dataKey="new" stackId="2" stroke="#3B82F6" fill="#3B82F6" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Satisfaction Metrics</CardTitle>
                  <CardDescription>Average ratings by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={analyticsData.clients.satisfaction}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis domain={[0, 5]} />
                      <Radar name="Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Clients and revenue by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analyticsData.clients.geographic.map((region) => (
                    <div key={region.region} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">{region.region}</h4>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{region.count} clients</p>
                      <p className="text-sm text-gray-600">{formatCurrency(region.revenue)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Current performance vs targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.performance.kpis.map((kpi) => (
                    <div key={kpi.metric} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{kpi.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-blue-600">{kpi.current}%</span>
                            {kpi.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${kpi.current >= kpi.target ? 'bg-green-600' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Target: {kpi.target}%</span>
                          <span>{kpi.current >= kpi.target ? 'Above Target' : 'Below Target'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Efficiency</CardTitle>
                <CardDescription>Efficiency vs capacity by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={analyticsData.performance.efficiency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="efficiency" fill="#3B82F6" name="Efficiency %" />
                    <Bar dataKey="capacity" fill="#10B981" name="Capacity %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminAnalytics;