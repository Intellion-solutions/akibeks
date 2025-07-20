import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, X, Edit3, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import DatabaseClient from '@/lib/database-client';

interface QuotationItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface EditableQuotationProps {
  quotation: any;
  onSave: (updatedQuotation: any) => void;
  onCancel: () => void;
  clients: any[];
  projects: any[];
}

export const EditableQuotation: React.FC<EditableQuotationProps> = ({
  quotation,
  onSave,
  onCancel,
  clients,
  projects,
}) => {
  const [editingQuotation, setEditingQuotation] = useState({
    ...quotation,
    items: quotation.items || []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);

  // Calculate totals
  const calculateTotals = (items: QuotationItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = subtotal * (editingQuotation.tax_rate || 0) / 100;
    const discountAmount = editingQuotation.discount_amount || 0;
    const total = subtotal + taxAmount - discountAmount;

    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals(editingQuotation.items);

  // Update item in the list
  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const updatedItems = [...editingQuotation.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate amount if quantity or rate changed
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }

    setEditingQuotation({
      ...editingQuotation,
      items: updatedItems
    });
  };

  // Add new item
  const addItem = () => {
    setEditingQuotation({
      ...editingQuotation,
      items: [
        ...editingQuotation.items,
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
    const updatedItems = editingQuotation.items.filter((_, i) => i !== index);
    setEditingQuotation({
      ...editingQuotation,
      items: updatedItems
    });
  };

  // Save quotation
  const handleSave = async () => {
    try {
      setSaving(true);

      // Validation
      if (!editingQuotation.client_id) {
        toast.error('Please select a client');
        return;
      }

      if (!editingQuotation.quote_number) {
        toast.error('Quote number is required');
        return;
      }

      if (editingQuotation.items.length === 0) {
        toast.error('At least one item is required');
        return;
      }

      // Check for empty items
      const hasEmptyItems = editingQuotation.items.some(item => 
        !item.description.trim() || item.quantity <= 0 || item.rate < 0
      );

      if (hasEmptyItems) {
        toast.error('Please fill in all item details');
        return;
      }

      const updatedQuotation = {
        ...editingQuotation,
        amount: subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        items: editingQuotation.items
      };

      // Update in database
      await DatabaseClient.update('quotations', quotation.id, updatedQuotation);

      onSave(updatedQuotation);
      setIsEditing(false);
      toast.success('Quotation updated successfully');
    } catch (error) {
      console.error('Failed to save quotation:', error);
      toast.error('Failed to save quotation');
    } finally {
      setSaving(false);
    }
  };

  // Convert to invoice
  const convertToInvoice = async () => {
    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      const invoiceData = {
        invoice_number: invoiceNumber,
        client_id: editingQuotation.client_id,
        project_id: editingQuotation.project_id,
        amount: subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        items: editingQuotation.items,
        status: 'draft',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        notes: editingQuotation.notes,
        terms: editingQuotation.terms
      };

      // Create invoice
      await DatabaseClient.insert('invoices', invoiceData);

      // Update quotation status to accepted
      await DatabaseClient.update('quotations', quotation.id, {
        status: 'accepted',
        accepted_date: new Date().toISOString().split('T')[0]
      });

      toast.success('Quotation converted to invoice successfully');
      
      // Refresh the quotation data
      const updatedQuotation = {
        ...editingQuotation,
        status: 'accepted',
        accepted_date: new Date().toISOString().split('T')[0]
      };
      onSave(updatedQuotation);
    } catch (error) {
      console.error('Failed to convert quotation:', error);
      toast.error('Failed to convert quotation to invoice');
    }
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if quotation is expired
  const isExpired = editingQuotation.valid_until && 
    new Date(editingQuotation.valid_until) < new Date() && 
    editingQuotation.status !== 'accepted';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Quotation #{editingQuotation.quote_number}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isExpired && (
              <Badge variant="destructive">Expired</Badge>
            )}
            <Badge className={getStatusColor(editingQuotation.status)}>
              {editingQuotation.status}
            </Badge>
            {!isEditing && (
              <div className="flex gap-2">
                {editingQuotation.status === 'draft' && (
                  <Button onClick={convertToInvoice} variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Convert to Invoice
                  </Button>
                )}
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quotation Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Quote Number</label>
                <Input
                  value={editingQuotation.quote_number}
                  onChange={(e) => setEditingQuotation({
                    ...editingQuotation,
                    quote_number: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Client</label>
                <Select
                  value={editingQuotation.client_id}
                  onValueChange={(value) => setEditingQuotation({
                    ...editingQuotation,
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
                  value={editingQuotation.project_id || ''}
                  onValueChange={(value) => setEditingQuotation({
                    ...editingQuotation,
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
                  value={editingQuotation.status}
                  onValueChange={(value) => setEditingQuotation({
                    ...editingQuotation,
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
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Valid Until</label>
                <Input
                  type="date"
                  value={editingQuotation.valid_until ? new Date(editingQuotation.valid_until).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingQuotation({
                    ...editingQuotation,
                    valid_until: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Accepted Date</label>
                <Input
                  type="date"
                  value={editingQuotation.accepted_date ? new Date(editingQuotation.accepted_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingQuotation({
                    ...editingQuotation,
                    accepted_date: e.target.value || null
                  })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Quotation Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quotation Items</h3>
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
                {editingQuotation.items.map((item: QuotationItem, index: number) => (
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
                    value={editingQuotation.tax_rate || 0}
                    onChange={(e) => setEditingQuotation({
                      ...editingQuotation,
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
                    value={editingQuotation.discount_amount || 0}
                    onChange={(e) => setEditingQuotation({
                      ...editingQuotation,
                      discount_amount: parseFloat(e.target.value) || 0
                    })}
                    className="w-24 text-right"
                  />
                ) : (
                  <span>-${(editingQuotation.discount_amount || 0).toFixed(2)}</span>
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
                value={editingQuotation.notes || ''}
                onChange={(e) => setEditingQuotation({
                  ...editingQuotation,
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
                value={editingQuotation.terms || ''}
                onChange={(e) => setEditingQuotation({
                  ...editingQuotation,
                  terms: e.target.value
                })}
                disabled={!isEditing}
                placeholder="Terms and conditions..."
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                onClick={() => {
                  setEditingQuotation({ ...quotation });
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

export default EditableQuotation;