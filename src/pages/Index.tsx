
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Trophy, 
  Shield, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Building2,
  Hammer,
  Construction,
  Truck,
  Wrench,
  Home,
  DollarSign,
  Award,
  Target,
  Zap,
  Calendar,
  PlayCircle,
  Quote,
  ChevronRight,
  ExternalLink,
  MessageCircle
} from "lucide-react";
import { Link } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOWrapper from "@/components/SEOWrapper";
import DatabaseClient, { Tables } from "@/core/database/client";
import { formatDisplayAmount } from "@/lib/currency-utils";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  status: string;
  budgetKes: string;
  completionPercentage: number;
  clientId?: string;
  projectType: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  priceRangeMin?: string;
  priceRangeMax?: string;
}

interface Testimonial {
  id: string;
  name: string;
  company?: string;
  message: string;
  rating: number;
  projectType?: string;
  location?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState({
    projectsCompleted: 150,
    clientsSatisfied: 200,
    yearsExperience: 15,
    certifications: 8
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured projects
      const { data: projectsData, error: projectsError } = await DatabaseClient.select<Project>(
        Tables.projects,
        {
          filters: [{ column: 'featured', operator: 'eq', value: true }],
          limit: 6,
          orderBy: 'createdAt',
          orderDirection: 'desc'
        }
      );

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      } else {
        setFeaturedProjects(projectsData || []);
      }

      // Fetch services
      const { data: servicesData, error: servicesError } = await DatabaseClient.select<Service>(
        Tables.services,
        {
          filters: [{ column: 'active', operator: 'eq', value: true }],
          limit: 6,
          orderBy: 'position',
          orderDirection: 'asc'
        }
      );

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      } else {
        setServices(servicesData || []);
      }

      // Fetch testimonials
      const { data: testimonialsData, error: testimonialsError } = await DatabaseClient.select<Testimonial>(
        Tables.testimonials,
        {
          filters: [
            { column: 'approved', operator: 'eq', value: true },
            { column: 'featured', operator: 'eq', value: true }
          ],
          limit: 6,
          orderBy: 'rating',
          orderDirection: 'desc'
        }
      );

      if (testimonialsError) {
        console.error('Error fetching testimonials:', testimonialsError);
      } else {
        setTestimonials(testimonialsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await DatabaseClient.insert(Tables.contactSubmissions, {
        name: contactForm.name,
        email: contactForm.email,
        phoneNumber: contactForm.phone,
        serviceInterest: contactForm.service,
        message: contactForm.message,
        source: 'homepage_contact',
        status: 'new',
        ipAddress: '', // Will be set by middleware in production
        userAgent: navigator.userAgent
      });

      if (error) throw error;

      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for your interest. We'll contact you within 24 hours.",
      });

