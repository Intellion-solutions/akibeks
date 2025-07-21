import { dbClient, Tables } from "./db-client";
import { z } from 'zod';

// Email configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Validation schemas
export const emailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  from: z.string().email('Invalid from email').optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string()
  })).optional()
});

// Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: 'welcome' | 'notification' | 'invoice' | 'quotation' | 'alert' | 'general';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  to: string;
  from: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';
  templateId?: string;
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class SMTPService {
  private static instance: SMTPService;

  public static getInstance(): SMTPService {
    if (!SMTPService.instance) {
      SMTPService.instance = new SMTPService();
    }
    return SMTPService.instance;
  }

  // Send email
  async sendEmail(emailData: z.infer<typeof emailSchema>): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const validatedData = emailSchema.parse(emailData);

      // For now, simulate email sending since we don't have a real SMTP setup
      console.log('Sending email:', {
        to: validatedData.to,
        subject: validatedData.subject,
        message: validatedData.message.substring(0, 100) + '...'
      });

      // Log email attempt
      await this.logEmail({
        to: validatedData.to,
        from: validatedData.from || process.env.SMTP_FROM_EMAIL || 'noreply@akibeks.co.ke',
        subject: validatedData.subject,
        status: 'sent',
        sentAt: new Date().toISOString()
      });

      // Simulate successful send
      return {
        success: true,
        messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      console.error('Send email error:', error);
      
      // Log failed email
      if (emailData.to && emailData.subject) {
        await this.logEmail({
          to: emailData.to,
          from: emailData.from || process.env.SMTP_FROM_EMAIL || 'noreply@akibeks.co.ke',
          subject: emailData.subject,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors.map(e => e.message).join(', ') };
      }
      return { success: false, error: 'Failed to send email' };
    }
  }

  // Send template email
  async sendTemplateEmail(
    templateId: string,
    to: string,
    variables: Record<string, any> = {}
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // TODO: Implement email templates table and retrieval
      // For now, simulate template email
      const subject = `Template Email - ${templateId}`;
      const message = `This is a template email with variables: ${JSON.stringify(variables)}`;

      return await this.sendEmail({
        to,
        subject,
        message
      });
    } catch (error) {
      console.error('Send template email error:', error);
      return { success: false, error: 'Failed to send template email' };
    }
  }

  // Send contact form email
  async sendContactFormEmail(formData: {
    name: string;
    email: string;
    phoneNumber?: string;
    company?: string;
    serviceInterest?: string;
    message: string;
  }): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@akibeks.co.ke';
      
      const subject = `New Contact Form Submission from ${formData.name}`;
      const message = `
        New contact form submission received:
        
        Name: ${formData.name}
        Email: ${formData.email}
        Phone: ${formData.phoneNumber || 'Not provided'}
        Company: ${formData.company || 'Not provided'}
        Service Interest: ${formData.serviceInterest || 'Not specified'}
        
        Message:
        ${formData.message}
        
        ---
        This email was sent automatically from the AKIBEKS website contact form.
      `;

      // Send to admin
      const adminResult = await this.sendEmail({
        to: adminEmail,
        subject,
        message,
        from: process.env.SMTP_FROM_EMAIL || 'noreply@akibeks.co.ke'
      });

      // Send acknowledgment to user
      const userSubject = 'Thank you for contacting AKIBEKS Engineering Solutions';
      const userMessage = `
        Dear ${formData.name},
        
        Thank you for contacting AKIBEKS Engineering Solutions. We have received your message and will get back to you within 24 hours.
        
        Your message:
        ${formData.message}
        
        Best regards,
        AKIBEKS Engineering Solutions Team
        
        Phone: +254 710 245 118
        Email: info@akibeks.co.ke
        Website: https://akibeks.co.ke
      `;

      const userResult = await this.sendEmail({
        to: formData.email,
        subject: userSubject,
        message: userMessage
      });

      return {
        success: adminResult.success && userResult.success,
        error: adminResult.error || userResult.error
      };
    } catch (error) {
      console.error('Send contact form email error:', error);
      return { success: false, error: 'Failed to send contact form email' };
    }
  }

  // Send invoice email
  async sendInvoiceEmail(
    invoiceId: string,
    clientEmail: string,
    invoiceNumber: string,
    amount: number
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const subject = `Invoice ${invoiceNumber} from AKIBEKS Engineering Solutions`;
      const message = `
        Dear Client,
        
        Please find attached invoice ${invoiceNumber} for KES ${amount.toLocaleString()}.
        
        Invoice Details:
        - Invoice Number: ${invoiceNumber}
        - Amount: KES ${amount.toLocaleString()}
        - Due Date: 30 days from invoice date
        
        Payment can be made via:
        - Bank Transfer
        - M-Pesa: [M-Pesa Number]
        - Cash
        
        Please contact us if you have any questions.
        
        Best regards,
        AKIBEKS Engineering Solutions
        
        Phone: +254 710 245 118
        Email: accounts@akibeks.co.ke
      `;

      return await this.sendEmail({
        to: clientEmail,
        subject,
        message
      });
    } catch (error) {
      console.error('Send invoice email error:', error);
      return { success: false, error: 'Failed to send invoice email' };
    }
  }

  // Send project update email
  async sendProjectUpdateEmail(
    projectId: string,
    clientEmail: string,
    projectTitle: string,
    updateMessage: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const subject = `Project Update: ${projectTitle}`;
      const message = `
        Dear Client,
        
        We have an update on your project: ${projectTitle}
        
        Update:
        ${updateMessage}
        
        You can view the full project details and progress at: https://akibeks.co.ke/projects/${projectId}
        
        If you have any questions, please don't hesitate to contact us.
        
        Best regards,
        AKIBEKS Engineering Solutions Project Team
        
        Phone: +254 710 245 118
        Email: projects@akibeks.co.ke
      `;

      return await this.sendEmail({
        to: clientEmail,
        subject,
        message
      });
    } catch (error) {
      console.error('Send project update email error:', error);
      return { success: false, error: 'Failed to send project update email' };
    }
  }

  // Send notification email
  async sendNotificationEmail(
    to: string,
    title: string,
    content: string,
    type: 'info' | 'warning' | 'alert' | 'success' = 'info'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const subject = `AKIBEKS Notification: ${title}`;
      const message = `
        ${title}
        
        ${content}
        
        ---
        This is an automated notification from AKIBEKS Engineering Solutions.
        
        If you have any questions, please contact us:
        Phone: +254 710 245 118
        Email: support@akibeks.co.ke
      `;

      return await this.sendEmail({
        to,
        subject,
        message
      });
    } catch (error) {
      console.error('Send notification email error:', error);
      return { success: false, error: 'Failed to send notification email' };
    }
  }

  // Log email activity
  private async logEmail(emailLog: Omit<EmailLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const logData = {
        ...emailLog,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // TODO: Implement email_logs table in schema
      // For now, log to console
      console.log('Email log:', logData);
      
      // Once email_logs table is implemented:
      // await dbClient.insert(Tables.emailLogs, logData);
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  // Get email statistics
  async getEmailStats(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    sent: number;
    failed: number;
    delivered: number;
    bounced: number;
    pending: number;
  }> {
    try {
      // TODO: Implement when email_logs table is available
      // For now, return mock data
      return {
        sent: 45,
        failed: 2,
        delivered: 42,
        bounced: 1,
        pending: 0
      };
    } catch (error) {
      console.error('Error getting email stats:', error);
      return {
        sent: 0,
        failed: 0,
        delivered: 0,
        bounced: 0,
        pending: 0
      };
    }
  }

  // Check SMTP configuration
  async checkConfiguration(): Promise<{
    isConfigured: boolean;
    error?: string;
  }> {
    try {
      if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
        return {
          isConfigured: false,
          error: 'SMTP credentials not configured'
        };
      }

      // TODO: Implement actual SMTP connection test
      return { isConfigured: true };
    } catch (error) {
      console.error('SMTP configuration check error:', error);
      return {
        isConfigured: false,
        error: 'Failed to check SMTP configuration'
      };
    }
  }
}

// Export singleton instance
export const smtpService = SMTPService.getInstance();
export default smtpService;