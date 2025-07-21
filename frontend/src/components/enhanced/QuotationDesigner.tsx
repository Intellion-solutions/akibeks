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
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Send, 
  Copy, 
  Upload,
  Eye,
  FileText,
  Calculator,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Percent,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  Settings,
  Zap,
  Target,
  Award,
  Shield,
  Star,
  TrendingUp,
  Lightbulb,
  Package,
  Rocket,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';

interface QuotationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  tax_rate: number;
  amount: number;
  delivery_time: string;
  warranty_period: string;
  notes?: string;
  optional: boolean;
  alternatives?: QuotationItem[];
}

interface QuotationSection {
  id: string;
  title: string;
  description: string;
  items: QuotationItem[];
  total: number;
  optional: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface QuotationDesignerProps {
  quotation?: any;
  onSave: (quotation: any) => void;
  onSend?: (quotation: any) => void;
  onConvertToInvoice?: (quotation: any) => void;
  clients: any[];
  projects: any[];
}

export const QuotationDesigner: React.FC<QuotationDesignerProps> = ({
  quotation: initialQuotation,
  onSave,
  onSend,
  onConvertToInvoice,
  clients,
  projects,
}) => {
  const [quotation, setQuotation] = useState({
    id: initialQuotation?.id || '',
    quote_number: initialQuotation?.quote_number || `QUO-${Date.now()}`,
    client_id: initialQuotation?.client_id || '',
    project_id: initialQuotation?.project_id || '',
    title: initialQuotation?.title || '',
    description: initialQuotation?.description || '',
    issue_date: initialQuotation?.issue_date || new Date().toISOString().split('T')[0],
    valid_until: initialQuotation?.valid_until || '',
    delivery_date: initialQuotation?.delivery_date || '',
    currency: initialQuotation?.currency || 'USD',
    status: initialQuotation?.status || 'draft', // draft, sent, viewed, accepted, rejected, expired
    
    // Sections and items
    sections: initialQuotation?.sections || [],
    
    // Pricing
    subtotal: 0,
    discount_amount: initialQuotation?.discount_amount || 0,
    discount_type: initialQuotation?.discount_type || 'fixed',
    tax_rate: initialQuotation?.tax_rate || 0,
    tax_amount: 0,
    total_amount: 0,
    
    // Payment terms
    payment_terms: initialQuotation?.payment_terms || 'Net 30',
    payment_schedule: initialQuotation?.payment_schedule || [],
    advance_payment: initialQuotation?.advance_payment || 0,
    
    // Project details
    project_timeline: initialQuotation?.project_timeline || '',
    project_scope: initialQuotation?.project_scope || '',
    deliverables: initialQuotation?.deliverables || [],
    milestones: initialQuotation?.milestones || [],
    assumptions: initialQuotation?.assumptions || [],
    exclusions: initialQuotation?.exclusions || [],
    
    // Client interaction
    revision_history: initialQuotation?.revision_history || [],
    client_feedback: initialQuotation?.client_feedback || '',
    acceptance_signature: initialQuotation?.acceptance_signature || '',
    acceptance_date: initialQuotation?.acceptance_date || '',
    
    // Branding and design
    template: initialQuotation?.template || 'professional',
    color_scheme: initialQuotation?.color_scheme || 'blue',
    company_logo: initialQuotation?.company_logo || '',
    company_name: initialQuotation?.company_name || 'Your Company',
    company_tagline: initialQuotation?.company_tagline || '',
    company_address: initialQuotation?.company_address || '',
    company_phone: initialQuotation?.company_phone || '',
    company_email: initialQuotation?.company_email || '',
    company_website: initialQuotation?.company_website || '',
    
    // Additional sections
    terms_conditions: initialQuotation?.terms_conditions || '',
    privacy_policy: initialQuotation?.privacy_policy || '',
    support_included: initialQuotation?.support_included || '',
    warranty_terms: initialQuotation?.warranty_terms || '',
    next_steps: initialQuotation?.next_steps || '',
    
    // Presentation features
    executive_summary: initialQuotation?.executive_summary || '',
    value_proposition: initialQuotation?.value_proposition || '',
    case_studies: initialQuotation?.case_studies || [],
    testimonials: initialQuotation?.testimonials || [],
    certifications: initialQuotation?.certifications || [],
    team_members: initialQuotation?.team_members || [],
    
    // Options and alternatives
    package_options: initialQuotation?.package_options || [],
    add_ons: initialQuotation?.add_ons || [],
    alternatives: initialQuotation?.alternatives || []
  });

  const [activeTab, setActiveTab] = useState('details');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quotationTemplates = [
    { id: 'professional', name: 'Professional', description: 'Clean and corporate design' },
    { id: 'creative', name: 'Creative', description: 'Modern and visually appealing' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and focused' },
    { id: 'detailed', name: 'Detailed', description: 'Comprehensive breakdown' },
    { id: 'proposal', name: 'Proposal', description: 'Full project proposal format' },
    { id: 'comparison', name: 'Comparison', description: 'Multiple option comparison' }
  ];

  const packageOptions = [
    { id: 'basic', name: 'Basic Package', description: 'Essential features', price_multiplier: 1 },
    { id: 'standard', name: 'Standard Package', description: 'Enhanced features', price_multiplier: 1.5 },
    { id: 'premium', name: 'Premium Package', description: 'Full feature set', price_multiplier: 2.2 },
    { id: 'enterprise', name: 'Enterprise Package', description: 'Custom solution', price_multiplier: 3 }
  ];

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = quotation.sections.reduce((sectionSum, section) => {
      return sectionSum + section.items.reduce((itemSum, item) => {
        if (!item.optional) {
          const itemTotal = item.quantity * item.rate;
          const itemDiscount = item.discount || 0;
          return itemSum + (itemTotal - itemDiscount);
        }
        return itemSum;
      }, 0);
    }, 0);

    let discountAmount = quotation.discount_amount;
    if (quotation.discount_type === 'percentage') {
      discountAmount = (subtotal * quotation.discount_amount) / 100;
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * quotation.tax_rate) / 100;
    const totalAmount = taxableAmount + taxAmount;

    setQuotation(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    }));
  };

  React.useEffect(() => {
    calculateTotals();
  }, [quotation.sections, quotation.discount_amount, quotation.discount_type, quotation.tax_rate]);

  // Section management
  const addSection = () => {
    const newSection: QuotationSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: '',
      items: [],
      total: 0,
      optional: false,
      priority: 'medium'
    };

    setQuotation(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setSelectedSection(newSection.id);
  };

  const updateSection = (sectionId: string, updates: Partial<QuotationSection>) => {
    setQuotation(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const removeSection = (sectionId: string) => {
    setQuotation(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  };

  // Item management
  const addItem = (sectionId: string) => {
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      title: '',
      description: '',
      category: '',
      quantity: 1,
      unit: 'each',
      rate: 0,
      discount: 0,
      tax_rate: quotation.tax_rate,
      amount: 0,
      delivery_time: '',
      warranty_period: '',
      optional: false,
      alternatives: []
    };

    setQuotation(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      )
    }));
  };

  const updateItem = (sectionId: string, itemIndex: number, updates: Partial<QuotationItem>) => {
    setQuotation(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          const updatedItems = [...section.items];
          updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };
          
          // Recalculate item amount
          const item = updatedItems[itemIndex];
          if ('quantity' in updates || 'rate' in updates || 'discount' in updates) {
            item.amount = (item.quantity * item.rate) - (item.discount || 0);
          }
          
          return { ...section, items: updatedItems };
        }
        return section;
      })
    }));
  };

  const removeItem = (sectionId: string, itemIndex: number) => {
    setQuotation(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, items: section.items.filter((_, i) => i !== itemIndex) }
          : section
      )
    }));
  };

  // Milestone management
  const addMilestone = () => {
    const newMilestone = {
      id: `milestone-${Date.now()}`,
      title: '',
      description: '',
      deliverable: '',
      timeline: '',
      payment_percentage: 0,
      dependencies: []
    };

    setQuotation(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
  };

  // Actions
  const handleSave = () => {
    if (!quotation.client_id) {
      toast.error('Please select a client');
      return;
    }

    if (quotation.sections.length === 0) {
      toast.error('Please add at least one section');
      return;
    }

    onSave(quotation);
    toast.success('Quotation saved successfully');
  };

  const handleSend = () => {
    if (onSend) {
      onSend({ ...quotation, status: 'sent' });
      toast.success('Quotation sent successfully');
    }
  };

  const handleConvertToInvoice = () => {
    if (onConvertToInvoice) {
      onConvertToInvoice(quotation);
      toast.success('Converting to invoice...');
    }
  };

  const handleAccept = () => {
    setQuotation(prev => ({
      ...prev,
      status: 'accepted',
      acceptance_date: new Date().toISOString()
    }));
    toast.success('Quotation accepted');
  };

  const handleReject = () => {
    setQuotation(prev => ({ ...prev, status: 'rejected' }));
    toast.error('Quotation rejected');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const validityProgress = () => {
    if (!quotation.valid_until) return 100;
    
    const now = new Date();
    const validUntil = new Date(quotation.valid_until);
    const issueDate = new Date(quotation.issue_date);
    
    const totalTime = validUntil.getTime() - issueDate.getTime();
    const elapsedTime = now.getTime() - issueDate.getTime();
    
    return Math.max(0, Math.min(100, ((totalTime - elapsedTime) / totalTime) * 100));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quotation Designer</h1>
              <p className="text-gray-600">Create comprehensive project quotations</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {onSend && (
                <Button variant="outline" onClick={handleSend}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Client
                </Button>
              )}
              {quotation.status === 'accepted' && onConvertToInvoice && (
                <Button variant="outline" onClick={handleConvertToInvoice}>
                  <FileText className="h-4 w-4 mr-2" />
                  Convert to Invoice
                </Button>
              )}
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Status and Validity */}
          <div className="flex items-center gap-4 mb-4">
            <Badge className={getStatusColor(quotation.status)}>
              {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
            </Badge>
            <span className="text-sm text-gray-500">
              Quote #{quotation.quote_number}
            </span>
            {quotation.valid_until && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Valid until {quotation.valid_until}</span>
                <div className="w-20">
                  <Progress value={validityProgress()} className="h-2" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {quotation.status === 'sent' && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleAccept} className="text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={handleReject} className="text-red-600">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Configuration */}
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
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                    <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <Label>Client</Label>
                      <Select value={quotation.client_id} onValueChange={(value) => 
                        setQuotation(prev => ({ ...prev, client_id: value }))
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
                      <Label>Quotation Title</Label>
                      <Input
                        value={quotation.title}
                        onChange={(e) => setQuotation(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Project name or description"
                      />
                    </div>

                    <div>
                      <Label>Project</Label>
                      <Select value={quotation.project_id} onValueChange={(value) => 
                        setQuotation(prev => ({ ...prev, project_id: value }))
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

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Issue Date</Label>
                        <Input
                          type="date"
                          value={quotation.issue_date}
                          onChange={(e) => setQuotation(prev => ({ ...prev, issue_date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Valid Until</Label>
                        <Input
                          type="date"
                          value={quotation.valid_until}
                          onChange={(e) => setQuotation(prev => ({ ...prev, valid_until: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Expected Delivery</Label>
                      <Input
                        type="date"
                        value={quotation.delivery_date}
                        onChange={(e) => setQuotation(prev => ({ ...prev, delivery_date: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Currency</Label>
                      <Select value={quotation.currency} onValueChange={(value) => 
                        setQuotation(prev => ({ ...prev, currency: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="design" className="space-y-4">
                    <div>
                      <Label>Template</Label>
                      <Select value={quotation.template} onValueChange={(value) => 
                        setQuotation(prev => ({ ...prev, template: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {quotationTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Color Scheme</Label>
                      <Select value={quotation.color_scheme} onValueChange={(value) => 
                        setQuotation(prev => ({ ...prev, color_scheme: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Professional Blue</SelectItem>
                          <SelectItem value="green">Success Green</SelectItem>
                          <SelectItem value="purple">Creative Purple</SelectItem>
                          <SelectItem value="gray">Minimal Gray</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Company Logo</Label>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setQuotation(prev => ({ 
                                ...prev, 
                                company_logo: event.target?.result as string 
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={quotation.company_name}
                        onChange={(e) => setQuotation(prev => ({ ...prev, company_name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Company Tagline</Label>
                      <Input
                        value={quotation.company_tagline}
                        onChange={(e) => setQuotation(prev => ({ ...prev, company_tagline: e.target.value }))}
                        placeholder="Your company's tagline"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Sections List */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sections</span>
                  <Button size="sm" onClick={addSection}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quotation.sections.map((section) => (
                    <div
                      key={section.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSection === section.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{section.title || 'Untitled Section'}</h4>
                          <p className="text-xs text-gray-500">{section.items.length} items</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant={section.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                            {section.priority}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSection(section.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Quotation Builder */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="sections" className="space-y-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="terms">Terms</TabsTrigger>
                <TabsTrigger value="extras">Add-ons</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="sections">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Quotation Sections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSection ? (
                      <div className="space-y-6">
                        {(() => {
                          const section = quotation.sections.find(s => s.id === selectedSection);
                          if (!section) return null;

                          return (
                            <>
                              {/* Section Header */}
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Section Title</Label>
                                    <Input
                                      value={section.title}
                                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                      placeholder="e.g., Web Development, Design Services"
                                    />
                                  </div>
                                  <div>
                                    <Label>Priority</Label>
                                    <Select 
                                      value={section.priority} 
                                      onValueChange={(value: 'high' | 'medium' | 'low') => 
                                        updateSection(section.id, { priority: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="high">High Priority</SelectItem>
                                        <SelectItem value="medium">Medium Priority</SelectItem>
                                        <SelectItem value="low">Low Priority</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div>
                                  <Label>Section Description</Label>
                                  <Textarea
                                    value={section.description}
                                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                                    placeholder="Describe what's included in this section..."
                                    rows={3}
                                  />
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`optional-${section.id}`}
                                    checked={section.optional}
                                    onCheckedChange={(checked) => updateSection(section.id, { optional: checked })}
                                  />
                                  <Label htmlFor={`optional-${section.id}`}>This section is optional</Label>
                                </div>
                              </div>

                              {/* Items Table */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-semibold">Items</h3>
                                  <Button onClick={() => addItem(section.id)} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                  </Button>
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Title & Description</TableHead>
                                        <TableHead className="w-24">Qty</TableHead>
                                        <TableHead className="w-20">Unit</TableHead>
                                        <TableHead className="w-24">Rate</TableHead>
                                        <TableHead className="w-24">Amount</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {section.items.map((item, index) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            <div className="space-y-2">
                                              <Input
                                                value={item.title}
                                                onChange={(e) => updateItem(section.id, index, { title: e.target.value })}
                                                placeholder="Item title"
                                                className="font-medium"
                                              />
                                              <Textarea
                                                value={item.description}
                                                onChange={(e) => updateItem(section.id, index, { description: e.target.value })}
                                                placeholder="Detailed description..."
                                                rows={2}
                                                className="text-sm"
                                              />
                                              <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                  value={item.delivery_time}
                                                  onChange={(e) => updateItem(section.id, index, { delivery_time: e.target.value })}
                                                  placeholder="Delivery time"
                                                  className="text-xs"
                                                />
                                                <Input
                                                  value={item.warranty_period}
                                                  onChange={(e) => updateItem(section.id, index, { warranty_period: e.target.value })}
                                                  placeholder="Warranty period"
                                                  className="text-xs"
                                                />
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              value={item.quantity}
                                              onChange={(e) => updateItem(section.id, index, { quantity: parseFloat(e.target.value) || 0 })}
                                              className="text-center"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Select 
                                              value={item.unit} 
                                              onValueChange={(value) => updateItem(section.id, index, { unit: value })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="each">Each</SelectItem>
                                                <SelectItem value="hour">Hour</SelectItem>
                                                <SelectItem value="day">Day</SelectItem>
                                                <SelectItem value="week">Week</SelectItem>
                                                <SelectItem value="month">Month</SelectItem>
                                                <SelectItem value="project">Project</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </TableCell>
                                          <TableCell>
                                            <div className="relative">
                                              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                              <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.rate}
                                                onChange={(e) => updateItem(section.id, index, { rate: parseFloat(e.target.value) || 0 })}
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
                                                onClick={() => removeItem(section.id, index)}
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
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No section selected</h3>
                        <p className="text-gray-500 mb-4">Select a section from the sidebar or create a new one</p>
                        <Button onClick={addSection}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Section
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Executive Summary</Label>
                      <Textarea
                        value={quotation.executive_summary}
                        onChange={(e) => setQuotation(prev => ({ ...prev, executive_summary: e.target.value }))}
                        placeholder="Provide a high-level overview of the project and value proposition..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Value Proposition</Label>
                      <Textarea
                        value={quotation.value_proposition}
                        onChange={(e) => setQuotation(prev => ({ ...prev, value_proposition: e.target.value }))}
                        placeholder="Explain the unique value and benefits of your solution..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Project Scope</Label>
                      <Textarea
                        value={quotation.project_scope}
                        onChange={(e) => setQuotation(prev => ({ ...prev, project_scope: e.target.value }))}
                        placeholder="Define what is included in the project scope..."
                        rows={3}
                      />
                    </div>

                    {/* Pricing Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Pricing Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-medium">${quotation.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span>Discount:</span>
                            <Select 
                              value={quotation.discount_type} 
                              onValueChange={(value) => setQuotation(prev => ({ ...prev, discount_type: value }))}
                            >
                              <SelectTrigger className="w-16 h-6">
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
                              value={quotation.discount_amount}
                              onChange={(e) => setQuotation(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                              className="w-20 text-right"
                            />
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
                              value={quotation.tax_rate}
                              onChange={(e) => setQuotation(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                              className="w-20 text-right"
                            />
                            <span className="w-16 text-right">${quotation.tax_amount.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Total:</span>
                            <span className="text-xl font-bold">${quotation.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="milestones">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Project Milestones
                      </div>
                      <Button onClick={addMilestone} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Milestone
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {quotation.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <Label>Milestone Title</Label>
                              <Input
                                value={milestone.title}
                                onChange={(e) => {
                                  const updatedMilestones = [...quotation.milestones];
                                  updatedMilestones[index] = { ...milestone, title: e.target.value };
                                  setQuotation(prev => ({ ...prev, milestones: updatedMilestones }));
                                }}
                                placeholder="e.g., Project Kickoff, Design Approval"
                              />
                            </div>
                            <div>
                              <Label>Timeline</Label>
                              <Input
                                value={milestone.timeline}
                                onChange={(e) => {
                                  const updatedMilestones = [...quotation.milestones];
                                  updatedMilestones[index] = { ...milestone, timeline: e.target.value };
                                  setQuotation(prev => ({ ...prev, milestones: updatedMilestones }));
                                }}
                                placeholder="e.g., Week 1, Day 5"
                              />
                            </div>
                          </div>
                          <div className="mb-3">
                            <Label>Description</Label>
                            <Textarea
                              value={milestone.description}
                              onChange={(e) => {
                                const updatedMilestones = [...quotation.milestones];
                                updatedMilestones[index] = { ...milestone, description: e.target.value };
                                setQuotation(prev => ({ ...prev, milestones: updatedMilestones }));
                              }}
                              placeholder="Describe what will be delivered in this milestone..."
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Deliverable</Label>
                              <Input
                                value={milestone.deliverable}
                                onChange={(e) => {
                                  const updatedMilestones = [...quotation.milestones];
                                  updatedMilestones[index] = { ...milestone, deliverable: e.target.value };
                                  setQuotation(prev => ({ ...prev, milestones: updatedMilestones }));
                                }}
                                placeholder="e.g., Wireframes, Prototype"
                              />
                            </div>
                            <div>
                              <Label>Payment %</Label>
                              <div className="relative">
                                <Percent className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={milestone.payment_percentage}
                                  onChange={(e) => {
                                    const updatedMilestones = [...quotation.milestones];
                                    updatedMilestones[index] = { ...milestone, payment_percentage: parseFloat(e.target.value) || 0 };
                                    setQuotation(prev => ({ ...prev, milestones: updatedMilestones }));
                                  }}
                                  className="pr-8"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {quotation.milestones.length === 0 && (
                        <div className="text-center py-8">
                          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones yet</h3>
                          <p className="text-gray-500 mb-4">Add milestones to break down your project timeline</p>
                          <Button onClick={addMilestone}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Milestone
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="terms">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Terms & Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Payment Terms</Label>
                      <Textarea
                        value={quotation.payment_terms}
                        onChange={(e) => setQuotation(prev => ({ ...prev, payment_terms: e.target.value }))}
                        placeholder="Describe payment schedule, methods, and policies..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Terms & Conditions</Label>
                      <Textarea
                        value={quotation.terms_conditions}
                        onChange={(e) => setQuotation(prev => ({ ...prev, terms_conditions: e.target.value }))}
                        placeholder="Legal terms, conditions, and policies..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Support & Warranty</Label>
                      <Textarea
                        value={quotation.warranty_terms}
                        onChange={(e) => setQuotation(prev => ({ ...prev, warranty_terms: e.target.value }))}
                        placeholder="Support offerings and warranty information..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Project Assumptions</Label>
                      <Textarea
                        value={quotation.assumptions.join('\n')}
                        onChange={(e) => setQuotation(prev => ({ 
                          ...prev, 
                          assumptions: e.target.value.split('\n').filter(line => line.trim()) 
                        }))}
                        placeholder="List project assumptions (one per line)..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Exclusions</Label>
                      <Textarea
                        value={quotation.exclusions.join('\n')}
                        onChange={(e) => setQuotation(prev => ({ 
                          ...prev, 
                          exclusions: e.target.value.split('\n').filter(line => line.trim()) 
                        }))}
                        placeholder="List what is NOT included (one per line)..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Next Steps</Label>
                      <Textarea
                        value={quotation.next_steps}
                        onChange={(e) => setQuotation(prev => ({ ...prev, next_steps: e.target.value }))}
                        placeholder="Outline the next steps after quotation acceptance..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="extras">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Package Options & Add-ons
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Package Options</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {packageOptions.map((pkg) => (
                          <div
                            key={pkg.id}
                            className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{pkg.name}</h4>
                              <Badge variant="outline">
                                {(quotation.total_amount * pkg.price_multiplier).toFixed(0)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{pkg.description}</p>
                            <div className="mt-2">
                              <span className="text-xs text-blue-600">
                                {pkg.price_multiplier}x base price
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Optional Add-ons</h3>
                      <div className="space-y-3">
                        {[
                          { name: 'Priority Support', price: 500, description: '24/7 priority support during project' },
                          { name: 'Additional Revisions', price: 200, description: 'Up to 5 additional revision rounds' },
                          { name: 'Training Sessions', price: 800, description: 'Team training on delivered solution' },
                          { name: 'Extended Warranty', price: 300, description: '12 months extended warranty' }
                        ].map((addon, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{addon.name}</h4>
                              <p className="text-sm text-gray-600">{addon.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">${addon.price}</span>
                              <Switch />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Quotation Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white border rounded-lg p-8 max-w-4xl mx-auto">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          {quotation.company_logo && (
                            <img src={quotation.company_logo} alt="Logo" className="h-16 mb-4" />
                          )}
                          <h1 className="text-3xl font-bold text-gray-900">{quotation.company_name}</h1>
                          {quotation.company_tagline && (
                            <p className="text-gray-600">{quotation.company_tagline}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <h2 className="text-2xl font-bold text-blue-600">QUOTATION</h2>
                          <p className="text-gray-600">#{quotation.quote_number}</p>
                          <p className="text-sm text-gray-500">{quotation.issue_date}</p>
                        </div>
                      </div>

                      {/* Title */}
                      {quotation.title && (
                        <div className="mb-6">
                          <h2 className="text-xl font-bold text-gray-900">{quotation.title}</h2>
                        </div>
                      )}

                      {/* Executive Summary */}
                      {quotation.executive_summary && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                          <p className="text-gray-700">{quotation.executive_summary}</p>
                        </div>
                      )}

                      {/* Sections */}
                      <div className="space-y-6">
                        {quotation.sections.map((section) => (
                          <div key={section.id} className="border-b pb-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-lg font-semibold">{section.title}</h3>
                              {section.optional && (
                                <Badge variant="outline">Optional</Badge>
                              )}
                            </div>
                            {section.description && (
                              <p className="text-gray-600 mb-3">{section.description}</p>
                            )}
                            <div className="space-y-2">
                              {section.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{item.title}</h4>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                    {(item.delivery_time || item.warranty_period) && (
                                      <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                        {item.delivery_time && <span>Delivery: {item.delivery_time}</span>}
                                        {item.warranty_period && <span>Warranty: {item.warranty_period}</span>}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right ml-4">
                                    <div className="text-sm text-gray-600">
                                      {item.quantity} {item.unit} × ${item.rate}
                                    </div>
                                    <div className="font-medium">${item.amount.toFixed(2)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="mt-8 flex justify-end">
                        <div className="w-80 space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${quotation.subtotal.toFixed(2)}</span>
                          </div>
                          {quotation.discount_amount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-${quotation.discount_type === 'percentage' 
                                ? ((quotation.subtotal * quotation.discount_amount) / 100).toFixed(2)
                                : quotation.discount_amount.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {quotation.tax_rate > 0 && (
                            <div className="flex justify-between">
                              <span>Tax ({quotation.tax_rate}%):</span>
                              <span>${quotation.tax_amount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t pt-2">
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total:</span>
                              <span>${quotation.total_amount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Validity */}
                      <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                          This quotation is valid until {quotation.valid_until}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDesigner;