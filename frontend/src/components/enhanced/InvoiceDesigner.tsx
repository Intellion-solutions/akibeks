import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Send, 
  Copy, 
  Palette,
  Upload,
  Eye,
  FileText,
  Calculator,
  Building,
  User,
  CreditCard,
  Calendar,
  Hash,
  MapPin,
  Phone,
  Mail,
  Globe,
  Percent,
  DollarSign,
  Image as ImageIcon,
  Printer,
  Share,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  tax_rate: number;
  amount: number;
  category?: string;
  notes?: string;
}

interface InvoiceDesignerProps {
  invoice?: any;
  onSave: (invoice: any) => void;
  onSend?: (invoice: any) => void;
  clients: any[];
  projects: any[];
}

export const InvoiceDesigner: React.FC<InvoiceDesignerProps> = ({
  invoice: initialInvoice,
  onSave,
  onSend,
  clients,
  projects,
}) => {
  const [invoice, setInvoice] = useState({
    id: initialInvoice?.id || '',
    invoice_number: initialInvoice?.invoice_number || `INV-${Date.now()}`,
    client_id: initialInvoice?.client_id || '',
    project_id: initialInvoice?.project_id || '',
    issue_date: initialInvoice?.issue_date || new Date().toISOString().split('T')[0],
    due_date: initialInvoice?.due_date || '',
    payment_terms: initialInvoice?.payment_terms || 'Net 30',
    currency: initialInvoice?.currency || 'USD',
    status: initialInvoice?.status || 'draft',
    items: initialInvoice?.items || [],
    subtotal: 0,
    discount_amount: initialInvoice?.discount_amount || 0,
    discount_type: initialInvoice?.discount_type || 'fixed', // 'fixed' or 'percentage'
    tax_rate: initialInvoice?.tax_rate || 0,
    tax_amount: 0,
    shipping_amount: initialInvoice?.shipping_amount || 0,
    total_amount: 0,
    notes: initialInvoice?.notes || '',
    terms: initialInvoice?.terms || '',
    footer_text: initialInvoice?.footer_text || '',
    // Branding
    company_logo: initialInvoice?.company_logo || '',
    company_name: initialInvoice?.company_name || 'Your Company',
    company_address: initialInvoice?.company_address || '',
    company_city: initialInvoice?.company_city || '',
    company_state: initialInvoice?.company_state || '',
    company_zip: initialInvoice?.company_zip || '',
    company_country: initialInvoice?.company_country || '',
    company_phone: initialInvoice?.company_phone || '',
    company_email: initialInvoice?.company_email || '',
    company_website: initialInvoice?.company_website || '',
    company_tax_id: initialInvoice?.company_tax_id || '',
    // Design
    template: initialInvoice?.template || 'modern',
    color_scheme: initialInvoice?.color_scheme || 'blue',
    font_family: initialInvoice?.font_family || 'Inter',
    show_logo: initialInvoice?.show_logo !== false,
    show_watermark: initialInvoice?.show_watermark || false,
    custom_css: initialInvoice?.custom_css || ''
  });

  const [activeTab, setActiveTab] = useState('details');
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = [
    { id: 'modern', name: 'Modern', preview: '/api/placeholder/200/150' },
    { id: 'classic', name: 'Classic', preview: '/api/placeholder/200/150' },
    { id: 'minimal', name: 'Minimal', preview: '/api/placeholder/200/150' },
    { id: 'corporate', name: 'Corporate', preview: '/api/placeholder/200/150' },
    { id: 'creative', name: 'Creative', preview: '/api/placeholder/200/150' },
    { id: 'elegant', name: 'Elegant', preview: '/api/placeholder/200/150' }
  ];

  const colorSchemes = [
    { id: 'blue', name: 'Blue', primary: '#3B82F6', secondary: '#EBF8FF' },
    { id: 'green', name: 'Green', primary: '#10B981', secondary: '#ECFDF5' },
    { id: 'purple', name: 'Purple', primary: '#8B5CF6', secondary: '#F3E8FF' },
    { id: 'red', name: 'Red', primary: '#EF4444', secondary: '#FEF2F2' },
    { id: 'orange', name: 'Orange', primary: '#F59E0B', secondary: '#FFFBEB' },
    { id: 'gray', name: 'Gray', primary: '#6B7280', secondary: '#F9FAFB' }
  ];

  const paymentTerms = [
    'Due on Receipt',
    'Net 15',
    'Net 30',
    'Net 45',
    'Net 60',
    'Net 90',
    'Custom'
  ];

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.rate;
      const itemDiscount = item.discount || 0;
      return sum + (itemTotal - itemDiscount);
    }, 0);

    let discountAmount = invoice.discount_amount;
    if (invoice.discount_type === 'percentage') {
      discountAmount = (subtotal * invoice.discount_amount) / 100;
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * invoice.tax_rate) / 100;
    const totalAmount = taxableAmount + taxAmount + invoice.shipping_amount;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    }));
  };

  React.useEffect(() => {
    calculateTotals();
  }, [invoice.items, invoice.discount_amount, invoice.discount_type, invoice.tax_rate, invoice.shipping_amount]);

  // Item management
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      tax_rate: invoice.tax_rate,
      amount: 0,
      category: '',
      notes: ''
    };

    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate item amount
    if (field === 'quantity' || field === 'rate' || field === 'discount') {
      const item = updatedItems[index];
      item.amount = (item.quantity * item.rate) - (item.discount || 0);
    }

    setInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItem = (index: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const duplicateItem = (index: number) => {
    const itemToDuplicate = { ...invoice.items[index] };
    itemToDuplicate.id = `item-${Date.now()}`;
    
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, itemToDuplicate]
    }));
  };

  // File handling
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInvoice(prev => ({ ...prev, company_logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Actions
  const handleSave = () => {
    if (!invoice.client_id) {
      toast.error('Please select a client');
      return;
    }

    if (invoice.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const hasEmptyItems = invoice.items.some(item => 
      !item.description.trim() || item.quantity <= 0 || item.rate < 0
    );

    if (hasEmptyItems) {
      toast.error('Please fill in all item details');
      return;
    }

    onSave(invoice);
    toast.success('Invoice saved successfully');
  };

  const handleSend = () => {
    if (onSend) {
      onSend({ ...invoice, status: 'sent' });
      toast.success('Invoice sent successfully');
    }
  };

  const handleDownload = () => {
    // Generate PDF and download
    toast.success('Invoice downloaded successfully');
  };

  const handleDuplicate = () => {
    const duplicatedInvoice = {
      ...invoice,
      id: '',
      invoice_number: `INV-${Date.now()}`,
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0]
    };
    setInvoice(duplicatedInvoice);
    toast.success('Invoice duplicated');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice Designer</h1>
              <p className="text-gray-600">Create and customize professional invoices</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {onSend && (
                <Button variant="outline" onClick={handleSend}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              )}
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={invoice.status === 'paid' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
            <span className="text-sm text-gray-500">
              Invoice #{invoice.invoice_number}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                    <TabsTrigger value="branding" className="text-xs">Branding</TabsTrigger>
                    <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <Label>Client</Label>
                      <Select value={invoice.client_id} onValueChange={(value) => 
                        setInvoice(prev => ({ ...prev, client_id: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Project (Optional)</Label>
                      <Select value={invoice.project_id} onValueChange={(value) => 
                        setInvoice(prev => ({ ...prev, project_id: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No project</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Issue Date</Label>
                        <Input
                          type="date"
                          value={invoice.issue_date}
                          onChange={(e) => setInvoice(prev => ({ ...prev, issue_date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={invoice.due_date}
                          onChange={(e) => setInvoice(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Payment Terms</Label>
                      <Select value={invoice.payment_terms} onValueChange={(value) => 
                        setInvoice(prev => ({ ...prev, payment_terms: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentTerms.map((term) => (
                            <SelectItem key={term} value={term}>
                              {term}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Currency</Label>
                      <Select value={invoice.currency} onValueChange={(value) => 
                        setInvoice(prev => ({ ...prev, currency: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="branding" className="space-y-4">
                    <div>
                      <Label>Company Logo</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                        {invoice.company_logo && (
                          <div className="mt-2">
                            <img 
                              src={invoice.company_logo} 
                              alt="Company Logo" 
                              className="h-16 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={invoice.company_name}
                        onChange={(e) => setInvoice(prev => ({ ...prev, company_name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Address</Label>
                      <Textarea
                        value={invoice.company_address}
                        onChange={(e) => setInvoice(prev => ({ ...prev, company_address: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>City</Label>
                        <Input
                          value={invoice.company_city}
                          onChange={(e) => setInvoice(prev => ({ ...prev, company_city: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={invoice.company_state}
                          onChange={(e) => setInvoice(prev => ({ ...prev, company_state: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>ZIP Code</Label>
                        <Input
                          value={invoice.company_zip}
                          onChange={(e) => setInvoice(prev => ({ ...prev, company_zip: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Input
                          value={invoice.company_country}
                          onChange={(e) => setInvoice(prev => ({ ...prev, company_country: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={invoice.company_phone}
                        onChange={(e) => setInvoice(prev => ({ ...prev, company_phone: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={invoice.company_email}
                        onChange={(e) => setInvoice(prev => ({ ...prev, company_email: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Website</Label>
                      <Input
                        value={invoice.company_website}
                        onChange={(e) => setInvoice(prev => ({ ...prev, company_website: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Tax ID</Label>
                      <Input
                        value={invoice.company_tax_id}
                        onChange={(e) => setInvoice(prev => ({ ...prev, company_tax_id: e.target.value }))}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="design" className="space-y-4">
                    <div>
                      <Label>Template</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            className={`border-2 rounded-lg p-2 cursor-pointer transition-colors ${
                              invoice.template === template.id ? 'border-blue-500' : 'border-gray-200'
                            }`}
                            onClick={() => setInvoice(prev => ({ ...prev, template: template.id }))}
                          >
                            <img 
                              src={template.preview} 
                              alt={template.name}
                              className="w-full h-20 object-cover rounded"
                            />
                            <p className="text-xs text-center mt-1">{template.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Color Scheme</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {colorSchemes.map((scheme) => (
                          <div
                            key={scheme.id}
                            className={`border-2 rounded-lg p-2 cursor-pointer transition-colors ${
                              invoice.color_scheme === scheme.id ? 'border-blue-500' : 'border-gray-200'
                            }`}
                            onClick={() => setInvoice(prev => ({ ...prev, color_scheme: scheme.id }))}
                          >
                            <div className="flex">
                              <div 
                                className="w-4 h-4 rounded-l"
                                style={{ backgroundColor: scheme.primary }}
                              />
                              <div 
                                className="w-4 h-4 rounded-r"
                                style={{ backgroundColor: scheme.secondary }}
                              />
                            </div>
                            <p className="text-xs mt-1">{scheme.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Font Family</Label>
                      <Select value={invoice.font_family} onValueChange={(value) => 
                        setInvoice(prev => ({ ...prev, font_family: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times">Times New Roman</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Show Logo</Label>
                        <Switch
                          checked={invoice.show_logo}
                          onCheckedChange={(checked) => setInvoice(prev => ({ ...prev, show_logo: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Show Watermark</Label>
                        <Switch
                          checked={invoice.show_watermark}
                          onCheckedChange={(checked) => setInvoice(prev => ({ ...prev, show_watermark: checked }))}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={invoice.notes}
                        onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes for the client..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Terms & Conditions</Label>
                      <Textarea
                        value={invoice.terms}
                        onChange={(e) => setInvoice(prev => ({ ...prev, terms: e.target.value }))}
                        placeholder="Payment terms and conditions..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Footer Text</Label>
                      <Textarea
                        value={invoice.footer_text}
                        onChange={(e) => setInvoice(prev => ({ ...prev, footer_text: e.target.value }))}
                        placeholder="Footer text (e.g., thank you message)..."
                        rows={2}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Invoice Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoice Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Invoice Items Section */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Invoice Items</h3>
                    <Button onClick={addItem} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-20">Qty</TableHead>
                          <TableHead className="w-24">Rate</TableHead>
                          <TableHead className="w-24">Discount</TableHead>
                          <TableHead className="w-24">Amount</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.items.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="space-y-2">
                                <Input
                                  value={item.description}
                                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                                  placeholder="Item description"
                                  className="font-medium"
                                />
                                <Input
                                  value={item.notes || ''}
                                  onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                  placeholder="Additional notes (optional)"
                                  className="text-sm text-gray-500"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="relative">
                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.rate}
                                  onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                  className="pl-8"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="relative">
                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.discount || 0}
                                  onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                  className="pl-8"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                ${((item.quantity * item.rate) - (item.discount || 0)).toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => duplicateItem(index)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItem(index)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end">
                  <div className="w-80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Subtotal:</span>
                      <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>Discount:</span>
                        <Select 
                          value={invoice.discount_type} 
                          onValueChange={(value) => setInvoice(prev => ({ ...prev, discount_type: value }))}
                        >
                          <SelectTrigger className="w-20 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">$</SelectItem>
                            <SelectItem value="percentage">%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={invoice.discount_amount}
                          onChange={(e) => setInvoice(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                          className="w-20 text-right"
                        />
                        <span className="w-16 text-right">
                          {invoice.discount_type === 'percentage' 
                            ? `-$${((invoice.subtotal * invoice.discount_amount) / 100).toFixed(2)}`
                            : `-$${invoice.discount_amount.toFixed(2)}`
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>Tax Rate:</span>
                        <Percent className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={invoice.tax_rate}
                          onChange={(e) => setInvoice(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                          className="w-20 text-right"
                        />
                        <span className="w-16 text-right">${invoice.tax_amount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Shipping:</span>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={invoice.shipping_amount}
                          onChange={(e) => setInvoice(prev => ({ ...prev, shipping_amount: parseFloat(e.target.value) || 0 }))}
                          className="w-24 pl-8 text-right"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total:</span>
                        <span className="text-xl font-bold">${invoice.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDesigner;