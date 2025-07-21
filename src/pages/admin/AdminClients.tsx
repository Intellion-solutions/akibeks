
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Plus, Edit, Eye, Phone, Mail, MapPin, User, Calendar, Trash2, 
  Building2, CreditCard, FileText, History, DollarSign, Filter, Download, 
  Send, MessageSquare, Star, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/db-client";
import { useAdmin } from "@/contexts/AdminContext";
import { formatKES, formatDisplayAmount } from "@/lib/currency-utils";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

interface Client {
  id: string;
  full_name: string;
  company_name?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  county?: string;
  postal_code?: string;
  id_number?: string;
  kra_pin?: string;
  client_type: 'individual' | 'company';
  status: 'active' | 'inactive' | 'pending';
  credit_limit?: number;
  outstanding_balance?: number;
  total_projects?: number;
  last_project_date?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  payment_terms?: string;
  preferred_contact?: 'phone' | 'email' | 'whatsapp';
  rating?: number;
}

interface ClientProject {
  id: string;
  title: string;
  status: string;
  total_amount: number;
  start_date: string;
  end_date?: string;
}

interface ClientTransaction {
  id: string;
  type: 'invoice' | 'payment' | 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: string;
}

const AdminClients = () => {
  const { isAuthenticated } = useAdmin();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [clientTransactions, setClientTransactions] = useState<ClientTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Client>>({
    full_name: "",
    company_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    county: "",
    postal_code: "",
    id_number: "",
    kra_pin: "",
    client_type: 'individual',
    status: 'active',
    credit_limit: 0,
    notes: "",
    payment_terms: "30 days",
    preferred_contact: 'phone',
    rating: 5
  });

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          projects(count),
          invoices(sum(total_amount), count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const clientsWithStats = data?.map(client => ({
        ...client,
        total_projects: client.projects?.[0]?.count || 0,
        outstanding_balance: client.invoices?.[0]?.sum || 0
      })) || [];

      setClients(clientsWithStats);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (clientId: string) => {
    try {
      // Fetch client projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, title, status, total_amount, start_date, end_date')
        .eq('client_id', clientId)
        .order('start_date', { ascending: false });

      setClientProjects(projects || []);

      // Fetch client transactions (invoices, payments)
      const { data: transactions } = await supabase
        .from('invoices')
        .select('id, amount as amount, description, created_at as date, status')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      const formattedTransactions = transactions?.map(t => ({
        ...t,
        type: 'invoice' as const,
        amount: t.amount || 0
      })) || [];

      setClientTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching client details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedClient) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedClient.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Client updated successfully",
        });
        setIsEditDialogOpen(false);
      } else {
        // Create new client
        const { error } = await supabase
          .from('clients')
          .insert([{
            ...formData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Client created successfully",
        });
        setIsCreateDialogOpen(false);
      }

      fetchClients();
      resetForm();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Error",
        description: "Failed to save client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', selectedClient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      company_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      county: "",
      postal_code: "",
      id_number: "",
      kra_pin: "",
      client_type: 'individual',
      status: 'active',
      credit_limit: 0,
      notes: "",
      payment_terms: "30 days",
      preferred_contact: 'phone',
      rating: 5
    });
    setSelectedClient(null);
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setFormData(client);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (client: Client) => {
    setSelectedClient(client);
    fetchClientDetails(client.id);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);

    const matchesStatus = filterStatus === "all" || client.status === filterStatus;
    const matchesType = filterType === "all" || client.client_type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      pending: "outline"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      individual: "secondary",
      company: "default"
    } as const;
    
    return <Badge variant={variants[type as keyof typeof variants] || "outline"}>{type}</Badge>;
  };

  const exportClients = async () => {
    try {
      const csvContent = [
        'Name,Company,Email,Phone,Type,Status,Outstanding Balance,Total Projects',
        ...filteredClients.map(client => 
          `"${client.full_name}","${client.company_name || ''}","${client.email || ''}","${client.phone}","${client.client_type}","${client.status}","${client.outstanding_balance || 0}","${client.total_projects || 0}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Clients exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export clients",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AdminPageHeader
            title="Client Management"
            description="Manage your clients, track projects, and monitor financial relationships"
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <User className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clients.filter(c => c.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDisplayAmount(clients.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies</CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clients.filter(c => c.client_type === 'company').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients by name, company, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={exportClients}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                      Create a new client profile with contact and business information.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client_type">Client Type</Label>
                        <Select 
                          value={formData.client_type} 
                          onValueChange={(value: 'individual' | 'company') => setFormData({...formData, client_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value: 'active' | 'inactive' | 'pending') => setFormData({...formData, status: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          required
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                          placeholder="Enter company name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="email@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          required
                          placeholder="+254 7XX XXX XXX"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Enter physical address"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder="Nairobi"
                        />
                      </div>

                      <div>
                        <Label htmlFor="county">County</Label>
                        <Select 
                          value={formData.county} 
                          onValueChange={(value) => setFormData({...formData, county: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select county" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nairobi">Nairobi</SelectItem>
                            <SelectItem value="mombasa">Mombasa</SelectItem>
                            <SelectItem value="kiambu">Kiambu</SelectItem>
                            <SelectItem value="nakuru">Nakuru</SelectItem>
                            <SelectItem value="uasin-gishu">Uasin Gishu</SelectItem>
                            <SelectItem value="machakos">Machakos</SelectItem>
                            <SelectItem value="kajiado">Kajiado</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input
                          id="postal_code"
                          value={formData.postal_code}
                          onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                          placeholder="00100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="id_number">ID Number</Label>
                        <Input
                          id="id_number"
                          value={formData.id_number}
                          onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                          placeholder="12345678"
                        />
                      </div>

                      <div>
                        <Label htmlFor="kra_pin">KRA PIN</Label>
                        <Input
                          id="kra_pin"
                          value={formData.kra_pin}
                          onChange={(e) => setFormData({...formData, kra_pin: e.target.value})}
                          placeholder="A123456789X"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="credit_limit">Credit Limit (KES)</Label>
                        <Input
                          id="credit_limit"
                          type="number"
                          value={formData.credit_limit}
                          onChange={(e) => setFormData({...formData, credit_limit: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="payment_terms">Payment Terms</Label>
                        <Select 
                          value={formData.payment_terms} 
                          onValueChange={(value) => setFormData({...formData, payment_terms: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="7 days">7 days</SelectItem>
                            <SelectItem value="14 days">14 days</SelectItem>
                            <SelectItem value="30 days">30 days</SelectItem>
                            <SelectItem value="45 days">45 days</SelectItem>
                            <SelectItem value="60 days">60 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="preferred_contact">Preferred Contact Method</Label>
                      <Select 
                        value={formData.preferred_contact} 
                        onValueChange={(value: 'phone' | 'email' | 'whatsapp') => setFormData({...formData, preferred_contact: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional notes about the client..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Client"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Clients Table */}
          <Card>
            <CardHeader>
              <CardTitle>Clients ({filteredClients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{client.full_name}</div>
                            {client.company_name && (
                              <div className="text-sm text-gray-500">{client.company_name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {client.phone}
                            </div>
                            {client.email && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="h-3 w-3 mr-1" />
                                {client.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(client.client_type)}</TableCell>
                        <TableCell>{getStatusBadge(client.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.total_projects || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={client.outstanding_balance && client.outstanding_balance > 0 ? "text-red-600 font-medium" : ""}>
                            {formatDisplayAmount(client.outstanding_balance || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            {client.rating || 5}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViewDialog(client)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(client)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(client)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
                <DialogDescription>
                  Update client information and settings.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Same form structure as create dialog */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_type">Client Type</Label>
                    <Select 
                      value={formData.client_type} 
                      onValueChange={(value: 'individual' | 'company') => setFormData({...formData, client_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: 'active' | 'inactive' | 'pending') => setFormData({...formData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Client"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* View Client Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Client Details</DialogTitle>
                <DialogDescription>
                  Complete client information and transaction history.
                </DialogDescription>
              </DialogHeader>
              
              {selectedClient && (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="communications">Communications</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Full Name</Label>
                            <p>{selectedClient.full_name}</p>
                          </div>
                          {selectedClient.company_name && (
                            <div>
                              <Label className="text-sm font-medium">Company</Label>
                              <p>{selectedClient.company_name}</p>
                            </div>
                          )}
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p>{selectedClient.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Phone</Label>
                            <p>{selectedClient.phone}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Address</Label>
                            <p>{selectedClient.address || 'Not provided'}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Financial Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Outstanding Balance</Label>
                            <p className="text-lg font-semibold text-red-600">
                              {formatDisplayAmount(selectedClient.outstanding_balance || 0)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Credit Limit</Label>
                            <p>{formatDisplayAmount(selectedClient.credit_limit || 0)}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Payment Terms</Label>
                            <p>{selectedClient.payment_terms || 'Not set'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Total Projects</Label>
                            <p>{selectedClient.total_projects || 0}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="projects" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Client Projects</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {clientProjects.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Project</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clientProjects.map((project) => (
                                <TableRow key={project.id}>
                                  <TableCell className="font-medium">{project.title}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{project.status}</Badge>
                                  </TableCell>
                                  <TableCell>{formatDisplayAmount(project.total_amount)}</TableCell>
                                  <TableCell>{new Date(project.start_date).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-center text-gray-500 py-4">No projects found for this client</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="transactions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {clientTransactions.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clientTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{transaction.type}</Badge>
                                  </TableCell>
                                  <TableCell>{transaction.description}</TableCell>
                                  <TableCell>{formatDisplayAmount(transaction.amount)}</TableCell>
                                  <TableCell>
                                    <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'}>
                                      {transaction.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-center text-gray-500 py-4">No transactions found for this client</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="communications" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Communication History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center text-gray-500 py-4">Communication tracking coming soon</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Client</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this client? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              
              {selectedClient && (
                <div className="py-4">
                  <p><strong>Client:</strong> {selectedClient.full_name}</p>
                  {selectedClient.company_name && (
                    <p><strong>Company:</strong> {selectedClient.company_name}</p>
                  )}
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete Client"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default AdminClients;
