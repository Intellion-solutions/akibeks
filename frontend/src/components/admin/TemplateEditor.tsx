
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X } from "lucide-react";
import { supabase } from "@/lib/db-client";

interface TemplateItem {
  id?: string;
  item_number: number;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Template {
  id?: string;
  template_id: string;
  template_name: string;
  material_cost: number;
  labor_charge: number;
  tax_amount: number;
  grand_total: number;
  terms_conditions: string;
  notes: string;
  items: TemplateItem[];
}

interface TemplateEditorProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  currencySymbol: string;
}

const TemplateEditor = ({ template, open, onOpenChange, onSave, currencySymbol }: TemplateEditorProps) => {
  const { toast } = useToast();
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (template) {
      setEditingTemplate({ ...template });
    } else {
      setEditingTemplate({
        template_id: '',
        template_name: '',
        material_cost: 0,
        labor_charge: 0,
        tax_amount: 0,
        grand_total: 0,
        terms_conditions: '',
        notes: '',
        items: [
          { item_number: 1, description: '', unit: 'Units', quantity: 1, unit_price: 0, amount: 0 }
        ]
      });
    }
    setValidationErrors([]);
  }, [template, open]);

  const calculateTotals = (items: TemplateItem[], materialCost = 0, laborCharge = 0) => {
    const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const subtotal = itemsTotal + materialCost + laborCharge;
    const taxAmount = subtotal * 0.16;
    const grandTotal = subtotal + taxAmount;
    return { subtotal, taxAmount, grandTotal };
  };

  const updateTemplateItem = (index: number, field: keyof TemplateItem, value: any) => {
    if (!editingTemplate) return;

    const updatedItems = [...editingTemplate.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    const { taxAmount, grandTotal } = calculateTotals(
      updatedItems, 
      editingTemplate.material_cost, 
      editingTemplate.labor_charge
    );
    
    setEditingTemplate({
      ...editingTemplate,
      items: updatedItems,
      tax_amount: taxAmount,
      grand_total: grandTotal
    });
  };

  const addTemplateItem = () => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      items: [
        ...editingTemplate.items,
        {
          item_number: editingTemplate.items.length + 1,
          description: '',
          unit: 'Units',
          quantity: 1,
          unit_price: 0,
          amount: 0
        }
      ]
    });
  };

  const removeTemplateItem = (index: number) => {
    if (!editingTemplate || editingTemplate.items.length <= 1) return;
    
    const updatedItems = editingTemplate.items.filter((_, i) => i !== index);
    const renumberedItems = updatedItems.map((item, i) => ({
      ...item,
      item_number: i + 1
    }));
    
    const { taxAmount, grandTotal } = calculateTotals(
      renumberedItems, 
      editingTemplate.material_cost, 
      editingTemplate.labor_charge
    );
    
    setEditingTemplate({
      ...editingTemplate,
      items: renumberedItems,
      tax_amount: taxAmount,
      grand_total: grandTotal
    });
  };

  const updateCostField = (field: 'material_cost' | 'labor_charge', value: number) => {
    if (!editingTemplate) return;
    
    const updatedTemplate = { ...editingTemplate, [field]: value };
    const { taxAmount, grandTotal } = calculateTotals(
      updatedTemplate.items,
      updatedTemplate.material_cost,
      updatedTemplate.labor_charge
    );
    
    setEditingTemplate({
      ...updatedTemplate,
      tax_amount: taxAmount,
      grand_total: grandTotal
    });
  };

  const validateTemplate = (): boolean => {
    const errors: string[] = [];
    
    if (!editingTemplate?.template_name.trim()) {
      errors.push('Template name is required');
    }
    
    if (editingTemplate?.items.some(item => !item.description.trim())) {
      errors.push('All items must have descriptions');
    }
    
    if (editingTemplate?.items.some(item => item.quantity <= 0)) {
      errors.push('All items must have positive quantities');
    }
    
    if (editingTemplate?.items.some(item => item.unit_price < 0)) {
      errors.push('Unit prices cannot be negative');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!editingTemplate || !validateTemplate()) return;
    
    setLoading(true);
    try {
      if (template?.id) {
        // Update existing template
        const { error: settingsError } = await supabase
          .from('template_settings')
          .update({
            template_name: editingTemplate.template_name,
            material_cost: editingTemplate.material_cost,
            labor_charge: editingTemplate.labor_charge,
            tax_amount: editingTemplate.tax_amount,
            grand_total: editingTemplate.grand_total,
            terms_conditions: editingTemplate.terms_conditions,
            notes: editingTemplate.notes
          })
          .eq('template_id', template.template_id);

        if (settingsError) throw settingsError;

        // Delete existing items and recreate them
        await supabase
          .from('template_items')
          .delete()
          .eq('template_id', template.template_id);

        const itemsToInsert = editingTemplate.items.map(item => ({
          template_id: template.template_id,
          item_number: item.item_number,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount
        }));

        const { error: itemsError } = await supabase
          .from('template_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        toast({
          title: "Template Updated",
          description: "Template has been updated successfully.",
        });
      } else {
        // Create new template
        const templateId = 'TPL' + Date.now().toString().slice(-6);
        
        const { error: settingsError } = await supabase
          .from('template_settings')
          .insert([{
            template_id: templateId,
            template_name: editingTemplate.template_name,
            material_cost: editingTemplate.material_cost,
            labor_charge: editingTemplate.labor_charge,
            tax_amount: editingTemplate.tax_amount,
            grand_total: editingTemplate.grand_total,
            terms_conditions: editingTemplate.terms_conditions,
            notes: editingTemplate.notes
          }]);

        if (settingsError) throw settingsError;

        const itemsToInsert = editingTemplate.items.map(item => ({
          template_id: templateId,
          item_number: item.item_number,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount
        }));

        const { error: itemsError } = await supabase
          .from('template_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        toast({
          title: "Template Created",
          description: "New template has been created successfully.",
        });
      }
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!editingTemplate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogDescription>
            {template ? 'Modify template details and items' : 'Design a professional template for quotes and invoices'}
          </DialogDescription>
        </DialogHeader>
        
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Please fix the following errors:</h4>
            <ul className="list-disc list-inside text-red-700 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Template Details</TabsTrigger>
            <TabsTrigger value="items">Items & Pricing</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                value={editingTemplate.template_name}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, template_name: e.target.value })}
                placeholder="Enter template name"
                className={validationErrors.some(e => e.includes('Template name')) ? 'border-red-500' : ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="materialCost">Material Cost ({currencySymbol})</Label>
                <Input
                  id="materialCost"
                  type="number"
                  value={editingTemplate.material_cost}
                  onChange={(e) => updateCostField('material_cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="laborCharge">Labor Charge ({currencySymbol})</Label>
                <Input
                  id="laborCharge"
                  type="number"
                  value={editingTemplate.labor_charge}
                  onChange={(e) => updateCostField('labor_charge', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="termsConditions">Terms & Conditions</Label>
              <Textarea
                id="termsConditions"
                value={editingTemplate.terms_conditions}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, terms_conditions: e.target.value })}
                placeholder="Enter terms and conditions..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editingTemplate.notes}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, notes: e.target.value })}
                placeholder="Enter additional notes..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Template Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addTemplateItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">No.</th>
                      <th className="text-left p-3 text-sm font-medium">Item Description *</th>
                      <th className="text-left p-3 text-sm font-medium">Unit</th>
                      <th className="text-left p-3 text-sm font-medium">Qty</th>
                      <th className="text-left p-3 text-sm font-medium">Unit Price</th>
                      <th className="text-left p-3 text-sm font-medium">Amount</th>
                      <th className="text-left p-3 text-sm font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingTemplate.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">
                          <Input
                            type="number"
                            value={item.item_number}
                            onChange={(e) => updateTemplateItem(index, 'item_number', parseInt(e.target.value))}
                            className="w-16"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            value={item.description}
                            onChange={(e) => updateTemplateItem(index, 'description', e.target.value)}
                            placeholder="Item description"
                            className={!item.description.trim() && validationErrors.length > 0 ? 'border-red-500' : ''}
                          />
                        </td>
                        <td className="p-3">
                          <Select
                            value={item.unit}
                            onValueChange={(value) => updateTemplateItem(index, 'unit', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Units">Units</SelectItem>
                              <SelectItem value="Sq M">Sq M</SelectItem>
                              <SelectItem value="Bags">Bags</SelectItem>
                              <SelectItem value="Tonnes">Tonnes</SelectItem>
                              <SelectItem value="Lump Sum">Lump Sum</SelectItem>
                              <SelectItem value="Hours">Hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateTemplateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-20"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateTemplateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-24"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="p-3">
                          <span className="font-medium">{currencySymbol} {item.amount.toLocaleString()}</span>
                        </td>
                        <td className="p-3">
                          {editingTemplate.items.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeTemplateItem(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span>{currencySymbol} {editingTemplate.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Material Cost:</span>
                  <span>{currencySymbol} {editingTemplate.material_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Labor Charge:</span>
                  <span>{currencySymbol} {editingTemplate.labor_charge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (16%):</span>
                  <span>{currencySymbol} {editingTemplate.tax_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Grand Total:</span>
                  <span>{currencySymbol} {editingTemplate.grand_total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="bg-white border rounded-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">AKIBEKS Engineering</h2>
                <p className="text-gray-600">{editingTemplate.template_name}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Items</h3>
                <table className="w-full border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">No.</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-left">Unit</th>
                      <th className="border p-2 text-right">Qty</th>
                      <th className="border p-2 text-right">Unit Price</th>
                      <th className="border p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingTemplate.items.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">{item.item_number}</td>
                        <td className="border p-2">{item.description}</td>
                        <td className="border p-2">{item.unit}</td>
                        <td className="border p-2 text-right">{item.quantity}</td>
                        <td className="border p-2 text-right">{currencySymbol} {item.unit_price.toLocaleString()}</td>
                        <td className="border p-2 text-right">{currencySymbol} {item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  {editingTemplate.terms_conditions && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
                      <p className="text-sm text-gray-600">{editingTemplate.terms_conditions}</p>
                    </div>
                  )}
                  {editingTemplate.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes:</h4>
                      <p className="text-sm text-gray-600">{editingTemplate.notes}</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Material Cost:</span>
                      <span>{currencySymbol} {editingTemplate.material_cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labor Charge:</span>
                      <span>{currencySymbol} {editingTemplate.labor_charge.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (16%):</span>
                      <span>{currencySymbol} {editingTemplate.tax_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Grand Total:</span>
                      <span>{currencySymbol} {editingTemplate.grand_total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateEditor;
