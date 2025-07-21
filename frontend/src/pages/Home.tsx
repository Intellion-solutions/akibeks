import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Users, Award, CheckCircle, Star, Phone, Mail, MapPin, Clock, Shield, Zap, Target, TrendingUp, Construction, Home as HomeIcon, Factory, Wrench, Calculator, FileText, Calendar, Headphones, Globe, Camera, Video, BookOpen, Lightbulb, Gauge, Cpu, Wifi, Database } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedHero from "@/components/AnimatedHero";
import ServicesCarousel from "@/components/ServicesCarousel";
import SEOHead from "@/components/SEOHead";

const Home = () => {
  const stats = [
    { number: "500+", label: "Projects Completed", icon: Building2 },
    { number: "15+", label: "Years Experience", icon: Award },
    { number: "50+", label: "Expert Team", icon: Users },
    { number: "98%", label: "Client Satisfaction", icon: Star }
  ];

  const services = [
    {
      icon: Construction,
      title: "Construction Services",
      description: "Full-scale construction from groundbreaking to final handover with quality craftsmanship.",
      features: ["Residential Building", "Commercial Construction", "Industrial Projects"]
    },
    {
      icon: Wrench,
      title: "Engineering Solutions",
      description: "Advanced engineering solutions for structural, civil, and mechanical projects.",
      features: ["Structural Engineering", "Civil Engineering", "MEP Systems"]
    },
    {
      icon: Users,
      title: "Project Management",
      description: "Comprehensive project oversight ensuring timely delivery and budget control.",
      features: ["Planning & Scheduling", "Quality Control", "Risk Management"]
    },
    {
      icon: Target,
      title: "Consulting Services",
      description: "Expert technical consulting and advisory services for complex challenges.",
      features: ["Feasibility Studies", "Technical Due Diligence", "Value Engineering"]
    }
  ];

  const testimonials = [
    {
      name: "John Kariuki",
      role: "Property Developer",
      content: "AKIBEKS delivered our commercial complex on time and within budget. Their attention to detail and professional approach exceeded our expectations.",
      rating: 5
    },
    {
      name: "Mary Wanjiku",
      role: "Homeowner",
      content: "Building our dream home with AKIBEKS was a smooth experience. They guided us through every step and delivered exceptional quality.",
      rating: 5
    },
    {
      name: "David Mutua",
      role: "Industrial Client",
      content: "Their industrial construction expertise is unmatched. The factory was completed ahead of schedule with superior build quality.",
      rating: 5
    }
  ];

  const whyChooseUs = [
    {
      icon: Shield,
      title: "Licensed & Certified",
      description: "Fully licensed by NCA with ISO certifications ensuring compliance and quality."
    },
    {
      icon: Zap,
      title: "Advanced Technology",
      description: "Utilizing cutting-edge construction technology and sustainable building practices."
    },
    {
      icon: Clock,
      title: "Timely Delivery",
      description: "Proven track record of delivering projects on time without compromising quality."
    },
    {
      icon: Award,
      title: "Award-Winning Team",
      description: "Industry-recognized professionals with extensive experience and expertise."
    }
  ];

  const industries = [
    { name: "Residential", icon: HomeIcon, projects: "200+" },
    { name: "Commercial", icon: Building2, projects: "150+" },
    { name: "Industrial", icon: Factory, projects: "50+" },
    { name: "Infrastructure", icon: Construction, projects: "100+" }
  ];

  const projectShowcase = [
    {
      title: "Westlands Corporate Tower",
      category: "Commercial",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&h=300&fit=crop",
      description: "35-story corporate headquarters with smart building systems",
      completion: "2024"
    },
    {
      title: "Kileleshwa Residential Complex",
      category: "Residential",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=300&fit=crop",
      description: "Luxury apartments with modern amenities and green spaces",
      completion: "2023"
    },
    {
      title: "Mombasa Industrial Park",
      category: "Industrial",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop",
      description: "State-of-the-art manufacturing facility with sustainable design",
      completion: "2024"
    }
  ];

  const newsUpdates = [
    {
      title: "AKIBEKS Wins National Construction Award 2024",
      date: "December 15, 2024",
      excerpt: "Recognized for excellence in sustainable construction practices and innovative project delivery.",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop"
    },
    {
      title: "New Green Building Certification Program Launched",
      date: "November 28, 2024",
      excerpt: "Leading the industry with our comprehensive green building certification initiative.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop"
    },
    {
      title: "Partnership with Kenya Green Building Society",
      date: "November 10, 2024",
      excerpt: "Strategic partnership to promote sustainable construction practices across Kenya.",
      image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=250&fit=crop"
    }
  ];

  const quickLinks = [
    { icon: Calculator, title: "Cost Calculator", description: "Get instant project estimates", link: "/calculator" },
    { icon: FileText, title: "Project Planner", description: "Plan your construction project", link: "/planner" },
    { icon: Calendar, title: "Schedule Consultation", description: "Book a meeting with our experts", link: "/consultation" },
    { icon: Headphones, title: "24/7 Support", description: "Get help anytime you need", link: "/support" }
  ];

  const digitalSolutions = [
    {
      icon: Gauge,
      title: "Project Dashboard",
      description: "Real-time project monitoring and progress tracking"
    },
    {
      icon: Cpu,
      title: "BIM Integration",
      description: "3D modeling and Building Information Modeling"
    },
    {
      icon: Wifi,
      title: "IoT Solutions",
      description: "Smart building technology and automation"
    },
    {
      icon: Database,
      title: "Data Analytics",
      description: "Construction data analysis and insights"
    }
  ];

  const certifications = [
    { name: "NCA Registration", description: "Registered with National Construction Authority" },
    { name: "ISO 9001:2015", description: "Quality Management System Certification" },
    { name: "ISO 14001:2015", description: "Environmental Management System" },
    { name: "OHSAS 18001", description: "Occupational Health and Safety Management" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SEOHead />
      <Navbar />
      
      {/* Animated Hero Section */}
      <AnimatedHero />

      {/* Stats Section - Enhanced */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800">Our Impact</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Building Excellence Since 2008</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Solutions Section - New */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/20 text-white">Innovation</Badge>
            <h2 className="text-4xl font-bold mb-4">
              Digital Construction Solutions
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Leveraging cutting-edge technology to revolutionize construction processes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {digitalSolutions.map((solution, index) => (
              <Card key={index} className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <solution.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{solution.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100 text-center">{solution.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section - Enhanced */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-800">Quick Access</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fast Track Your Project
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access our digital tools and services to streamline your construction journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickLinks.map((item, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="outline" className="w-full group-hover:bg-indigo-600 group-hover:text-white transition-colors" asChild>
                    <Link to={item.link}>Access Tool</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section - New */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800">Certifications</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Quality Assurance & Compliance
            </h2>
            <p className="text-xl text-gray-600">
              Certified and compliant with international standards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((cert, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{cert.name}</h3>
                  <p className="text-gray-600 text-sm">{cert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Enhanced */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-800">About AKIBEKS</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Building Kenya's Future Since 2008
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                With over 15 years of excellence in construction and engineering, AKIBEKS has established itself as Kenya's premier construction company. We combine traditional craftsmanship with modern technology to deliver exceptional results.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "NCA Licensed and ISO Certified",
                  "500+ Successfully Completed Projects",
                  "Serving clients across East Africa",
                  "Award-winning engineering solutions",
                  "Sustainable construction practices",
                  "Advanced BIM and digital solutions"
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" asChild>
                <Link to="/about">
                  Learn More About Us
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-blue-100 mb-6">
                  To transform Kenya's landscape through innovative construction solutions, sustainable practices, and unwavering commitment to quality and excellence.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">98%</div>
                    <div className="text-blue-200 text-sm">Client Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-blue-200 text-sm">Support Available</div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-400 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Keep existing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-800">Our Services</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Construction Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From residential homes to industrial complexes, we provide end-to-end construction and engineering services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link to="/services">
                View All Services
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Project Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-100 text-teal-800">Recent Projects</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Project Showcase
            </h2>
            <p className="text-xl text-gray-600">
              Explore our latest completed projects and ongoing developments
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {projectShowcase.map((project, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-teal-600 text-white">{project.category}</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-white/90 text-gray-800">{project.completion}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-teal-600 transition-colors">{project.title}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <Button variant="outline" className="w-full group-hover:bg-teal-600 group-hover:text-white transition-colors" asChild>
                    <Link to="/portfolio">View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link to="/portfolio">
                View Full Portfolio
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800">Industries</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sectors We Serve
            </h2>
            <p className="text-xl text-gray-600">
              Diverse expertise across multiple construction sectors
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {industries.map((industry, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <industry.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{industry.name}</h3>
                <p className="text-gray-600">{industry.projects} Projects</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News & Updates */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-800">Latest News</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              News & Updates
            </h2>
            <p className="text-xl text-gray-600">
              Stay updated with our latest achievements and industry insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {newsUpdates.map((news, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="text-sm text-amber-600 mb-2">{news.date}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-amber-600 transition-colors">{news.title}</h3>
                  <p className="text-gray-600 mb-4">{news.excerpt}</p>
                  <Button variant="outline" className="group-hover:bg-amber-600 group-hover:text-white transition-colors" asChild>
                    <Link to="/blog">Read More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link to="/blog">
                View All News
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-800">Why Choose AKIBEKS</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Excellence in Every Project
            </h2>
            <p className="text-xl text-gray-600">
              What sets us apart in the construction industry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/20 text-white">Client Testimonials</Badge>
            <h2 className="text-4xl font-bold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-blue-100">
              Trusted by hundreds of satisfied clients across Kenya
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/90 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-blue-200 text-sm">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get in touch with our expert team and let's bring your vision to life with professional construction services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100" asChild>
              <Link to="/request-quote">
                Get Free Quote
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600" asChild>
              <Link to="/contact">Contact Us Today</Link>
            </Button>
          </div>
          
          {/* Quick Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center">
              <Phone className="w-6 h-6 mr-3" />
              <div>
                <div className="font-semibold">Call Us</div>
                <div className="text-orange-100">+254 710 245 118</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Mail className="w-6 h-6 mr-3" />
              <div>
                <div className="font-semibold">Email Us</div>
                <div className="text-orange-100">info@akibeks.co.ke</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <MapPin className="w-6 h-6 mr-3" />
              <div>
                <div className="font-semibold">Visit Us</div>
                <div className="text-orange-100">Nairobi, Kenya</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
