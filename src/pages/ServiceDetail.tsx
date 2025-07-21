
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Star, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/lib/db-client";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  unit: string;
}

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatPrice = (price: number, unit: string) => {
    return `From KSh ${price.toLocaleString()}/${unit}`;
  };

  const getServiceFeatures = (category: string) => {
    const features = {
      construction: [
        "Professional architectural design",
        "Quality materials sourcing",
        "Skilled craftsmen and supervisors",
        "Regular progress updates",
        "Safety compliance",
        "1-year warranty"
      ],
      renovation: [
        "Custom design consultation",
        "Minimal disruption to daily life",
        "Quality fixtures and fittings",
        "Before and after documentation",
        "Clean-up included",
        "6-month warranty"
      ],
      plumbing: [
        "Licensed plumbers",
        "Quality pipes and fittings",
        "Pressure testing included",
        "Emergency service available",
        "Leak detection",
        "2-year warranty on installations"
      ],
      electrical: [
        "Certified electricians",
        "Safety testing included",
        "Modern wiring systems",
        "Energy-efficient solutions",
        "24/7 emergency service",
        "2-year warranty"
      ],
      civil_works: [
        "Site survey and analysis",
        "Environmental compliance",
        "Heavy machinery available",
        "Progress monitoring",
        "Quality assurance",
        "Long-term durability"
      ],
      project_management: [
        "Dedicated project manager",
        "Timeline management",
        "Budget control",
        "Quality oversight",
        "Regular reporting",
        "Stakeholder coordination"
      ]
    };
    return features[category as keyof typeof features] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">Loading service details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
            <Button asChild>
              <Link to="/services">Back to Services</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const features = getServiceFeatures(service.category);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title={`${service.name} - Professional ${formatCategoryName(service.category)} Services`}
        description={`${service.description} Professional ${service.name} services in Kenya with competitive pricing starting from KSh ${service.base_price.toLocaleString()}/${service.unit}.`}
        keywords={`${service.name}, ${formatCategoryName(service.category)}, construction services Kenya, engineering services, ${service.category} Kenya`}
        url={`https://akibeks.co.ke/services/${id}`}
      />
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Button variant="outline" className="mb-8" asChild>
          <Link to="/services">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <Badge className="mb-4 bg-orange-100 text-orange-800">
                {formatCategoryName(service.category)}
              </Badge>
              <h1 className="text-4xl font-bold mb-4 animate-fade-in">{service.name}</h1>
              <p className="text-xl text-gray-600 mb-6">{service.description}</p>
              <div className="text-3xl font-bold text-orange-600 mb-8">
                {formatPrice(service.base_price, service.unit)}
              </div>
            </div>

            {/* Service Features */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
                <CardDescription>Key features of our {service.name.toLowerCase()} service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Process Steps */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Our Process</CardTitle>
                <CardDescription>How we deliver exceptional results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { step: 1, title: "Initial Consultation", description: "We discuss your needs and vision for the project" },
                    { step: 2, title: "Site Survey & Planning", description: "Detailed assessment and custom project planning" },
                    { step: 3, title: "Quote & Agreement", description: "Transparent pricing and formal project agreement" },
                    { step: 4, title: "Project Execution", description: "Professional implementation with regular updates" },
                    { step: 5, title: "Quality Check & Handover", description: "Final inspection and project completion" }
                  ].map((process, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {process.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{process.title}</h4>
                        <p className="text-gray-600">{process.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Quote */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Get a Quote</CardTitle>
                <CardDescription>Interested in this service? Get a personalized quote</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {formatPrice(service.base_price, service.unit)}
                  </div>
                  <p className="text-sm text-gray-600">Starting price - actual cost may vary</p>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/request-quote">
                    Get Detailed Quote
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/contact">
                    Contact Us
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Why Choose Us */}
            <Card>
              <CardHeader>
                <CardTitle>Why Choose AKIBEKS?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>15+ Years Experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span>On-Time Delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span>Serving All Kenya</span>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">Emergency Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-4">Need urgent assistance? We're available 24/7 for emergencies.</p>
                <Button variant="destructive" className="w-full" asChild>
                  <a href="tel:+254710245118">
                    Call Emergency Line
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
