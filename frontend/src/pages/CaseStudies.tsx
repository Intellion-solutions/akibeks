
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  Award,
  Zap,
  CheckCircle,
  ArrowRight,
  Filter,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CaseStudies = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const caseStudies = [
    {
      id: 1,
      title: "Nairobi Modern Business Complex",
      category: "commercial",
      location: "Westlands, Nairobi",
      completedDate: "March 2024",
      budget: "KES 120M",
      duration: "18 months",
      client: "Samara Holdings Ltd",
      image: "/api/placeholder/600/400",
      challenge: "Constructing a 12-story business complex in a high-density urban area with limited space and strict environmental regulations.",
      solution: "Implemented innovative vertical construction techniques with prefabricated modules and green building technologies to minimize environmental impact.",
      results: [
        "Completed 2 months ahead of schedule",
        "30% reduction in energy consumption",
        "LEED Gold certification achieved",
        "Zero safety incidents during construction"
      ],
      keyFeatures: [
        "Smart building automation",
        "Rainwater harvesting system",
        "Solar panel integration",
        "Green roof garden",
        "Underground parking for 200 vehicles"
      ],
      tags: ["Commercial", "Green Building", "Urban", "High-rise"]
    },
    {
      id: 2,
      title: "Mombasa Affordable Housing Project",
      category: "residential",
      location: "Kisauni, Mombasa",
      completedDate: "January 2024",
      budget: "KES 80M",
      duration: "12 months",
      client: "Kenya National Housing Corporation",
      image: "/api/placeholder/600/400",
      challenge: "Delivering quality affordable housing for 500 families while maintaining cost efficiency and meeting government standards.",
      solution: "Utilized locally sourced materials and community labor programs to reduce costs while ensuring quality construction standards.",
      results: [
        "500 housing units delivered",
        "25% below budget completion",
        "Created 200 local jobs",
        "100% occupancy within 3 months"
      ],
      keyFeatures: [
        "2 & 3 bedroom units",
        "Community center",
        "Children's playground",
        "Solar water heating",
        "Waste management system"
      ],
      tags: ["Residential", "Affordable Housing", "Community", "Coastal"]
    },
    {
      id: 3,
      title: "Kisumu Water Treatment Plant",
      category: "infrastructure",
      location: "Kisumu County",
      completedDate: "September 2023",
      budget: "KES 200M",
      duration: "24 months",
      client: "Kisumu Water & Sewerage Company",
      image: "/api/placeholder/600/400",
      challenge: "Building a modern water treatment facility to serve 500,000 residents while ensuring minimal disruption to existing water supply.",
      solution: "Phased construction approach with temporary bypass systems to maintain water supply during construction.",
      results: [
        "Increased water capacity by 200%",
        "Improved water quality by 95%",
        "Serves 500,000+ residents",
        "24/7 operational capability"
      ],
      keyFeatures: [
        "Advanced filtration systems",
        "Automated monitoring",
        "Emergency backup systems",
        "Laboratory facilities",
        "Staff training center"
      ],
      tags: ["Infrastructure", "Water Treatment", "Public Service", "Technology"]
    },
    {
      id: 4,
      title: "Nakuru County Hospital Expansion",
      category: "healthcare",
      location: "Nakuru Town",
      completedDate: "June 2023",
      budget: "KES 150M",
      duration: "20 months",
      client: "Nakuru County Government",
      image: "/api/placeholder/600/400",
      challenge: "Expanding hospital capacity while maintaining full operations during construction in a sensitive healthcare environment.",
      solution: "Modular construction approach with infection control protocols and 24/7 coordination with hospital operations.",
      results: [
        "Doubled hospital capacity",
        "Zero operational disruption",
        "State-of-the-art medical facilities",
        "Improved patient outcomes"
      ],
      keyFeatures: [
        "Modern ICU units",
        "Digital imaging center",
        "Emergency trauma center",
        "Helicopter landing pad",
        "Medical gas systems"
      ],
      tags: ["Healthcare", "Emergency", "Specialized Construction", "Critical Infrastructure"]
    },
    {
      id: 5,
      title: "Eldoret International School",
      category: "education",
      location: "Eldoret, Uasin Gishu",
      completedDate: "December 2023",
      budget: "KES 95M",
      duration: "15 months",
      client: "Eldoret International School Board",
      image: "/api/placeholder/600/400",
      challenge: "Creating a world-class educational facility with modern amenities while working within budget constraints.",
      solution: "Value engineering approach with innovative design solutions and local material optimization.",
      results: [
        "1,200 student capacity",
        "International standard facilities",
        "Energy-efficient design",
        "Award-winning architecture"
      ],
      keyFeatures: [
        "Smart classrooms",
        "Science laboratories",
        "Sports complex",
        "Library and media center",
        "Performing arts theater"
      ],
      tags: ["Education", "International Standards", "Smart Technology", "Architecture"]
    },
    {
      id: 6,
      title: "Thika Road Bridge Rehabilitation",
      category: "infrastructure",
      location: "Thika Road, Nairobi",
      completedDate: "August 2023",
      budget: "KES 45M",
      duration: "8 months",
      client: "Kenya National Highways Authority",
      image: "/api/placeholder/600/400",
      challenge: "Rehabilitating a critical bridge while maintaining traffic flow on one of Kenya's busiest highways.",
      solution: "Night construction schedule with advanced traffic management systems and pre-engineered components.",
      results: [
        "Zero traffic disruption",
        "Extended bridge lifespan by 50 years",
        "Improved safety standards",
        "Enhanced load capacity"
      ],
      keyFeatures: [
        "Reinforced concrete structure",
        "Modern drainage systems",
        "LED lighting installation",
        "Earthquake-resistant design",
        "Smart monitoring systems"
      ],
      tags: ["Infrastructure", "Bridge", "Highway", "Traffic Management"]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Projects', count: caseStudies.length },
    { id: 'commercial', name: 'Commercial', count: caseStudies.filter(cs => cs.category === 'commercial').length },
    { id: 'residential', name: 'Residential', count: caseStudies.filter(cs => cs.category === 'residential').length },
    { id: 'infrastructure', name: 'Infrastructure', count: caseStudies.filter(cs => cs.category === 'infrastructure').length },
    { id: 'healthcare', name: 'Healthcare', count: caseStudies.filter(cs => cs.category === 'healthcare').length },
    { id: 'education', name: 'Education', count: caseStudies.filter(cs => cs.category === 'education').length }
  ];

  const filteredCaseStudies = activeFilter === 'all' 
    ? caseStudies 
    : caseStudies.filter(cs => cs.category === activeFilter);

  const stats = [
    { number: "100+", label: "Completed Projects", icon: <Building2 className="h-8 w-8 text-blue-600" /> },
    { number: "KES 2B+", label: "Total Project Value", icon: <DollarSign className="h-8 w-8 text-green-600" /> },
    { number: "10,000+", label: "Jobs Created", icon: <Users className="h-8 w-8 text-purple-600" /> },
    { number: "98%", label: "Client Satisfaction", icon: <Award className="h-8 w-8 text-yellow-600" /> }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <Building2 className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Our Success Stories
              <span className="text-blue-600 block">Across Kenya</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Explore our portfolio of completed projects across Kenya. From 
              commercial complexes in Nairobi to infrastructure projects in rural 
              counties, see how we've transformed communities through quality construction.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request-quote">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Download className="mr-2 h-5 w-5" />
                Download Portfolio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-lg font-semibold text-gray-900">Filter by Category:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeFilter === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(category.id)}
                  className={activeFilter === category.id ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCaseStudies.map((study) => (
              <Card key={study.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={study.image} 
                    alt={study.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white">
                      {study.category.charAt(0).toUpperCase() + study.category.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {study.title}
                  </CardTitle>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      {study.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      {study.completedDate}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                      {study.budget}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-purple-500" />
                      {study.duration}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                      <p className="text-gray-600 text-sm">{study.challenge}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                      <p className="text-gray-600 text-sm">{study.solution}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Results</h4>
                      <ul className="space-y-1">
                        {study.results.slice(0, 3).map((result, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {study.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        View Full Case Study
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Proven Process
            </h2>
            <p className="text-lg text-gray-600">
              Every successful project follows our systematic approach to ensure 
              quality, timeliness, and client satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Planning & Design",
                description: "Comprehensive project planning with detailed architectural and engineering designs.",
                icon: <Building2 className="h-8 w-8 text-blue-600" />
              },
              {
                step: "02", 
                title: "Permits & Approval",
                description: "Securing all necessary permits and regulatory approvals from relevant authorities.",
                icon: <CheckCircle className="h-8 w-8 text-green-600" />
              },
              {
                step: "03",
                title: "Construction",
                description: "Systematic construction execution with quality control and regular progress updates.",
                icon: <Zap className="h-8 w-8 text-yellow-600" />
              },
              {
                step: "04",
                title: "Delivery & Support",
                description: "Project handover with comprehensive support and maintenance services.",
                icon: <Award className="h-8 w-8 text-purple-600" />
              }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                  <div className="text-3xl font-bold text-gray-300 mb-4">{process.step}</div>
                  <div className="flex justify-center mb-4">
                    {process.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {process.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {process.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Your Success Story?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let's discuss how we can bring your construction vision to life. 
            Get a free consultation and project quote today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/request-quote">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Free Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Schedule Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CaseStudies;
