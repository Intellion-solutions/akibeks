import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit2, Save, X, Trash2 } from "lucide-react";
import InvoiceTableView from "./InvoiceTableView";

interface InvoiceItem {
  description: string;
  quantity: number;
  material_cost: number;
  section: string;
  labor_charge?: number;
  labor_percentage?: number;
}

interface InvoiceSectionManagerProps {
  items: InvoiceItem[];
  updateInvoiceItem: (index: number, field: string, value: any) => void;
  addInvoiceItem: () => void;
  removeInvoiceItem: (index: number) => void;
  getSectionSubtotal: (section: string) => number;
  getSectionLaborCharge: (section: string, laborPercentage?: number) => number;
  currencySymbol: string;
  includeLaborInSubtotal: boolean;
  setIncludeLaborInSubtotal: (include: boolean) => void;
}

const InvoiceSectionManager = ({
  items,
  updateInvoiceItem,
  addInvoiceItem,
  removeInvoiceItem,
  getSectionSubtotal,
  getSectionLaborCharge,
  currencySymbol,
  includeLaborInSubtotal,
  setIncludeLaborInSubtotal
}: InvoiceSectionManagerProps) => {
  const [editingSectionName, setEditingSectionName] = useState<string | null>(null);
  const [tempSectionName, setTempSectionName] = useState("");
  const [showTableView, setShowTableView] = useState(true);

  const sections = Array.from(new Set(items.map(item => item.section)));

  const handleEditSectionName = (sectionName: string) => {
    setEditingSectionName(sectionName);
    setTempSectionName(sectionName);
  };

  const handleSaveSectionName = (oldSectionName: string) => {
    if (tempSectionName.trim() && tempSectionName !== oldSectionName) {
      items.forEach((item, index) => {
        if (item.section === oldSectionName) {
          updateInvoiceItem(index, "section", tempSectionName.trim());
        }
      });
    }
    setEditingSectionName(null);
    setTempSectionName("");
  };

  const handleCancelEdit = () => {
    setEditingSectionName(null);
    setTempSectionName("");
  };

  const addItemToSection = (sectionName: string) => {
    addInvoiceItem();
    setTimeout(() => {
      updateInvoiceItem(items.length, "section", sectionName);
    }, 0);
  };

  const addNewSection = () => {
    const newSectionName = `New Section ${sections.length + 1}`;
    addInvoiceItem();
    setTimeout(() => {
      updateInvoiceItem(items.length, "section", newSectionName);
    }, 0);
  };

  const handleLaborChargeUpdate = (globalIndex: number, newLaborCharge: number) => {
    const item = items[globalIndex];
    const materialCost = item.material_cost * item.quantity;
    const newPercentage = materialCost > 0 ? (newLaborCharge / materialCost) * 100 : 0;
    
    updateInvoiceItem(globalIndex, "labor_charge", newLaborCharge);
    updateInvoiceItem(globalIndex, "labor_percentage", newPercentage);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Invoice Items</Label>
        <div className="flex gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="table-view"
              checked={showTableView}
              onCheckedChange={setShowTableView}
            />
            <Label htmlFor="table-view" className="text-sm">
              Table View
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="include-labor"
              checked={includeLaborInSubtotal}
              onCheckedChange={setIncludeLaborInSubtotal}
            />
            <Label htmlFor="include-labor" className="text-sm">
              Include Labor in Subtotal
            </Label>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addNewSection}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {showTableView ? (
        <InvoiceTableView
          items={items}
          currencySymbol={currencySymbol}
          getSectionSubtotal={getSectionSubtotal}
          getSectionLaborCharge={getSectionLaborCharge}
        />
      ) : (
        <div className="space-y-6">
          {sections.map((sectionName: string) => {
            const sectionItems = items.filter(item => item.section === sectionName);
            const sectionSubtotal = getSectionSubtotal(sectionName);
            const sectionLaborCharge = getSectionLaborCharge(sectionName);
            
            return (
              <Card key={sectionName} className="p-4 border-2 border-blue-200">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    {editingSectionName === sectionName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={tempSectionName}
                          onChange={(e) => setTempSectionName(e.target.value)}
                          className="text-lg font-bold text-blue-800"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveSectionName(sectionName)}
                        />
                        <Button size="sm" variant="ghost" onClick={() => handleSaveSectionName(sectionName)}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-blue-800">{sectionName}</h3>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditSectionName(sectionName)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addItemToSection(sectionName)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {sectionItems.map((item: InvoiceItem, sectionIndex: number) => {
                    const globalIndex = items.findIndex(i => i === item);
                    const materialCost = item.material_cost * item.quantity;
                    const laborCharge = item.labor_charge || (materialCost * ((item.labor_percentage || 36) / 100));
                    const laborPercentage = materialCost > 0 ? (laborCharge / materialCost) * 100 : 0;
                    
                    return (
                      <div key={globalIndex} className="grid grid-cols-14 gap-3 items-end bg-gray-50 p-3 rounded">
                        <div className="col-span-3">
                          <Label htmlFor={`item-desc-${globalIndex}`}>Description</Label>
                          <Input
                            id={`item-desc-${globalIndex}`}
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(globalIndex, "description", e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`item-qty-${globalIndex}`}>Quantity</Label>
                          <Input
                            id={`item-qty-${globalIndex}`}
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(globalIndex, "quantity", parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`item-material-${globalIndex}`}>Unit Price ({currencySymbol})</Label>
                          <Input
                            id={`item-material-${globalIndex}`}
                            type="number"
                            value={item.material_cost}
                            onChange={(e) => updateInvoiceItem(globalIndex, "material_cost", parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Material Amount ({currencySymbol})</Label>
                          <Input 
                            value={materialCost.toFixed(2)} 
                            readOnly 
                            className="bg-gray-100 font-medium"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`labor-charge-${globalIndex}`}>Labor Charge ({currencySymbol})</Label>
                          <Input
                            id={`labor-charge-${globalIndex}`}
                            type="number"
                            value={laborCharge.toFixed(2)}
                            onChange={(e) => handleLaborChargeUpdate(globalIndex, parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="bg-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Labor % ({laborPercentage.toFixed(1)}%)</Label>
                          <Input 
                            value={`${laborPercentage.toFixed(1)}%`}
                            readOnly 
                            className="bg-gray-100 font-medium text-center"
                          />
                        </div>
                        <div className="col-span-1 flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeInvoiceItem(globalIndex)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Section Summary */}
                <div className="mt-4 pt-4 border-t bg-blue-50 p-3 rounded">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Material Subtotal:</span>
                      <p className="font-bold text-lg">{currencySymbol} {sectionSubtotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Labor Charge:</span>
                      <p className="font-bold text-lg text-blue-600">{currencySymbol} {sectionLaborCharge.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Section Total:</span>
                      <p className="font-bold text-xl text-blue-800">
                        {currencySymbol} {(includeLaborInSubtotal ? sectionSubtotal + sectionLaborCharge : sectionSubtotal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvoiceSectionManager;
