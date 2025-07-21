
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, MessageCircle } from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  created_at: string;
  clients?: {
    full_name: string;
    company_name?: string;
    phone: string;
    email?: string;
  };
}

interface AdminInvoiceTableProps {
  invoices: Invoice[];
  currencySymbol: string;
  onView: (invoiceId: string) => void;
  onEdit: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
  onSendWhatsApp: (invoiceId: string) => void;
  getStatusColor: (status: string) => string;
}

const AdminInvoiceTable = ({
  invoices,
  currencySymbol,
  onView,
  onEdit,
  onDelete,
  onSendWhatsApp,
  getStatusColor
}: AdminInvoiceTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">📋</span>
          Invoice Management Table
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {invoice.clients?.company_name || invoice.clients?.full_name}
                      </p>
                      {invoice.clients?.phone && (
                        <p className="text-sm text-gray-500">{invoice.clients.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(invoice.status) as any}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {currencySymbol} {Number(invoice.total_amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    {currencySymbol} {Number(invoice.paid_amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(invoice.id)}
                        title="View Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(invoice.id)}
                        title="Edit Invoice"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSendWhatsApp(invoice.id)}
                        className="text-green-600 hover:text-green-700"
                        title="Send WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(invoice.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminInvoiceTable;
