
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newInvoice: any;
  setNewInvoice: (invoice: any) => void;
  clients: any[];
  templates: any[];
  onCreateInvoice: () => void;
  addInvoiceItem: () => void;
  removeInvoiceItem: (index: number) => void;
  updateInvoiceItem: (index: number, field: string, value: any) => void;
  getSubtotal: () => number;
  getSectionSubtotal: (section: string) => number;
  getSectionLaborCharge: (section: string, laborPercentage?: number) => number;
  getTotalLaborCharges: () => number;
  getTotalAmount: () => number;
  currencySymbol: string;
  includeLaborInSubtotal: boolean;
  setIncludeLaborInSubtotal: (include: boolean) => void;
}

const CreateInvoiceDialog: React.FC<CreateInvoiceDialogProps> = ({
  open,
  onOpenChange,
  newInvoice,
  setNewInvoice,
  clients,
  templates,
  onCreateInvoice,
  addInvoiceItem,
  removeInvoiceItem,
  updateInvoiceItem,
  getSubtotal,
  getSectionSubtotal,
  getSectionLaborCharge,
  getTotalLaborCharges,
  getTotalAmount,
  currencySymbol,
  includeLaborInSubtotal,
  setIncludeLaborInSubtotal
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateInvoice();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select
                value={newInvoice.clientId}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, clientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
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

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newInvoice.dueDate}
                onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Select
                value={newInvoice.paymentTerms}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, paymentTerms: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template Type</Label>
              <Select
                value={newInvoice.templateType}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, templateType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={newInvoice.taxRate}
                onChange={(e) => setNewInvoice({ ...newInvoice, taxRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={newInvoice.letterheadEnabled}
              onCheckedChange={(checked) => setNewInvoice({ ...newInvoice, letterheadEnabled: checked })}
            />
            <Label>Enable Letterhead</Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              <Button type="button" onClick={addInvoiceItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {newInvoice.items.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                <div className="col-span-4">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Section</Label>
                  <Select
                    value={item.section}
                    onValueChange={(value) => updateInvoiceItem(index, 'section', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Materials">Materials</SelectItem>
                      <SelectItem value="Labor">Labor</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-1">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Material Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.material_cost}
                    onChange={(e) => updateInvoiceItem(index, 'material_cost', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Labor %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={item.labor_percentage}
                    onChange={(e) => updateInvoiceItem(index, 'labor_percentage', parseFloat(e.target.value) || 36.5)}
                  />
                </div>
                
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeInvoiceItem(index)}
                    disabled={newInvoice.items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={newInvoice.discountAmount}
                onChange={(e) => setNewInvoice({ ...newInvoice, discountAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={includeLaborInSubtotal}
                onCheckedChange={setIncludeLaborInSubtotal}
              />
              <Label>Include Labor in Subtotal</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={newInvoice.notes}
              onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
              placeholder="Additional notes or terms..."
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Material Cost:</span>
              <span>{currencySymbol} {getSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Labor Charges:</span>
              <span>{currencySymbol} {getTotalLaborCharges().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{currencySymbol} {(includeLaborInSubtotal ? getSubtotal() + getTotalLaborCharges() : getSubtotal()).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({newInvoice.taxRate}%):</span>
              <span>{currencySymbol} {((includeLaborInSubtotal ? getSubtotal() + getTotalLaborCharges() : getSubtotal()) * (newInvoice.taxRate / 100)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-{currencySymbol} {newInvoice.discountAmount.toLocaleString()}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{currencySymbol} {getTotalAmount().toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
