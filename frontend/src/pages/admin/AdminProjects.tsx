import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar as CalendarIcon,
  MapPin,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  MoreHorizontal,
  Star,
  TrendingUp,
  Target,
  FileText,
  Mail,
  Phone
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { clientDb } from "@/lib/client-db";
import { formatDisplayAmount } from "@/lib/currency-utils";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  location: string;
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  budget: number;
  actualCost?: number;
  progress: number;
  teamSize: number;
  projectManager: string;
  services: string[];
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({});
  const [editProject, setEditProject] = useState<Partial<Project>>({});
  const { toast } = useToast();

  // Mock data for projects
  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'Nairobi CBD Office Complex',
      description: 'A modern 15-story office building featuring sustainable design, smart building technology, and premium finishes.',
      category: 'Commercial',
      status: 'completed',
      priority: 'high',
      clientId: '1',
      clientName: 'Nairobi Business Park Ltd',
      clientEmail: 'info@nairobibusinesspark.co.ke',
      clientPhone: '+254 700 123 456',
      location: 'Nairobi CBD, Kenya',
      startDate: new Date('2023-01-15'),
      estimatedEndDate: new Date('2024-06-30'),
      actualEndDate: new Date('2024-06-15'),
      budget: 850000000,
      actualCost: 820000000,
      progress: 100,
      teamSize: 45,
      projectManager: 'John Kamau',
      services: ['Architectural Design', 'Structural Engineering', 'MEP Systems', 'Project Management'],
      tags: ['LEED Certified', 'Smart Building', 'High-rise'],
      notes: 'Project completed ahead of schedule with excellent client satisfaction.',
      createdAt: new Date('2022-12-01'),
      updatedAt: new Date('2024-06-15')
    },
    {
      id: '2',
      title: 'Westlands Residential Estate',
      description: 'Luxury residential development with 120 units featuring modern amenities and green spaces.',
      category: 'Residential',
      status: 'in_progress',
      priority: 'high',
      clientId: '2',
      clientName: 'Westlands Development Co.',
      clientEmail: 'projects@westlandsdev.co.ke',
      clientPhone: '+254 722 345 678',
      location: 'Westlands, Nairobi',
      startDate: new Date('2024-03-01'),
      estimatedEndDate: new Date('2025-12-31'),
      budget: 1200000000,
      progress: 35,
      teamSize: 32,
      projectManager: 'Mary Wanjiku',
      services: ['Master Planning', 'Architectural Design', 'Infrastructure Design', 'Landscaping'],
      tags: ['Gated Community', 'Luxury', 'Green Building'],
      notes: 'Phase 1 foundation work completed. Moving to superstructure.',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-01')
    },
    {
      id: '3',
      title: 'Mombasa Port Expansion',
      description: 'Infrastructure development project to expand port capacity and improve logistics efficiency.',
      category: 'Infrastructure',
      status: 'planning',
      priority: 'critical',
      clientId: '3',
      clientName: 'Kenya Ports Authority',
      clientEmail: 'engineering@kpa.co.ke',
      clientPhone: '+254 733 456 789',
      location: 'Mombasa, Kenya',
      startDate: new Date('2024-08-01'),
      estimatedEndDate: new Date('2027-03-31'),
      budget: 2500000000,
      progress: 15,
      teamSize: 68,
      projectManager: 'Peter Ochieng',
      services: ['Feasibility Study', 'Structural Engineering', 'Marine Engineering', 'Environmental Impact Assessment'],
      tags: ['Port Infrastructure', 'Marine Engineering', 'Government Project'],
      notes: 'Environmental impact assessment in progress. Awaiting regulatory approvals.',
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-10-15')
    }
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProjects(mockProjects);
        setFilteredProjects(mockProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(project => project.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'planning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'on_hold':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCreateProject = async () => {
    try {
      // Validate required fields
      if (!newProject.title || !newProject.clientName || !newProject.budget) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const projectData = {
        ...newProject,
        id: Date.now().toString(),
        progress: 0,
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date()
      } as Project;

      setProjects(prev => [...prev, projectData]);
      setIsCreateDialogOpen(false);
      setNewProject({});
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleEditProject = async () => {
    if (!selectedProject) return;

    try {
      const updatedProject = {
        ...selectedProject,
        ...editProject,
        updatedAt: new Date()
      };

      setProjects(prev => 
        prev.map(p => p.id === selectedProject.id ? updatedProject : p)
      );
      
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      setEditProject({});
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all engineering projects</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new engineering project to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={newProject.title || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter project title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newProject.category || ''} 
                    onValueChange={(value) => setNewProject(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Project description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={newProject.clientName || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Client name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newProject.location || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Project location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (KES) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newProject.budget || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    placeholder="Project budget"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newProject.priority || 'medium'} 
                    onValueChange={(value) => setNewProject(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="h-5 w-5" />
              <span className="font-medium">Filters:</span>
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

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Projects Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by creating your first project.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusIcon(project.status)}
                      {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setEditProject(project);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Project Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{project.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatDisplayAmount(project.budget)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(project.estimatedEndDate, 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                  <div className="flex flex-wrap gap-1">
                    {project.services.slice(0, 2).map((service, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {project.services.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.services.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Project Title</Label>
                <Input
                  id="edit-title"
                  value={editProject.title || ''}
                  onChange={(e) => setEditProject(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editProject.status || selectedProject.status} 
                  onValueChange={(value) => setEditProject(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-progress">Progress (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={editProject.progress || selectedProject.progress}
                  onChange={(e) => setEditProject(prev => ({ ...prev, progress: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select 
                  value={editProject.priority || selectedProject.priority} 
                  onValueChange={(value) => setEditProject(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editProject.notes || selectedProject.notes || ''}
                  onChange={(e) => setEditProject(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;
