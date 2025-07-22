import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Star, 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Award,
  Eye,
  Zap,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';
import SEOHead from "@/components/SEO/SEOHead";
import Navbar from "@/components/Navbar";
import { contentManager, EditableProject } from '@/lib/content-manager';
import { useToast } from "@/hooks/use-toast";

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<EditableProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<EditableProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<EditableProject | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    featured: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await contentManager.getPublicProjects({
        featured: filters.featured || undefined,
        limit: 50
      });
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.location.toLowerCase().includes(searchTerm) ||
        project.client.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(project => project.category === filters.category);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(project => project.isFeatured);
    }

    // Sort by featured first, then by creation date
    filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'planning': return <Target className="h-4 w-4" />;
      case 'on-hold': return <AlertCircle className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'residential': <Building2 className="h-5 w-5" />,
      'commercial': <Building2 className="h-5 w-5" />,
      'industrial': <Shield className="h-5 w-5" />,
      'infrastructure': <TrendingUp className="h-5 w-5" />,
      'renovation': <Zap className="h-5 w-5" />,
      'design': <Award className="h-5 w-5" />,
    };
    return icons[category.toLowerCase()] || <Building2 className="h-5 w-5" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const openProjectDetail = (project: EditableProject) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Our Projects - AKIBEKS Engineering Solutions"
        description="Explore our portfolio of completed and ongoing construction and engineering projects across Kenya. From residential to commercial and industrial developments."
        keywords={["construction projects Kenya", "engineering portfolio", "building projects", "AKIBEKS projects", "construction company portfolio"]}
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Our Project Portfolio
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Discover our impressive collection of construction and engineering projects that showcase our expertise and commitment to excellence.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-blue-700/50 px-4 py-2 rounded-full">
                  <Building2 className="h-4 w-4" />
                  <span>{projects.length} Total Projects</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-700/50 px-4 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                  <span>{projects.filter(p => p.status === 'completed').length} Completed</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-700/50 px-4 py-2 rounded-full">
                  <Star className="h-4 w-4" />
                  <span>{projects.filter(p => p.isFeatured).length} Featured</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="renovation">Renovation</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={filters.featured ? "default" : "outline"}
                onClick={() => setFilters(prev => ({ ...prev, featured: !prev.featured }))}
                className="flex items-center gap-2"
              >
                <Star className={`h-4 w-4 ${filters.featured ? 'fill-current' : ''}`} />
                Featured Only
              </Button>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No projects found</h3>
                <p className="text-gray-500">Try adjusting your filters to see more projects.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Project Image */}
                    <div className="relative h-48 overflow-hidden">
                      {project.images && project.images.length > 0 ? (
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          {getCategoryIcon(project.category)}
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                          {getStatusIcon(project.status)}
                          {project.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      {/* Featured Badge */}
                      {project.isFeatured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                          </Badge>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {project.completionPercentage > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                          <div className="flex justify-between items-center text-white text-xs mb-1">
                            <span>Progress</span>
                            <span>{project.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-white/30 rounded-full h-1">
                            <div 
                              className="bg-blue-400 h-1 rounded-full transition-all duration-300" 
                              style={{ width: `${project.completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(project.category)}
                          {project.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {project.teamSize} team members
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2" />
                          {project.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-2" />
                          {project.client}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(project.startDate).toLocaleDateString()}
                          {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                        </div>
                        <div className="flex items-center text-sm font-semibold text-green-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {formatCurrency(project.budgetKes)}
                        </div>
                      </div>

                      {/* Technologies */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.slice(0, 3).map((tech, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{project.technologies.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Button 
                        onClick={() => openProjectDetail(project)}
                        className="w-full flex items-center justify-center gap-2 group-hover:bg-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Project Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProject && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-3">
                    {getCategoryIcon(selectedProject.category)}
                    {selectedProject.title}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {selectedProject.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Project Images */}
                  {selectedProject.images && selectedProject.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProject.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${selectedProject.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Project Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={getStatusColor(selectedProject.status)}>
                            {selectedProject.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{selectedProject.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{selectedProject.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Client:</span>
                          <span className="font-medium">{selectedProject.client}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-medium text-green-600">{formatCurrency(selectedProject.budgetKes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Team Size:</span>
                          <span className="font-medium">{selectedProject.teamSize} members</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Progress:</span>
                          <span className="font-medium">{selectedProject.completionPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Timeline</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</span>
                        </div>
                        {selectedProject.endDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">End Date:</span>
                            <span className="font-medium">{new Date(selectedProject.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      {selectedProject.features && selectedProject.features.length > 0 && (
                        <>
                          <h4 className="font-semibold text-lg">Key Features</h4>
                          <ul className="space-y-1">
                            {selectedProject.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Long Description */}
                  {selectedProject.longDescription && (
                    <div>
                      <h4 className="font-semibold text-lg mb-3">Project Description</h4>
                      <p className="text-gray-700 leading-relaxed">{selectedProject.longDescription}</p>
                    </div>
                  )}

                  {/* Technologies */}
                  {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-lg mb-3">Technologies & Methods</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech, index) => (
                          <Badge key={index} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Challenges & Solutions */}
                  {(selectedProject.challenges || selectedProject.solutions) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedProject.challenges && (
                        <div>
                          <h4 className="font-semibold text-lg mb-3 text-orange-600">Challenges</h4>
                          <p className="text-gray-700">{selectedProject.challenges}</p>
                        </div>
                      )}
                      {selectedProject.solutions && (
                        <div>
                          <h4 className="font-semibold text-lg mb-3 text-green-600">Solutions</h4>
                          <p className="text-gray-700">{selectedProject.solutions}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Testimonial */}
                  {selectedProject.testimonial && (
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-lg mb-3">Client Testimonial</h4>
                      <blockquote className="text-gray-700 italic mb-3">
                        "{selectedProject.testimonial.content}"
                      </blockquote>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{selectedProject.testimonial.clientName}</div>
                          <div className="text-sm text-gray-600">{selectedProject.testimonial.clientTitle}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < selectedProject.testimonial!.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Projects;
