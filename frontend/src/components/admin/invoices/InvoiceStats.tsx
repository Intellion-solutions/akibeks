
import { Card, CardContent } from "@/components/ui/card";
import { FileText, DollarSign, Calendar } from "lucide-react";

interface InvoiceStatsProps {
  invoices: any[];
  currencySymbol: string;
}

const InvoiceStats = ({ invoices, currencySymbol }: InvoiceStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter(inv => inv.status === "paid").length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoices.filter(inv => inv.status === "pending").length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-blue-600">
                {currencySymbol} {invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0).toLocaleString()}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceStats;
