import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Shield, 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  Camera,
  Thermometer,
  Zap,
  Wind,
  Droplets,
  Gauge
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEO/SEOHead";
import { constructionTracker, ConstructionProject } from '@/lib/construction-tracker';

interface ConstructionStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalBudget: number;
  spentBudget: number;
  averageCompletion: number;
  safetyScore: number;
  qualityScore: number;
  onTimeProjects: number;
  overBudgetProjects: number;
  criticalIssues: number;
}

interface ProjectFilters {
  status?: string;
  priority?: string;
  managerId?: string;
  clientId?: string;
  search?: string;
}

interface IoTReading {
  id: string;
  projectId: string;
  sensorType: 'temperature' | 'humidity' | 'air_quality' | 'noise' | 'vibration' | 'dust';
  value: number;
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  location: string;
}

const AdminConstruction: React.FC = () => {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [stats, setStats] = useState<ConstructionStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    totalBudget: 0,
    spentBudget: 0,
    averageCompletion: 0,
    safetyScore: 95,
    qualityScore: 92,
    onTimeProjects: 0,
    overBudgetProjects: 0,
    criticalIssues: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [selectedProject, setSelectedProject] = useState<ConstructionProject | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [iotReadings, setIotReadings] = useState<IoTReading[]>([]);
  const [newProject, setNewProject] = useState<Partial<ConstructionProject>>({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    location: {
      address: '',
      coordinates: { lat: 0, lng: 0 },
      area: 0,
      zoning: ''
    },
    timeline: {
      plannedStart: '',
      plannedEnd: '',
      milestones: []
    },
    budget: {
      totalBudget: 0,
      spentAmount: 0,
      remainingBudget: 0,
      categories: []
    }
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    fetchIoTData();
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchIoTData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectsData = await constructionTracker.getProjects(filters);
      setProjects(projectsData);
      calculateStats(projectsData);
    } catch (error) {
      console.error('Failed to fetch construction data:', error);
      toast({
        title: "Error",
        description: "Failed to load construction data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchIoTData = async () => {
    try {
      // Mock IoT data - in production, this would come from real sensors
      const mockReadings: IoTReading[] = [
        {
          id: '1',
          projectId: 'proj1',
          sensorType: 'temperature',
          value: 28.5,
          unit: '°C',
          timestamp: new Date().toISOString(),
          status: 'normal',
          location: 'Site A - Zone 1'
        },
        {
          id: '2',
          projectId: 'proj1',
          sensorType: 'air_quality',
          value: 85,
          unit: 'AQI',
          timestamp: new Date().toISOString(),
          status: 'warning',
          location: 'Site A - Zone 2'
        },
        {
          id: '3',
          projectId: 'proj2',
          sensorType: 'noise',
          value: 75,
          unit: 'dB',
          timestamp: new Date().toISOString(),
          status: 'normal',
          location: 'Site B - Main Area'
        }
      ];
      setIotReadings(mockReadings);
    } catch (error) {
      console.error('Failed to fetch IoT data:', error);
    }
  };

  const calculateStats = (projectList: ConstructionProject[]) => {
    const totalProjects = projectList.length;
    const activeProjects = projectList.filter(p => ['construction', 'design', 'permits'].includes(p.status)).length;
    const completedProjects = projectList.filter(p => p.status === 'completed').length;
    const onHoldProjects = projectList.filter(p => p.status === 'on-hold').length;
    const totalBudget = projectList.reduce((sum, p) => sum + p.budget.totalBudget, 0);
    const spentBudget = projectList.reduce((sum, p) => sum + p.budget.spentAmount, 0);
    const averageCompletion = totalProjects > 0 ? projectList.reduce((sum, p) => sum + p.progress.overallPercentage, 0) / totalProjects : 0;
    const onTimeProjects = projectList.filter(p => {
      const now = new Date();
      const plannedEnd = new Date(p.timeline.plannedEnd);
      return p.status === 'completed' || now <= plannedEnd;
    }).length;
    const overBudgetProjects = projectList.filter(p => p.budget.spentAmount > p.budget.totalBudget * 0.9).length;

    setStats({
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalBudget,
      spentBudget,
      averageCompletion,
      safetyScore: 95,
      qualityScore: 92,
      onTimeProjects,
      overBudgetProjects,
      criticalIssues: iotReadings.filter(r => r.status === 'critical').length,
    });
  };

  const handleCreateProject = async () => {
    try {
      if (!newProject.name || !newProject.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const projectToCreate = {
        ...newProject,
        clientId: newProject.clientId || '',
        managerId: newProject.managerId || '',
        team: {
          projectManager: '',
          engineers: [],
          contractors: [],
          supervisors: [],
          workers: []
        },
        progress: {
          overallPercentage: 0,
          phases: [],
          lastUpdated: new Date().toISOString()
        },
        quality: {
          inspections: [],
          issues: [],
          certifications: []
        },
        safety: {
          incidents: [],
          trainings: [],
          equipmentChecks: [],
          complianceStatus: {
            permits: { total: 0, approved: 0, pending: 0, expired: 0 },
            inspections: { scheduled: 0, passed: 0, failed: 0, overdue: 0 },
            certifications: { active: 0, expiring: 0, expired: 0 },
            safetyScore: 100,
            environmentalCompliance: true
          }
        },
        resources: {
          materials: [],
          equipment: [],
          inventory: []
        },
        documents: {
          permits: [],
          drawings: [],
          contracts: [],
          reports: []
        },
        iot: {
          sensors: [],
          weatherData: [],
          environmentalData: []
        }
      } as ConstructionProject;

      const created = await constructionTracker.createProject(projectToCreate);
      if (created) {
        setProjects([...projects, created]);
        setIsCreateDialogOpen(false);
        setNewProject({
          name: '',
          description: '',
          status: 'planning',
          priority: 'medium',
          location: {
            address: '',
            coordinates: { lat: 0, lng: 0 },
            area: 0,
            zoning: ''
          },
          timeline: {
            plannedStart: '',
            plannedEnd: '',
            milestones: []
          },
          budget: {
            totalBudget: 0,
            spentAmount: 0,
            remainingBudget: 0,
            categories: []
          }
        });
        toast({
          title: "Success",
          description: "Construction project created successfully",
        });
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'planning': 'bg-blue-100 text-blue-800',
      'design': 'bg-purple-100 text-purple-800',
      'permits': 'bg-yellow-100 text-yellow-800',
      'construction': 'bg-orange-100 text-orange-800',
      'inspection': 'bg-indigo-100 text-indigo-800',
      'completed': 'bg-green-100 text-green-800',
      'on-hold': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getIoTStatusColor = (status: string) => {
    const colors = {
      'normal': 'text-green-600',
      'warning': 'text-yellow-600',
      'critical': 'text-red-600',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getSensorIcon = (type: string) => {
    const icons = {
      'temperature': Thermometer,
      'humidity': Droplets,
      'air_quality': Wind,
      'noise': Activity,
      'vibration': Gauge,
      'dust': Wind,
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProjects = projects.filter(project => {
    if (filters.status && project.status !== filters.status) return false;
    if (filters.priority && project.priority !== filters.priority) return false;
    if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading construction data...</span>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Construction Management - Admin Panel" 
        description="Advanced construction project management with IoT monitoring, safety tracking, and automated progress reporting." 
        noindex={true} 
        nofollow={true} 
      />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Construction Management</h1>
            <p className="text-gray-600 mt-2">Monitor projects, track progress, and manage resources</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => fetchData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.activeProjects}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedProjects}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalBudget)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Safety Score</p>
                  <p className="text-2xl font-bold text-green-600">{stats.safetyScore}%</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(stats.averageCompletion)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Projects Overview</TabsTrigger>
            <TabsTrigger value="iot">IoT Monitoring</TabsTrigger>
            <TabsTrigger value="safety">Safety & Quality</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filter Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Input
                      placeholder="Search projects..."
                      value={filters.search || ''}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <Select value={filters.status || ''} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="permits">Permits</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.priority || ''} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setFilters({})}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Projects Table */}
            <Card>
              <CardHeader>
                <CardTitle>Construction Projects</CardTitle>
                <CardDescription>
                  {filteredProjects.length} projects found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
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
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-gray-500">{project.description}</div>
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {project.location.address}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-full">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{project.progress.overallPercentage}%</span>
                            </div>
                            <Progress value={project.progress.overallPercentage} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{formatCurrency(project.budget.totalBudget)}</div>
                            <div className="text-gray-500">
                              Spent: {formatCurrency(project.budget.spentAmount)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(project.timeline.plannedStart).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">
                              to {new Date(project.timeline.plannedEnd).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iot" className="space-y-4">
            {/* IoT Monitoring Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Real-time IoT Monitoring
                </CardTitle>
                <CardDescription>
                  Live sensor data from construction sites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {iotReadings.map((reading) => {
                    const SensorIcon = getSensorIcon(reading.sensorType);
                    return (
                      <Card key={reading.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <SensorIcon className="h-5 w-5 text-blue-600 mr-2" />
                              <span className="font-medium capitalize">
                                {reading.sensorType.replace('_', ' ')}
                              </span>
                            </div>
                            <Badge className={`${getIoTStatusColor(reading.status)} bg-transparent border`}>
                              {reading.status}
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {reading.value} {reading.unit}
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>{reading.location}</div>
                            <div>{new Date(reading.timestamp).toLocaleString()}</div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-4">
            {/* Safety & Quality Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Safety Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Safety Score</span>
                    <span className="text-2xl font-bold text-green-600">{stats.safetyScore}%</span>
                  </div>
                  <Progress value={stats.safetyScore} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">Incidents This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">45</div>
                      <div className="text-sm text-gray-600">Safety Trainings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Quality Score</span>
                    <span className="text-2xl font-bold text-blue-600">{stats.qualityScore}%</span>
                  </div>
                  <Progress value={stats.qualityScore} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">23</div>
                      <div className="text-sm text-gray-600">Passed Inspections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">2</div>
                      <div className="text-sm text-gray-600">Pending Reviews</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>On-time Projects</span>
                    <span className="font-bold text-green-600">{stats.onTimeProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Over Budget</span>
                    <span className="font-bold text-red-600">{stats.overBudgetProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Budget Utilization</span>
                    <span className="font-bold text-blue-600">
                      {Math.round((stats.spentBudget / stats.totalBudget) * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Project Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        Planning
                      </span>
                      <span className="font-medium">
                        {projects.filter(p => p.status === 'planning').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                        Construction
                      </span>
                      <span className="font-medium">
                        {projects.filter(p => p.status === 'construction').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        Completed
                      </span>
                      <span className="font-medium">
                        {projects.filter(p => p.status === 'completed').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {iotReadings.filter(r => r.status === 'critical').length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        No critical issues
                      </div>
                    ) : (
                      iotReadings
                        .filter(r => r.status === 'critical')
                        .map(reading => (
                          <div key={reading.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <span className="text-sm font-medium text-red-800">
                              {reading.sensorType} Alert
                            </span>
                            <span className="text-sm text-red-600">
                              {reading.location}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Project Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Construction Project</DialogTitle>
              <DialogDescription>
                Add a new construction project to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Project Name *</label>
                  <Input
                    value={newProject.name || ''}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={newProject.status || 'planning'} 
                    onValueChange={(value) => setNewProject({ ...newProject, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="permits">Permits</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={newProject.priority || 'medium'} 
                    onValueChange={(value) => setNewProject({ ...newProject, priority: value as any })}
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
                <div>
                  <label className="text-sm font-medium">Budget (KES)</label>
                  <Input
                    type="number"
                    value={newProject.budget?.totalBudget || ''}
                    onChange={(e) => setNewProject({ 
                      ...newProject, 
                      budget: { 
                        ...newProject.budget!, 
                        totalBudget: Number(e.target.value),
                        remainingBudget: Number(e.target.value)
                      } 
                    })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={newProject.location?.address || ''}
                  onChange={(e) => setNewProject({ 
                    ...newProject, 
                    location: { 
                      ...newProject.location!, 
                      address: e.target.value 
                    } 
                  })}
                  placeholder="Enter project location"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={newProject.timeline?.plannedStart || ''}
                    onChange={(e) => setNewProject({ 
                      ...newProject, 
                      timeline: { 
                        ...newProject.timeline!, 
                        plannedStart: e.target.value 
                      } 
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={newProject.timeline?.plannedEnd || ''}
                    onChange={(e) => setNewProject({ 
                      ...newProject, 
                      timeline: { 
                        ...newProject.timeline!, 
                        plannedEnd: e.target.value 
                      } 
                    })}
                  />
                </div>
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

        {/* View Project Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedProject?.name}</DialogTitle>
              <DialogDescription>
                Detailed project information and progress tracking
              </DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Status</p>
                          <Badge className={getStatusColor(selectedProject.status)}>
                            {selectedProject.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Progress</p>
                          <p className="text-2xl font-bold">{selectedProject.progress.overallPercentage}%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Budget</p>
                          <p className="text-lg font-bold">{formatCurrency(selectedProject.budget.totalBudget)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Project Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Description:</strong> {selectedProject.description}</div>
                      <div><strong>Location:</strong> {selectedProject.location.address}</div>
                      <div><strong>Priority:</strong> 
                        <Badge className={`ml-2 ${getPriorityColor(selectedProject.priority)}`}>
                          {selectedProject.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Start:</strong> {new Date(selectedProject.timeline.plannedStart).toLocaleDateString()}</div>
                      <div><strong>End:</strong> {new Date(selectedProject.timeline.plannedEnd).toLocaleDateString()}</div>
                      <div><strong>Duration:</strong> {Math.ceil((new Date(selectedProject.timeline.plannedEnd).getTime() - new Date(selectedProject.timeline.plannedStart).getTime()) / (1000 * 60 * 60 * 24))} days</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminConstruction;