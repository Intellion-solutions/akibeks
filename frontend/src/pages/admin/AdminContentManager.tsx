import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  Upload,
  Copy,
  Globe,
  Star,
  Image as ImageIcon,
  FileText,
  Settings,
  Users,
  Briefcase,
  Monitor,
  Smartphone,
  Code,
  Palette,
  Search,
  Filter,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import ContentManagementService, { ContentSection, ServiceContent, ProjectShowcase } from '../../lib/content-management';

export const AdminContentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pages');
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [services, setServices] = useState<ServiceContent[]>([]);
  const [projects, setProjects] = useState<ProjectShowcase[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentSection | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceContent | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectShowcase | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    page: '',
    published: '',
    search: ''
  });

  const pages = [
    { id: 'home', name: 'Home Page', sections: ['hero', 'features', 'testimonials', 'cta'] },
    { id: 'about', name: 'About Page', sections: ['story', 'team', 'values', 'mission'] },
    { id: 'services', name: 'Services Page', sections: ['overview', 'features', 'pricing'] },
    { id: 'projects', name: 'Projects Page', sections: ['showcase', 'case-studies', 'clients'] },
    { id: 'contact', name: 'Contact Page', sections: ['info', 'form', 'location'] },
    { id: 'company', name: 'Company Page', sections: ['history', 'leadership', 'awards'] },
    { id: 'partners', name: 'Partners Page', sections: ['overview', 'tiers', 'application'] }
  ];

  const serviceCategories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Consulting',
    'Digital Marketing',
    'DevOps',
    'Cloud Services',
    'Data Analytics'
  ];

  const projectTypes = [
    'Web Application',
    'Mobile App',
    'E-commerce',
    'Corporate Website',
    'API Development',
    'Cloud Migration',
    'Data Platform',
    'Custom Software'
  ];

  useEffect(() => {
    loadContent();
    loadServices();
    loadProjects();
  }, []);

  const loadContent = async () => {
    try {
      // This would call the ContentManagementService
      // const sections = await ContentManagementService.getContentByPage('all', false);
      // setContentSections(sections);
    } catch (error) {
      toast.error('Failed to load content');
    }
  };

  const loadServices = async () => {
    try {
      // const servicesList = await ContentManagementService.getServices(false);
      // setServices(servicesList);
    } catch (error) {
      toast.error('Failed to load services');
    }
  };

  const loadProjects = async () => {
    try {
      // const projectsList = await ContentManagementService.getProjectShowcases(false);
      // setProjects(projectsList);
    } catch (error) {
      toast.error('Failed to load projects');
    }
  };

  const handleSaveContent = async (content: ContentSection) => {
    try {
      if (content.id) {
        // await ContentManagementService.updateContent(content.id, content, 'current_user');
        toast.success('Content updated successfully');
      } else {
        // await ContentManagementService.createContent(content, 'current_user');
        toast.success('Content created successfully');
      }
      setIsEditing(false);
      setSelectedContent(null);
      loadContent();
    } catch (error) {
      toast.error('Failed to save content');
    }
  };

  const handleSaveService = async (service: ServiceContent) => {
    try {
      if (service.id) {
        // await ContentManagementService.updateService(service.id, service, 'current_user');
        toast.success('Service updated successfully');
      } else {
        // await ContentManagementService.createService(service, 'current_user');
        toast.success('Service created successfully');
      }
      setIsEditing(false);
      setSelectedService(null);
      loadServices();
    } catch (error) {
      toast.error('Failed to save service');
    }
  };

  const handleSaveProject = async (project: ProjectShowcase) => {
    try {
      if (project.id) {
        // await ContentManagementService.updateProjectShowcase(project.id, project, 'current_user');
        toast.success('Project updated successfully');
      } else {
        // await ContentManagementService.createProjectShowcase(project, 'current_user');
        toast.success('Project created successfully');
      }
      setIsEditing(false);
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const ContentEditor: React.FC<{ content: ContentSection; onSave: (content: ContentSection) => void }> = ({
    content,
    onSave
  }) => {
    const [editingContent, setEditingContent] = useState(content);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Page</Label>
            <Select value={editingContent.page} onValueChange={(value) => 
              setEditingContent(prev => ({ ...prev, page: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                {pages.map(page => (
                  <SelectItem key={page.id} value={page.id}>{page.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Section</Label>
            <Input
              value={editingContent.section}
              onChange={(e) => setEditingContent(prev => ({ ...prev, section: e.target.value }))}
              placeholder="Section name"
            />
          </div>
        </div>

        <div>
          <Label>Title</Label>
          <Input
            value={editingContent.title}
            onChange={(e) => setEditingContent(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Section title"
          />
        </div>

        <div>
          <Label>Content</Label>
          <Textarea
            value={typeof editingContent.content === 'string' ? editingContent.content : JSON.stringify(editingContent.content, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setEditingContent(prev => ({ ...prev, content: parsed }));
              } catch {
                setEditingContent(prev => ({ ...prev, content: e.target.value }));
              }
            }}
            rows={8}
            placeholder="Content (JSON or text)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={editingContent.sort_order}
              onChange={(e) => setEditingContent(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingContent.is_published}
              onCheckedChange={(checked) => setEditingContent(prev => ({ ...prev, is_published: checked }))}
            />
            <Label>Published</Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSave(editingContent)}>
            <Save className="h-4 w-4 mr-2" />
            Save Content
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const ServiceEditor: React.FC<{ service: ServiceContent; onSave: (service: ServiceContent) => void }> = ({
    service,
    onSave
  }) => {
    const [editingService, setEditingService] = useState(service);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input
              value={editingService.title}
              onChange={(e) => setEditingService(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Service title"
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={editingService.category} onValueChange={(value) => 
              setEditingService(prev => ({ ...prev, category: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={editingService.description}
            onChange={(e) => setEditingService(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            placeholder="Service description"
          />
        </div>

        <div>
          <Label>Icon</Label>
          <Input
            value={editingService.icon}
            onChange={(e) => setEditingService(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="Icon name or URL"
          />
        </div>

        <div>
          <Label>Features (one per line)</Label>
          <Textarea
            value={editingService.features.join('\n')}
            onChange={(e) => setEditingService(prev => ({ 
              ...prev, 
              features: e.target.value.split('\n').filter(f => f.trim()) 
            }))}
            rows={6}
            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
          />
        </div>

        <div>
          <Label>Pricing</Label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm">Basic</Label>
              <Input
                type="number"
                value={editingService.pricing?.basic || ''}
                onChange={(e) => setEditingService(prev => ({ 
                  ...prev, 
                  pricing: { ...prev.pricing, basic: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="Basic price"
              />
            </div>
            <div>
              <Label className="text-sm">Pro</Label>
              <Input
                type="number"
                value={editingService.pricing?.pro || ''}
                onChange={(e) => setEditingService(prev => ({ 
                  ...prev, 
                  pricing: { ...prev.pricing, pro: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="Pro price"
              />
            </div>
            <div>
              <Label className="text-sm">Enterprise</Label>
              <Input
                type="number"
                value={editingService.pricing?.enterprise || ''}
                onChange={(e) => setEditingService(prev => ({ 
                  ...prev, 
                  pricing: { ...prev.pricing, enterprise: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="Enterprise price"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingService.is_featured}
              onCheckedChange={(checked) => setEditingService(prev => ({ ...prev, is_featured: checked }))}
            />
            <Label>Featured</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingService.is_active}
              onCheckedChange={(checked) => setEditingService(prev => ({ ...prev, is_active: checked }))}
            />
            <Label>Active</Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSave(editingService)}>
            <Save className="h-4 w-4 mr-2" />
            Save Service
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const ProjectEditor: React.FC<{ project: ProjectShowcase; onSave: (project: ProjectShowcase) => void }> = ({
    project,
    onSave
  }) => {
    const [editingProject, setEditingProject] = useState(project);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input
              value={editingProject.title}
              onChange={(e) => setEditingProject(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Project title"
            />
          </div>
          <div>
            <Label>Client Name</Label>
            <Input
              value={editingProject.client_name}
              onChange={(e) => setEditingProject(prev => ({ ...prev, client_name: e.target.value }))}
              placeholder="Client name"
            />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={editingProject.description}
            onChange={(e) => setEditingProject(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            placeholder="Project description"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Industry</Label>
            <Input
              value={editingProject.industry}
              onChange={(e) => setEditingProject(prev => ({ ...prev, industry: e.target.value }))}
              placeholder="Industry"
            />
          </div>
          <div>
            <Label>Project Type</Label>
            <Select value={editingProject.project_type} onValueChange={(value) => 
              setEditingProject(prev => ({ ...prev, project_type: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Duration</Label>
            <Input
              value={editingProject.duration}
              onChange={(e) => setEditingProject(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 3 months"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Team Size</Label>
            <Input
              type="number"
              value={editingProject.team_size}
              onChange={(e) => setEditingProject(prev => ({ ...prev, team_size: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label>Completion Date</Label>
            <Input
              type="date"
              value={editingProject.completion_date}
              onChange={(e) => setEditingProject(prev => ({ ...prev, completion_date: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label>Technologies (comma separated)</Label>
          <Input
            value={editingProject.technologies.join(', ')}
            onChange={(e) => setEditingProject(prev => ({ 
              ...prev, 
              technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
            }))}
            placeholder="React, Node.js, PostgreSQL"
          />
        </div>

        <div>
          <Label>Challenges (one per line)</Label>
          <Textarea
            value={editingProject.challenges.join('\n')}
            onChange={(e) => setEditingProject(prev => ({ 
              ...prev, 
              challenges: e.target.value.split('\n').filter(c => c.trim()) 
            }))}
            rows={4}
            placeholder="Challenge 1&#10;Challenge 2"
          />
        </div>

        <div>
          <Label>Solutions (one per line)</Label>
          <Textarea
            value={editingProject.solutions.join('\n')}
            onChange={(e) => setEditingProject(prev => ({ 
              ...prev, 
              solutions: e.target.value.split('\n').filter(s => s.trim()) 
            }))}
            rows={4}
            placeholder="Solution 1&#10;Solution 2"
          />
        </div>

        <div>
          <Label>Results (one per line)</Label>
          <Textarea
            value={editingProject.results.join('\n')}
            onChange={(e) => setEditingProject(prev => ({ 
              ...prev, 
              results: e.target.value.split('\n').filter(r => r.trim()) 
            }))}
            rows={4}
            placeholder="Result 1&#10;Result 2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingProject.is_featured}
              onCheckedChange={(checked) => setEditingProject(prev => ({ ...prev, is_featured: checked }))}
            />
            <Label>Featured</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingProject.is_active}
              onCheckedChange={(checked) => setEditingProject(prev => ({ ...prev, is_active: checked }))}
            />
            <Label>Active</Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSave(editingProject)}>
            <Save className="h-4 w-4 mr-2" />
            Save Project
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600">Manage website content, services, and project showcases</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pages">Page Content</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="seo">SEO & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Page Content Management
                </CardTitle>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setSelectedContent({
                        page: '',
                        section: '',
                        title: '',
                        content: '',
                        is_published: false,
                        sort_order: 0
                      });
                      setIsEditing(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Content
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedContent?.id ? 'Edit Content' : 'Create Content'}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedContent && (
                      <ContentEditor 
                        content={selectedContent} 
                        onSave={handleSaveContent} 
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search content..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-64"
                  />
                </div>
                <Select value={filters.page} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, page: value }))
                }>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Pages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Pages</SelectItem>
                    {pages.map(page => (
                      <SelectItem key={page.id} value={page.id}>{page.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.published} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, published: value }))
                }>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentSections.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">
                          {pages.find(p => p.id === content.page)?.name || content.page}
                        </TableCell>
                        <TableCell>{content.section}</TableCell>
                        <TableCell>{content.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {content.is_published ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Eye className="h-3 w-3 mr-1" />
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Draft
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{content.sort_order}</TableCell>
                        <TableCell>
                          {content.updated_at ? new Date(content.updated_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedContent(content);
                                setIsEditing(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600">
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
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Services Management
                </CardTitle>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setSelectedService({
                        title: '',
                        description: '',
                        icon: '',
                        features: [],
                        gallery: [],
                        testimonials: [],
                        is_featured: false,
                        is_active: true,
                        category: '',
                        tags: []
                      });
                      setIsEditing(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedService?.id ? 'Edit Service' : 'Create Service'}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedService && (
                      <ServiceEditor 
                        service={selectedService} 
                        onSave={handleSaveService} 
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {service.icon && (
                            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                              <span className="text-sm">{service.icon}</span>
                            </div>
                          )}
                          <h3 className="font-semibold text-sm">{service.title}</h3>
                        </div>
                        <div className="flex items-center gap-1">
                          {service.is_featured && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setSelectedService(service);
                              setIsEditing(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Category:</span>
                          <span>{service.category}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Features:</span>
                          <span>{service.features.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Status:</span>
                          <Badge variant={service.is_active ? 'default' : 'secondary'}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Project Showcase
                </CardTitle>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setSelectedProject({
                        title: '',
                        description: '',
                        client_name: '',
                        industry: '',
                        project_type: '',
                        duration: '',
                        team_size: 0,
                        technologies: [],
                        challenges: [],
                        solutions: [],
                        results: [],
                        images: [],
                        is_featured: false,
                        is_active: true,
                        completion_date: ''
                      });
                      setIsEditing(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedProject?.id ? 'Edit Project' : 'Create Project'}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedProject && (
                      <ProjectEditor 
                        project={selectedProject} 
                        onSave={handleSaveProject} 
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-gray-600">{project.client_name}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {project.is_featured && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setSelectedProject(project);
                              setIsEditing(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Industry:</span>
                          <p className="font-medium">{project.industry}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <p className="font-medium">{project.project_type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-medium">{project.duration}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Team Size:</span>
                          <p className="font-medium">{project.team_size}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Page</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select page" />
                      </SelectTrigger>
                      <SelectContent>
                        {pages.map(page => (
                          <SelectItem key={page.id} value={page.id}>{page.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Page Title</Label>
                    <Input placeholder="SEO title for the page" />
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea placeholder="Meta description for search engines" rows={3} />
                  </div>
                  <div>
                    <Label>Keywords</Label>
                    <Input placeholder="Comma separated keywords" />
                  </div>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save SEO Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Content Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{contentSections.length}</div>
                      <div className="text-sm text-gray-600">Total Sections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {contentSections.filter(c => c.is_published).length}
                      </div>
                      <div className="text-sm text-gray-600">Published</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{services.length}</div>
                      <div className="text-sm text-gray-600">Services</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{projects.length}</div>
                      <div className="text-sm text-gray-600">Projects</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        No recent activity
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContentManager;