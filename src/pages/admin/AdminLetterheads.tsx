
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Palette, Eye, Edit, Trash2, Star } from "lucide-react";
import { supabase } from "@/lib/db-client";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";

interface InvoiceTemplate {
  id: string;
  template_name: string;
  template_type: string;
  is_default: boolean;
  letterhead_config: any;
  color_scheme: any;
  layout_config: any;
  created_at: string;
  updated_at: string;
}

const AdminLetterheads = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAdmin();
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    template_type: 'standard',
    is_default: false,
    letterhead_config: {
      showLogo: true,
      showAddress: true,
      showContact: true,
      showWebsite: true,
      companyTagline: 'Professional Engineering Solutions'
    },
    color_scheme: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#3b82f6'
    },
    layout_config: {
      sections: true,
      itemBorders: true,
      compactMode: false,
      showDealers: true
    }
  });

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const { error } = await supabase
        .from('invoice_templates')
        .insert([newTemplate]);

      if (error) throw error;

      toast({
        title: "Template Created",
        description: "New invoice template has been created successfully.",
      });

      setShowCreateTemplate(false);
      setNewTemplate({
        template_name: '',
        template_type: 'standard',
        is_default: false,
        letterhead_config: {
          showLogo: true,
          showAddress: true,
          showContact: true,
          showWebsite: true,
          companyTagline: 'Professional Engineering Solutions'
        },
        color_scheme: {
          primary: '#2563eb',
          secondary: '#1e40af',
          accent: '#3b82f6'
        },
        layout_config: {
          sections: true,
          itemBorders: true,
          compactMode: false,
          showDealers: true
        }
      });
      
      await fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const { error } = await supabase
        .from('invoice_templates')
        .update(editingTemplate)
        .eq('id', editingTemplate.id);

      if (error) throw error;

      toast({
        title: "Template Updated",
        description: "Template has been updated successfully.",
      });

      setEditingTemplate(null);
      await fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase
        .from('invoice_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully.",
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const setAsDefault = async (templateId: string) => {
    try {
      // First, unset all defaults
      await supabase
        .from('invoice_templates')
        .update({ is_default: false })
        .neq('id', '');

      // Then set the selected one as default
      const { error } = await supabase
        .from('invoice_templates')
        .update({ is_default: true })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Default Template Set",
        description: "This template is now the default for new invoices.",
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Error setting default template:', error);
      toast({
        title: "Error",
        description: "Failed to set default template",
        variant: "destructive"
      });
    }
  };

  const previewColors = [
    { name: 'Professional Blue', colors: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' } },
    { name: 'Modern Green', colors: { primary: '#059669', secondary: '#047857', accent: '#10b981' } },
    { name: 'Classic Red', colors: { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444' } },
    { name: 'Corporate Purple', colors: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6' } },
    { name: 'Elegant Gold', colors: { primary: '#d97706', secondary: '#b45309', accent: '#f59e0b' } },
    { name: 'Professional Teal', colors: { primary: '#0891b2', secondary: '#0e7490', accent: '#06b6d4' } }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Palette className="w-8 h-8 mr-3" />
            Letterheads & Templates
          </h1>
          <p className="text-gray-600 mt-2">Design and manage professional invoice templates and letterheads</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Templates</p>
                  <p className="text-2xl font-bold">{templates.length}</p>
                </div>
                <Palette className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Default Template</p>
                  <p className="text-2xl font-bold text-green-600">
                    {templates.filter(t => t.is_default).length}
                  </p>
                </div>
                <Star className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Template Types</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {[...new Set(templates.map(t => t.template_type))].length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Template Button */}
        <div className="mb-6">
          <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Professional Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Template Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template_name">Template Name</Label>
                    <Input
                      id="template_name"
                      value={newTemplate.template_name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, template_name: e.target.value }))}
                      placeholder="e.g., Corporate Blue Template"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template_type">Template Type</Label>
                    <Select value={newTemplate.template_type} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, template_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Color Scheme */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Color Scheme</Label>
                  <div className="grid grid-cols-3 gap-6">
                    {previewColors.map((colorSet) => (
                      <div
                        key={colorSet.name}
                        className="cursor-pointer border-2 rounded-lg p-4 hover:shadow-md transition-all"
                        style={{
                          borderColor: newTemplate.color_scheme.primary === colorSet.colors.primary ? colorSet.colors.primary : '#e5e7eb'
                        }}
                        onClick={() => setNewTemplate(prev => ({ ...prev, color_scheme: colorSet.colors }))}
                      >
                        <div className="flex space-x-2 mb-2">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: colorSet.colors.primary }}
                          ></div>
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: colorSet.colors.secondary }}
                          ></div>
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: colorSet.colors.accent }}
                          ></div>
                        </div>
                        <p className="text-sm font-medium">{colorSet.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Letterhead Configuration */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Letterhead Settings</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showLogo">Show Company Logo</Label>
                        <Switch
                          id="showLogo"
                          checked={newTemplate.letterhead_config.showLogo}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            letterhead_config: { ...prev.letterhead_config, showLogo: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showAddress">Show Company Address</Label>
                        <Switch
                          id="showAddress"
                          checked={newTemplate.letterhead_config.showAddress}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            letterhead_config: { ...prev.letterhead_config, showAddress: checked }
                          }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showContact">Show Contact Info</Label>
                        <Switch
                          id="showContact"
                          checked={newTemplate.letterhead_config.showContact}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            letterhead_config: { ...prev.letterhead_config, showContact: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showWebsite">Show Website</Label>
                        <Switch
                          id="showWebsite"
                          checked={newTemplate.letterhead_config.showWebsite}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            letterhead_config: { ...prev.letterhead_config, showWebsite: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="companyTagline">Company Tagline</Label>
                    <Input
                      id="companyTagline"
                      value={newTemplate.letterhead_config.companyTagline}
                      onChange={(e) => setNewTemplate(prev => ({
                        ...prev,
                        letterhead_config: { ...prev.letterhead_config, companyTagline: e.target.value }
                      }))}
                      placeholder="Professional Engineering Solutions"
                    />
                  </div>
                </div>

                {/* Layout Configuration */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Layout Options</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sections">Show Item Sections</Label>
                        <Switch
                          id="sections"
                          checked={newTemplate.layout_config.sections}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            layout_config: { ...prev.layout_config, sections: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="itemBorders">Item Borders</Label>
                        <Switch
                          id="itemBorders"
                          checked={newTemplate.layout_config.itemBorders}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            layout_config: { ...prev.layout_config, itemBorders: checked }
                          }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compactMode">Compact Mode</Label>
                        <Switch
                          id="compactMode"
                          checked={newTemplate.layout_config.compactMode}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            layout_config: { ...prev.layout_config, compactMode: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showDealers">Show Dealers Section</Label>
                        <Switch
                          id="showDealers"
                          checked={newTemplate.layout_config.showDealers}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            layout_config: { ...prev.layout_config, showDealers: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6">
          {templates.map((template) => (
            <Card key={template.id} className={`hover:shadow-md transition-shadow ${template.is_default ? 'ring-2 ring-green-500' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{template.template_name}</h3>
                      {template.is_default && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </span>
                      )}
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {template.template_type}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex space-x-1">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: template.color_scheme?.primary || '#2563eb' }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: template.color_scheme?.secondary || '#1e40af' }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: template.color_scheme?.accent || '#3b82f6' }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        Created: {new Date(template.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {template.letterhead_config?.showLogo && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Logo</span>
                      )}
                      {template.letterhead_config?.showAddress && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Address</span>
                      )}
                      {template.layout_config?.sections && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Sections</span>
                      )}
                      {template.layout_config?.showDealers && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Dealers</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {!template.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAsDefault(template.id)}
                        className="flex items-center gap-2"
                      >
                        <Star className="w-4 h-4" />
                        Set Default
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Create your first invoice template to get started</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Template Dialog */}
        {editingTemplate && (
          <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Template: {editingTemplate.template_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_template_name">Template Name</Label>
                    <Input
                      id="edit_template_name"
                      value={editingTemplate.template_name}
                      onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, template_name: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_template_type">Template Type</Label>
                    <Select value={editingTemplate.template_type} onValueChange={(value) => setEditingTemplate(prev => prev ? { ...prev, template_type: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateTemplate}>
                    Update Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminLetterheads;
