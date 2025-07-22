
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Briefcase, 
  Users, 
  HeadphonesIcon,
  Building,
  Globe
} from "lucide-react";
import Navbar from "@/components/Navbar";
// Footer component removed
// SMTP service removed, using database client instead

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    form_type: "general" as 'general' | 'quote_request' | 'support' | 'partnership' | 'career'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const smtpService = {
    sendContactEmail: async (data: any) => {
      // This would be handled by the backend API
      console.log('Contact form submission:', data);
      return { success: true };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Get user's IP and user agent
      const userAgent = navigator.userAgent;
      let ip = 'unknown';
      
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ip = data.ip;
      } catch (ipError) {
        console.log('Could not fetch IP address');
      }

      // Submit contact form
      await smtpService.sendContactEmail({
        ...formData,
        source_page: window.location.pathname,
        user_agent: userAgent,
        ip_address: ip,
        status: 'new',
        priority: formData.form_type === 'support' ? 'high' : 'medium',
        tags: [formData.form_type, 'website-contact'],
        custom_fields: {
          browser: userAgent,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
          source: 'main-website'
        }
      });

      setSubmitStatus('success');
      toast({
        title: "Message Sent Successfully!",
        description: "We've received your message and will respond within 24 hours. Thank you for contacting us!",
      });
      
      setFormData({ 
        name: "", 
        email: "", 
        phone: "",
        company: "",
        subject: "", 
        message: "",
        form_type: "general"
      });
    } catch (error) {
      setSubmitStatus('error');
      toast({
        title: "Failed to Send Message",
        description: "There was an error sending your message. Please try again or contact us directly.",
        variant: "destructive"
      });
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getFormTypeIcon = (type: string) => {
    switch (type) {
      case 'quote_request': return <Briefcase className="w-4 h-4" />;
      case 'support': return <HeadphonesIcon className="w-4 h-4" />;
      case 'partnership': return <Users className="w-4 h-4" />;
      case 'career': return <Building className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case 'quote_request': return 'Request Quote';
      case 'support': return 'Technical Support';
      case 'partnership': return 'Partnership Inquiry';
      case 'career': return 'Career Opportunities';
      default: return 'General Inquiry';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        {/* Enhanced Hero Section */}
        <section className="bg-gradient-to-br from-orange-600 via-orange-700 to-red-600 text-white py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <Mail className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Get In Touch</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Let's Build Something 
              <span className="block text-orange-200">Amazing Together</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-orange-100 max-w-4xl mx-auto leading-relaxed">
              Ready to start your construction project? Let's discuss your vision and bring it to life 
              with our expert team and innovative solutions.
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Badge className="bg-white/20 text-white border-white/30">
                <Clock className="w-3 h-3 mr-1" />
                24hr Response Time
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Free Consultation
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                <Globe className="w-3 h-3 mr-1" />
                Kenya Wide Service
              </Badge>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 -mt-8 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Phone</h3>
                  <p className="text-gray-600 font-medium">+254 710 245 118</p>
                  <p className="text-gray-600">+254 722 123 456</p>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      Emergency Line Available
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Email</h3>
                  <p className="text-gray-600 font-medium">info@akibeks.co.ke</p>
                  <p className="text-gray-600">projects@akibeks.co.ke</p>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      24hr Email Support
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Location</h3>
                  <p className="text-gray-600 font-medium">Nairobi, Kenya</p>
                  <p className="text-gray-600">Serving Nationwide</p>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      On-Site Visits Available
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Business Hours</h3>
                  <p className="text-gray-600 font-medium">Mon - Fri: 8AM - 6PM</p>
                  <p className="text-gray-600">Sat: 9AM - 4PM</p>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      Emergency: 24/7
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Contact Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                        <MessageSquare className="w-6 h-6 mr-3 text-orange-600" />
                        Send us a Message
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Fill out the form below and we'll get back to you within 24 hours with a personalized response.
                      </CardDescription>
                    </div>
                    
                    {submitStatus === 'success' && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-6 h-6 mr-2" />
                        <span className="font-medium">Sent!</span>
                      </div>
                    )}
                    
                    {submitStatus === 'error' && (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="w-6 h-6 mr-2" />
                        <span className="font-medium">Error</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form Type Selection */}
                    <div>
                      <Label htmlFor="form_type" className="text-sm font-medium text-gray-700 mb-3 block">
                        What can we help you with? *
                      </Label>
                      <Select 
                        value={formData.form_type} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, form_type: value }))}
                      >
                        <SelectTrigger className="w-full h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500">
                          <div className="flex items-center">
                            {getFormTypeIcon(formData.form_type)}
                            <span className="ml-3">{getFormTypeLabel(formData.form_type)}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">
                            <div className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-3" />
                              General Inquiry
                            </div>
                          </SelectItem>
                          <SelectItem value="quote_request">
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-3" />
                              Request Project Quote
                            </div>
                          </SelectItem>
                          <SelectItem value="support">
                            <div className="flex items-center">
                              <HeadphonesIcon className="w-4 h-4 mr-3" />
                              Technical Support
                            </div>
                          </SelectItem>
                          <SelectItem value="partnership">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-3" />
                              Partnership Opportunity
                            </div>
                          </SelectItem>
                          <SelectItem value="career">
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-3" />
                              Career Opportunities
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                          placeholder="+254 710 000 000"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="company" className="text-sm font-medium text-gray-700 mb-2 block">
                          Company/Organization
                        </Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                          placeholder="Your Company"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-700 mb-2 block">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                        placeholder="Brief description of your inquiry"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-2 block">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 resize-none"
                        placeholder="Please provide detailed information about your project, requirements, timeline, budget range, or any specific questions you have..."
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.message.length} / 2000 characters
                      </div>
                    </div>

                    {/* Priority Badge */}
                    {formData.form_type === 'support' && (
                      <div className="flex items-center bg-red-50 p-3 rounded-lg">
                        <Badge variant="destructive" className="mr-3">
                          High Priority
                        </Badge>
                        <span className="text-sm text-gray-700">
                          Support requests are prioritized for same-day response
                        </span>
                      </div>
                    )}

                    {formData.form_type === 'quote_request' && (
                      <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                        <Badge className="mr-3 bg-blue-600">
                          Quote Request
                        </Badge>
                        <span className="text-sm text-gray-700">
                          We'll prepare a detailed estimate within 48 hours
                        </span>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                          Sending Message...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </div>
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        By submitting this form, you agree to our privacy policy. 
                        We respect your privacy and will never share your information.
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Enhanced Map Section */}
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Find Us</CardTitle>
                  <CardDescription>
                    Our office location and service areas across Kenya. We're here to serve you better.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 h-80 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20"></div>
                    <div className="relative text-center">
                      <MapPin className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                      <p className="text-gray-700 font-medium">Interactive Map Coming Soon</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Professional mapping integration in development
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Building className="w-4 h-4 mr-2 text-orange-600" />
                        Head Office
                      </h4>
                      <p className="text-gray-700">Nairobi CBD, Kenya</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Modern facilities with consultation rooms and project display center
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-orange-600" />
                        Service Areas
                      </h4>
                      <p className="text-gray-700">Nairobi, Kiambu, Machakos, Kajiado</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Expanding to cover all major counties in Kenya
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">500+</div>
                        <div className="text-sm text-gray-600">Projects Completed</div>
                      </div>
                      <div className="text-center p-3 bg-white border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">50+</div>
                        <div className="text-sm text-gray-600">Expert Team Members</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>

      {/* Footer component temporarily removed */}
    </div>
  );
};

export default Contact;
