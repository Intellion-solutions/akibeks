import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  DollarSign,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Star,
  TrendingUp,
  Calendar,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  MoreHorizontal,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEO/SEOHead";
import { secureDb, Client, Project, User as DatabaseUser, SecureResponse } from '@/lib/database-secure';

interface ClientStats {
  total: number;
  active: number;
  prospects: number;
  totalValue: number;
  averageProjectValue: number;
  conversionRate: number;
}

interface ClientFilters {
  status?: string;
  industry?: string;
  search?: string;
  minValue?: number;
  maxValue?: number;
}

interface ClientWithProjects extends Client {
  projectsData?: Project[];
  lastActivity?: string;
  upcomingTasks?: number;
}

const AdminClients: React.FC = () => {
  const [clients, setClients] = useState<ClientWithProjects[]>([]);
  const [stats, setStats] = useState<ClientStats>({
    total: 0,
    active: 0,
    prospects: 0,
    totalValue: 0,
    averageProjectValue: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ClientFilters>({});
  const [selectedClient, setSelectedClient] = useState<ClientWithProjects | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    industry: '',
    website: '',
    status: 'prospect',
    notes: '',
    totalValue: 0,
    projects: [],
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch clients with filters
      const clientsResponse = await secureDb.getClients({
        limit: 100,
        status: filters.status,
        industry: filters.industry,
      });

      if (clientsResponse.success && clientsResponse.data) {
        let filteredClients = clientsResponse.data;

        // Apply client-side filters
        if (filters.search) {
          filteredClients = filteredClients.filter(client =>
            client.companyName.toLowerCase().includes(filters.search!.toLowerCase()) ||
            client.contactPerson.toLowerCase().includes(filters.search!.toLowerCase()) ||
            client.email.toLowerCase().includes(filters.search!.toLowerCase())
          );
        }

        if (filters.minValue !== undefined) {
          filteredClients = filteredClients.filter(client => client.totalValue >= filters.minValue!);
        }

        if (filters.maxValue !== undefined) {
          filteredClients = filteredClients.filter(client => client.totalValue <= filters.maxValue!);
        }

        // Enhance clients with additional data
        const enhancedClients: ClientWithProjects[] = await Promise.all(
          filteredClients.map(async (client) => {
            // Fetch projects for each client
            const projectsResponse = await secureDb.getProjects({ 
              limit: 10,
              clientId: client.id 
            });

            const projectsData = projectsResponse.success && projectsResponse.data 
              ? projectsResponse.data.data 
              : [];

            return {
              ...client,
              projectsData,
              lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              upcomingTasks: Math.floor(Math.random() * 5),
            };
          })
        );

        setClients(enhancedClients);
        calculateStats(enhancedClients);
      } else {
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast({
        title: "Error",
        description: "Failed to load client data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientList: ClientWithProjects[]) => {
    const total = clientList.length;
    const active = clientList.filter(c => c.status === 'active').length;
    const prospects = clientList.filter(c => c.status === 'prospect').length;
    const totalValue = clientList.reduce((sum, client) => sum + client.totalValue, 0);
    const averageProjectValue = total > 0 ? totalValue / total : 0;
    const conversionRate = total > 0 ? (active / total) * 100 : 0;

    setStats({
      total,
      active,
      prospects,
      totalValue,
      averageProjectValue,
      conversionRate: Math.round(conversionRate),
    });
  };

  const handleCreateClient = async () => {
    try {
      if (!newClient.companyName || !newClient.contactPerson || !newClient.email) {
        toast({
          title: "Error",
          description: "Company name, contact person, and email are required",
          variant: "destructive",
        });
        return;
      }

      const clientData = {
        ...newClient,
        projects: [],
        totalValue: 0,
      } as Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;

      const response = await secureDb.createClient(clientData);

      if (response.success && response.data) {
        const enhancedClient: ClientWithProjects = {
          ...response.data,
          projectsData: [],
          lastActivity: new Date().toISOString(),
          upcomingTasks: 0,
        };

        setClients(prev => [enhancedClient, ...prev]);
        setIsCreateDialogOpen(false);
        setNewClient({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
          industry: '',
          website: '',
          status: 'prospect',
          notes: '',
          totalValue: 0,
          projects: [],
        });
        
        toast({
          title: "Success",
          description: "Client created successfully",
        });

        // Recalculate stats
        const updatedClients = [enhancedClient, ...clients];
        calculateStats(updatedClients);
      } else {
        throw new Error(response.error || 'Failed to create client');
      }
    } catch (error) {
      console.error('Failed to create client:', error);
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'prospect': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      case 'prospect': return <Star className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getIndustryIcon = (industry: string) => {
    // Simple industry icons mapping
    const icons: Record<string, React.ReactNode> = {
      construction: <Building2 className="h-4 w-4" />,
      technology: <Activity className="h-4 w-4" />,
      healthcare: <Plus className="h-4 w-4" />,
      education: <FileText className="h-4 w-4" />,
      retail: <Users className="h-4 w-4" />,
    };
    return icons[industry.toLowerCase()] || <Building2 className="h-4 w-4" />;
  };

  if (loading) {
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
        title="Client Management - Admin Panel"
        description="Comprehensive client relationship management system with project tracking and analytics."
        noindex={true}
        nofollow={true}
      />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Client Management
            </h1>
            <p className="text-gray-600 mt-1">Manage client relationships and track business opportunities</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Client
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prospects</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.prospects}</p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Value</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.averageProjectValue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.conversionRate}%</p>
                </div>
                <Activity className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.status || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.industry || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Min Value (KES)"
                value={filters.minValue || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minValue: e.target.value ? parseFloat(e.target.value) : undefined }))}
              />

              <Input
                type="number"
                placeholder="Max Value (KES)"
                value={filters.maxValue || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, maxValue: e.target.value ? parseFloat(e.target.value) : undefined }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              Manage client relationships and track business opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {getIndustryIcon(client.industry)}
                          {client.companyName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.website && (
                            <a 
                              href={client.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.contactPerson}</div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {getIndustryIcon(client.industry)}
                        {client.industry}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(client.status)}
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {client.projectsData?.length || 0}
                        </div>
                        <div className="text-xs text-gray-500">projects</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {formatCurrency(client.totalValue)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {client.lastActivity ? new Date(client.lastActivity).toLocaleDateString() : 'Never'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedClient(client);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Client Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
              <DialogDescription>
                Add a new client to track relationships and business opportunities.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input
                    value={newClient.companyName || ''}
                    onChange={(e) => setNewClient(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Person *</label>
                  <Input
                    value={newClient.contactPerson || ''}
                    onChange={(e) => setNewClient(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="Contact person name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={newClient.email || ''}
                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={newClient.phone || ''}
                    onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <Textarea
                  value={newClient.address || ''}
                  onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Company address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Industry</label>
                  <Select value={newClient.industry} onValueChange={(value) => setNewClient(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={newClient.website || ''}
                    onChange={(e) => setNewClient(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={newClient.notes || ''}
                  onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the client"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClient}>
                Create Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Client Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedClient?.companyName}
              </DialogTitle>
              <DialogDescription>
                Client details and project history
              </DialogDescription>
            </DialogHeader>
            
            {selectedClient && (
              <div className="space-y-6">
                {/* Client Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span>{selectedClient.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-600" />
                        <a href={`mailto:${selectedClient.email}`} className="text-blue-600 hover:underline">
                          {selectedClient.email}
                        </a>
                      </div>
                      {selectedClient.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-600" />
                          <a href={`tel:${selectedClient.phone}`} className="text-blue-600 hover:underline">
                            {selectedClient.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">{selectedClient.address}</span>
                      </div>
                      {selectedClient.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-600" />
                          <a 
                            href={selectedClient.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Visit Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Business Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Industry</label>
                        <div className="flex items-center gap-2 mt-1">
                          {getIndustryIcon(selectedClient.industry)}
                          <Badge variant="outline">{selectedClient.industry}</Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Status</label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(selectedClient.status)}
                          <Badge className={getStatusColor(selectedClient.status)}>
                            {selectedClient.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Total Value</label>
                        <div className="text-lg font-bold text-green-600 mt-1">
                          {formatCurrency(selectedClient.totalValue)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Projects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Projects ({selectedClient.projectsData?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedClient.projectsData && selectedClient.projectsData.length > 0 ? (
                      <div className="space-y-3">
                        {selectedClient.projectsData.map((project) => (
                          <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{project.title}</div>
                              <div className="text-sm text-gray-500">{project.description}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-green-600">
                                {formatCurrency(project.budgetKes)}
                              </div>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No projects found for this client</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedClient.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedClient.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminClients;