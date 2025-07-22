
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InvoiceItem {
  description: string;
  quantity: number;
  material_cost: number;
  section: string;
  labor_charge?: number;
  labor_percentage?: number;
}

interface InvoiceTableViewProps {
  items: InvoiceItem[];
  currencySymbol: string;
  getSectionSubtotal: (section: string) => number;
  getSectionLaborCharge: (section: string, laborPercentage?: number) => number;
}

const InvoiceTableView = ({ 
  items, 
  currencySymbol, 
  getSectionSubtotal, 
  getSectionLaborCharge 
}: InvoiceTableViewProps) => {
  const sections = Array.from(new Set(items.map(item => item.section)));

  return (
    <div className="space-y-6">
      {sections.map((sectionName: string) => {
        const sectionItems = items.filter(item => item.section === sectionName);
        const sectionSubtotal = getSectionSubtotal(sectionName);
        const sectionLaborCharge = getSectionLaborCharge(sectionName);
        
        return (
          <Card key={sectionName} className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg font-bold text-blue-800 flex items-center">
                <span className="mr-3">📋</span>
                {sectionName}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center w-24">Qty</TableHead>
                    <TableHead className="text-right w-32">Unit Price</TableHead>
                    <TableHead className="text-right w-32">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectionItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-gray-500">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {currencySymbol} {item.material_cost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {currencySymbol} {(item.material_cost * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Section Subtotal Row */}
                  <TableRow className="bg-gray-50 font-medium">
                    <TableCell colSpan={4} className="text-right">
                      Section Subtotal:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {currencySymbol} {sectionSubtotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  
                  {/* Labor Charge Row */}
                  <TableRow className="bg-blue-50 font-medium">
                    <TableCell colSpan={4} className="text-right text-blue-800">
                      Labor Charge (36%):
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-800">
                      {currencySymbol} {sectionLaborCharge.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  
                  {/* Section Total Row */}
                  <TableRow className="bg-blue-100 font-bold border-t-2 border-blue-300">
                    <TableCell colSpan={4} className="text-right text-blue-900">
                      Section Total:
                    </TableCell>
                    <TableCell className="text-right text-blue-900 text-lg">
                      {currencySymbol} {(sectionSubtotal + sectionLaborCharge).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InvoiceTableView;
