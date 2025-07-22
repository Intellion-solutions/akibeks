import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Logo from './Logo';

interface QuotationItem {
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

interface QuotationData {
  id: string;
  quote_number: string;
  client_name: string;
  client_address: string;
  client_phone?: string;
  client_email?: string;
  issue_date: string;
  valid_until: string;
  items: QuotationItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount?: number;
  total_amount: number;
  notes?: string;
  terms?: string;
  project_description?: string;
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

interface QuotationPDFProps {
  quotation: QuotationData;
  company: CompanyInfo;
}

const QuotationPDF: React.FC<QuotationPDFProps> = ({ quotation, company }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Group items by section if available
  const groupedItems = quotation.items.reduce((acc, item) => {
    const section = item.section || 'General';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, QuotationItem[]>);

  const getTemplateColors = () => {
    switch (quotation.template_type) {
      case 'modern':
        return {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#34d399',
          gradient: 'from-green-600 to-green-700'
        };
      case 'classic':
        return {
          primary: '#6366f1',
          secondary: '#4f46e5',
          accent: '#818cf8',
          gradient: 'from-indigo-600 to-indigo-700'
        };
      case 'corporate':
        return {
          primary: '#f59e0b',
          secondary: '#d97706',
          accent: '#fbbf24',
          gradient: 'from-amber-600 to-amber-700'
        };
      case 'minimal':
        return {
          primary: '#6b7280',
          secondary: '#4b5563',
          accent: '#9ca3af',
          gradient: 'from-gray-600 to-gray-700'
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

  const getValidityStatus = () => {
    const validUntil = new Date(quotation.valid_until);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', text: 'EXPIRED' };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'expiring', color: 'text-orange-600', text: `Expires in ${daysUntilExpiry} days` };
    } else {
      return { status: 'valid', color: 'text-green-600', text: `Valid for ${daysUntilExpiry} days` };
    }
  };

  const validityStatus = getValidityStatus();

  return (
    <div className="max-w-4xl mx-auto bg-white print:shadow-none shadow-2xl">
      {/* Enhanced Professional Letterhead */}
      {quotation.letterhead_enabled && (
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
                <p className="text-sm text-blue-100">Quotation Number</p>
                <p className="text-3xl font-bold">{quotation.quote_number}</p>
                <p className="text-sm text-blue-100 mt-2">{formatDate(quotation.issue_date)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 print:p-6">
        {/* Header without letterhead */}
        {!quotation.letterhead_enabled && (
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
              <h1 className="text-5xl font-bold text-gray-900 mb-4">QUOTATION</h1>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600">Quote Number</p>
                <p className="text-2xl font-bold text-blue-600">{quotation.quote_number}</p>
                <p className="text-sm text-gray-600 mt-2">{formatDate(quotation.issue_date)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Client Information and Quote Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 rounded-t-lg`}>
              <h3 className="font-bold text-lg">Quote For</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-lg space-y-1">
              <p className="font-medium text-gray-900">{quotation.client_name}</p>
              <p className="text-gray-700">{quotation.client_address}</p>
              {quotation.client_phone && <p className="text-gray-700">{quotation.client_phone}</p>}
              {quotation.client_email && <p className="text-gray-700">{quotation.client_email}</p>}
            </div>
          </div>
          
          <div>
            <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 rounded-t-lg`}>
              <h3 className="font-bold text-lg">Quote Details</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Issue Date:</span>
                <span className="font-medium">{formatDate(quotation.issue_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valid Until:</span>
                <span className={`font-medium ${validityStatus.color}`}>{formatDate(quotation.valid_until)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${validityStatus.color}`}>{validityStatus.text}</span>
              </div>
              {quotation.project_description && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Project</p>
                  <p className="font-medium text-gray-900">{quotation.project_description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 rounded-t-lg`}>
            <h3 className="font-bold text-lg">Quotation Items</h3>
          </div>
          
          <div className="border border-gray-200 rounded-b-lg overflow-hidden">
            {Object.entries(groupedItems).map(([sectionName, sectionItems], sectionIndex) => (
              <div key={sectionIndex}>
                {Object.keys(groupedItems).length > 1 && (
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-800">{sectionName}</h4>
                  </div>
                )}
                
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Description</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-600">Qty</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Unit Price</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Material Cost</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Labor</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionItems.map((item, index) => (
                      <tr key={item.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="p-3">
                          <div className="text-sm font-medium text-gray-900">{item.description}</div>
                        </td>
                        <td className="p-3 text-center text-sm text-gray-700">{item.quantity}</td>
                        <td className="p-3 text-right text-sm text-gray-700">{formatCurrency(item.unit_price)}</td>
                        <td className="p-3 text-right text-sm text-gray-700">{formatCurrency(item.material_cost)}</td>
                        <td className="p-3 text-right text-sm text-gray-700">
                          {item.labor_percentage}% ({formatCurrency(item.labor_charge)})
                        </td>
                        <td className="p-3 text-right text-sm font-medium text-gray-900">{formatCurrency(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-md">
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">{formatCurrency(quotation.subtotal)}</span>
              </div>
              
              {quotation.discount_amount && quotation.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(quotation.discount_amount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({quotation.tax_rate}%):</span>
                <span className="font-medium text-gray-900">{formatCurrency(quotation.tax_amount)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(quotation.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        {quotation.terms && (
          <div className="mb-8">
            <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 rounded-t-lg`}>
              <h3 className="font-bold text-lg">Terms and Conditions</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-lg">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{quotation.terms}</div>
            </div>
          </div>
        )}

        {/* Notes */}
        {quotation.notes && (
          <div className="mb-8">
            <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 rounded-t-lg`}>
              <h3 className="font-bold text-lg">Additional Notes</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-lg">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{quotation.notes}</div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-blue-900 mb-3">Questions about this quotation?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-blue-800">Contact Information</p>
              <p className="text-blue-700">{company.phone}</p>
              <p className="text-blue-700">{company.email}</p>
              {company.website && <p className="text-blue-700">{company.website}</p>}
            </div>
            <div>
              <p className="font-semibold text-blue-800">Office Address</p>
              <p className="text-blue-700">{company.address}</p>
            </div>
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-green-900 mb-3">Quotation Acceptance</h3>
          <p className="text-sm text-green-700 mb-4">
            By signing below, you accept this quotation and authorize AKIBEKS Engineering Solutions 
            to proceed with the project as described above.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <div className="border-b border-green-300 pb-1 mb-2">
                <p className="text-xs text-green-600 mb-1">Client Signature</p>
                <div className="h-12"></div>
              </div>
              <p className="text-sm text-green-700">Date: ________________</p>
            </div>
            <div>
              <div className="border-b border-green-300 pb-1 mb-2">
                <p className="text-xs text-green-600 mb-1">AKIBEKS Representative</p>
                <div className="h-12"></div>
              </div>
              <p className="text-sm text-green-700">Date: ________________</p>
            </div>
          </div>
        </div>

        {/* Footer with validity warning */}
        <div className="text-center border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 mb-2">
            This quotation was generated by {company.company_name} on {formatDate(quotation.issue_date)}
          </p>
          <p className={`text-xs font-medium ${validityStatus.color}`}>
            📄 This quotation is valid until {formatDate(quotation.valid_until)} - {validityStatus.text}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            For any queries regarding this quotation, please contact us using the information provided above.
          </p>
        </div>

        {/* Watermark for Draft */}
        {quotation.notes?.toLowerCase().includes('draft') && (
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

export default QuotationPDF;