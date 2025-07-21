
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Package, AlertTriangle, TrendingUp, Boxes, Edit, Trash2, Eye } from "lucide-react";
import { supabase } from "@/lib/db-client";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/AdminLogin";
import AdminHeader from "@/components/AdminHeader";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  cost_per_unit: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminInventory = () => {
  const { isAuthenticated, companySettings } = useAdmin();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "units",
    min_stock: 0,
    cost_per_unit: 0,
    status: "in_stock"
  });

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('inventory')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inventory item added successfully"
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .update(formData)
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inventory item updated successfully"
      });
      
      setIsEditDialogOpen(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inventory item deleted successfully"
      });
      
      fetchInventory();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      unit: "units",
      min_stock: 0,
      cost_per_unit: 0,
      status: "in_stock"
    });
    setSelectedItem(null);
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      min_stock: item.min_stock,
      cost_per_unit: item.cost_per_unit,
      status: item.status
    });
    setIsEditDialogOpen(true);
  };

  const updateInventoryStatus = (items: InventoryItem[]) => {
    return items.map(item => ({
      ...item,
      status: item.quantity <= item.min_stock 
        ? (item.quantity === 0 ? 'out_of_stock' : 'low_stock')
        : 'in_stock'
    }));
  };

  const filteredInventory = inventory.filter((item: InventoryItem) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const updatedInventory = updateInventoryStatus(filteredInventory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalValue = inventory.reduce((sum: number, item: InventoryItem) => sum + (item.quantity * item.cost_per_unit), 0);
  const lowStockItems = updatedInventory.filter((item: InventoryItem) => item.quantity <= item.min_stock).length;
  const categories = [...new Set(inventory.map((item: InventoryItem) => item.category))];
  const currencySymbol = companySettings?.currency_symbol || 'KSh';

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="bg-white shadow-sm border-b rounded-lg mb-6">
          <div className="px-4 md:px-6 py-4 md:py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                  <Package className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                  Inventory Management
                </h1>
                <p className="text-gray-600 mt-1">Track materials, equipment, and supplies</p>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>
                      Add a new item to your inventory
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Item Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter item name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Construction Materials">Construction Materials</SelectItem>
                          <SelectItem value="Equipment">Equipment</SelectItem>
                          <SelectItem value="Tools">Tools</SelectItem>
                          <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Plumbing">Plumbing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit *</Label>
                        <Input
                          id="unit"
                          value={formData.unit}
                          onChange={(e) => setFormData({...formData, unit: e.target.value})}
                          placeholder="e.g., pieces, tons"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min_stock">Minimum Stock *</Label>
                        <Input
                          id="min_stock"
                          type="number"
                          value={formData.min_stock}
                          onChange={(e) => setFormData({...formData, min_stock: parseInt(e.target.value) || 0})}
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cost_per_unit">Cost per Unit ({currencySymbol}) *</Label>
                        <Input
                          id="cost_per_unit"
                          type="number"
                          value={formData.cost_per_unit}
                          onChange={(e) => setFormData({...formData, cost_per_unit: parseFloat(e.target.value) || 0})}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Item</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <Boxes className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{inventory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{currencySymbol} {totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{lowStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Grid */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {updatedInventory.map((item: InventoryItem) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg truncate">{item.name}</CardTitle>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription>{item.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Quantity</p>
                      <p className="font-semibold">{item.quantity} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Min Stock</p>
                      <p className="font-semibold">{item.min_stock} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Unit Cost</p>
                      <p className="font-semibold">{currencySymbol} {item.cost_per_unit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Value</p>
                      <p className="font-semibold">{currencySymbol} {(item.quantity * item.cost_per_unit).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedItem(item);
                        setIsViewDialogOpen(true);
                      }}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(item)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {updatedInventory.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search criteria" : "Start by adding your first inventory item"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* View Item Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Item Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedItem?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Name</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedItem.name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Category</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedItem.category}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Quantity</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedItem.quantity} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Minimum Stock</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedItem.min_stock} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Cost per Unit</Label>
                    <p className="text-sm text-gray-600 mt-1">{currencySymbol} {selectedItem.cost_per_unit}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Total Value</Label>
                    <p className="text-sm text-gray-600 mt-1">{currencySymbol} {(selectedItem.quantity * selectedItem.cost_per_unit).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedItem.status)}>
                      {selectedItem.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label className="font-medium">Last Updated</Label>
                    <p className="text-sm text-gray-600 mt-1">{new Date(selectedItem.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
              <DialogDescription>
                Update inventory item information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Item Name *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Construction Materials">Construction Materials</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                    <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_quantity">Quantity *</Label>
                  <Input
                    id="edit_quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_unit">Unit *</Label>
                  <Input
                    id="edit_unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_min_stock">Minimum Stock *</Label>
                  <Input
                    id="edit_min_stock"
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({...formData, min_stock: parseInt(e.target.value) || 0})}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_cost_per_unit">Cost per Unit ({currencySymbol}) *</Label>
                  <Input
                    id="edit_cost_per_unit"
                    type="number"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({...formData, cost_per_unit: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Item</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminInventory;
