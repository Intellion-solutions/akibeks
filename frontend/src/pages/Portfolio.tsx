
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Filter,
  Search,
  ExternalLink,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Play
} from "lucide-react";
import { Link } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOWrapper from "@/components/SEOWrapper";
import { clientDb } from "@/lib/client-db";
import { formatDisplayAmount } from "@/lib/currency-utils";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  location: string;
  startDate: string;
  estimatedEndDate: string;
  budget: number;
  progress: number;
  imageUrl?: string;
  gallery?: string[];
  client: string;
  services: string[];
  teamSize: number;
  features: string[];
  testimonial?: {
    text: string;
    author: string;
    rating: number;
  };
}

const Portfolio = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Mock data for portfolio projects
  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'Nairobi CBD Office Complex',
      description: 'A modern 15-story office building featuring sustainable design, smart building technology, and premium finishes.',
      category: 'Commercial',
      status: 'completed',
      priority: 'high',
      location: 'Nairobi CBD, Kenya',
      startDate: '2023-01-15',
      estimatedEndDate: '2024-06-30',
      budget: 850000000,
      progress: 100,
      imageUrl: '/images/projects/nairobi-office.jpg',
      gallery: ['/images/gallery/office-1.jpg', '/images/gallery/office-2.jpg'],
      client: 'Nairobi Business Park Ltd',
      services: ['Architectural Design', 'Structural Engineering', 'MEP Systems', 'Project Management'],
      teamSize: 45,
      features: ['LEED Gold Certified', 'Smart Building Systems', 'Solar Power Integration', 'Rainwater Harvesting'],
      testimonial: {
        text: 'AKIBEKS delivered an exceptional project that exceeded our expectations in both quality and timeline.',
        author: 'John Kamau, CEO',
        rating: 5
      }
    },
    {
      id: '2',
      title: 'Westlands Residential Estate',
      description: 'Luxury residential development with 120 units featuring modern amenities and green spaces.',
      category: 'Residential',
      status: 'in_progress',
      priority: 'high',
      location: 'Westlands, Nairobi',
      startDate: '2024-03-01',
      estimatedEndDate: '2025-12-31',
      budget: 1200000000,
      progress: 35,
      imageUrl: '/images/projects/westlands-estate.jpg',
      client: 'Westlands Development Co.',
      services: ['Master Planning', 'Architectural Design', 'Infrastructure Design', 'Landscaping'],
      teamSize: 32,
      features: ['Gated Community', 'Swimming Pool', 'Gym & Spa', 'Children\'s Playground', 'Solar Street Lighting']
    },
    {
      id: '3',
      title: 'Mombasa Port Expansion',
      description: 'Infrastructure development project to expand port capacity and improve logistics efficiency.',
      category: 'Infrastructure',
      status: 'planning',
      priority: 'critical',
      location: 'Mombasa, Kenya',
      startDate: '2024-08-01',
      estimatedEndDate: '2027-03-31',
      budget: 2500000000,
      progress: 15,
      imageUrl: '/images/projects/mombasa-port.jpg',
      client: 'Kenya Ports Authority',
      services: ['Feasibility Study', 'Structural Engineering', 'Marine Engineering', 'Environmental Impact Assessment'],
      teamSize: 68,
      features: ['Deep Water Berths', 'Automated Cargo Handling', 'Rail Connectivity', 'Green Port Initiative']
    },
    {
      id: '4',
      title: 'Kisumu Water Treatment Plant',
      description: 'State-of-the-art water treatment facility serving 500,000 residents with advanced purification technology.',
      category: 'Infrastructure',
      status: 'completed',
      priority: 'high',
      location: 'Kisumu, Kenya',
      startDate: '2022-06-01',
      estimatedEndDate: '2023-11-30',
      budget: 450000000,
      progress: 100,
      imageUrl: '/images/projects/kisumu-water.jpg',
      client: 'Kisumu Water & Sewerage Co.',
      services: ['Process Design', 'Structural Engineering', 'Electrical Systems', 'Commissioning'],
      teamSize: 28,
      features: ['Advanced Filtration', 'UV Disinfection', 'Remote Monitoring', 'Energy Efficient Design'],
      testimonial: {
        text: 'The plant has significantly improved water quality and reliability for our customers.',
        author: 'Mary Ochieng, General Manager',
        rating: 5
      }
    },
    {
      id: '5',
      title: 'Karen Shopping Mall',
      description: 'Premium retail and entertainment complex with international brands and local businesses.',
      category: 'Commercial',
      status: 'in_progress',
      priority: 'medium',
      location: 'Karen, Nairobi',
      startDate: '2024-01-15',
      estimatedEndDate: '2025-08-31',
      budget: 680000000,
      progress: 55,
      imageUrl: '/images/projects/karen-mall.jpg',
      client: 'Karen Retail Developers',
      services: ['Architectural Design', 'MEP Engineering', 'Fire Safety Systems', 'Parking Design'],
      teamSize: 38,
      features: ['IMAX Cinema', 'Food Court', 'Anchor Stores', 'Underground Parking', 'Rooftop Garden']
    },
    {
      id: '6',
      title: 'Nakuru Industrial Park',
      description: 'Modern industrial facility with manufacturing units, warehouses, and supporting infrastructure.',
      category: 'Industrial',
      status: 'planning',
      priority: 'medium',
      location: 'Nakuru, Kenya',
      startDate: '2024-10-01',
      estimatedEndDate: '2026-06-30',
      budget: 950000000,
      progress: 8,
      imageUrl: '/images/projects/nakuru-industrial.jpg',
      client: 'Nakuru Industrial Development Authority',
      services: ['Master Planning', 'Infrastructure Design', 'Environmental Assessment', 'Utility Planning'],
      teamSize: 42,
      features: ['Rail Access', 'Power Substation', 'Water Treatment', 'Waste Management', 'Security Systems']
    }
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProjects(mockProjects);
        setFilteredProjects(mockProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(project => 
        project.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => 
        project.status === statusFilter
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, categoryFilter, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'planning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['all', 'Commercial', 'Residential', 'Infrastructure', 'Industrial'];
  const statuses = ['all', 'completed', 'in_progress', 'planning'];

  return (
    <SEOWrapper
      title="Portfolio - AKIBEKS Engineering Solutions"
      description="Explore our portfolio of completed and ongoing engineering projects across Kenya. From commercial buildings to infrastructure development."
      keywords="portfolio, projects, engineering, construction, Kenya, commercial, residential, infrastructure"
    >
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Our Portfolio
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Showcasing Excellence in Engineering and Construction Across Kenya
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <span>50+ Projects Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span>KES 5B+ in Project Value</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>100+ Team Members</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Filter className="h-5 w-5" />
                <span className="font-medium">Filter Projects:</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : 
                         status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Projects Found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Project Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                      {project.imageUrl ? (
                        <img 
                          src={project.imageUrl} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-16 w-16 text-blue-300" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                          {getStatusIcon(project.status)}
                          {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>

                      {/* Priority Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge variant={project.priority === 'critical' ? 'destructive' : 
                                     project.priority === 'high' ? 'default' : 'secondary'}>
                          {project.priority}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                        <div className="flex justify-between items-center text-white text-sm mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </CardTitle>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Project Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{project.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>Budget: {formatDisplayAmount(project.budget)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>Team: {project.teamSize} members</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(project.startDate).toLocaleDateString()} - 
                            {new Date(project.estimatedEndDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {project.services.slice(0, 3).map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {project.services.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Testimonial */}
                      {project.testimonial && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(project.testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 italic line-clamp-2">
                            "{project.testimonial.text}"
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            - {project.testimonial.author}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          asChild 
                          className="flex-1"
                          onClick={() => setSelectedProject(project)}
                        >
                          <Link to={`/projects/${project.id}`}>
                            View Details
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        {project.gallery && project.gallery.length > 0 && (
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Let's discuss how we can bring your engineering vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/contact">Get a Quote</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/services">Our Services</Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </SEOWrapper>
  );
};

export default Portfolio;
