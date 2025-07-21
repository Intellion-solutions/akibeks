import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, X, Edit3, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import DatabaseClient from '@/lib/database-client';

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface EditableInvoiceProps {
  invoice: any;
  onSave: (updatedInvoice: any) => void;
  onCancel: () => void;
  clients: any[];
  projects: any[];
}

export const EditableInvoice: React.FC<EditableInvoiceProps> = ({
  invoice,
  onSave,
  onCancel,
  clients,
  projects,
}) => {
  const [editingInvoice, setEditingInvoice] = useState({
    ...invoice,
    items: invoice.items || []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);

  // Calculate totals
  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = subtotal * (editingInvoice.tax_rate || 0) / 100;
    const discountAmount = editingInvoice.discount_amount || 0;
    const total = subtotal + taxAmount - discountAmount;

    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals(editingInvoice.items);

  // Update item in the list
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...editingInvoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate amount if quantity or rate changed
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }

    setEditingInvoice({
      ...editingInvoice,
      items: updatedItems
    });
  };

  // Add new item
  const addItem = () => {
    setEditingInvoice({
      ...editingInvoice,
      items: [
        ...editingInvoice.items,
        {
          description: '',
          quantity: 1,
          rate: 0,
          amount: 0
        }
      ]
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    const updatedItems = editingInvoice.items.filter((_, i) => i !== index);
    setEditingInvoice({
      ...editingInvoice,
      items: updatedItems
    });
  };

  // Save invoice
  const handleSave = async () => {
    try {
      setSaving(true);

      // Validation
      if (!editingInvoice.client_id) {
        toast.error('Please select a client');
        return;
      }

      if (!editingInvoice.invoice_number) {
        toast.error('Invoice number is required');
        return;
      }

      if (editingInvoice.items.length === 0) {
        toast.error('At least one item is required');
        return;
      }

      // Check for empty items
      const hasEmptyItems = editingInvoice.items.some(item => 
        !item.description.trim() || item.quantity <= 0 || item.rate < 0
      );

      if (hasEmptyItems) {
        toast.error('Please fill in all item details');
        return;
      }

      const updatedInvoice = {
        ...editingInvoice,
        amount: subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        items: editingInvoice.items
      };

      // Update in database
      await DatabaseClient.update('invoices', invoice.id, updatedInvoice);

      onSave(updatedInvoice);
      setIsEditing(false);
      toast.success('Invoice updated successfully');
    } catch (error) {
      console.error('Failed to save invoice:', error);
      toast.error('Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Invoice #{editingInvoice.invoice_number}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(editingInvoice.status)}>
              {editingInvoice.status}
            </Badge>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Invoice Number</label>
                <Input
                  value={editingInvoice.invoice_number}
                  onChange={(e) => setEditingInvoice({
                    ...editingInvoice,
                    invoice_number: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Client</label>
                <Select
                  value={editingInvoice.client_id}
                  onValueChange={(value) => setEditingInvoice({
                    ...editingInvoice,
                    client_id: value
                  })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Project (Optional)</label>
                <Select
                  value={editingInvoice.project_id || ''}
                  onValueChange={(value) => setEditingInvoice({
                    ...editingInvoice,
                    project_id: value || null
                  })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editingInvoice.status}
                  onValueChange={(value) => setEditingInvoice({
                    ...editingInvoice,
                    status: value
                  })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={editingInvoice.due_date ? new Date(editingInvoice.due_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingInvoice({
                    ...editingInvoice,
                    due_date: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Paid Date</label>
                <Input
                  type="date"
                  value={editingInvoice.paid_date ? new Date(editingInvoice.paid_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingInvoice({
                    ...editingInvoice,
                    paid_date: e.target.value || null
                  })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              {isEditing && (
                <Button onClick={addItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Quantity</TableHead>
                  <TableHead className="w-32">Rate</TableHead>
                  <TableHead className="w-32">Amount</TableHead>
                  {isEditing && <TableHead className="w-16">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {editingInvoice.items.map((item: InvoiceItem, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      ) : (
                        item.description
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        `$${item.rate.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ${(item.quantity * item.rate).toFixed(2)}
                      </span>
                    </TableCell>
                    {isEditing && (
                      <TableCell>
                        <Button
                          onClick={() => removeItem(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax Rate (%):</span>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={editingInvoice.tax_rate || 0}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      tax_rate: parseFloat(e.target.value) || 0
                    })}
                    className="w-20 text-right"
                  />
                ) : (
                  <span>${taxAmount.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span>Discount:</span>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingInvoice.discount_amount || 0}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      discount_amount: parseFloat(e.target.value) || 0
                    })}
                    className="w-24 text-right"
                  />
                ) : (
                  <span>-${(editingInvoice.discount_amount || 0).toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={editingInvoice.notes || ''}
                onChange={(e) => setEditingInvoice({
                  ...editingInvoice,
                  notes: e.target.value
                })}
                disabled={!isEditing}
                placeholder="Additional notes..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Terms & Conditions</label>
              <Textarea
                value={editingInvoice.terms || ''}
                onChange={(e) => setEditingInvoice({
                  ...editingInvoice,
                  terms: e.target.value
                })}
                disabled={!isEditing}
                placeholder="Payment terms and conditions..."
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                onClick={() => {
                  setEditingInvoice({ ...invoice });
                  setIsEditing(false);
                }}
                variant="outline"
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditableInvoice;