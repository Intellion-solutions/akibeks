import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { 
  Search, 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  DollarSign, 
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/lib/db-client";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  issue_date: string;
  created_at: string;
}

const InvoiceManagement = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchInvoiceNumber, setSearchInvoiceNumber] = useState('');

  const fetchInvoices = async () => {
    if (!searchEmail && !searchInvoiceNumber) return;
    
    setLoading(true);
    try {
      let query = supabase.from('invoices').select('*');
      
      if (searchEmail) {
        query = query.eq('client_email', searchEmail);
      }
      
      if (searchInvoiceNumber) {
        query = query.eq('invoice_number', searchInvoiceNumber);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setInvoices(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No invoices found",
          description: "No invoices found with the provided information.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Mail },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <SEOHead 
        title="Invoice Management - AKIBEKS Engineering Solutions"
        description="View and manage your invoices from AKIBEKS Engineering Solutions. Track payments, download invoices, and view invoice history."
        keywords="invoice management, payments, billing, AKIBEKS, engineering invoices"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Invoice Management
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access and manage your invoices from AKIBEKS Engineering Solutions. 
              View payment status, download invoices, and track your billing history.
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Find Your Invoices
              </CardTitle>
              <CardDescription>
                Enter your email address or invoice number to access your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="e.g., INV-2024-001"
                    value={searchInvoiceNumber}
                    onChange={(e) => setSearchInvoiceNumber(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={fetchInvoices} 
                disabled={loading || (!searchEmail && !searchInvoiceNumber)}
                className="w-full md:w-auto"
              >
                {loading ? "Searching..." : "Find Invoices"}
              </Button>
            </CardContent>
          </Card>

          {/* Invoices Display */}
          {invoices.length > 0 && (
            <>
              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1">
                      <Input
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice List */}
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {invoice.invoice_number}
                            </h3>
                            {getStatusBadge(invoice.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="space-y-1">
                              <p className="flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                {invoice.client_email || 'No email provided'}
                              </p>
                              {invoice.client_phone && (
                                <p className="flex items-center">
                                  <Phone className="w-4 h-4 mr-2" />
                                  {invoice.client_phone}
                                </p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Issue Date: {formatDate(invoice.issue_date)}
                              </p>
                              <p className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Due Date: {formatDate(invoice.due_date)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(invoice.total_amount)}
                            </p>
                            {invoice.paid_amount > 0 && (
                              <p className="text-sm text-green-600">
                                Paid: {formatCurrency(invoice.paid_amount)}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Help Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Have questions about your invoice? Contact our billing team.
                  </p>
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </div>
                
                <div className="text-center">
                  <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Call us for immediate assistance with billing inquiries.
                  </p>
                  <Button variant="outline" size="sm">
                    +254 123 456 789
                  </Button>
                </div>
                
                <div className="text-center">
                  <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Payment Options</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Learn about available payment methods and terms.
                  </p>
                  <Button variant="outline" size="sm">
                    View Options
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default InvoiceManagement;