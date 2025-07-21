
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileText, ArrowLeft, Plus, Edit, Trash2, Eye, Send } from "lucide-react";
import { supabase } from "@/lib/db-client";
import { useAdmin } from "@/contexts/AdminContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";

interface Quote {
  id: string;
  quote_number: string;
  client_id: string;
  total_amount: number;
  valid_until: string;
  status: string;
  created_at: string;
  terms?: string;
  clients?: {
    full_name: string;
    company_name?: string;
    email?: string;
    phone: string;
  };
}

interface Client {
  id: string;
  full_name: string;
  company_name?: string;
  email?: string;
  phone: string;
}

const AdminQuotations = () => {
  const { isAuthenticated, companySettings } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateQuote, setShowCreateQuote] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [newQuote, setNewQuote] = useState({
    clientId: "",
    validUntil: "",
    terms: "",
    items: [{ description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]
  });

  useEffect(() => {
    fetchQuotes();
    fetchClients();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (
            full_name,
            company_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to load quotations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleCreateQuote = async () => {
    try {
      if (!newQuote.clientId || newQuote.items.length === 0) {
        toast({
          title: "Error",
          description: "Please select a client and add at least one item",
          variant: "destructive"
        });
        return;
      }

      const totalAmount = newQuote.items.reduce((sum, item) => sum + item.totalPrice, 0);

      const { error } = await supabase
        .from('quotes')
        .insert({
          client_id: newQuote.clientId,
          total_amount: totalAmount,
          valid_until: newQuote.validUntil || null,
          terms: newQuote.terms,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote created successfully",
      });

      setShowCreateQuote(false);
      setNewQuote({
        clientId: "",
        validUntil: "",
        terms: "",
        items: [{ description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]
      });
      
      await fetchQuotes();
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({
        title: "Error",
        description: "Failed to create quote",
        variant: "destructive"
      });
    }
  };

  const addQuoteItem = () => {
    setNewQuote(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]
    }));
  };

  const removeQuoteItem = (index: number) => {
    if (newQuote.items.length > 1) {
      setNewQuote(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateQuoteItem = (index: number, field: string, value: any) => {
    setNewQuote(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const deleteQuote = async (quoteId: string) => {
    if (!confirm("Are you sure you want to delete this quote?")) return;

    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });

      await fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast({
        title: "Error",
        description: "Failed to delete quote",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      case "sent": return "outline";
      default: return "secondary";
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const clientName = quote.clients?.company_name || quote.clients?.full_name || '';
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || quote.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const currencySymbol = companySettings?.currency_symbol || 'KSh';

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="w-8 h-8 mr-3" />
                Quotations Management
              </h1>
              <p className="text-gray-600 mt-2">Create and manage professional quotations</p>
            </div>
          </div>
          
          <Button onClick={() => setShowCreateQuote(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Quote
          </Button>
        </div>

        <div className="mb-6 flex gap-4">
          <Input
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quote.quote_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.clients?.company_name || quote.clients?.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currencySymbol} {quote.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteQuote(quote.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={showCreateQuote} onOpenChange={setShowCreateQuote}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select value={newQuote.clientId} onValueChange={(value) => setNewQuote(prev => ({...prev, clientId: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name || client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    type="date"
                    value={newQuote.validUntil}
                    onChange={(e) => setNewQuote(prev => ({...prev, validUntil: e.target.value}))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  value={newQuote.terms}
                  onChange={(e) => setNewQuote(prev => ({...prev, terms: e.target.value}))}
                  placeholder="Enter terms and conditions..."
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Quote Items</Label>
                  <Button type="button" onClick={addQuoteItem} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                
                {newQuote.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-5">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateQuoteItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuoteItem(index, 'quantity', parseFloat(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateQuoteItem(index, 'unitPrice', parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Total</Label>
                        <Input
                          value={item.totalPrice.toLocaleString()}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="col-span-1">
                        {newQuote.items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuoteItem(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>{currencySymbol} {newQuote.items.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateQuote(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateQuote}>
                Create Quote
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminQuotations;
