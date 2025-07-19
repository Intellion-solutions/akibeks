import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Plus,
  Edit
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Quotation {
  id: string;
  quote_number: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until: string;
  created_at: string;
  project_description?: string;
  terms?: string;
}

const QuotationManagement = () => {
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchQuoteNumber, setSearchQuoteNumber] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Request Quote Form State
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    location: '',
    budget: '',
    timeline: '',
    description: '',
    requirements: [] as string[]
  });

  const fetchQuotations = async () => {
    if (!searchEmail && !searchQuoteNumber) return;
    
    setLoading(true);
    try {
      let query = supabase.from('quotations').select('*');
      
      if (searchEmail) {
        query = query.eq('client_email', searchEmail);
      }
      
      if (searchQuoteNumber) {
        query = query.eq('quote_number', searchQuoteNumber);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setQuotations(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No quotations found",
          description: "No quotations found with the provided information.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quotations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitQuoteRequest = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('quote_requests')
        .insert([{
          client_name: requestForm.name,
          client_email: requestForm.email,
          client_phone: requestForm.phone,
          company_name: requestForm.company,
          project_type: requestForm.projectType,
          location: requestForm.location,
          budget_range: requestForm.budget,
          timeline: requestForm.timeline,
          description: requestForm.description,
          requirements: requestForm.requirements,
          status: 'pending'
        }]);
        
      if (error) throw error;
      
      toast({
        title: "Quote request submitted!",
        description: "We'll get back to you within 24-48 hours with a detailed quotation.",
      });
      
      setShowRequestForm(false);
      setRequestForm({
        name: '', email: '', phone: '', company: '', projectType: '',
        location: '', budget: '', timeline: '', description: '', requirements: []
      });
      
    } catch (error) {
      console.error('Error submitting quote request:', error);
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Send },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      expired: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle }
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

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = 
      quotation.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const projectTypes = [
    "House Construction",
    "Commercial Building", 
    "Renovation",
    "Civil Works",
    "Electrical Works",
    "Plumbing",
    "Quantity Surveying"
  ];

  return (
    <>
      <SEOHead 
        title="Quotation Management - AKIBEKS Engineering Solutions"
        description="View and manage your quotations from AKIBEKS Engineering Solutions. Request new quotes, track quotation status, and download estimates."
        keywords="quotation management, estimates, quotes, AKIBEKS, engineering quotations"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Quotation Management
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Request new quotations and manage existing ones from AKIBEKS Engineering Solutions. 
              Track quotation status, download estimates, and communicate with our team.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button 
              onClick={() => setShowRequestForm(true)}
              className="flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Request New Quote
            </Button>
          </div>

          {/* Request Quote Form */}
          {showRequestForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Request New Quotation</CardTitle>
                <CardDescription>
                  Fill out the form below to request a detailed quotation for your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={requestForm.name}
                      onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={requestForm.email}
                      onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={requestForm.phone}
                      onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input
                      id="company"
                      value={requestForm.company}
                      onChange={(e) => setRequestForm({ ...requestForm, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectType">Project Type *</Label>
                    <select
                      id="projectType"
                      value={requestForm.projectType}
                      onChange={(e) => setRequestForm({ ...requestForm, projectType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select project type</option>
                      {projectTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={requestForm.location}
                      onChange={(e) => setRequestForm({ ...requestForm, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget Range</Label>
                    <select
                      id="budget"
                      value={requestForm.budget}
                      onChange={(e) => setRequestForm({ ...requestForm, budget: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select budget range</option>
                      <option value="Under KES 500K">Under KES 500,000</option>
                      <option value="KES 500K - 1M">KES 500,000 - 1,000,000</option>
                      <option value="KES 1M - 5M">KES 1,000,000 - 5,000,000</option>
                      <option value="KES 5M - 10M">KES 5,000,000 - 10,000,000</option>
                      <option value="Over KES 10M">Over KES 10,000,000</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="timeline">Project Timeline</Label>
                    <select
                      id="timeline"
                      value={requestForm.timeline}
                      onChange={(e) => setRequestForm({ ...requestForm, timeline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select timeline</option>
                      <option value="ASAP">As soon as possible</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6-12 months">6-12 months</option>
                      <option value="Over 1 year">Over 1 year</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                    placeholder="Describe your project requirements, scope, and any specific details..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={submitQuoteRequest}
                    disabled={loading || !requestForm.name || !requestForm.email || !requestForm.phone || !requestForm.projectType || !requestForm.location || !requestForm.description}
                  >
                    {loading ? "Submitting..." : "Submit Quote Request"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Find Your Quotations
              </CardTitle>
              <CardDescription>
                Enter your email address or quotation number to access your quotations
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
                  <Label htmlFor="quoteNumber">Quotation Number</Label>
                  <Input
                    id="quoteNumber"
                    placeholder="e.g., QUO-2024-001"
                    value={searchQuoteNumber}
                    onChange={(e) => setSearchQuoteNumber(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={fetchQuotations} 
                disabled={loading || (!searchEmail && !searchQuoteNumber)}
                className="w-full md:w-auto"
              >
                {loading ? "Searching..." : "Find Quotations"}
              </Button>
            </CardContent>
          </Card>

          {/* Quotations Display */}
          {quotations.length > 0 && (
            <>
              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1">
                      <Input
                        placeholder="Search quotations..."
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
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quotation List */}
              <div className="space-y-4">
                {filteredQuotations.map((quotation) => (
                  <Card key={quotation.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {quotation.quote_number}
                            </h3>
                            {getStatusBadge(quotation.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="space-y-1">
                              <p className="flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                {quotation.client_email || 'No email provided'}
                              </p>
                              {quotation.client_phone && (
                                <p className="flex items-center">
                                  <Phone className="w-4 h-4 mr-2" />
                                  {quotation.client_phone}
                                </p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Created: {formatDate(quotation.created_at)}
                              </p>
                              <p className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Valid Until: {formatDate(quotation.valid_until)}
                              </p>
                            </div>
                          </div>
                          
                          {quotation.project_description && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600">
                                <strong>Project:</strong> {quotation.project_description.substring(0, 100)}...
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(quotation.total_amount)}
                            </p>
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
                            {quotation.status === 'sent' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Accept
                              </Button>
                            )}
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
                    Have questions about your quotation? Contact our team.
                  </p>
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </div>
                
                <div className="text-center">
                  <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Call us for immediate assistance with quotations.
                  </p>
                  <Button variant="outline" size="sm">
                    +254 123 456 789
                  </Button>
                </div>
                
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Schedule Consultation</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Book a free consultation to discuss your project.
                  </p>
                  <Button variant="outline" size="sm">
                    Book Meeting
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

export default QuotationManagement;