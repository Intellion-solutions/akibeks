import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";
import { 
  Palette, 
  Layout, 
  Type, 
  Image, 
  Save, 
  Eye, 
  Copy, 
  Trash2, 
  Plus,
  Download,
  Upload,
  Undo,
  Redo,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Settings,
  PaintBucket,
  Move,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Edit,
  Check,
  X,
  Star,
  Layers,
  Monitor,
  Smartphone,
  Tablet,
  Printer,
  Minus
} from "lucide-react";
import { db } from "@/lib/db-client";

interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'table' | 'line' | 'rectangle' | 'logo' | 'signature';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  styles: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: string;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: string;
    padding?: number;
    margin?: number;
    opacity?: number;
    rotation?: number;
  };
}

interface Template {
  id: string;
  name: string;
  type: 'invoice' | 'quotation';
  description: string;
  thumbnail: string;
  elements: TemplateElement[];
  settings: {
    pageSize: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: { top: number; right: number; bottom: number; left: number };
    backgroundColor: string;
    watermark?: string;
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminTemplates = () => {
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [activeTab, setActiveTab] = useState('templates');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile' | 'print'>('desktop');
  const [isDesigning, setIsDesigning] = useState(false);
  const [history, setHistory] = useState<Template[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // New template form
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'invoice' as const,
    description: '',
    baseTemplate: ''
  });

  // Element editing state
  const [editingElement, setEditingElement] = useState<TemplateElement | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTemplates();
    }
  }, [isAuthenticated]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'Modern Professional',
          type: 'invoice',
          description: 'Clean and modern design with blue accents',
          thumbnail: '/api/placeholder/300/400',
          elements: [
            {
              id: 'header',
              type: 'text',
              content: 'INVOICE',
              x: 50,
              y: 50,
              width: 200,
              height: 40,
              styles: {
                fontSize: 28,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                color: '#1e40af',
                textAlign: 'left'
              }
            },
            {
              id: 'logo',
              type: 'logo',
              content: 'Company Logo',
              x: 400,
              y: 30,
              width: 120,
              height: 80,
              styles: {}
            },
            {
              id: 'company-info',
              type: 'text',
              content: 'AKIBEKS Engineering Solutions\n123 Engineering Street\nNairobi, Kenya\nPhone: +254 123 456 789',
              x: 50,
              y: 120,
              width: 250,
              height: 100,
              styles: {
                fontSize: 12,
                fontFamily: 'Arial',
                color: '#374151',
                textAlign: 'left'
              }
            }
          ],
          settings: {
            pageSize: 'A4',
            orientation: 'portrait',
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            backgroundColor: '#ffffff'
          },
          isDefault: true,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Corporate Elite',
          type: 'invoice',
          description: 'Sophisticated design for enterprise clients',
          thumbnail: '/api/placeholder/300/400',
          elements: [],
          settings: {
            pageSize: 'A4',
            orientation: 'portrait',
            margins: { top: 30, right: 30, bottom: 30, left: 30 },
            backgroundColor: '#f8fafc'
          },
          isDefault: false,
          isActive: false,
          createdAt: '2024-01-02',
          updatedAt: '2024-01-10'
        },
        {
          id: '3',
          name: 'Professional Quote',
          type: 'quotation',
          description: 'Clean quotation template with pricing tables',
          thumbnail: '/api/placeholder/300/400',
          elements: [],
          settings: {
            pageSize: 'A4',
            orientation: 'portrait',
            margins: { top: 25, right: 25, bottom: 25, left: 25 },
            backgroundColor: '#ffffff'
          },
          isDefault: true,
          isActive: true,
          createdAt: '2024-01-03',
          updatedAt: '2024-01-12'
        }
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch templates.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    if (!newTemplate.name) return;

    try {
      const template: Template = {
        id: Date.now().toString(),
        name: newTemplate.name,
        type: newTemplate.type,
        description: newTemplate.description,
        thumbnail: '/api/placeholder/300/400',
        elements: [],
        settings: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          backgroundColor: '#ffffff'
        },
        isDefault: false,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTemplates(prev => [...prev, template]);
      setSelectedTemplate(template);
      setIsDesigning(true);
      setNewTemplate({ name: '', type: 'invoice', description: '', baseTemplate: '' });

      toast({
        title: "Template created",
        description: "New template has been created successfully."
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template.",
        variant: "destructive"
      });
    }
  };

  const saveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const updatedTemplate = {
        ...selectedTemplate,
        updatedAt: new Date().toISOString()
      };

      setTemplates(prev => 
        prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t)
      );

      toast({
        title: "Template saved",
        description: "Template has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
        setIsDesigning(false);
      }

      toast({
        title: "Template deleted",
        description: "Template has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive"
      });
    }
  };

  const duplicateTemplate = async (template: Template) => {
    try {
      const duplicated: Template = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Copy)`,
        isDefault: false,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTemplates(prev => [...prev, duplicated]);

      toast({
        title: "Template duplicated",
        description: "Template has been duplicated successfully."
      });
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate template.",
        variant: "destructive"
      });
    }
  };

  const addElement = (type: TemplateElement['type']) => {
    if (!selectedTemplate) return;

    const newElement: TemplateElement = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? 'Sample Text' : type === 'image' ? 'Image Placeholder' : 'Element',
      x: 100,
      y: 100,
      width: type === 'line' ? 200 : 150,
      height: type === 'line' ? 2 : type === 'text' ? 30 : 100,
      styles: {
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#000000',
        textAlign: 'left'
      }
    };

    const updatedTemplate = {
      ...selectedTemplate,
      elements: [...selectedTemplate.elements, newElement]
    };

    setSelectedTemplate(updatedTemplate);
    setSelectedElement(newElement);
  };

  const updateElement = (elementId: string, updates: Partial<TemplateElement>) => {
    if (!selectedTemplate) return;

    const updatedTemplate = {
      ...selectedTemplate,
      elements: selectedTemplate.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    };

    setSelectedTemplate(updatedTemplate);
    
    if (selectedElement?.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const deleteElement = (elementId: string) => {
    if (!selectedTemplate) return;

    const updatedTemplate = {
      ...selectedTemplate,
      elements: selectedTemplate.elements.filter(el => el.id !== elementId)
    };

    setSelectedTemplate(updatedTemplate);
    
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const getPreviewScale = () => {
    switch (previewMode) {
      case 'tablet': return 0.7;
      case 'mobile': return 0.4;
      case 'print': return 0.8;
      default: return 1;
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onLogout={logout} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Designer</h1>
            <p className="text-gray-600">Create and customize professional invoice and quotation templates</p>
          </div>
          
          <div className="flex gap-4 mt-4 lg:mt-0">
            {isDesigning && (
              <>
                <Button variant="outline" onClick={() => setIsDesigning(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Exit Designer
                </Button>
                <Button onClick={saveTemplate}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </>
            )}
            
            {!isDesigning && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Template</DialogTitle>
                    <DialogDescription>
                      Design a new template for invoices or quotations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="e.g., Modern Professional"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="templateType">Template Type</Label>
                      <Select value={newTemplate.type} onValueChange={(value: any) => setNewTemplate({ ...newTemplate, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice Template</SelectItem>
                          <SelectItem value="quotation">Quotation Template</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="templateDescription">Description</Label>
                      <Textarea
                        id="templateDescription"
                        value={newTemplate.description}
                        onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                        placeholder="Brief description of the template"
                      />
                    </div>
                    
                    <Button onClick={createTemplate} className="w-full">
                      Create Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {isDesigning && selectedTemplate ? (
          // Template Designer Interface
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Tools */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Design Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Element Tools */}
                <div>
                  <h4 className="font-medium mb-3">Add Elements</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => addElement('text')}>
                      <Type className="w-4 h-4 mr-1" />
                      Text
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addElement('image')}>
                      <Image className="w-4 h-4 mr-1" />
                      Image
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addElement('table')}>
                      <Grid className="w-4 h-4 mr-1" />
                      Table
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addElement('line')}>
                      <Minus className="w-4 h-4 mr-1" />
                      Line
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addElement('rectangle')}>
                      <Layout className="w-4 h-4 mr-1" />
                      Box
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addElement('logo')}>
                      <Star className="w-4 h-4 mr-1" />
                      Logo
                    </Button>
                  </div>
                </div>

                {/* Preview Modes */}
                <div>
                  <h4 className="font-medium mb-3">Preview Mode</h4>
                  <div className="space-y-2">
                    <Button 
                      variant={previewMode === 'desktop' ? 'default' : 'outline'} 
                      size="sm" 
                      className="w-full"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      Desktop
                    </Button>
                    <Button 
                      variant={previewMode === 'tablet' ? 'default' : 'outline'} 
                      size="sm" 
                      className="w-full"
                      onClick={() => setPreviewMode('tablet')}
                    >
                      <Tablet className="w-4 h-4 mr-2" />
                      Tablet
                    </Button>
                    <Button 
                      variant={previewMode === 'mobile' ? 'default' : 'outline'} 
                      size="sm" 
                      className="w-full"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Mobile
                    </Button>
                    <Button 
                      variant={previewMode === 'print' ? 'default' : 'outline'} 
                      size="sm" 
                      className="w-full"
                      onClick={() => setPreviewMode('print')}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>

                {/* Template Settings */}
                <div>
                  <h4 className="font-medium mb-3">Template Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Page Size</Label>
                      <Select 
                        value={selectedTemplate.settings.pageSize} 
                        onValueChange={(value: any) => setSelectedTemplate({
                          ...selectedTemplate,
                          settings: { ...selectedTemplate.settings, pageSize: value }
                        })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="Letter">Letter</SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Background Color</Label>
                      <Input 
                        type="color" 
                        value={selectedTemplate.settings.backgroundColor}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          settings: { ...selectedTemplate.settings, backgroundColor: e.target.value }
                        })}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Canvas */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Undo className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Redo className="w-4 h-4" />
                    </Button>
                    <Badge variant="secondary">{Math.round(getPreviewScale() * 100)}%</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative bg-white border rounded-lg overflow-hidden" style={{ 
                  transform: `scale(${getPreviewScale()})`,
                  transformOrigin: 'top left',
                  width: 'fit-content',
                  height: 'fit-content'
                }}>
                  <div 
                    className="relative"
                    style={{ 
                      width: '595px', // A4 width in pixels at 72 DPI
                      height: '842px', // A4 height in pixels at 72 DPI
                      backgroundColor: selectedTemplate.settings.backgroundColor,
                      padding: `${selectedTemplate.settings.margins.top}px ${selectedTemplate.settings.margins.right}px ${selectedTemplate.settings.margins.bottom}px ${selectedTemplate.settings.margins.left}px`
                    }}
                  >
                    {/* Render Template Elements */}
                    {selectedTemplate.elements.map((element) => (
                      <div
                        key={element.id}
                        className={`absolute cursor-pointer border-2 ${
                          selectedElement?.id === element.id ? 'border-blue-500' : 'border-transparent'
                        } hover:border-blue-300 transition-colors`}
                        style={{
                          left: element.x,
                          top: element.y,
                          width: element.width,
                          height: element.height,
                          fontSize: element.styles.fontSize,
                          fontFamily: element.styles.fontFamily,
                          fontWeight: element.styles.fontWeight,
                          color: element.styles.color,
                          backgroundColor: element.styles.backgroundColor,
                          textAlign: element.styles.textAlign as any,
                          padding: element.styles.padding,
                          opacity: element.styles.opacity,
                          transform: `rotate(${element.styles.rotation || 0}deg)`
                        }}
                        onClick={() => setSelectedElement(element)}
                      >
                        {element.type === 'text' && (
                          <div className="whitespace-pre-wrap">{element.content}</div>
                        )}
                        {element.type === 'image' && (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-500 border-dashed border-2 border-gray-300">
                            {element.content}
                          </div>
                        )}
                        {element.type === 'logo' && (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center text-sm text-blue-600 border-dashed border-2 border-blue-300">
                            Company Logo
                          </div>
                        )}
                        {element.type === 'line' && (
                          <div className="w-full h-full bg-gray-400"></div>
                        )}
                        {element.type === 'rectangle' && (
                          <div 
                            className="w-full h-full border"
                            style={{
                              borderWidth: element.styles.borderWidth || 1,
                              borderColor: element.styles.borderColor || '#000000',
                              borderStyle: element.styles.borderStyle || 'solid'
                            }}
                          ></div>
                        )}
                        {element.type === 'table' && (
                          <div className="w-full h-full border border-gray-300">
                            <table className="w-full h-full border-collapse">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="border border-gray-300 p-1 text-xs">Item</th>
                                  <th className="border border-gray-300 p-1 text-xs">Qty</th>
                                  <th className="border border-gray-300 p-1 text-xs">Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-300 p-1 text-xs">Sample Item</td>
                                  <td className="border border-gray-300 p-1 text-xs">1</td>
                                  <td className="border border-gray-300 p-1 text-xs">$100</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Sidebar - Properties */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedElement ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Element Type</Label>
                      <Badge variant="secondary" className="ml-2">{selectedElement.type}</Badge>
                    </div>

                    {selectedElement.type === 'text' && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Content</Label>
                          <Textarea
                            value={selectedElement.content}
                            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                            className="text-sm"
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Font Size</Label>
                            <Input
                              type="number"
                              value={selectedElement.styles.fontSize || 14}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, fontSize: parseInt(e.target.value) }
                              })}
                              className="text-sm h-8"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">Font Weight</Label>
                            <Select 
                              value={selectedElement.styles.fontWeight || 'normal'}
                              onValueChange={(value) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, fontWeight: value }
                              })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                                <SelectItem value="lighter">Lighter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Text Color</Label>
                          <Input
                            type="color"
                            value={selectedElement.styles.color || '#000000'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, color: e.target.value }
                            })}
                            className="h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Text Align</Label>
                          <div className="flex gap-1">
                            <Button 
                              variant={selectedElement.styles.textAlign === 'left' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, textAlign: 'left' }
                              })}
                            >
                              <AlignLeft className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant={selectedElement.styles.textAlign === 'center' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, textAlign: 'center' }
                              })}
                            >
                              <AlignCenter className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant={selectedElement.styles.textAlign === 'right' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, textAlign: 'right' }
                              })}
                            >
                              <AlignRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Position and Size */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Position & Size</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">X Position</Label>
                          <Input
                            type="number"
                            value={selectedElement.x}
                            onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) })}
                            className="text-sm h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y Position</Label>
                          <Input
                            type="number"
                            value={selectedElement.y}
                            onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) })}
                            className="text-sm h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Width</Label>
                          <Input
                            type="number"
                            value={selectedElement.width}
                            onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                            className="text-sm h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Height</Label>
                          <Input
                            type="number"
                            value={selectedElement.height}
                            onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })}
                            className="text-sm h-8"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteElement(selectedElement.id)}
                        className="flex-1"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Duplicate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Select an element to edit its properties</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Template Gallery
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="templates">All Templates</TabsTrigger>
              <TabsTrigger value="invoices">Invoice Templates</TabsTrigger>
              <TabsTrigger value="quotations">Quotation Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map((template) => (
                  <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={template.thumbnail} 
                          alt={template.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-white text-gray-900 hover:bg-gray-100"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setIsDesigning(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-white border-white hover:bg-gray-100"
                              onClick={() => {}}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                        {template.isDefault && (
                          <Badge className="absolute top-2 left-2 bg-blue-600">Default</Badge>
                        )}
                        {template.isActive && (
                          <Badge className="absolute top-2 right-2 bg-green-600">Active</Badge>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {template.type}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {template.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Updated {new Date(template.updatedAt).toLocaleDateString()}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => duplicateTemplate(template)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            {!template.isDefault && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteTemplate(template.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.filter(t => t.type === 'invoice').map((template) => (
                  <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
                    {/* Same card content as above */}
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={template.thumbnail} 
                          alt={template.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-white text-gray-900 hover:bg-gray-100"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setIsDesigning(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-white border-white hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                        {template.isDefault && (
                          <Badge className="absolute top-2 left-2 bg-blue-600">Default</Badge>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Updated {new Date(template.updatedAt).toLocaleDateString()}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => duplicateTemplate(template)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            {!template.isDefault && (
                              <Button variant="ghost" size="sm" onClick={() => deleteTemplate(template.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="quotations" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.filter(t => t.type === 'quotation').map((template) => (
                  <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
                    {/* Same card content as above */}
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={template.thumbnail} 
                          alt={template.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-white text-gray-900 hover:bg-gray-100"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setIsDesigning(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-white border-white hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                        {template.isDefault && (
                          <Badge className="absolute top-2 left-2 bg-blue-600">Default</Badge>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Updated {new Date(template.updatedAt).toLocaleDateString()}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => duplicateTemplate(template)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            {!template.isDefault && (
                              <Button variant="ghost" size="sm" onClick={() => deleteTemplate(template.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default AdminTemplates;
