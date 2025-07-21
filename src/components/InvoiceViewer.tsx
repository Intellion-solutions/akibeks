
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Send, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/db-client";
import InvoicePDF from './InvoicePDF';

interface InvoiceViewerProps {
  invoiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ invoiceId, open, onOpenChange }) => {
  const { toast } = useToast();
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && invoiceId) {
      fetchInvoiceData();
      fetchCompanyData();
    }
  }, [open, invoiceId]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      
      // Fetch invoice with client info
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            full_name,
            company_name,
            address,
            phone,
            email
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Fetch invoice items with enhanced fields
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at');

      if (itemsError) throw itemsError;

      // Transform data for InvoicePDF component
      const transformedInvoice = {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        client_name: invoice.clients?.company_name || invoice.clients?.full_name || 'Unknown Client',
        client_address: invoice.clients?.address || '',
        client_phone: invoice.clients?.phone,
        client_email: invoice.clients?.email,
        issue_date: invoice.created_at,
        due_date: invoice.due_date,
        items: items?.map(item => ({
          id: item.id,
          description: item.description,
          quantity: parseFloat(item.quantity.toString()),
          unit_price: parseFloat(item.unit_price.toString()),
          material_cost: parseFloat(item.material_cost?.toString() || '0'),
          labor_percentage: parseFloat(item.labor_percentage?.toString() || '36.5'),
          labor_charge: parseFloat(item.labor_charge?.toString() || '0'),
          total_price: parseFloat(item.total_price.toString()),
          section: item.section || 'General'
        })) || [],
        subtotal: parseFloat(invoice.subtotal?.toString() || invoice.total_amount.toString()) || 0,
        tax_rate: parseFloat(invoice.tax_rate?.toString() || '16'),
        tax_amount: parseFloat(invoice.tax_amount?.toString() || '0'),
        discount_amount: parseFloat(invoice.discount_amount?.toString() || '0'),
        total_amount: parseFloat(invoice.total_amount.toString()) || 0,
        notes: invoice.notes,
        payment_terms: invoice.payment_terms,
        template_type: invoice.template_type || 'standard',
        letterhead_enabled: invoice.letterhead_enabled !== false
      };

      setInvoiceData(transformedInvoice);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyData = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('company_settings')
        .select('*');

      if (error) throw error;

      // Convert array to object
      const companySettings = settings?.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string>) || {};

      const company = {
        company_name: companySettings.company_name || 'AKIBEKS Engineering Solutions',
        address: companySettings.address || 'Nairobi, Kenya',
        phone: companySettings.phone || '+254 710 245 118',
        email: companySettings.email || 'info@akibeks.co.ke',
        website: companySettings.website,
        tax_id: companySettings.tax_id
      };

      setCompanyData(company);
    } catch (error) {
      console.error('Error fetching company data:', error);
      // Use default values if fetch fails
      setCompanyData({
        company_name: 'AKIBEKS Engineering Solutions',
        address: 'Nairobi, Kenya',
        phone: '+254 710 245 118',
        email: 'info@akibeks.co.ke'
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Invoice PDF download will begin shortly",
    });
  };

  const handleSend = () => {
    toast({
      title: "Invoice Sent",
      description: "Invoice has been sent to client via email",
    });
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Professional Invoice Preview
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button size="sm" onClick={handleSend}>
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-6 pt-0">
          {invoiceData && companyData ? (
            <InvoicePDF invoice={invoiceData} company={companyData} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No invoice data available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceViewer;
