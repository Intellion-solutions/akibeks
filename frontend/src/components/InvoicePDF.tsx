
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Logo from './Logo';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  material_cost: number;
  labor_percentage: number;
  labor_charge: number;
  total_price: number;
  section?: string;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  client_name: string;
  client_address: string;
  client_phone?: string;
  client_email?: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount?: number;
  total_amount: number;
  notes?: string;
  payment_terms?: string;
  template_type?: string;
  letterhead_enabled?: boolean;
}

interface CompanyInfo {
  company_name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  tax_id?: string;
}

interface InvoicePDFProps {
  invoice: InvoiceData;
  company: CompanyInfo;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, company }) => {
  // Group items by section
  const groupedItems = invoice.items.reduce((acc, item) => {
    const section = item.section || 'General';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, InvoiceItem[]>);

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculate section totals
  const calculateSectionSubtotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + item.material_cost * item.quantity, 0);
  };

  const calculateSectionLaborCharge = (sectionSubtotal: number, laborPercentage: number = 36) => {
    return sectionSubtotal * (laborPercentage / 100);
  };

  // Get template colors based on template type
  const getTemplateColors = () => {
    switch (invoice.template_type) {
      case 'modern':
        return {
          primary: '#059669',
          secondary: '#047857',
          accent: '#10b981',
          gradient: 'from-emerald-600 to-emerald-700'
        };
      case 'classic':
        return {
          primary: '#dc2626',
          secondary: '#b91c1c',
          accent: '#ef4444',
          gradient: 'from-red-600 to-red-700'
        };
      default:
        return {
          primary: '#2563eb',
          secondary: '#1e40af',
          accent: '#3b82f6',
          gradient: 'from-blue-600 to-blue-700'
        };
    }
  };

  const colors = getTemplateColors();

  return (
    <div className="max-w-4xl mx-auto bg-white print:shadow-none shadow-2xl">
      {/* Enhanced Professional Letterhead */}
      {invoice.letterhead_enabled && (
        <div className={`bg-gradient-to-r ${colors.gradient} text-white p-12 print:p-8`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div className="bg-white p-8 rounded-xl shadow-2xl min-w-[120px] min-h-[120px] flex items-center justify-center">
                <Logo size="lg" variant="default" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-wide mb-2">{company.company_name}</h1>
                <p className="text-blue-100 text-xl">Professional Engineering Solutions</p>
                <div className="mt-4 text-blue-100 space-y-1">
                  <p className="text-sm">{company.address}</p>
                  <p className="text-sm">{company.phone} | {company.email}</p>
                  {company.website && <p className="text-sm">{company.website}</p>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-20 p-6 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-blue-100">Invoice Number</p>
                <p className="text-3xl font-bold">{invoice.invoice_number}</p>
                <p className="text-sm text-blue-100 mt-2">{formatDate(invoice.issue_date)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 print:p-6">
        {/* Header without letterhead */}
        {!invoice.letterhead_enabled && (
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <div className="mb-6 min-w-[100px] min-h-[100px] flex items-center">
                <Logo size="lg" variant="default" />
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900 text-lg">{company.company_name}</p>
                <p>{company.address}</p>
                <p>{company.phone}</p>
                <p>{company.email}</p>
                {company.website && <p>{company.website}</p>}
                {company.tax_id && <p>Tax ID: {company.tax_id}</p>}
              </div>
            </div>
            
            <div className="text-right">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">INVOICE</h1>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="text-2xl font-bold text-blue-600">{invoice.invoice_number}</p>
                <p className="text-sm text-gray-600 mt-2">{formatDate(invoice.issue_date)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Client Information */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 rounded-t-lg`}>
              <h3 className="font-bold text-lg">Bill To</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-lg space-y-1">
              <p className="font-medium text-gray-900">{invoice.client_name}</p>
              <p className="text-gray-700">{invoice.client_address}</p>
              {invoice.client_phone && <p className="text-gray-700">{invoice.client_phone}</p>}
              {invoice.client_email && <p className="text-gray-700">{invoice.client_email}</p>}
            </div>
          </div>
          
          <div>
            <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 rounded-t-lg`}>
              <h3 className="font-bold text-lg">Invoice Details</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Issue Date:</span>
                <span className="font-medium">{formatDate(invoice.issue_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium text-red-600">{formatDate(invoice.due_date)}</span>
              </div>
              {invoice.payment_terms && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Terms:</span>
                  <span className="font-medium">{invoice.payment_terms}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items by Section - Fixed Row Layout */}
        <div className="mb-8">
          {Object.entries(groupedItems).map(([sectionName, sectionItems], sectionIndex) => {
            const sectionSubtotal = calculateSectionSubtotal(sectionItems);
            const sectionLaborCharge = calculateSectionLaborCharge(sectionSubtotal);

            return (
              <div key={sectionName} className={`${sectionIndex > 0 ? 'mt-8 print:break-before-page' : ''}`}>
                <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 rounded-t-lg shadow-lg`}>
                  <h3 className="font-bold text-xl flex items-center">
                    <span className="mr-3">📋</span>
                    {sectionName}
                  </h3>
                </div>
                
                <div className="border border-t-0 rounded-b-lg overflow-hidden shadow-lg">
                  {/* Table Header */}
                  <div className="bg-gray-100 px-4 py-3">
                    <div className="grid grid-cols-12 gap-4 font-medium text-gray-700 text-sm">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-5">Description</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-2 text-center">Unit Price</div>
                      <div className="col-span-2 text-right">Amount</div>
                    </div>
                  </div>
                  
                  {/* Table Body - Each item in a row */}
                  <div className="bg-white">
                    {sectionItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                        <div className="col-span-1 text-center text-gray-500 font-medium">
                          {index + 1}
                        </div>
                        <div className="col-span-5">
                          <p className="font-medium text-gray-900">{item.description}</p>
                        </div>
                        <div className="col-span-2 text-center text-gray-700 font-medium">
                          {item.quantity}
                        </div>
                        <div className="col-span-2 text-center text-gray-700">
                          {formatCurrency(item.material_cost)}
                        </div>
                        <div className="col-span-2 text-right font-medium text-gray-900">
                          {formatCurrency(item.material_cost * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Section Totals */}
                  <div className="bg-gray-50 border-t-2 border-gray-200 px-4 py-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-8"></div>
                        <div className="col-span-2 text-right font-medium text-gray-700">Section Subtotal:</div>
                        <div className="col-span-2 text-right font-bold text-lg">{formatCurrency(sectionSubtotal)}</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-8"></div>
                        <div className="col-span-2 text-right font-medium text-gray-700">Labor Charge (36%):</div>
                        <div className="col-span-2 text-right font-bold text-lg text-blue-600">{formatCurrency(sectionLaborCharge)}</div>
                      </div>
                      <div className={`bg-gradient-to-r ${colors.gradient} text-white p-3 rounded-lg`}>
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-8"></div>
                          <div className="col-span-2 text-right font-bold">Section Total:</div>
                          <div className="col-span-2 text-right font-bold text-xl">{formatCurrency(sectionSubtotal + sectionLaborCharge)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-96">
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <div className="space-y-3">
                <div className="flex justify-between py-2 text-lg">
                  <span className="text-gray-600">SUBTOTAL:</span>
                  <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                </div>
                
                <div className="flex justify-between py-2 text-lg">
                  <span className="text-gray-600">Tax VAT {invoice.tax_rate}%:</span>
                  <span className="font-semibold">{formatCurrency(invoice.tax_amount)}</span>
                </div>
                
                {invoice.discount_amount && invoice.discount_amount > 0 && (
                  <div className="flex justify-between py-2 text-lg">
                    <span className="text-gray-600">DISCOUNT:</span>
                    <span className="font-semibold text-green-600">-{formatCurrency(invoice.discount_amount)}</span>
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 rounded-lg shadow-lg`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">TOTAL DUE:</span>
                    <span className="text-3xl font-bold">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 text-center mt-2">
                  Tax Inclusive Amount
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center">
              <span className="mr-2">📝</span> Special Notes:
            </h4>
            <p className="text-amber-700 leading-relaxed">{invoice.notes}</p>
          </div>
        )}

        {/* Professional Thank You */}
        <div className="text-center mb-8 py-8">
          <div className={`bg-gradient-to-r ${colors.gradient} text-white p-6 rounded-lg shadow-lg`}>
            <h3 className="text-2xl font-bold mb-2">Thank you for your Business!</h3>
            <p className="text-blue-100">We appreciate the opportunity to serve you</p>
            <div className="w-32 h-0.5 bg-white mx-auto mt-4 opacity-50"></div>
          </div>
        </div>

        {/* Enhanced Footer with Dealers */}
        <div className="grid grid-cols-3 gap-8 text-sm bg-gray-50 p-6 rounded-lg mb-6">
          <div>
            <h4 className={`font-bold mb-3 text-[${colors.primary}]`}>Questions?</h4>
            <div className="space-y-1 text-gray-700">
              <p>📧 Email: {company.email}</p>
              <p>📞 Call: {company.phone}</p>
              {company.website && <p>🌐 Web: {company.website}</p>}
            </div>
          </div>
          
          <div>
            <h4 className={`font-bold mb-3 text-[${colors.primary}]`}>Payment Information:</h4>
            <div className="space-y-1 text-gray-700">
              <p><strong>Account:</strong> 123 567 890</p>
              <p><strong>A/C Name:</strong> {company.company_name}</p>
              <p><strong>Bank:</strong> Equity Bank Kenya</p>
              <p><strong>Branch:</strong> Nairobi CBD</p>
            </div>
          </div>
          
          <div>
            <h4 className={`font-bold mb-3 text-[${colors.primary}]`}>Terms & Conditions:</h4>
            <p className="text-xs leading-relaxed text-gray-700">
              {invoice.payment_terms || "Payment is due within 30 days of invoice date. Late payments may incur additional charges. All work is guaranteed for 12 months from completion date."}
            </p>
          </div>
        </div>

        {/* Dealers Section */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg shadow-inner mb-6">
          <h4 className={`font-bold text-center mb-4 text-[${colors.primary}] text-lg`}>Our Trusted Partners & Dealers</h4>
          <div className="grid grid-cols-4 gap-4 text-xs text-gray-600">
            <div className="text-center">
              <p className="font-semibold">Building Materials</p>
              <p>Bamburi Cement Ltd</p>
              <p>East African Portland</p>
              <p>Devki Steel Mills</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Electrical Supplies</p>
              <p>General Electric Kenya</p>
              <p>Schneider Electric</p>
              <p>Siemens Kenya</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Plumbing & Hardware</p>
              <p>Mabati Rolling Mills</p>
              <p>Basco Products Kenya</p>
              <p>Polyoak Packaging</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Finishing Materials</p>
              <p>Crown Paints Kenya</p>
              <p>Galaxy Paints</p>
              <p>Tile & Carpet Centre</p>
            </div>
          </div>
        </div>

        {/* System Generated Footer - Moved to very bottom */}
        <div className="text-center border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">
            This invoice was automatically generated by {company.company_name} Invoice Management System on {new Date().toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            📄 <strong>SYSTEM GENERATED INVOICE</strong> - For any queries regarding this invoice, please contact us using the information provided above.
          </p>
        </div>

        {/* Watermark for Draft */}
        {invoice.notes?.toLowerCase().includes('draft') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-6xl font-bold text-gray-200 transform rotate-45 opacity-20">
              DRAFT
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePDF;
