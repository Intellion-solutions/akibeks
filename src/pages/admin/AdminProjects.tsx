import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Star, 
  Eye, 
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  MoreHorizontal,
  Target,
  PieChart,
  BarChart3,
  Activity
} from "lucide-react";
import { db } from "@/lib/db-client";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  client_name: string;
  manager_name: string;
  budget: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  completion_percentage: number;
  team_members?: number;
  tasks_total?: number;
  tasks_completed?: number;
  created_at: string;
}

const AdminProjects = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAdmin();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "planning" as const,
    priority: "medium" as const,
    client_name: "",
    manager_name: "",
    budget: "",
    start_date: "",
    end_date: ""
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    on_hold: 0,
    planning: 0,
    total_budget: 0,
    spent_budget: 0,
    avg_completion: 0
  });

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    updateStats();
  }, [projects]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'E-commerce Website Redesign',
          description: 'Complete redesign of the company e-commerce platform with modern UI/UX and enhanced functionality.',
          status: 'active',
          priority: 'high',
          client_name: 'TechShop Inc.',
          manager_name: 'John Smith',
          budget: 75000,
          spent_amount: 45000,
          start_date: '2024-01-15',
          end_date: '2024-05-15',
          completion_percentage: 60,
          team_members: 8,
          tasks_total: 45,
          tasks_completed: 27,
          created_at: '2024-01-10T10:30:00Z'
        },
        {
          id: '2',
          name: 'Mobile App Development',
          description: 'Native iOS and Android mobile application for customer engagement and sales.',
          status: 'planning',
          priority: 'medium',
          client_name: 'StartupCorp',
          manager_name: 'Sarah Johnson',
          budget: 120000,
          spent_amount: 5000,
          start_date: '2024-03-01',
          end_date: '2024-09-01',
          completion_percentage: 5,
          team_members: 6,
          tasks_total: 62,
          tasks_completed: 3,
          created_at: '2024-02-01T14:20:00Z'
        },
        {
          id: '3',
          name: 'Data Analytics Platform',
          description: 'Business intelligence platform with real-time analytics and reporting capabilities.',
          status: 'active',
          priority: 'urgent',
          client_name: 'DataCorp LLC',
          manager_name: 'Michael Chen',
          budget: 200000,
          spent_amount: 140000,
          start_date: '2023-10-01',
          end_date: '2024-04-01',
          completion_percentage: 85,
          team_members: 12,
          tasks_total: 78,
          tasks_completed: 66,
          created_at: '2023-09-15T09:00:00Z'
        },
        {
          id: '4',
          name: 'Marketing Website',
          description: 'Corporate marketing website with CMS integration and SEO optimization.',
          status: 'completed',
          priority: 'low',
          client_name: 'Creative Agency',
          manager_name: 'Emily Davis',
          budget: 35000,
          spent_amount: 32000,
          start_date: '2023-11-01',
          end_date: '2024-01-15',
          completion_percentage: 100,
          team_members: 4,
          tasks_total: 28,
          tasks_completed: 28,
          created_at: '2023-10-20T16:45:00Z'
        },
        {
          id: '5',
          name: 'Inventory Management System',
          description: 'Cloud-based inventory management system with barcode scanning and reporting.',
          status: 'on_hold',
          priority: 'medium',
          client_name: 'RetailMax',
          manager_name: 'David Wilson',
          budget: 95000,
          spent_amount: 25000,
          start_date: '2024-01-01',
          end_date: '2024-06-01',
          completion_percentage: 25,
          team_members: 5,
          tasks_total: 38,
          tasks_completed: 9,
          created_at: '2023-12-15T11:30:00Z'
        }
      ];
      
      setProjects(mockProjects);
      toast({
        title: "Projects loaded",
        description: "Project data has been successfully loaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const on_hold = projects.filter(p => p.status === 'on_hold').length;
    const planning = projects.filter(p => p.status === 'planning').length;
    const total_budget = projects.reduce((sum, p) => sum + p.budget, 0);
    const spent_budget = projects.reduce((sum, p) => sum + p.spent_amount, 0);
    const avg_completion = total > 0 ? Math.round(projects.reduce((sum, p) => sum + p.completion_percentage, 0) / total) : 0;

    setStats({
      total,
      active,
      completed,
      on_hold,
      planning,
      total_budget,
      spent_budget,
      avg_completion
    });
  };

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.client_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const project: Project = {
        id: Date.now().toString(),
        ...newProject,
        budget: parseFloat(newProject.budget) || 0,
        spent_amount: 0,
        completion_percentage: 0,
        team_members: 0,
        tasks_total: 0,
        tasks_completed: 0,
        created_at: new Date().toISOString()
      };

      setProjects(prev => [project, ...prev]);
      setShowCreateProject(false);
      setNewProject({
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        client_name: "",
        manager_name: "",
        budget: "",
        start_date: "",
        end_date: ""
      });

      toast({
        title: "Success",
        description: "Project created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      setProjects(prev => prev.map(project => 
        project.id === selectedProject.id ? { ...selectedProject } : project
      ));
      setShowEditProject(false);
      setSelectedProject(null);

      toast({
        title: "Success",
        description: "Project updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      setProjects(prev => prev.filter(project => project.id !== selectedProject.id));
      setShowDeleteConfirm(false);
      setSelectedProject(null);

      toast({
        title: "Success",
        description: "Project deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    const matchesPriority = filterPriority === "all" || project.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Manage and monitor all projects across your organization.
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <Button 
                  onClick={() => setShowCreateProject(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Projects</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.active}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.total_budget)}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-orange-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Completion</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.avg_completion}%</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search projects by name, client, or manager..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Projects ({filteredProjects.length})</span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filter
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">{project.manager_name}</div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Users className="h-3 w-3 mr-1" />
                              {project.team_members} members
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">{project.client_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(project.status)}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeColor(project.priority)}>
                            {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-full">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>{project.completion_percentage}%</span>
                              <span className="text-gray-500">
                                {project.tasks_completed}/{project.tasks_total} tasks
                              </span>
                            </div>
                            <Progress value={project.completion_percentage} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(project.budget)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Spent: {formatCurrency(project.spent_amount)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {Math.round((project.spent_amount / project.budget) * 100)}% used
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center text-gray-900">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(project.start_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-gray-500 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(project.end_date).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProject(project);
                                setShowEditProject(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProject(project);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create Project Dialog */}
      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project with client information, budget, and timeline.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="E-commerce Platform"
                />
              </div>
              <div>
                <Label htmlFor="client">Client Name *</Label>
                <Input
                  id="client"
                  value={newProject.client_name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Tech Solutions Inc."
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Project description and requirements..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manager">Project Manager</Label>
                <Input
                  id="manager"
                  value={newProject.manager_name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, manager_name: e.target.value }))}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="50000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newProject.status} onValueChange={(value) => setNewProject(prev => ({ ...prev, status: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newProject.priority} onValueChange={(value) => setNewProject(prev => ({ ...prev, priority: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newProject.start_date}
                  onChange={(e) => setNewProject(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newProject.end_date}
                  onChange={(e) => setNewProject(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateProject(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditProject} onOpenChange={setShowEditProject}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information and settings.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Project Name *</Label>
                  <Input
                    id="edit-name"
                    value={selectedProject.name}
                    onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-client">Client Name *</Label>
                  <Input
                    id="edit-client"
                    value={selectedProject.client_name}
                    onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, client_name: e.target.value }) : null)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedProject.description}
                  onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-manager">Project Manager</Label>
                  <Input
                    id="edit-manager"
                    value={selectedProject.manager_name}
                    onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, manager_name: e.target.value }) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-budget">Budget ($)</Label>
                  <Input
                    id="edit-budget"
                    type="number"
                    value={selectedProject.budget}
                    onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, budget: parseFloat(e.target.value) || 0 }) : null)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={selectedProject.status} onValueChange={(value) => setSelectedProject(prev => prev ? ({ ...prev, status: value as any }) : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={selectedProject.priority} onValueChange={(value) => setSelectedProject(prev => prev ? ({ ...prev, priority: value as any }) : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start_date">Start Date</Label>
                  <Input
                    id="edit-start_date"
                    type="date"
                    value={selectedProject.start_date}
                    onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, start_date: e.target.value }) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end_date">End Date</Label>
                  <Input
                    id="edit-end_date"
                    type="date"
                    value={selectedProject.end_date}
                    onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, end_date: e.target.value }) : null)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditProject(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject} disabled={loading}>
              {loading ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-gray-900">{selectedProject.name}</div>
                  <div className="text-sm text-gray-500">{selectedProject.client_name}</div>
                  <div className="text-sm text-gray-500">Budget: {formatCurrency(selectedProject.budget)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={loading}>
              {loading ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;
