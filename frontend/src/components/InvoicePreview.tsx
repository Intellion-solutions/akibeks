
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  Printer, 
  Send, 
  Edit, 
  Trash2, 
  Eye, 
  MessageSquare,
  Calculator,
  FileText,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoicePreviewProps {
  invoice: any;
  onEdit: () => void;
  onDelete: () => void;
  onSend: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  onEdit, 
  onDelete, 
  onSend 
}) => {
  const { toast } = useToast();
  const [includeLaborInSubtotal, setIncludeLaborInSubtotal] = React.useState(true);
  const [customLaborCharge, setCustomLaborCharge] = React.useState(invoice.labor_charge || 0);
  const [laborPercentage, setLaborPercentage] = React.useState(36.5);

  // Calculate totals
  const materialCost = invoice.items?.reduce((sum: number, item: any) => 
    sum + (item.material_cost * item.quantity), 0) || 0;
  
  const calculatedLaborCharge = includeLaborInSubtotal 
    ? materialCost * (laborPercentage / 100)
    : customLaborCharge;
  
  const subtotal = includeLaborInSubtotal 
    ? materialCost + calculatedLaborCharge
    : materialCost;
  
  const taxAmount = subtotal * (invoice.tax_rate / 100);
  const grandTotal = subtotal + taxAmount - (invoice.discount_amount || 0);

  const handleLaborChargeChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomLaborCharge(numValue);
    // Calculate percentage based on material cost
    if (materialCost > 0) {
      setLaborPercentage((numValue / materialCost) * 100);
    }
  };

  const handleSendWhatsApp = () => {
    const clientPhone = invoice.client_phone || "+254700000000";
    const message = `Hello! Your invoice ${invoice.invoice_number} for ${invoice.client_name} is ready. Total amount: KSh ${grandTotal.toLocaleString()}. Please review and let us know if you have any questions.`;
    const whatsappUrl = `https://wa.me/${clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onSend();
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Started",
      description: "Invoice is being prepared for printing",
    });
  };

  const handleDownload = () => {
    // Simulate PDF download
    toast({
      title: "Download Started",
      description: "Invoice PDF will be downloaded shortly",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.invoice_number}`,
        text: `Invoice for ${invoice.client_name} - Total: KSh ${grandTotal.toLocaleString()}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Invoice link copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleShare} variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSendWhatsApp} size="sm" className="bg-green-600 hover:bg-green-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send WhatsApp
          </Button>
          <Button onClick={onDelete} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Invoice Preview */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold">INVOICE</CardTitle>
              <p className="text-blue-100">#{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2">
                {invoice.status || 'Draft'}
              </Badge>
              <p className="text-sm text-blue-100">
                Date: {new Date(invoice.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Client & Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-3">Bill To:</h3>
              <div className="space-y-1">
                <p className="font-semibold">{invoice.client_name}</p>
                <p className="text-gray-600">{invoice.client_address}</p>
                <p className="text-gray-600">{invoice.client_phone}</p>
                <p className="text-gray-600">{invoice.client_email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">From:</h3>
              <div className="space-y-1">
                <p className="font-semibold">AKIBEKS Engineering Solutions</p>
                <p className="text-gray-600">Nairobi, Kenya</p>
                <p className="text-gray-600">+254 710 245 118</p>
                <p className="text-gray-600">info@akibeks.co.ke</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-2">Description</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="text-center py-3">{item.quantity}</td>
                      <td className="text-right py-3">
                        KSh {item.material_cost?.toLocaleString()}
                      </td>
                      <td className="text-right py-3">
                        KSh {(item.material_cost * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Labor Charge Settings */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4 flex items-center">
                <Calculator className="w-4 h-4 mr-2" />
                Labor Charge Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-labor">Include in Subtotal</Label>
                  <Switch 
                    id="include-labor"
                    checked={includeLaborInSubtotal}
                    onCheckedChange={setIncludeLaborInSubtotal}
                  />
                </div>
                
                {!includeLaborInSubtotal && (
                  <div>
                    <Label htmlFor="custom-labor">Custom Labor Charge</Label>
                    <Input
                      id="custom-labor"
                      type="number"
                      value={customLaborCharge}
                      onChange={(e) => handleLaborChargeChange(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  Current percentage: {laborPercentage.toFixed(2)}%
                </div>
              </div>
            </Card>

            {/* Totals */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Material Cost:</span>
                <span>KSh {materialCost.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Labor Charge ({laborPercentage.toFixed(1)}%):</span>
                <span>KSh {calculatedLaborCharge.toLocaleString()}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Subtotal:</span>
                <span>KSh {subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tax VAT ({invoice.tax_rate}%):</span>
                <span>KSh {taxAmount.toLocaleString()}</span>
              </div>
              
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-KSh {invoice.discount_amount.toLocaleString()}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg">
                <span>Grand Total:</span>
                <span>KSh {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Notes
              </h4>
              <p className="text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Terms */}
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              Payment Terms: {invoice.payment_terms || 'Net 30 days'}
            </p>
            <p className="text-sm mt-2">
              Thank you for your business!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicePreview;