      setContactForm({ name: '', email: '', phone: '', service: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const serviceIcons = {
    construction: Building2,
    renovation: Hammer,
    engineering: Wrench,
    architecture: Home,
    consultation: Users,
    maintenance: Truck,
  };

  return (
    <SEOWrapper
      config={{
        title: "AKIBEKS Engineering Solutions - Premier Construction Company in Kenya",
        description: "Leading construction and engineering company in Kenya. We deliver exceptional residential, commercial, and civil engineering projects with over 15 years of experience in Nairobi, Mombasa, and across Kenya.",
        keywords: [
          "construction company Kenya",
          "engineering solutions Kenya",
          "building construction Nairobi",
          "civil engineering Kenya",
          "residential construction",
          "commercial projects Kenya",
          "AKIBEKS construction",
          "Nairobi construction company",
          "Mombasa construction",
          "Kenya engineering firm"
        ],
        type: "website"
      }}
    >
      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80" 
              alt="Construction site in Kenya"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/60"></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-20 w-32 h-32 bg-orange-400/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-green-400/20 rounded-full blur-xl"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
                <Award className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-white text-sm font-medium">NCA Registered • ISO 9001:2015 Certified</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Building Kenya's
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Future Together
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
                Award-winning construction and engineering solutions across Kenya. 
                From residential homes to commercial complexes, we deliver excellence with 15+ years of proven expertise.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <Link to="/request-quote">
                    Get Free Quote
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-4 rounded-full text-lg backdrop-blur-sm transition-all duration-300">
                  <Link to="/portfolio">
                    View Our Projects
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stats.projectsCompleted}+</div>
                  <div className="text-blue-200 text-sm md:text-base">Projects Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stats.clientsSatisfied}+</div>
                  <div className="text-blue-200 text-sm md:text-base">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stats.yearsExperience}</div>
                  <div className="text-blue-200 text-sm md:text-base">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stats.certifications}</div>
                  <div className="text-blue-200 text-sm md:text-base">Certifications</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Our Services
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Comprehensive Construction Solutions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From concept to completion, we offer full-service construction and engineering solutions 
                tailored to Kenya's unique building requirements and standards.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {services.length > 0 ? services.map((service) => {
                const IconComponent = (serviceIcons as any)[service.icon] || Building2;
                
                return (
                  <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {service.features && service.features.length > 0 && (
                        <ul className="space-y-2 mb-4">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      {service.priceRangeMin && service.priceRangeMax && (
                        <div className="flex items-center justify-between py-2 border-t border-gray-100">
                          <span className="text-sm text-gray-500">Price Range:</span>
                          <span className="font-semibold text-blue-600">
                            {formatDisplayAmount(parseFloat(service.priceRangeMin))} - {formatDisplayAmount(parseFloat(service.priceRangeMax))}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button asChild variant="outline" className="flex-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Link to={`/services/${service.id}`}>
                            Learn More
                            <ChevronRight className="ml-2 w-4 h-4" />
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
              }) : (
                // Fallback static services if none loaded from database
                [
                  {
                    icon: Building2,
                    title: "Commercial Construction",
                    description: "Office buildings, retail spaces, and commercial complexes designed for modern business needs.",
                    features: ["Office Buildings", "Retail Centers", "Warehouses", "Industrial Facilities"]
                  },
                  {
                    icon: Home,
                    title: "Residential Projects",
                    description: "Custom homes, residential estates, and housing developments across Kenya.",
                    features: ["Custom Homes", "Apartments", "Residential Estates", "Affordable Housing"]
                  },
                  {
                    icon: Wrench,
                    title: "Civil Engineering",
                    description: "Infrastructure development including roads, bridges, and water systems.",
                    features: ["Road Construction", "Bridge Engineering", "Water Systems", "Site Development"]
                  }
                ].map((service, index) => (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <service.icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button asChild variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Link to="/services">
                          Learn More
                          <ChevronRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* View All Services Button */}
            <div className="text-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                <Link to="/services">
                  View All Services
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <div>
                <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                  Why Choose AKIBEKS
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Kenya's Most Trusted Construction Partner
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  With over 15 years of experience in the Kenyan construction industry, 
                  we combine local expertise with international standards to deliver exceptional results.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: Shield,
                      title: "NCA Registered & ISO Certified",
                      description: "Fully licensed by the National Construction Authority and ISO 9001:2015 certified for quality management."
                    },
                    {
                      icon: Target,
                      title: "Kenya-Focused Expertise",
                      description: "Deep understanding of local building codes, climate considerations, and regulatory requirements."
                    },
                    {
                      icon: Clock,
                      title: "On-Time, On-Budget Delivery",
                      description: "98% of our projects completed on schedule and within budget through meticulous planning and execution."
                    },
                    {
                      icon: Trophy,
                      title: "Award-Winning Projects",
                      description: "Multiple industry awards and recognition for excellence in construction and engineering."
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Link to="/about">
                      Learn More About Us
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/portfolio">
                      View Our Portfolio
                      <ExternalLink className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Image */}
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1590072936008-3746a8e7c28e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="AKIBEKS construction team"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating Stats Card */}
                <div className="absolute -bottom-8 -left-8 bg-white rounded-xl shadow-xl p-6 border">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">98%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Featured Projects
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Excellence in Every Project
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore some of our most impactful construction projects across Kenya, 
                showcasing our commitment to quality, innovation, and client satisfaction.
              </p>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProjects.slice(0, 6).map((project) => (
                <Card key={project.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={project.imageUrl || `https://images.unsplash.com/photo-159007293600${Math.floor(Math.random() * 10)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <Badge className="absolute top-4 left-4 bg-blue-600">
                      {project.projectType}
                    </Badge>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center text-sm mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {project.location}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">
                        Budget: {formatDisplayAmount(parseFloat(project.budgetKes))}
                      </div>
                      <Badge variant="outline" className={
                        project.completionPercentage === 100 ? "text-green-600 border-green-200" :
                        project.completionPercentage > 50 ? "text-blue-600 border-blue-200" :
                        "text-orange-600 border-orange-200"
                      }>
                        {project.completionPercentage}% Complete
                      </Badge>
                    </div>
                    <Button asChild variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Link to={`/projects/${project.id}`}>
                        View Details
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* View All Projects Button */}
            <div className="text-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                <Link to="/portfolio">
                  View All Projects
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Client Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                What Our Clients Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Don't just take our word for it. Hear from our satisfied clients across Kenya 
                who have experienced the AKIBEKS difference in construction excellence.
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.slice(0, 6).map((testimonial) => (
                <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-gray-700 mb-6 italic">
                      <Quote className="w-6 h-6 text-blue-200 mb-2" />
                      "{testimonial.message}"
                    </blockquote>

                    {/* Client Info */}
                    <div className="border-t pt-4">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      {testimonial.company && (
                        <div className="text-sm text-gray-600">{testimonial.company}</div>
                      )}
                      {testimonial.location && (
                        <div className="text-sm text-blue-600 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {testimonial.location}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* View All Testimonials Button */}
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link to="/testimonials">
                  View All Testimonials
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Contact Info */}
              <div>
                <Badge variant="outline" className="mb-4 text-blue-200 border-blue-300">
                  Get In Touch
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Start Your Project?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Let's discuss your construction needs and create something extraordinary together. 
                  Our team is ready to provide you with a free consultation and detailed quote.
                </p>

                {/* Contact Methods */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-800 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-blue-200" />
                    </div>
                    <div>
                      <div className="font-semibold">Call Us</div>
                      <div className="text-blue-200">+254 710 245 118</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-800 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-200" />
                    </div>
                    <div>
                      <div className="font-semibold">Email Us</div>
                      <div className="text-blue-200">info@akibeks.co.ke</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-800 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-200" />
                    </div>
                    <div>
                      <div className="font-semibold">Visit Us</div>
                      <div className="text-blue-200">Westlands, Nairobi, Kenya</div>
                    </div>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Free Consultation</div>
                      <div className="text-blue-200 text-sm">Get expert advice at no cost</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Request a Quote</CardTitle>
                  <CardDescription className="text-blue-200">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Input
                          placeholder="Your Name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                          required
                        />
                      </div>
                      <div>
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Input
                          placeholder="Phone Number"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                          className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                        />
                      </div>
                      <div>
                        <select
                          value={contactForm.service}
                          onChange={(e) => setContactForm({...contactForm, service: e.target.value})}
                          className="w-full p-3 rounded-md bg-white/20 border border-white/30 text-white"
                        >
                          <option value="" className="text-gray-900">Select Service</option>
                          <option value="residential" className="text-gray-900">Residential Construction</option>
                          <option value="commercial" className="text-gray-900">Commercial Construction</option>
                          <option value="renovation" className="text-gray-900">Renovation</option>
                          <option value="consultation" className="text-gray-900">Consultation</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Textarea
                        placeholder="Tell us about your project..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 min-h-[120px]"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Message"}
                      <MessageCircle className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </SEOWrapper>
  );
};

export default Index;
