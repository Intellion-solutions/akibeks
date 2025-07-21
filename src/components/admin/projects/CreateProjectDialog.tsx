
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, User, Building2, Plus, X } from "lucide-react";
import { supabase } from "@/lib/db-client";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  full_name: string;
  company_name?: string;
}

interface User {
  id: string;
  full_name: string;
  role: string;
}

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  users: User[];
  onProjectCreated: () => void;
}

const CreateProjectDialog = ({ open, onOpenChange, clients, users, onProjectCreated }: CreateProjectDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    location: "",
    clientId: "",
    projectManagerId: "",
    status: "planning",
    startDate: "",
    endDate: "",
    budget: "",
    milestones: [{ title: "", description: "", targetDate: "" }],
    features: [""],
    tags: [""]
  });

  const handleInputChange = (field: string, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const addMilestone = () => {
    setProjectData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: "", description: "", targetDate: "" }]
    }));
  };

  const removeMilestone = (index: number) => {
    if (projectData.milestones.length > 1) {
      setProjectData(prev => ({
        ...prev,
        milestones: prev.milestones.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    setProjectData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const addFeature = () => {
    setProjectData(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }));
  };

  const removeFeature = (index: number) => {
    if (projectData.features.length > 1) {
      setProjectData(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }));
    }
  };

  const updateFeature = (index: number, value: string) => {
    setProjectData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!projectData.title || !projectData.clientId) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          location: projectData.location,
          client_id: projectData.clientId,
          project_manager_id: projectData.projectManagerId || null,
          status: projectData.status,
          start_date: projectData.startDate || null,
          end_date: projectData.endDate || null,
          budget: projectData.budget ? parseFloat(projectData.budget) : null
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create milestones
      if (projectData.milestones.some(m => m.title)) {
        const milestonesToInsert = projectData.milestones
          .filter(m => m.title.trim())
          .map(milestone => ({
            project_id: project.id,
            title: milestone.title,
            description: milestone.description,
            target_date: milestone.targetDate || null
          }));

        if (milestonesToInsert.length > 0) {
          const { error: milestoneError } = await supabase
            .from('project_milestones')
            .insert(milestonesToInsert);

          if (milestoneError) throw milestoneError;
        }
      }

      toast({
        title: "Success",
        description: "Project created successfully!",
      });

      onProjectCreated();
      onOpenChange(false);
      
      // Reset form
      setProjectData({
        title: "",
        description: "",
        location: "",
        clientId: "",
        projectManagerId: "",
        status: "planning",
        startDate: "",
        endDate: "",
        budget: "",
        milestones: [{ title: "", description: "", targetDate: "" }],
        features: [""],
        tags: [""]
      });
      setCurrentStep(1);

    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Project Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={projectData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter project title"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={projectData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Project description"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={projectData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Project location"
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={projectData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Assignment & Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client *</Label>
              <Select value={projectData.clientId} onValueChange={(value) => handleInputChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name || client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="projectManager">Project Manager</Label>
              <Select value={projectData.projectManagerId} onValueChange={(value) => handleInputChange('projectManagerId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={projectData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={projectData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                value={projectData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectData.milestones.map((milestone, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">Milestone {index + 1}</h4>
                  {projectData.milestones.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                      placeholder="Milestone title"
                    />
                  </div>
                  
                  <div>
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={milestone.targetDate}
                      onChange={(e) => updateMilestone(index, 'targetDate', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label>Description</Label>
                  <Textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    placeholder="Milestone description"
                    rows={2}
                  />
                </div>
              </div>
            ))}
            
            <Button type="button" onClick={addMilestone} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep 
                    ? 'bg-blue-600 text-white' 
                    : step < currentStep 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Basic Info</span>
            <span>Assignment</span>
            <span>Milestones</span>
          </div>
        </DialogHeader>

        <div className="py-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              
              {currentStep < 3 ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Creating..." : "Create Project"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
