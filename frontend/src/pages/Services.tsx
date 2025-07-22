
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Home, 
  Wrench, 
  Hammer, 
  Users, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Calculator,
  FileText,
  Award,
  Zap,
  Target,
  TrendingUp
} from "lucide-react";
import { Link } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOWrapper from "@/components/SEOWrapper";
import { secureDb } from "@/lib/database-secure";
import { formatDisplayAmount } from "@/lib/currency-utils";

interface Service {
  id: string;
  title: string;
  description: string;
  long_description: string;
  icon: string;
  features: string[];
  price_range_min?: number;
  price_range_max?: number;
  duration_estimate?: string;
  category: string;
  active: boolean;
  image_url?: string;
  benefits: string[];
  process_steps: string[];
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory]);

  const fetchServices = async () => {
    try {
      const { data, error } = await secureDb.getServices({ isActive: true });

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      const servicesData = Array.isArray(data) ? data : [];
      
      // Transform database Service to page Service interface
      const transformedServices = servicesData.map((dbService: any) => ({
        id: dbService.id,
        title: dbService.name || dbService.title || 'Untitled Service',
        description: dbService.description || '',
        long_description: dbService.description || '',
        icon: 'Wrench', // Default icon
        features: dbService.features || [],
        price_range_min: dbService.basePrice || 0,
        price_range_max: (dbService.basePrice || 0) * 1.5,
        duration_estimate: `${dbService.duration || 30} days`,
        category: dbService.category || 'General',
        active: dbService.isActive || false,
        image_url: '',
        benefits: dbService.deliverables || [],
        process_steps: dbService.requirements || []
      }));
      
      setServices(transformedServices);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(transformedServices.map(service => service.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    setFilteredServices(filtered);
  };

  const getServiceIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      building2: Building2,
      home: Home,
      wrench: Wrench,
      hammer: Hammer,
      users: Users,
      shield: Shield,
    };
    return icons[iconName] || Building2;
  };

  const serviceCategories = [
    { id: 'all', name: 'All Services', count: services.length },
    { id: 'construction', name: 'Construction', count: services.filter(s => s.category === 'construction').length },
    { id: 'engineering', name: 'Engineering', count: services.filter(s => s.category === 'engineering').length },
    { id: 'consultation', name: 'Consultation', count: services.filter(s => s.category === 'consultation').length },
    { id: 'maintenance', name: 'Maintenance', count: services.filter(s => s.category === 'maintenance').length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <SEOWrapper
      config={{
        title: "Construction & Engineering Services - AKIBEKS Kenya",
        description: "Comprehensive construction and engineering services in Kenya. From residential homes to commercial buildings, civil engineering to project management. NCA registered with ISO certification.",
        keywords: [
          "construction services Kenya",
          "engineering services Kenya",
          "building construction",
          "civil engineering",
          "residential construction",
          "commercial construction",
          "project management Kenya",
          "building renovation",
          "consultation services"
        ]
      }}
    >
      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
              alt="Construction services in Kenya"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/60"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="outline" className="mb-6 text-blue-200 border-blue-300">
                Our Services
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Professional Construction & Engineering Services
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Comprehensive solutions for all your construction needs across Kenya. 
                From concept to completion, we deliver excellence with integrity.
              </p>

              {/* Service Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{services.length}+</div>
                  <div className="text-blue-200 text-sm">Service Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">15+</div>
                  <div className="text-blue-200 text-sm">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">200+</div>
                  <div className="text-blue-200 text-sm">Projects Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">98%</div>
                  <div className="text-blue-200 text-sm">Client Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-12 bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {serviceCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    {category.name}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredServices.length} of {services.length} services
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredServices.map((service) => {
                  const IconComponent = getServiceIcon(service.icon);
                  
                  return (
                    <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg overflow-hidden">
                      {/* Service Image */}
                      <div className="aspect-video relative overflow-hidden bg-gray-100">
                        {service.image_url ? (
                          <img 
                            src={service.image_url}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <IconComponent className="w-16 h-16 text-blue-600" />
                          </div>
                        )}
                        <Badge className="absolute top-4 left-4 bg-blue-600">
                          {service.category}
                        </Badge>
                      </div>

                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                            {service.title}
                          </CardTitle>
                          <div className="ml-2 flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-gray-600">
                          {service.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Key Features */}
                        {service.features && service.features.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Features:</h4>
                            <ul className="space-y-1">
                              {service.features.slice(0, 3).map((feature, idx) => (
                                <li key={idx} className="flex items-center text-sm text-gray-600">
                                  <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Price Range */}
                        {service.price_range_min && service.price_range_max && (
                          <div className="flex items-center justify-between py-2 border-t border-gray-100">
                            <span className="text-sm text-gray-500">Price Range:</span>
                            <span className="font-semibold text-blue-600">
                              {formatDisplayAmount(service.price_range_min)} - {formatDisplayAmount(service.price_range_max)}
                            </span>
                          </div>
                        )}

                        {/* Duration */}
                        {service.duration_estimate && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-500">Est. Duration:</span>
                            <span className="text-sm font-medium text-gray-900 flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              {service.duration_estimate}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                          <Button asChild variant="outline" className="flex-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Link to={`/services/${service.id}`}>
                              Learn More
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-black">
                            <Link to="/request-quote">
                              Get Quote
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Our Services */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Our Advantage
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose AKIBEKS Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We deliver exceptional value through our comprehensive approach, 
                experienced team, and commitment to quality excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Award,
                  title: "Certified Excellence",
                  description: "NCA registered and ISO 9001:2015 certified for quality assurance."
                },
                {
                  icon: Shield,
                  title: "Fully Insured",
                  description: "Comprehensive insurance coverage for all projects and services."
                },
                {
                  icon: Clock,
                  title: "Timely Delivery",
                  description: "98% of projects completed on time through efficient project management."
                },
                {
                  icon: Target,
                  title: "Quality Focus",
                  description: "Rigorous quality control processes ensure exceptional results."
                },
                {
                  icon: Users,
                  title: "Expert Team",
                  description: "Highly skilled professionals with 15+ years of industry experience."
                },
                {
                  icon: Calculator,
                  title: "Transparent Pricing",
                  description: "Clear, upfront pricing with no hidden costs or surprises."
                },
                {
                  icon: Zap,
                  title: "Modern Technology",
                  description: "Latest construction technology and project management tools."
                },
                {
                  icon: TrendingUp,
                  title: "Proven Results",
                  description: "200+ successful projects across Kenya with satisfied clients."
                }
              ].map((advantage, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <advantage.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{advantage.title}</h3>
                    <p className="text-gray-600 text-sm">{advantage.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Service Process */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Our Process
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                How We Deliver Excellence
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our proven 6-step process ensures every project is delivered to the highest standards, 
                on time and within budget.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Initial Consultation",
                  description: "Free consultation to understand your needs, requirements, and project goals.",
                  icon: Users
                },
                {
                  step: "02",
                  title: "Site Assessment",
                  description: "Thorough site evaluation and feasibility study with detailed analysis.",
                  icon: Search
                },
                {
                  step: "03",
                  title: "Project Planning",
                  description: "Comprehensive project planning with timeline, budget, and resource allocation.",
                  icon: FileText
                },
                {
                  step: "04",
                  title: "Design & Approval",
                  description: "Detailed design development and obtaining necessary permits and approvals.",
                  icon: CheckCircle
                },
                {
                  step: "05",
                  title: "Construction",
                  description: "Professional execution with regular progress updates and quality control.",
                  icon: Hammer
                },
                {
                  step: "06",
                  title: "Handover",
                  description: "Final inspection, documentation, and project handover with warranty.",
                  icon: Award
                }
              ].map((process, index) => (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mr-4">
                        {process.step}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <process.icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{process.title}</h3>
                    <p className="text-gray-600 text-sm">{process.description}</p>
                  </CardContent>
                  
                  {/* Connector */}
                  {index < 5 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-200 z-10"></div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Get in touch with our experts today for a free consultation and detailed quote. 
              Let's bring your construction vision to life.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8">
                <Link to="/request-quote">
                  Get Free Quote
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8">
                <Link to="/contact">
                  Contact Us
                  <Phone className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-5 h-5 text-blue-300" />
                <span className="text-blue-100">+254 710 245 118</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5 text-blue-300" />
                <span className="text-blue-100">info@akibeks.co.ke</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-300" />
                <span className="text-blue-100">Westlands, Nairobi</span>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </SEOWrapper>
  );
};

export default Services;
