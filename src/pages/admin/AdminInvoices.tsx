
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileText, ArrowLeft, Trash2, DollarSign, Calendar, Plus } from "lucide-react";
import { supabase } from "@/lib/db-client";
import { useAdmin } from "@/contexts/AdminContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";
import InvoiceViewer from "@/components/InvoiceViewer";
import InvoiceStats from "@/components/admin/invoices/InvoiceStats";
import InvoiceFilters from "@/components/admin/invoices/InvoiceFilters";
import CreateInvoiceDialog from "@/components/admin/invoices/CreateInvoiceDialog";
import InvoiceList from "@/components/admin/invoices/InvoiceList";
import AdminInvoiceTable from "@/components/admin/invoices/AdminInvoiceTable";
import InvoiceTableView from "@/components/admin/invoices/InvoiceTableView";
import AuditLog from "@/components/admin/AuditLog";

interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  created_at: string;
  notes?: string;
  payment_terms?: string;
  template_type?: string;
  letterhead_enabled?: boolean;
  clients?: {
    full_name: string;
    company_name?: string;
    phone: string;
    email?: string;
    address: string;
  };
}

interface Client {
  id: string;
  full_name: string;
  company_name?: string;
  email?: string;
  phone: string;
}

interface InvoiceTemplate {
  id: string;
  template_name: string;
  template_type: string;
  is_default: boolean;
  color_scheme: any;
}

