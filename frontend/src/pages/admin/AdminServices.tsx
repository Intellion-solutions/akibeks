import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Eye, 
  EyeOff, 
  Edit,
  Trash2,
  Wrench,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { secureDb } from '@/lib/database-secure';

interface Service {
  id: string;
  title: string;
  description: string | null;
  category: string;
  icon: string | null;
  base_price: number | null;
  price_unit: string | null;
  features: string[];
  is_active: boolean | null;
  is_featured: boolean | null;
  display_order: number | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const AdminServices: React.FC = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    icon: '',
    base_price: '',
    price_unit: '',
    features: '',
    is_active: true,
    is_featured: false,
    display_order: '',
    seo_title: '',
    seo_description: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const result = await secureDb.getServices();
      const { data, error } = result;

      if (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error",
          description: "Failed to fetch services",
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match the expected interface
      const servicesData = Array.isArray(data) ? data : [];
      const transformedData = servicesData.map((item: any) => ({
        ...item,
        features: Array.isArray(item.features) ? 
          item.features.filter((f: any): f is string => typeof f === 'string') : 
          [],
      }));
      
      setServices(transformedData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredServices = services.filter(service => {
    const searchTermLower = searchTerm.toLowerCase();
    const titleMatch = service.title.toLowerCase().includes(searchTermLower);
    const descriptionMatch = (service.description || '').toLowerCase().includes(searchTermLower);
    const categoryMatch = selectedCategory === 'all' || service.category === selectedCategory;

    return categoryMatch && (titleMatch || descriptionMatch);
  });

  const openDialog = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      icon: '',
      base_price: '',
      price_unit: '',
      features: '',
      is_active: true,
      is_featured: false,
      display_order: '',
      seo_title: '',
      seo_description: ''
    });
    setEditingService(null);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingService(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const serviceData = {
        name: formData.title,
        description: formData.description,
        category: formData.category,
        basePrice: parseFloat(formData.base_price || '0'),
        features: formData.features.split(',').map(f => f.trim()),
        isActive: formData.is_active,
        duration: parseInt(formData.display_order || '30'), // Use display_order as duration for now
        requirements: [], // Default empty array
        deliverables: [] // Default empty array
      };

      if (editingService) {
        // Update existing service
        const { error } = await secureDb.updateService(editingService.id, serviceData);

        if (error) {
          throw new Error(error);
        }

        toast({
          title: "Success",
          description: "Service updated successfully",
        });
      } else {
        // Create new service
        const { error } = await secureDb.createService(serviceData);

        if (error) {
          throw new Error(error);
        }

        toast({
          title: "Success",
          description: "Service created successfully",
        });
      }

      fetchServices();
      closeDialog();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const editService = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description || '',
      category: service.category,
      icon: service.icon || '',
      base_price: service.base_price?.toString() || '',
      price_unit: service.price_unit || '',
      features: service.features.join(', '),
      is_active: service.is_active || true,
      is_featured: service.is_featured || false,
      display_order: service.display_order?.toString() || '',
      seo_title: service.seo_title || '',
      seo_description: service.seo_description || ''
    });
    setShowDialog(true);
  };

  const deleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        setLoading(true);
        const { error } = await secureDb.deleteService(serviceId);

        if (error) {
          throw new Error(error);
        }

        toast({
          title: "Success",
          description: "Service deleted successfully",
        });
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast({
          title: "Error",
          description: "Failed to delete service",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      setLoading(true);
      const { error } = await secureDb.updateService(service.id, { isActive: !service.is_active });

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: `Service ${service.is_active ? 'deactivated' : 'activated'} successfully`,
      });
      fetchServices();
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast({
        title: "Error",
        description: "Failed to toggle active status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (service: Service) => {
    // Featured functionality not available in current database schema
    toast({
      title: "Info",
      description: "Featured functionality not available",
      variant: "default"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Manage Services"
        description="Add, edit, and manage the services offered."
        actions={
          <Button onClick={openDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <Tabs defaultValue="all" className="ml-auto">
                <TabsList>
                  <TabsTrigger value="all" onClick={() => handleCategoryChange('all')}>All</TabsTrigger>
                  <TabsTrigger value="engineering" onClick={() => handleCategoryChange('engineering')}>Engineering</TabsTrigger>
                  <TabsTrigger value="construction" onClick={() => handleCategoryChange('construction')}>Construction</TabsTrigger>
                  <TabsTrigger value="design" onClick={() => handleCategoryChange('design')}>Design</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Separator />

            <div className="grid gap-4">
              {filteredServices.map(service => (
                <Card key={service.id}>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>{service.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{service.category}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(service)}>
                        {service.is_active ? (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleFeatured(service)}>
                        {service.is_featured ? (
                          <>
                            <Star className="w-4 h-4 mr-2" />
                            Unfeature
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4 mr-2" />
                            Feature
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => editService(service)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteService(service.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Input
                  type="text"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="base_price">Base Price</Label>
                <Input
                  type="number"
                  id="base_price"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="price_unit">Price Unit</Label>
                <Input
                  type="text"
                  id="price_unit"
                  name="price_unit"
                  value={formData.price_unit}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  type="number"
                  id="display_order"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="features">Features (comma separated)</Label>
              <Input
                type="text"
                id="features"
                name="features"
                value={formData.features}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  type="text"
                  id="seo_title"
                  name="seo_title"
                  value={formData.seo_title}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="seo_description">SEO Description</Label>
                <Input
                  type="text"
                  id="seo_description"
                  name="seo_description"
                  value={formData.seo_description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
              />
              <Label htmlFor="is_featured">Featured</Label>
              <Switch
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
              />
            </div>
            <DialogFooter>
              <Button type="submit">{editingService ? 'Update' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServices;
