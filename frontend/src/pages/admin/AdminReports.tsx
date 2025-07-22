
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Filter, TrendingUp, TrendingDown, DollarSign, Users, Building, Activity, BarChart3, PieChart, LineChart } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/db-client";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart as RechartsLineChart, Line } from 'recharts';

interface FinancialData {
  revenue: number;
  expenses: number;
  profit: number;
  growth: number;
  invoicesCount: number;
  paidInvoices: number;
}

interface ProjectsData {
  total: number;
  completed: number;
  inProgress: number;
  completion: number;
  planning: number;
  onHold: number;
}

interface ClientsData {
  total: number;
  companies: number;
  individuals: number;
  active: number;
  retention: number;
}

interface PerformanceData {
  efficiency: number;
  satisfaction: number;
}

type ReportData = FinancialData | ProjectsData | ClientsData | PerformanceData;

const AdminReports = () => {
  const { isAuthenticated } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'financial' | 'projects' | 'clients' | 'performance'>('financial');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const { toast } = useToast();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange, startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const data = await generateMockData();
      setReportData(data);
      setChartData(generateChartData(data));
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = async (): Promise<ReportData[]> => {
    // Mock data generation based on report type
    switch (reportType) {
      case 'financial':
        return [{
          revenue: 450000,
          expenses: 280000,
          profit: 170000,
          growth: 12.5,
          invoicesCount: 45,
          paidInvoices: 38
        }] as FinancialData[];
      case 'projects':
        return [{
          total: 24,
          completed: 18,
          inProgress: 4,
          completion: 75,
          planning: 2,
          onHold: 0
        }] as ProjectsData[];
      case 'clients':
        return [{
          total: 156,
          companies: 89,
          individuals: 67,
          active: 142,
          retention: 94.2
        }] as ClientsData[];
      case 'performance':
        return [{
          efficiency: 87.5,
          satisfaction: 92.1
        }] as PerformanceData[];
      default:
        return [];
    }
  };

  const generateChartData = (data: ReportData[]) => {
    if (data.length === 0) return [];
    
    const firstItem = data[0];
    
    switch (reportType) {
      case 'financial':
        const financialData = firstItem as FinancialData;
        return [
          { name: 'Revenue', value: financialData.revenue, color: '#8884d8' },
          { name: 'Expenses', value: financialData.expenses, color: '#82ca9d' },
          { name: 'Profit', value: financialData.profit, color: '#ffc658' }
        ];
      case 'projects':
        const projectsData = firstItem as ProjectsData;
        return [
          { name: 'Completed', value: projectsData.completed, color: '#8884d8' },
          { name: 'In Progress', value: projectsData.inProgress, color: '#82ca9d' },
          { name: 'Planning', value: projectsData.planning, color: '#ffc658' },
          { name: 'On Hold', value: projectsData.onHold, color: '#ff7c7c' }
        ];
      case 'clients':
        const clientsData = firstItem as ClientsData;
        return [
          { name: 'Companies', value: clientsData.companies, color: '#8884d8' },
          { name: 'Individuals', value: clientsData.individuals, color: '#82ca9d' }
        ];
      default:
        return [];
    }
  };

  const renderMetrics = () => {
    if (reportData.length === 0) return null;
    
    const data = reportData[0];
    
    switch (reportType) {
      case 'financial':
        const financialData = data as FinancialData;
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold">KSh {financialData.revenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {financialData.growth}% from last period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Expenses</p>
                    <p className="text-2xl font-bold">KSh {financialData.expenses.toLocaleString()}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Profit</p>
                    <p className="text-2xl font-bold">KSh {financialData.profit.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Invoices</p>
                    <p className="text-2xl font-bold">{financialData.invoicesCount}</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Paid Invoices</p>
                    <p className="text-2xl font-bold">{financialData.paidInvoices}</p>
                  </div>
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'projects':
        const projectsData = data as ProjectsData;
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold">{projectsData.total}</p>
                  </div>
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{projectsData.completed}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold">{projectsData.inProgress}</p>
                  </div>
                  <Activity className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Planning</p>
                    <p className="text-2xl font-bold">{projectsData.planning}</p>
                  </div>
                  <PieChart className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">On Hold</p>
                    <p className="text-2xl font-bold">{projectsData.onHold}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold">{projectsData.completion}%</p>
                  </div>
                  <LineChart className="w-8 h-8 text-cyan-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'clients':
        const clientsData = data as ClientsData;
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold">{clientsData.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Companies</p>
                    <p className="text-2xl font-bold">{clientsData.companies}</p>
                  </div>
                  <Building className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Individuals</p>
                    <p className="text-2xl font-bold">{clientsData.individuals}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Clients</p>
                    <p className="text-2xl font-bold">{clientsData.active}</p>
                  </div>
                  <Activity className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Retention Rate</p>
                    <p className="text-2xl font-bold">{clientsData.retention}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'performance':
        const performanceData = data as PerformanceData;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <p className="text-2xl font-bold">{performanceData.efficiency}%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Satisfaction</p>
                    <p className="text-2xl font-bold">{performanceData.satisfaction}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  const generateReport = () => {
    const reportContent = `
${reportType.toUpperCase()} REPORT
Generated on: ${new Date().toLocaleDateString()}
Period: ${dateRange}

${JSON.stringify(reportData[0], null, 2)}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Report generated and downloaded successfully"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive business insights and analytics</p>
          </div>
          
          <Button onClick={generateReport} className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Generate Report</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="projects">Projects</SelectItem>
                    <SelectItem value="clients">Clients</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        {renderMetrics()}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Tooltip />
                  <RechartsPieChart data={chartData} cx="50%" cy="50%" outerRadius={80}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