const AdminInvoices = () => {
  const { isAuthenticated, companySettings } = useAdmin();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
  const [includeLaborInSubtotal, setIncludeLaborInSubtotal] = useState(false);

  const [newInvoice, setNewInvoice] = useState({
    clientId: "",
    dueDate: "",
    paymentTerms: "Net 30",
    notes: "",
    templateType: "standard",
    letterheadEnabled: true,
    taxRate: 16,
    discountAmount: 0,
    items: [{ 
      description: "", 
      quantity: 1, 
      unit_price: 0, 
      material_cost: 0,
      labor_percentage: 36.5,
      labor_charge: 0,
      total_price: 0,
      section: "General"
    }]
  });

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchTemplates();
  }, []);

  const [showAuditLog, setShowAuditLog] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            full_name,
            company_name,
            phone,
            email,
            address
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
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

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .order('template_name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const getTotalMaterialCost = () => {
    return newInvoice.items.reduce((total, item) => total + (item.material_cost * item.quantity), 0);
  };

  const getTotalLaborCharges = () => {
    return newInvoice.items.reduce((total, item) => {
      const materialCost = item.material_cost * item.quantity;
      const laborCharge = item.labor_charge || (materialCost * ((item.labor_percentage || 36) / 100));
      return total + laborCharge;
    }, 0);
  };

  const getGrandTotal = () => {
    const materialCost = getTotalMaterialCost();
    const laborCharges = getTotalLaborCharges();
    const subtotal = includeLaborInSubtotal ? materialCost + laborCharges : materialCost;
    return subtotal - newInvoice.discountAmount;
  };

  const getTotalRevenue = () => {
    return invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  };

  const getPaidAmount = () => {
    return invoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);
  };

  const getOutstandingAmount = () => {
    return getTotalRevenue() - getPaidAmount();
  };

  const getOverdueInvoices = () => {
    const today = new Date();
    return invoices.filter(inv => 
      inv.due_date && new Date(inv.due_date) < today && inv.status !== 'paid'
    ).length;
  };

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      return;
    }

    try {
      // First delete invoice items
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (itemsError) throw itemsError;

      // Then delete the invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (invoiceError) throw invoiceError;

      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });

      await fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive"
      });
    }
  };

  const sendInvoiceViaWhatsApp = async (invoiceId: string) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice || !invoice.clients?.phone) {
        toast({
          title: "Error",
          description: "Client phone number not found",
          variant: "destructive"
        });
        return;
      }

      const clientPhone = invoice.clients.phone.replace(/[^\d]/g, ''); // Remove non-digits
      const clientName = invoice.clients.full_name || invoice.clients.company_name;
      const companyName = companySettings?.company_name || 'AKIBEKS Engineering Solutions';
      
      // Create a simple message with invoice details
      const message = `Dear ${clientName},

Greetings from ${companyName}!

Please find your invoice details below:
📄 Invoice Number: ${invoice.invoice_number}
💰 Amount: KSh ${invoice.total_amount.toLocaleString()}
📅 Due Date: ${new Date(invoice.due_date).toLocaleDateString()}

Payment Details:
• Bank: Equity Bank Kenya
• A/C: 123 567 890
• A/C Name: ${companyName}

This is a system-generated invoice. For any queries, please contact us.

Thank you for your business!

Best regards,
${companyName}
📞 +254 710 245 118
✉️ info@akibeks.co.ke`;
      
      const whatsappUrl = `https://wa.me/${clientPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: "WhatsApp Opened",
        description: "Invoice details sent via WhatsApp",
      });

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: "Error",
        description: "Failed to send WhatsApp message",
        variant: "destructive"
      });
    }
  };

  const handleEditInvoice = (invoiceId: string) => {
    console.log('Edit invoice:', invoiceId);
    handleViewInvoice(invoiceId);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const clientName = invoice.clients?.company_name || invoice.clients?.full_name || '';
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "secondary";
      case "overdue": return "destructive";
      case "draft": return "outline";
      default: return "secondary";
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setShowInvoiceViewer(true);
  };

  const getSectionSubtotal = (sectionName: string) => {
    return newInvoice.items
      .filter(item => item.section === sectionName)
      .reduce((total, item) => total + (item.material_cost * item.quantity), 0);
  };

  const getSectionLaborCharge = (sectionName: string, laborPercentage: number = 36) => {
    const sectionSubtotal = getSectionSubtotal(sectionName);
    return sectionSubtotal * (laborPercentage / 100);
  };

  const handleCreateInvoice = async () => {
    try {
      if (!newInvoice.clientId || newInvoice.items.length === 0) {
        toast({
          title: "Error",
          description: "Please select a client and add at least one item",
          variant: "destructive"
        });
        return;
      }

      const subtotal = newInvoice.items.reduce((sum, item) => sum + item.total_price, 0);
      const taxAmount = subtotal * (newInvoice.taxRate / 100);
      const totalAmount = subtotal + taxAmount - newInvoice.discountAmount;
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: '', // Auto-generated
          client_id: newInvoice.clientId,
          subtotal: subtotal,
          tax_rate: newInvoice.taxRate,
          tax_amount: taxAmount,
          discount_amount: newInvoice.discountAmount,
          total_amount: totalAmount,
          due_date: newInvoice.dueDate || null,
          payment_terms: newInvoice.paymentTerms,
          notes: newInvoice.notes,
          template_type: newInvoice.templateType,
          letterhead_enabled: newInvoice.letterheadEnabled,
          status: 'draft'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsToInsert = newInvoice.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        material_cost: item.material_cost,
        labor_percentage: item.labor_percentage,
        labor_charge: item.labor_charge,
        total_price: item.total_price,
        section: item.section
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Invoice Created",
        description: "New invoice has been generated successfully.",
      });

      setShowCreateInvoice(false);
      setNewInvoice({
        clientId: "",
        dueDate: "",
        paymentTerms: "Net 30",
        notes: "",
        templateType: "standard",
        letterheadEnabled: true,
        taxRate: 16,
        discountAmount: 0,
        items: [{ 
          description: "", 
          quantity: 1, 
          unit_price: 0, 
          material_cost: 0,
          labor_percentage: 36.5,
          labor_charge: 0,
          total_price: 0,
          section: "General"
        }]
      });
      
      await fetchInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
    }
  };

  const addInvoiceItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { 
        description: "", 
        quantity: 1, 
        unit_price: 0, 
        material_cost: 0,
        labor_percentage: 36.5,
        labor_charge: 0,
        total_price: 0,
        section: "General"
      }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    if (newInvoice.items.length > 1) {
      setNewInvoice(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          if (field === "material_cost" || field === "quantity") {
            updatedItem.total_price = updatedItem.material_cost * updatedItem.quantity;
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

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
                Invoice Management
              </h1>
              <p className="text-gray-600 mt-2">Create and manage professional invoices</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateInvoice(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAuditLog(!showAuditLog)}
              className="flex items-center gap-2"
            >
              📊 Audit Log
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold">{invoices.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {currencySymbol} {getTotalRevenue().toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {currencySymbol} {getPaidAmount().toLocaleString()}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {currencySymbol} {getOutstandingAmount().toLocaleString()}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {getOverdueInvoices()}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {showAuditLog && (
          <div className="mb-8">
            <AuditLog />
          </div>
        )}

        <div className="mb-6">
          <CreateInvoiceDialog
            open={showCreateInvoice}
            onOpenChange={setShowCreateInvoice}
            newInvoice={newInvoice}
            setNewInvoice={setNewInvoice}
            clients={clients}
            templates={templates}
            onCreateInvoice={handleCreateInvoice}
            addInvoiceItem={addInvoiceItem}
            removeInvoiceItem={removeInvoiceItem}
            updateInvoiceItem={updateInvoiceItem}
            getSubtotal={getTotalMaterialCost}
            getSectionSubtotal={getSectionSubtotal}
            getSectionLaborCharge={getSectionLaborCharge}
            getTotalLaborCharges={getTotalLaborCharges}
            getTotalAmount={getGrandTotal}
            currencySymbol={currencySymbol}
            includeLaborInSubtotal={includeLaborInSubtotal}
            setIncludeLaborInSubtotal={setIncludeLaborInSubtotal}
          />
        </div>

        <InvoiceFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        <div className="mb-8">
          <AdminInvoiceTable
            invoices={filteredInvoices}
            currencySymbol={currencySymbol}
            onView={handleViewInvoice}
            onEdit={handleEditInvoice}
            onDelete={deleteInvoice}
            onSendWhatsApp={sendInvoiceViaWhatsApp}
            getStatusColor={getStatusColor}
          />
        </div>

        <InvoiceViewer
          invoiceId={selectedInvoiceId || ''}
          open={showInvoiceViewer}
          onOpenChange={setShowInvoiceViewer}
        />
      </div>
    </div>
  );
};

export default AdminInvoices;
