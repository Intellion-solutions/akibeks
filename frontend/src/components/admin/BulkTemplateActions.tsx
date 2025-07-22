
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Copy, Trash2, CheckSquare, Square, FileDown, X } from "lucide-react";
import { supabase } from "@/lib/db-client";

interface Template {
  id: string;
  template_id: string;
  template_name: string;
  grand_total: number;
  created_at: string;
}

interface BulkTemplateActionsProps {
  templates: Template[];
  selectedTemplates: string[];
  onSelectionChange: (selected: string[]) => void;
  onActionComplete: () => void;
}

const BulkTemplateActions = ({ 
  templates, 
  selectedTemplates, 
  onSelectionChange, 
  onActionComplete 
}: BulkTemplateActionsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isAllSelected = templates.length > 0 && selectedTemplates.length === templates.length;
  const isPartiallySelected = selectedTemplates.length > 0 && selectedTemplates.length < templates.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(templates.map(t => t.template_id));
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    if (selectedTemplates.includes(templateId)) {
      onSelectionChange(selectedTemplates.filter(id => id !== templateId));
    } else {
      onSelectionChange([...selectedTemplates, templateId]);
    }
  };

  const bulkDuplicate = async () => {
    if (selectedTemplates.length === 0) return;

    setLoading(true);
    try {
      for (const templateId of selectedTemplates) {
        const template = templates.find(t => t.template_id === templateId);
        if (!template) continue;

        // Get template details
        const { data: templateSettings } = await supabase
          .from('template_settings')
          .select('*')
          .eq('template_id', templateId)
          .single();

        const { data: templateItems } = await supabase
          .from('template_items')
          .select('*')
          .eq('template_id', templateId);

        if (!templateSettings) continue;

        const newTemplateId = 'TPL' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3);

        // Create duplicate template settings
        await supabase
          .from('template_settings')
          .insert([{
            template_id: newTemplateId,
            template_name: `${templateSettings.template_name} (Copy)`,
            material_cost: templateSettings.material_cost,
            labor_charge: templateSettings.labor_charge,
            tax_amount: templateSettings.tax_amount,
            grand_total: templateSettings.grand_total,
            terms_conditions: templateSettings.terms_conditions,
            notes: templateSettings.notes
          }]);

        // Create duplicate template items
        if (templateItems && templateItems.length > 0) {
          const itemsToInsert = templateItems.map(item => ({
            template_id: newTemplateId,
            item_number: item.item_number,
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.amount
          }));

          await supabase
            .from('template_items')
            .insert(itemsToInsert);
        }
      }

      toast({
        title: "Templates Duplicated",
        description: `Successfully duplicated ${selectedTemplates.length} template(s).`,
      });
      
      onSelectionChange([]);
      onActionComplete();
    } catch (error) {
      console.error('Error duplicating templates:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedTemplates.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedTemplates.length} template(s)? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      // Delete template items first
      for (const templateId of selectedTemplates) {
        await supabase
          .from('template_items')
          .delete()
          .eq('template_id', templateId);

        await supabase
          .from('template_settings')
          .delete()
          .eq('template_id', templateId);
      }

      toast({
        title: "Templates Deleted",
        description: `Successfully deleted ${selectedTemplates.length} template(s).`,
      });
      
      onSelectionChange([]);
      onActionComplete();
    } catch (error) {
      console.error('Error deleting templates:', error);
      toast({
        title: "Error",
        description: "Failed to delete templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportTemplates = async (format: string) => {
    if (selectedTemplates.length === 0) return;

    setLoading(true);
    try {
      const templatesData = [];
      
      for (const templateId of selectedTemplates) {
        const { data: templateSettings } = await supabase
          .from('template_settings')
          .select('*')
          .eq('template_id', templateId)
          .single();

        const { data: templateItems } = await supabase
          .from('template_items')
          .select('*')
          .eq('template_id', templateId);

        if (templateSettings) {
          templatesData.push({
            ...templateSettings,
            items: templateItems || []
          });
        }
      }

      if (format === 'json') {
        const dataStr = JSON.stringify(templatesData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `templates_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const csvHeaders = 'Template ID,Template Name,Material Cost,Labor Charge,Tax Amount,Grand Total,Created At\n';
        const csvData = templatesData.map(t => 
          `${t.template_id},"${t.template_name}",${t.material_cost},${t.labor_charge},${t.tax_amount},${t.grand_total},${t.created_at}`
        ).join('\n');
        
        const dataBlob = new Blob([csvHeaders + csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `templates_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Successful",
        description: `Exported ${selectedTemplates.length} template(s) as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error exporting templates:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (templates.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                ref={(el) => {
                  if (el && el instanceof HTMLInputElement) {
                    el.indeterminate = isPartiallySelected;
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                Select All ({templates.length})
              </span>
            </div>
            
            {selectedTemplates.length > 0 && (
              <Badge variant="secondary">
                {selectedTemplates.length} selected
              </Badge>
            )}
          </div>

          {selectedTemplates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={bulkDuplicate}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate ({selectedTemplates.length})
              </Button>
              
              <Select onValueChange={(value) => exportTemplates(value)}>
                <SelectTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">Export as JSON</SelectItem>
                  <SelectItem value="csv">Export as CSV</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={bulkDelete}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedTemplates.length})
              </Button>
            </div>
          )}
        </div>

        {/* Individual template selection */}
        {selectedTemplates.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {templates
                .filter(t => selectedTemplates.includes(t.template_id))
                .map(template => (
                  <Badge 
                    key={template.template_id} 
                    variant="outline" 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSelectTemplate(template.template_id)}
                  >
                    {template.template_name}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkTemplateActions;
