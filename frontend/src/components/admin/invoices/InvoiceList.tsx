
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MessageCircle, Trash2 } from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  created_at: string;
  notes?: string;
  payment_terms?: string;
  template_type?: string;
  letterhead_enabled?: boolean;
  clients?: {
    full_name: string;
    company_name?: string;
    phone: string;
    email?: string;
  };
}

interface InvoiceListProps {
  invoices: Invoice[];
  currencySymbol: string;
  handleViewInvoice: (invoiceId: string) => void;
  getStatusColor: (status: string) => string;
  onDeleteInvoice: (invoiceId: string) => void;
  onSendWhatsApp: (invoiceId: string) => void;
}

const InvoiceList = ({
  invoices,
  currencySymbol,
  handleViewInvoice,
  getStatusColor,
  onDeleteInvoice,
  onSendWhatsApp
}: InvoiceListProps) => {
  if (invoices.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-gray-500">No invoices found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {invoices.map((invoice) => (
        <Card key={invoice.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {invoice.invoice_number}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {invoice.clients?.company_name || invoice.clients?.full_name}
                </p>
              </div>
              <Badge variant={getStatusColor(invoice.status) as any}>
                {invoice.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-semibold">{currencySymbol} {invoice.total_amount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid</p>
                <p className="font-semibold text-green-600">{currencySymbol} {invoice.paid_amount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-semibold">
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-semibold">
                  {new Date(invoice.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewInvoice(invoice.id)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSendWhatsApp(invoice.id)}
                className="text-green-600 hover:text-green-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteInvoice(invoice.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InvoiceList;
