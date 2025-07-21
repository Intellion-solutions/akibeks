
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/db-client";

interface ServiceRequestFormProps {
  onSuccess?: () => void;
}

const ServiceRequestForm = ({ onSuccess }: ServiceRequestFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    service_type: "",
    project_description: "",
    location: "",
    budget_range: "",
    preferred_start_date: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First create/get client
      let clientId = null;
      
      const { data: existingClient, error: clientCheckError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (clientCheckError && clientCheckError.code !== 'PGRST116') {
        throw clientCheckError;
      }

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert([{
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            company_name: formData.company_name || null
          }])
          .select('id')
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Create quote request
      const { error: quoteError } = await supabase
        .from('quote_requests')
        .insert([{
          client_id: clientId,
          service_type: formData.service_type,
          project_description: formData.project_description,
          location: formData.location,
          budget_range: formData.budget_range,
          preferred_start_date: formData.preferred_start_date || null,
          notes: formData.notes
        }]);

      if (quoteError) throw quoteError;

      toast({
        title: "Request Submitted!",
        description: "We'll get back to you within 24 hours with a detailed quote."
      });

      // Reset form
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        company_name: "",
        service_type: "",
        project_description: "",
        location: "",
        budget_range: "",
        preferred_start_date: "",
        notes: ""
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error submitting service request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Request Our Services</CardTitle>
        <CardDescription>
          Tell us about your project and we'll provide you with a detailed quote
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Enter company name (optional)"
                />
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Project Details</h3>
            <div>
              <Label htmlFor="service_type">Service Type *</Label>
              <Select value={formData.service_type} onValueChange={(value) => handleInputChange('service_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="renovation">Renovation</SelectItem>
                  <SelectItem value="civil_works">Civil Works</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="project_management">Project Management</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="project_description">Project Description *</Label>
              <Textarea
                id="project_description"
                value={formData.project_description}
                onChange={(e) => handleInputChange('project_description', e.target.value)}
                placeholder="Describe your project in detail..."
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Project Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter project location"
                  required
                />
              </div>
              <div>
                <Label htmlFor="budget_range">Budget Range</Label>
                <Select value={formData.budget_range} onValueChange={(value) => handleInputChange('budget_range', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_500k">Under KSh 500,000</SelectItem>
                    <SelectItem value="500k_1m">KSh 500,000 - 1,000,000</SelectItem>
                    <SelectItem value="1m_5m">KSh 1,000,000 - 5,000,000</SelectItem>
                    <SelectItem value="5m_10m">KSh 5,000,000 - 10,000,000</SelectItem>
                    <SelectItem value="over_10m">Over KSh 10,000,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="preferred_start_date">Preferred Start Date</Label>
              <Input
                id="preferred_start_date"
                type="date"
                value={formData.preferred_start_date}
                onChange={(e) => handleInputChange('preferred_start_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information or special requirements..."
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Service Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestForm;
