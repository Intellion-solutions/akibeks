
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Plus,
  BarChart3,
  Activity,
  Building2,
  Wrench
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface DashboardStats {
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  activeProjects: number;
  completedProjects: number;
  totalTestimonials: number;
  approvedTestimonials: number;
  totalServices: number;
  activeServices: number;
  featuredServices: number;
  totalProjectsShowcase: number;
  featuredProjectsShowcase: number;
}

interface RecentActivity {
  id: string;
  type: 'invoice' | 'project' | 'client' | 'testimonial';
  title: string;
  description: string;
  date: string;
  status?: string;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTestimonials: 0,
    approvedTestimonials: 0,
    totalServices: 0,
    activeServices: 0,
    featuredServices: 0,
    totalProjectsShowcase: 0,
    featuredProjectsShowcase: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all stats in parallel
      const [
        clientsResponse,
        invoicesResponse,
        projectsResponse,
        testimonialsResponse,
        servicesResponse,
        projectsShowcaseResponse,
      ] = await Promise.all([
        supabase.from('clients').select('id, created_at'),
        supabase.from('invoices').select('id, total_amount, status, created_at, due_date'),
        supabase.from('projects').select('id, status, created_at, title'),
        supabase.from('testimonials').select('id, is_approved, created_at, client_name, content'),
        supabase.from('services_content').select('id, is_active, is_featured, created_at, title'),
        supabase.from('projects_showcase').select('id, is_active, is_featured, created_at, title'),
      ]);

      const clients = clientsResponse.data || [];
      const invoices = invoicesResponse.data || [];
      const projects = projectsResponse.data || [];
      const testimonials = testimonialsResponse.data || [];
      const services = servicesResponse.data || [];
      const projectsShowcase = projectsShowcaseResponse.data || [];

      // Calculate stats
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length;
      
      const overdueInvoices = invoices.filter(inv => {
        if (inv.status !== 'sent') return false;
        const dueDate = new Date(inv.due_date);
        const today = new Date();
        return dueDate < today;
      }).length;

      const activeProjects = projects.filter(p => p.status === 'in_progress').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const approvedTestimonials = testimonials.filter(t => t.is_approved).length;
      const activeServices = services.filter(s => s.is_active).length;
      const featuredServices = services.filter(s => s.is_featured).length;
      const featuredProjectsShowcase = projectsShowcase.filter(p => p.is_featured).length;

      setStats({
        totalClients: clients.length,
        totalInvoices: invoices.length,
        totalRevenue,
        pendingInvoices,
        overdueInvoices,
        activeProjects,
        completedProjects,
        totalTestimonials: testimonials.length,
        approvedTestimonials,
        totalServices: services.length,
        activeServices,
        featuredServices,
        totalProjectsShowcase: projectsShowcase.length,
        featuredProjectsShowcase
      });

      // Generate recent activity
      const activities: RecentActivity[] = [
        ...invoices.slice(-3).map(inv => ({
          id: inv.id,
          type: 'invoice' as const,
          title: `Invoice Created`,
          description: `New invoice for KSh ${inv.total_amount?.toLocaleString()}`,
          date: inv.created_at,
          status: inv.status
        })),
        ...projects.slice(-2).map(proj => ({
          id: proj.id,
          type: 'project' as const,
          title: proj.title,
          description: `Project status: ${proj.status}`,
          date: proj.created_at,
          status: proj.status
        })),
        ...testimonials.slice(-2).map(test => ({
          id: test.id,
          type: 'testimonial' as const,
          title: `Testimonial from ${test.client_name}`,
          description: test.content.substring(0, 100) + '...',
          date: test.created_at,
          status: test.is_approved ? 'approved' : 'pending'
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      setRecentActivity(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Create Invoice",
      description: "Generate a new invoice",
      icon: FileText,
      onClick: () => navigate('/admin/invoices'),
      color: "bg-blue-500"
    },
    {
      title: "Add Client",
      description: "Register new client",
      icon: Users,
      onClick: () => navigate('/admin/clients'),
      color: "bg-green-500"
    },
    {
      title: "New Project",
      description: "Start a new project",
      icon: Building2,
      onClick: () => navigate('/admin/projects'),
      color: "bg-purple-500"
    },
    {
      title: "Manage Services",
      description: "Update service offerings",
      icon: Wrench,
      onClick: () => navigate('/admin/services'),
      color: "bg-orange-500"
    }
  ];

  const getStatusIcon = (type: string, status?: string) => {
    if (type === 'invoice') {
      switch (status) {
        case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
        case 'sent': return <Clock className="w-4 h-4 text-blue-600" />;
        case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />;
        default: return <FileText className="w-4 h-4 text-gray-600" />;
      }
    }
    if (type === 'testimonial') {
      return status === 'approved' ? 
        <Star className="w-4 h-4 text-yellow-600" /> : 
        <Clock className="w-4 h-4 text-orange-600" />;
    }
    return <Activity className="w-4 h-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening with your business."
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KSh {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalInvoices} total invoices
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Registered clients
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <div className="p-2 bg-orange-100 rounded-full">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueInvoices} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow"
                onClick={action.onClick}
              >
                <div className={`p-3 ${action.color} rounded-full`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Management Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Website Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Services</p>
                <p className="text-sm text-muted-foreground">
                  {stats.activeServices} active, {stats.featuredServices} featured
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.totalServices}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/services')}
                >
                  Manage
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Project Showcase</p>
                <p className="text-sm text-muted-foreground">
                  {stats.featuredProjectsShowcase} featured projects
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.totalProjectsShowcase}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/projects')}
                >
                  Manage
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Testimonials</p>
                <p className="text-sm text-muted-foreground">
                  {stats.approvedTestimonials} approved
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.totalTestimonials}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/testimonials')}
                >
                  Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Personnel Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Admin Personnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <p className="text-sm text-muted-foreground">Active Admins</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <p className="text-sm text-muted-foreground">Login Sessions</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/admin/personnel')}
                  className="flex-1"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Personnel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/personnel?tab=security')}
                  className="flex-1"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Security Events
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(activity.type, activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    {activity.status && (
                      <Badge 
                        variant={
                          activity.status === 'paid' || activity.status === 'approved' || activity.status === 'completed' 
                            ? 'default' 
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Invoice Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {((stats.totalInvoices - stats.pendingInvoices) / Math.max(stats.totalInvoices, 1) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Invoices Paid</p>
              <Progress 
                value={(stats.totalInvoices - stats.pendingInvoices) / Math.max(stats.totalInvoices, 1) * 100} 
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {(stats.pendingInvoices / Math.max(stats.totalInvoices, 1) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Pending Payment</p>
              <Progress 
                value={stats.pendingInvoices / Math.max(stats.totalInvoices, 1) * 100} 
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {(stats.overdueInvoices / Math.max(stats.totalInvoices, 1) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <Progress 
                value={stats.overdueInvoices / Math.max(stats.totalInvoices, 1) * 100} 
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
