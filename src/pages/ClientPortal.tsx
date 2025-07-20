import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { 
  FileText, 
  Calculator, 
  Building, 
  Search,
  DollarSign,
  Calendar,
  Users,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  Download,
  Eye,
  Plus,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const ClientPortal = () => {
  const services = [
    {
      title: "Invoice Management",
      description: "View and manage your invoices, track payments, and download billing documents.",
      icon: FileText,
      color: "blue",
      link: "/invoices",
      features: [
        "View invoice status and payment history",
        "Download PDF invoices",
        "Track payment due dates",
        "Email support for billing queries"
      ]
    },
    {
      title: "Quotation Management", 
      description: "Request new quotations, track existing quotes, and manage project estimates.",
      icon: Calculator,
      color: "green",
      link: "/quotations",
      features: [
        "Request detailed project quotations",
        "Track quotation status",
        "Accept or reject quotes online",
        "Download estimate documents"
      ]
    },
    {
      title: "Project Tracking",
      description: "Monitor your project progress, view milestones, and stay updated on construction status.",
      icon: Building,
      color: "purple",
      link: "/projects",
      features: [
        "Real-time project progress tracking",
        "Milestone and deadline monitoring",
        "Project team communication",
        "Photo updates and reports"
      ]
    }
  ];

  const stats = [
    {
      icon: Users,
      title: "500+",
      subtitle: "Satisfied Clients",
      color: "text-blue-600"
    },
    {
      icon: Building,
      title: "200+",
      subtitle: "Projects Completed",
      color: "text-green-600"
    },
    {
      icon: Clock,
      title: "24/7",
      subtitle: "Client Support",
      color: "text-purple-600"
    },
    {
      icon: Shield,
      title: "100%",
      subtitle: "Secure Access",
      color: "text-orange-600"
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50",
        icon: "text-blue-600",
        border: "border-blue-200",
        button: "bg-blue-600 hover:bg-blue-700"
      },
      green: {
        bg: "bg-green-50", 
        icon: "text-green-600",
        border: "border-green-200",
        button: "bg-green-600 hover:bg-green-700"
      },
      purple: {
        bg: "bg-purple-50",
        icon: "text-purple-600", 
        border: "border-purple-200",
        button: "bg-purple-600 hover:bg-purple-700"
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <>
      <SEOHead 
        title="Client Portal - AKIBEKS Engineering Solutions"
        description="Access your AKIBEKS client portal to manage invoices, quotations, and track project progress. Secure access to all your engineering and construction project information."
        keywords="client portal, AKIBEKS, invoice management, quotations, project tracking, construction management"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Client Portal
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Welcome to your dedicated client portal. Access all your project information, 
              manage invoices and quotations, and stay connected with your AKIBEKS project team.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                  <div className="text-2xl font-bold text-gray-900">{stat.title}</div>
                  <div className="text-sm text-gray-600">{stat.subtitle}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Services */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => {
              const colors = getColorClasses(service.color);
              const Icon = service.icon;
              
              return (
                <Card key={index} className={`border-2 ${colors.border} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                  <CardHeader className={colors.bg}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 bg-white rounded-lg shadow-sm`}>
                        <Icon className={`w-8 h-8 ${colors.icon}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-gray-700">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <ul className="space-y-3 mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link to={service.link}>
                      <Button className={`w-full ${colors.button} text-white`}>
                        Access {service.title}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Access Tools */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Quick Access Tools</CardTitle>
              <CardDescription className="text-center">
                Common actions and quick links for efficient project management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <Search className="w-6 h-6" />
                  <span>Find Invoice</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <Plus className="w-6 h-6" />
                  <span>Request Quote</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <BarChart3 className="w-6 h-6" />
                  <span>Project Status</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <MessageCircle className="w-6 h-6" />
                  <span>Contact Team</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl text-center">How It Works</CardTitle>
              <CardDescription className="text-center">
                Simple steps to access and manage your project information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Choose Service</h3>
                  <p className="text-gray-600">
                    Select the service you need - invoice management, quotations, or project tracking
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Verify Identity</h3>
                  <p className="text-gray-600">
                    Enter your email address or project number to securely access your information
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Access & Manage</h3>
                  <p className="text-gray-600">
                    View, download, and manage your documents and project information
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Need Help?</CardTitle>
              <CardDescription className="text-center">
                Our support team is here to assist you with any questions or issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get detailed help via email with quick response times
                  </p>
                  <Button variant="outline" size="sm">
                    Send Email
                  </Button>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <Phone className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Speak directly with our support team for immediate assistance
                  </p>
                  <Button variant="outline" size="sm">
                    Call Now
                  </Button>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <MessageCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Chat with our team in real-time for quick questions
                  </p>
                  <Button variant="outline" size="sm">
                    Start Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900">Security & Privacy</h3>
                  <p className="text-sm text-orange-700">
                    Your information is protected with enterprise-grade security. 
                    We never share your project data with third parties.
                  </p>
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

export default ClientPortal;