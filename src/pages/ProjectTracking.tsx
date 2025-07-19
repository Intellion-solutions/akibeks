import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Building
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
  start_date: string;
  expected_completion: string;
  completion_percentage: number;
  created_at: string;
  project_manager?: string;
}

interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  target_date: string;
  completion_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  percentage: number;
}

interface Update {
  id: string;
  project_id: string;
  title: string;
  description: string;
  update_type: 'progress' | 'milestone' | 'issue' | 'completion';
  created_at: string;
  images?: string[];
}

const ProjectTracking = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchProjectNumber, setSearchProjectNumber] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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

  const fetchProjectDetails = async (projectId: string) => {
    try {
      // Fetch milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('target_date', { ascending: true });
        
      if (milestonesError) throw milestonesError;
      setMilestones(milestonesData || []);
      
      // Fetch updates
      const { data: updatesData, error: updatesError } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (updatesError) throw updatesError;
      setUpdates(updatesData || []);
      
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project details.",
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

  const getMilestoneStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: Wrench },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color} size="sm">
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
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

  const getTimeRemaining = (dateString: string) => {
    const targetDate = new Date(dateString);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  return (
    <>
      <SEOHead 
        title="Project Tracking - AKIBEKS Engineering Solutions"
        description="Track the progress of your construction and engineering projects with AKIBEKS. View milestones, updates, and project status in real-time."
        keywords="project tracking, construction progress, AKIBEKS, project management, engineering projects"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Project Tracking
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Track the progress of your construction and engineering projects in real-time. 
              View milestones, updates, and communicate with our project team.
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Find Your Projects
              </CardTitle>
              <CardDescription>
                Enter your email address or project number to access your projects
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
                {loading ? "Searching..." : "Find Projects"}
              </Button>
            </CardContent>
          </Card>

          {/* Projects List */}
          {projects.length > 0 && !selectedProject && (
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Your Projects</h2>
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedProject(project);
                        fetchProjectDetails(project.id);
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
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
                              <Calendar className="w-4 h-4 mr-2" />
                              Expected: {formatDate(project.expected_completion)}
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
                            value={(project.spent_amount / project.total_budget) * 100} 
                            className="mt-2"
                          />
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">Project Progress</p>
                          <div className="flex items-center gap-2">
                            <Progress value={project.completion_percentage} className="flex-1" />
                            <span className="text-sm font-medium">{project.completion_percentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Project Details */}
          {selectedProject && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setSelectedProject(null)}>
                  ← Back to Projects
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <Building className="w-6 h-6 text-blue-600" />
                        {selectedProject.title}
                        {getStatusBadge(selectedProject.status)}
                      </CardTitle>
                      <CardDescription>
                        Project {selectedProject.project_number} • {selectedProject.location}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">{selectedProject.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Project Progress</p>
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
                      <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Time Remaining</p>
                      <p className="text-lg font-bold text-orange-600">
                        {getTimeRemaining(selectedProject.expected_completion)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="milestones" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>
                
                <TabsContent value="milestones" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Milestones</CardTitle>
                      <CardDescription>
                        Track major milestones and their completion status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {milestones.length > 0 ? (
                        <div className="space-y-4">
                          {milestones.map((milestone) => (
                            <div key={milestone.id} className="border-l-4 border-blue-500 pl-4 py-3">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                                {getMilestoneStatusBadge(milestone.status)}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Target: {formatDate(milestone.target_date)}</span>
                                {milestone.completion_date && (
                                  <span>Completed: {formatDate(milestone.completion_date)}</span>
                                )}
                                <div className="flex items-center gap-2">
                                  <Progress value={milestone.percentage} className="w-20" />
                                  <span>{milestone.percentage}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No milestones available yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="updates" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Updates</CardTitle>
                      <CardDescription>
                        Latest updates and progress reports from the project team
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {updates.length > 0 ? (
                        <div className="space-y-6">
                          {updates.map((update) => (
                            <div key={update.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                              <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                  {update.update_type === 'progress' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                                  {update.update_type === 'milestone' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                  {update.update_type === 'issue' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                                  {update.update_type === 'completion' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900">{update.title}</h4>
                                    <span className="text-sm text-gray-500">{formatDate(update.created_at)}</span>
                                  </div>
                                  <p className="text-gray-700">{update.description}</p>
                                  {update.images && update.images.length > 0 && (
                                    <div className="mt-3">
                                      <div className="flex gap-2">
                                        {update.images.map((image, index) => (
                                          <div key={index} className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <Camera className="w-6 h-6 text-gray-500" />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No updates available yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Team Contact</CardTitle>
                      <CardDescription>
                        Get in touch with your project team
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Project Manager</h4>
                            <p className="text-gray-600">{selectedProject.project_manager || 'To be assigned'}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Contact Methods</h4>
                            <div className="space-y-2">
                              <Button variant="outline" className="w-full justify-start">
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </Button>
                              <Button variant="outline" className="w-full justify-start">
                                <Phone className="w-4 h-4 mr-2" />
                                Schedule Call
                              </Button>
                              <Button variant="outline" className="w-full justify-start">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Live Chat
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Quick Message</h4>
                          <div className="space-y-3">
                            <textarea 
                              className="w-full p-3 border border-gray-300 rounded-md resize-none"
                              rows={4}
                              placeholder="Type your message here..."
                            />
                            <Button className="w-full">
                              Send Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                    Get help with project tracking and updates.
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
                    Access project documents and reports.
                  </p>
                  <Button variant="outline" size="sm">
                    View Documents
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

export default ProjectTracking;