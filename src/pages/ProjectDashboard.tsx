import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Camera,
  MessageCircle,
  TrendingUp,
  Wrench,
  Building,
  PlusCircle,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  BarChart3,
  Zap,
  Target,
  Flag,
  AlertCircle,
  Star,
  UserCheck,
  Activity,
  Calendar as CalendarIcon,
  Clipboard,
  PieChart,
  LineChart,
  Settings,
  Bell,
  Share2,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  project_number: string;
  title: string;
  description: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  location: string;
  total_budget: number;
  spent_amount: number;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  expected_completion: string;
  actual_completion?: string;
  completion_percentage: number;
  created_at: string;
  project_manager?: string;
  team_members?: string[];
  tags?: string[];
  risk_level: 'low' | 'medium' | 'high';
  client_satisfaction?: number;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  assigned_to: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string;
  estimated_hours: number;
  actual_hours?: number;
  dependencies?: string[];
  created_at: string;
  completed_at?: string;
}

interface Resource {
  id: string;
  project_id: string;
  name: string;
  type: 'human' | 'equipment' | 'material';
  cost_per_unit: number;
  quantity: number;
  status: 'available' | 'assigned' | 'in_use' | 'maintenance';
  allocation_start?: string;
  allocation_end?: string;
}

interface TimeEntry {
  id: string;
  project_id: string;
  task_id?: string;
  user_name: string;
  hours: number;
  date: string;
  description: string;
  billable: boolean;
}

interface RiskItem {
  id: string;
  project_id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation_strategy: string;
  status: 'identified' | 'mitigating' | 'resolved' | 'occurred';
  owner: string;
}

const ProjectDashboard = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchProjectNumber, setSearchProjectNumber] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'gantt'>('list');

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium' as const,
    due_date: '',
    estimated_hours: 0
  });

  // Time tracking state
  const [timeEntry, setTimeEntry] = useState({
    task_id: '',
    hours: 0,
    description: '',
    billable: true
  });

  const fetchProjects = async () => {
    if (!searchEmail && !searchProjectNumber) return;
    
    setLoading(true);
    try {
      let query = supabase.from('projects').select('*');
      
      if (searchEmail) {
        query = query.eq('client_email', searchEmail);
      }
      
      if (searchProjectNumber) {
        query = query.eq('project_number', searchProjectNumber);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProjects(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No projects found",
          description: "No projects found with the provided information.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectData = async (projectId: string) => {
    try {
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });
        
      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
      
      // Fetch resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('project_resources')
        .select('*')
        .eq('project_id', projectId);
        
      if (resourcesError) throw resourcesError;
      setResources(resourcesData || []);
      
      // Fetch time entries
      const { data: timeData, error: timeError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });
        
      if (timeError) throw timeError;
      setTimeEntries(timeData || []);
      
      // Fetch risks
      const { data: risksData, error: risksError } = await supabase
        .from('project_risks')
        .select('*')
        .eq('project_id', projectId);
        
      if (risksError) throw risksError;
      setRisks(risksData || []);
      
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project details.",
        variant: "destructive"
      });
    }
  };

  const addTask = async () => {
    if (!selectedProject || !newTask.title) return;
    
    try {
      const { error } = await supabase
        .from('project_tasks')
        .insert([{
          project_id: selectedProject.id,
          title: newTask.title,
          description: newTask.description,
          assigned_to: newTask.assigned_to,
          priority: newTask.priority,
          due_date: newTask.due_date,
          estimated_hours: newTask.estimated_hours,
          status: 'todo'
        }]);
        
      if (error) throw error;
      
      toast({
        title: "Task added",
        description: "Task has been successfully added to the project."
      });
      
      setNewTask({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        due_date: '',
        estimated_hours: 0
      });
      
      fetchProjectData(selectedProject.id);
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task.",
        variant: "destructive"
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
        .eq('id', taskId);
        
      if (error) throw error;
      
      toast({
        title: "Task updated",
        description: "Task status has been updated."
      });
      
      if (selectedProject) {
        fetchProjectData(selectedProject.id);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive"
      });
    }
  };

  const logTime = async () => {
    if (!selectedProject || !timeEntry.hours) return;
    
    try {
      const { error } = await supabase
        .from('time_entries')
        .insert([{
          project_id: selectedProject.id,
          task_id: timeEntry.task_id || null,
          user_name: 'Current User', // This would come from auth context
          hours: timeEntry.hours,
          date: new Date().toISOString().split('T')[0],
          description: timeEntry.description,
          billable: timeEntry.billable
        }]);
        
      if (error) throw error;
      
      toast({
        title: "Time logged",
        description: `${timeEntry.hours} hours logged successfully.`
      });
      
      setTimeEntry({
        task_id: '',
        hours: 0,
        description: '',
        billable: true
      });
      
      fetchProjectData(selectedProject.id);
    } catch (error) {
      console.error('Error logging time:', error);
      toast({
        title: "Error",
        description: "Failed to log time.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
      on_hold: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', icon: Flag },
      medium: { color: 'bg-blue-100 text-blue-800', icon: Flag },
      high: { color: 'bg-orange-100 text-orange-800', icon: Flag },
      critical: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color} size="sm">
        <Icon className="w-3 h-3 mr-1" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProjectHealth = (project: Project) => {
    const today = new Date();
    const endDate = new Date(project.expected_completion);
    const startDate = new Date(project.start_date);
    
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysElapsed = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const timeProgress = Math.min(100, (daysElapsed / totalDays) * 100);
    
    const budgetProgress = (project.spent_amount / project.total_budget) * 100;
    
    let health = 'good';
    if (project.completion_percentage < timeProgress - 10 || budgetProgress > project.completion_percentage + 15) {
      health = 'at_risk';
    }
    if (project.completion_percentage < timeProgress - 20 || budgetProgress > project.completion_percentage + 25) {
      health = 'critical';
    }
    
    return {
      status: health,
      timeProgress,
      budgetProgress,
      color: health === 'good' ? 'text-green-600' : health === 'at_risk' ? 'text-orange-600' : 'text-red-600'
    };
  };

  const getTasksByStatus = () => {
    return {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      review: tasks.filter(t => t.status === 'review'),
      completed: tasks.filter(t => t.status === 'completed')
    };
  };

  const getTotalHoursLogged = () => {
    return timeEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  const getBillableHours = () => {
    return timeEntries.filter(entry => entry.billable).reduce((total, entry) => total + entry.hours, 0);
  };

  return (
    <>
      <SEOHead 
        title="Project Dashboard - AKIBEKS Engineering Solutions"
        description="Comprehensive project management dashboard for AKIBEKS clients. Track progress, manage tasks, monitor resources, and collaborate with your project team."
        keywords="project dashboard, project management, task tracking, AKIBEKS, construction management, engineering projects"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Project Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive project management with advanced tracking, task management, 
              resource allocation, and team collaboration features.
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Access Your Projects
              </CardTitle>
              <CardDescription>
                Enter your email address or project number to access the advanced project dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="projectNumber">Project Number</Label>
                  <Input
                    id="projectNumber"
                    placeholder="e.g., PRJ-2024-001"
                    value={searchProjectNumber}
                    onChange={(e) => setSearchProjectNumber(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={fetchProjects} 
                disabled={loading || (!searchEmail && !searchProjectNumber)}
                className="w-full md:w-auto"
              >
                {loading ? "Searching..." : "Access Dashboard"}
              </Button>
            </CardContent>
          </Card>

          {/* Projects List */}
          {projects.length > 0 && !selectedProject && (
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">Your Projects</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              {projects.map((project) => {
                const health = calculateProjectHealth(project);
                
                return (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedProject(project);
                          fetchProjectData(project.id);
                        }}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Building className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {project.title}
                            </h3>
                            {getStatusBadge(project.status)}
                            {getPriorityBadge(project.priority)}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="space-y-1">
                              <p className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {project.location}
                              </p>
                              <p className="flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                {project.project_manager || 'Project Manager TBA'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Started: {formatDate(project.start_date)}
                              </p>
                              <p className="flex items-center">
                                <Target className="w-4 h-4 mr-2" />
                                Due: {formatDate(project.expected_completion)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="flex items-center">
                                <Activity className={`w-4 h-4 mr-2 ${health.color}`} />
                                Health: <span className={`ml-1 font-medium ${health.color}`}>
                                  {health.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </p>
                              <p className="flex items-center">
                                <Star className="w-4 h-4 mr-2" />
                                Priority: {project.priority}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right min-w-[200px]">
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">Budget Progress</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(project.spent_amount)} / {formatCurrency(project.total_budget)}
                            </p>
                            <Progress 
                              value={health.budgetProgress} 
                              className="mt-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {health.budgetProgress.toFixed(1)}% spent
                            </p>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">Project Progress</p>
                            <div className="flex items-center gap-2">
                              <Progress value={project.completion_percentage} className="flex-1" />
                              <span className="text-sm font-medium">{project.completion_percentage}%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Time: {health.timeProgress.toFixed(1)}% elapsed
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Project Dashboard */}
          {selectedProject && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setSelectedProject(null)}>
                  ← Back to Projects
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>

              {/* Project Header */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <Building className="w-6 h-6 text-blue-600" />
                        {selectedProject.title}
                        {getStatusBadge(selectedProject.status)}
                        {getPriorityBadge(selectedProject.priority)}
                      </CardTitle>
                      <CardDescription>
                        Project {selectedProject.project_number} • {selectedProject.location}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Project Health</p>
                      <p className={`text-lg font-bold ${calculateProjectHealth(selectedProject).color}`}>
                        {calculateProjectHealth(selectedProject).status.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">{selectedProject.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedProject.completion_percentage}%</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Budget Used</p>
                      <p className="text-lg font-bold text-green-600">
                        {((selectedProject.spent_amount / selectedProject.total_budget) * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Hours Logged</p>
                      <p className="text-lg font-bold text-orange-600">
                        {getTotalHoursLogged()}h
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Clipboard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Active Tasks</p>
                      <p className="text-lg font-bold text-purple-600">
                        {tasks.filter(t => t.status !== 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Dashboard Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="time">Time Tracking</TabsTrigger>
                  <TabsTrigger value="risks">Risk Management</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Activity className="w-5 h-5 mr-2" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {tasks.slice(0, 5).map((task) => (
                            <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{task.title}</p>
                                <p className="text-sm text-gray-600">
                                  Assigned to {task.assigned_to} • Due {formatDate(task.due_date)}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusBadge(task.status)}
                                  {getPriorityBadge(task.priority)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Project Timeline */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <CalendarIcon className="w-5 h-5 mr-2" />
                          Project Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div>
                              <p className="font-medium text-green-900">Project Started</p>
                              <p className="text-sm text-green-700">{formatDate(selectedProject.start_date)}</p>
                            </div>
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div>
                              <p className="font-medium text-blue-900">Current Phase</p>
                              <p className="text-sm text-blue-700">{selectedProject.status.replace('_', ' ')}</p>
                            </div>
                            <Wrench className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div>
                              <p className="font-medium text-orange-900">Expected Completion</p>
                              <p className="text-sm text-orange-700">{formatDate(selectedProject.expected_completion)}</p>
                            </div>
                            <Target className="w-6 h-6 text-orange-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Task Management</h3>
                    <div className="flex gap-2">
                      <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="list">List View</SelectItem>
                          <SelectItem value="kanban">Kanban Board</SelectItem>
                          <SelectItem value="gantt">Gantt Chart</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Task
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="taskTitle">Task Title</Label>
                              <Input
                                id="taskTitle"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder="Enter task title"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="taskDescription">Description</Label>
                              <Textarea
                                id="taskDescription"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                placeholder="Task description"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="assignedTo">Assigned To</Label>
                                <Input
                                  id="assignedTo"
                                  value={newTask.assigned_to}
                                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                                  placeholder="Team member name"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="priority">Priority</Label>
                                <Select 
                                  value={newTask.priority} 
                                  onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
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
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                  id="dueDate"
                                  type="date"
                                  value={newTask.due_date}
                                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                                <Input
                                  id="estimatedHours"
                                  type="number"
                                  value={newTask.estimated_hours}
                                  onChange={(e) => setNewTask({ ...newTask, estimated_hours: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                            
                            <Button onClick={addTask} className="w-full">
                              Add Task
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Kanban Board View */}
                  {viewMode === 'kanban' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {Object.entries(getTasksByStatus()).map(([status, statusTasks]) => (
                        <Card key={status} className="min-h-[400px]">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                              {status.replace('_', ' ')} ({statusTasks.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {statusTasks.map((task) => (
                              <Card key={task.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                                <div className="space-y-2">
                                  <p className="font-medium text-sm">{task.title}</p>
                                  <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                                  <div className="flex items-center justify-between">
                                    {getPriorityBadge(task.priority)}
                                    <p className="text-xs text-gray-500">{task.assigned_to}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    {status !== 'completed' && (
                                      <>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                        >
                                          Start
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => updateTaskStatus(task.id, 'completed')}
                                        >
                                          Complete
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* List View */}
                  {viewMode === 'list' && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {tasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium">{task.title}</h4>
                                  {getStatusBadge(task.status)}
                                  {getPriorityBadge(task.priority)}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>Assigned: {task.assigned_to}</span>
                                  <span>Due: {formatDate(task.due_date)}</span>
                                  <span>Est: {task.estimated_hours}h</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resource Management</CardTitle>
                      <CardDescription>
                        Track and manage project resources including team members, equipment, and materials
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {resources.map((resource) => (
                          <Card key={resource.id} className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{resource.name}</h4>
                                <Badge variant={resource.status === 'available' ? 'default' : 'secondary'}>
                                  {resource.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">Type: {resource.type}</p>
                              <p className="text-sm text-gray-600">
                                Cost: {formatCurrency(resource.cost_per_unit)} per unit
                              </p>
                              <p className="text-sm text-gray-600">Quantity: {resource.quantity}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Time Tracking Tab */}
                <TabsContent value="time" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Time Logging */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Log Time</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="timeTask">Task (Optional)</Label>
                          <Select value={timeEntry.task_id} onValueChange={(value) => setTimeEntry({ ...timeEntry, task_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a task" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">General Work</SelectItem>
                              {tasks.map((task) => (
                                <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="hours">Hours</Label>
                          <Input
                            id="hours"
                            type="number"
                            step="0.5"
                            value={timeEntry.hours}
                            onChange={(e) => setTimeEntry({ ...timeEntry, hours: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="timeDescription">Description</Label>
                          <Textarea
                            id="timeDescription"
                            value={timeEntry.description}
                            onChange={(e) => setTimeEntry({ ...timeEntry, description: e.target.value })}
                            placeholder="What did you work on?"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="billable"
                            checked={timeEntry.billable}
                            onChange={(e) => setTimeEntry({ ...timeEntry, billable: e.target.checked })}
                          />
                          <Label htmlFor="billable">Billable</Label>
                        </div>
                        
                        <Button onClick={logTime} className="w-full">
                          Log Time
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Time Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Time Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span>Total Hours Logged</span>
                            <span className="font-bold text-blue-600">{getTotalHoursLogged()}h</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span>Billable Hours</span>
                            <span className="font-bold text-green-600">{getBillableHours()}h</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span>Non-Billable Hours</span>
                            <span className="font-bold text-orange-600">{getTotalHoursLogged() - getBillableHours()}h</span>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <h4 className="font-medium mb-3">Recent Time Entries</h4>
                          <div className="space-y-2">
                            {timeEntries.slice(0, 5).map((entry) => (
                              <div key={entry.id} className="flex justify-between items-center text-sm">
                                <div>
                                  <p className="font-medium">{entry.description}</p>
                                  <p className="text-gray-500">{entry.user_name} • {formatDate(entry.date)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{entry.hours}h</p>
                                  <Badge variant={entry.billable ? 'default' : 'secondary'} size="sm">
                                    {entry.billable ? 'Billable' : 'Non-billable'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Risk Management Tab */}
                <TabsContent value="risks" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Management</CardTitle>
                      <CardDescription>
                        Identify, assess, and mitigate project risks
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {risks.length > 0 ? (
                        <div className="space-y-4">
                          {risks.map((risk) => (
                            <div key={risk.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{risk.title}</h4>
                                <div className="flex gap-2">
                                  <Badge variant={risk.probability === 'high' ? 'destructive' : risk.probability === 'medium' ? 'default' : 'secondary'}>
                                    {risk.probability} probability
                                  </Badge>
                                  <Badge variant={risk.impact === 'high' ? 'destructive' : risk.impact === 'medium' ? 'default' : 'secondary'}>
                                    {risk.impact} impact
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium">Mitigation Strategy:</p>
                                  <p className="text-gray-600">{risk.mitigation_strategy}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Owner: {risk.owner}</p>
                                  <Badge variant={risk.status === 'resolved' ? 'default' : 'secondary'}>
                                    {risk.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No risks identified yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <PieChart className="w-5 h-5 mr-2" />
                          Task Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(getTasksByStatus()).map(([status, statusTasks]) => (
                            <div key={status} className="flex items-center justify-between">
                              <span className="capitalize">{status.replace('_', ' ')}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${(statusTasks.length / tasks.length) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{statusTasks.length}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart3 className="w-5 h-5 mr-2" />
                          Budget Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Spent</span>
                              <span className="text-sm font-medium">{formatCurrency(selectedProject.spent_amount)}</span>
                            </div>
                            <Progress value={(selectedProject.spent_amount / selectedProject.total_budget) * 100} />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Remaining</span>
                              <span className="text-sm font-medium">
                                {formatCurrency(selectedProject.total_budget - selectedProject.spent_amount)}
                              </span>
                            </div>
                            <Progress value={((selectedProject.total_budget - selectedProject.spent_amount) / selectedProject.total_budget) * 100} />
                          </div>
                          
                          <div className="pt-4 border-t">
                            <div className="flex justify-between">
                              <span className="font-medium">Total Budget</span>
                              <span className="font-bold">{formatCurrency(selectedProject.total_budget)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Help Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Project Support</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Get help with project management and dashboard features.
                  </p>
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </div>
                
                <div className="text-center">
                  <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Emergency Contact</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    For urgent project matters and emergency situations.
                  </p>
                  <Button variant="outline" size="sm">
                    Emergency Line
                  </Button>
                </div>
                
                <div className="text-center">
                  <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Access user guides and project management resources.
                  </p>
                  <Button variant="outline" size="sm">
                    View Docs
                  </Button>
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

export default ProjectDashboard;