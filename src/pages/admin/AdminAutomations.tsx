import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  Bot, 
  Mail, 
  Clock, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import AutomationService, { Automation, AutomationAction, AutomationTrigger } from '@/lib/automation-service';

const AdminAutomations = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [automationLogs, setAutomationLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [automationsData, templatesData] = await Promise.all([
        AutomationService.getAutomations(),
        AutomationService.getEmailTemplates()
      ]);
      
      setAutomations(automationsData);
      setEmailTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load automations');
    } finally {
      setIsLoading(false);
    }
  };

  // Automation CRUD operations
  const handleSaveAutomation = async (automation: Automation) => {
    try {
      if (automation.id) {
        await AutomationService.updateAutomation(automation.id, automation, 'current-user-id');
      } else {
        await AutomationService.createAutomation(automation, 'current-user-id');
      }
      
      await loadData();
      setIsDialogOpen(false);
      setEditingAutomation(null);
      toast.success('Automation saved successfully');
    } catch (error) {
      console.error('Failed to save automation:', error);
      toast.error('Failed to save automation');
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;
    
    try {
      await AutomationService.deleteAutomation(id, 'current-user-id');
      await loadData();
      toast.success('Automation deleted successfully');
    } catch (error) {
      console.error('Failed to delete automation:', error);
      toast.error('Failed to delete automation');
    }
  };

  // Email template CRUD operations
  const handleSaveEmailTemplate = async (template: any) => {
    try {
      if (template.id) {
        await AutomationService.updateEmailTemplate(template.id, template, 'current-user-id');
      } else {
        await AutomationService.createEmailTemplate(template, 'current-user-id');
      }
      
      await loadData();
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
      toast.success('Email template saved successfully');
    } catch (error) {
      console.error('Failed to save email template:', error);
      toast.error('Failed to save email template');
    }
  };

  const handleDeleteEmailTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email template?')) return;
    
    try {
      await AutomationService.deleteEmailTemplate(id, 'current-user-id');
      await loadData();
      toast.success('Email template deleted successfully');
    } catch (error) {
      console.error('Failed to delete email template:', error);
      toast.error('Failed to delete email template');
    }
  };

  // Run scheduled checks manually
  const handleRunScheduledChecks = async () => {
    try {
      await AutomationService.runScheduledChecks();
      toast.success('Scheduled checks completed');
    } catch (error) {
      console.error('Failed to run scheduled checks:', error);
      toast.error('Failed to run scheduled checks');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automations</h1>
          <p className="text-gray-600">Manage workflow automations and email templates</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRunScheduledChecks} variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Run Checks
          </Button>
          <Button onClick={() => {
            setEditingAutomation({
              name: '',
              description: '',
              trigger_type: 'project_created',
              trigger_conditions: { type: 'project_created', conditions: {} },
              actions: [],
              is_active: true
            });
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>
      </div>

      <Tabs defaultValue="automations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="automations" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Execution Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automations">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Automations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automations.map((automation) => (
                    <TableRow key={automation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{automation.name}</div>
                          <div className="text-sm text-gray-500">{automation.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {automation.trigger_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {automation.actions.slice(0, 2).map((action, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {action.type.replace('_', ' ')}
                            </Badge>
                          ))}
                          {automation.actions.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{automation.actions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={automation.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {automation.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(automation.created_at || '').toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAutomation(automation);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAutomation(automation.id!)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Email Templates</CardTitle>
              <Button onClick={() => {
                setEditingTemplate({
                  name: '',
                  subject: '',
                  body: '',
                  template_type: 'notification',
                  variables: [],
                  is_active: true
                });
                setIsTemplateDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.template_type}</Badge>
                      </TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        <Badge className={template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTemplate(template);
                              setIsTemplateDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEmailTemplate(template.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Automation Execution Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Automation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Execution Time</TableHead>
                    <TableHead>Executed At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automationLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.automation_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <Badge className={log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {log.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{log.execution_time ? `${log.execution_time}ms` : '-'}</TableCell>
                      <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Automation Dialog */}
      <AutomationDialog
        automation={editingAutomation}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingAutomation(null);
        }}
        onSave={handleSaveAutomation}
      />

      {/* Email Template Dialog */}
      <EmailTemplateDialog
        template={editingTemplate}
        isOpen={isTemplateDialogOpen}
        onClose={() => {
          setIsTemplateDialogOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveEmailTemplate}
      />
    </div>
  );
};

// Automation Dialog Component
const AutomationDialog: React.FC<{
  automation: Automation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (automation: Automation) => void;
}> = ({ automation, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Automation>({
    name: '',
    description: '',
    trigger_type: 'project_created',
    trigger_conditions: { type: 'project_created', conditions: {} },
    actions: [],
    is_active: true
  });

  useEffect(() => {
    if (automation) {
      setFormData(automation);
    }
  }, [automation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [
        ...formData.actions,
        {
          type: 'send_email',
          parameters: {}
        }
      ]
    });
  };

  const updateAction = (index: number, action: AutomationAction) => {
    const updatedActions = [...formData.actions];
    updatedActions[index] = action;
    setFormData({
      ...formData,
      actions: updatedActions
    });
  };

  const removeAction = (index: number) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {automation?.id ? 'Edit Automation' : 'Create Automation'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="trigger_type">Trigger Type</Label>
              <Select value={formData.trigger_type} onValueChange={(value) => 
                setFormData({ ...formData, trigger_type: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project_created">Project Created</SelectItem>
                  <SelectItem value="task_completed">Task Completed</SelectItem>
                  <SelectItem value="invoice_overdue">Invoice Overdue</SelectItem>
                  <SelectItem value="deadline_approaching">Deadline Approaching</SelectItem>
                  <SelectItem value="status_changed">Status Changed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Actions</Label>
              <Button type="button" onClick={addAction} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </div>
            {formData.actions.map((action, index) => (
              <div key={index} className="border rounded p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <Select
                    value={action.type}
                    onValueChange={(value) => updateAction(index, { ...action, type: value as any })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_email">Send Email</SelectItem>
                      <SelectItem value="create_notification">Create Notification</SelectItem>
                      <SelectItem value="update_status">Update Status</SelectItem>
                      <SelectItem value="assign_user">Assign User</SelectItem>
                      <SelectItem value="create_task">Create Task</SelectItem>
                      <SelectItem value="send_webhook">Send Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={() => removeAction(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {/* Action-specific parameters would go here */}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Email Template Dialog Component
const EmailTemplateDialog: React.FC<{
  template: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: any) => void;
}> = ({ template, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    template_type: 'notification',
    variables: [],
    is_active: true
  });

  useEffect(() => {
    if (template) {
      setFormData(template);
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {template?.id ? 'Edit Email Template' : 'Create Email Template'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template_name">Name</Label>
              <Input
                id="template_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="template_type">Type</Label>
              <Select value={formData.template_type} onValueChange={(value) => 
                setFormData({ ...formData, template_type: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="project_update">Project Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="template_subject">Subject</Label>
            <Input
              id="template_subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Use {{variable}} for dynamic content"
              required
            />
          </div>

          <div>
            <Label htmlFor="template_body">Body</Label>
            <Textarea
              id="template_body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Use {{variable}} for dynamic content"
              rows={8}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="template_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="template_active">Active</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAutomations;