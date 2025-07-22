import nodemailer from 'nodemailer';
import { z } from 'zod';
import { emailSchema, createEmailTemplateSchema } from '../../shared/schemas';
import { EMAIL_STATUS, EMAIL_CATEGORIES } from '../../shared/constants';
import type { EmailTemplate, EmailLog, ApiResponse } from '../../shared/types';
import smtpConfigModule, { validateSMTPConfig } from '../config/smtp.config.js';

// Create transporter
const createTransporter = () => {
  // Validate configuration before creating transporter
  if (!validateSMTPConfig()) {
    throw new Error('Invalid SMTP configuration');
  }
  
  return nodemailer.createTransport({
    ...smtpConfigModule.smtp,
    tls: smtpConfigModule.smtp.tls
  });
};

export class SMTPService {
  private static transporter = createTransporter();

  /**
   * Send email
   */
  static async sendEmail(emailData: z.infer<typeof emailSchema>): Promise<ApiResponse<EmailLog>> {
    try {
      // Validate email data
      const validatedData = emailSchema.parse(emailData);

      const mailOptions = {
        from: validatedData.from || process.env.SMTP_USER,
        to: validatedData.to,
        cc: validatedData.cc,
        bcc: validatedData.bcc,
        subject: validatedData.subject,
        html: validatedData.message,
        text: validatedData.message.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        attachments: validatedData.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);

      const emailLog: EmailLog = {
        id: info.messageId,
        to: validatedData.to,
        from: validatedData.from || process.env.SMTP_USER || '',
        subject: validatedData.subject,
        status: EMAIL_STATUS.SENT,
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      return {
        success: true,
        data: emailLog,
        message: 'Email sent successfully'
      };

    } catch (error) {
      console.error('SMTP Error:', error);
      
      const emailLog: EmailLog = {
        id: Date.now().toString(),
        to: emailData.to,
        from: emailData.from || process.env.SMTP_USER || '',
        subject: emailData.subject,
        status: EMAIL_STATUS.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date().toISOString()
      };

      return {
        success: false,
        data: emailLog,
        error: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  }

  /**
   * Send email using template
   */
  static async sendTemplateEmail(
    templateId: string, 
    to: string, 
    variables: Record<string, any> = {}
  ): Promise<ApiResponse<EmailLog>> {
    try {
      // In a real implementation, you would fetch the template from database
      // For now, we'll use a mock template
      const template: EmailTemplate = {
        id: templateId,
        name: 'Welcome Email',
        subject: 'Welcome to AKIBEKS Engineering Solutions',
        htmlContent: `
          <h1>Welcome {{firstName}}!</h1>
          <p>Thank you for your interest in AKIBEKS Engineering Solutions.</p>
          <p>We'll be in touch soon to discuss your project needs.</p>
        `,
        textContent: 'Welcome {{firstName}}! Thank you for your interest in AKIBEKS Engineering Solutions.',
        variables: ['firstName'],
        category: EMAIL_CATEGORIES.WELCOME,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Replace variables in template
      let htmlContent = template.htmlContent;
      let textContent = template.textContent;
      let subject = template.subject;

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, String(value));
        textContent = textContent.replace(regex, String(value));
        subject = subject.replace(regex, String(value));
      });

      return await this.sendEmail({
        to,
        subject,
        message: htmlContent
      });

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send template email'
      };
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(to: string, firstName: string): Promise<ApiResponse<EmailLog>> {
    return await this.sendTemplateEmail('welcome', to, { firstName });
  }

  /**
   * Send contact form notification
   */
  static async sendContactNotification(contactData: {
    name: string;
    email: string;
    message: string;
    company?: string;
    phone?: string;
  }): Promise<ApiResponse<EmailLog>> {
    try {
      const subject = `New Contact Form Submission from ${contactData.name}`;
      const message = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        ${contactData.company ? `<p><strong>Company:</strong> ${contactData.company}</p>` : ''}
        ${contactData.phone ? `<p><strong>Phone:</strong> ${contactData.phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${contactData.message}</p>
      `;

      return await this.sendEmail({
        to: smtpConfigModule.smtp.auth.user, // Send to admin
        subject,
        message
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send contact notification'
      };
    }
  }

  /**
   * Send contact email (compatibility method)
   */
  static async sendContactEmail(contactData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<any> {
    return await this.sendContactNotification({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      message: contactData.message
    });
  }

  /**
   * Send quote request email (compatibility method)
   */
  static async sendQuoteEmail(quoteData: {
    name: string;
    email: string;
    phone?: string;
    service: string;
    budget?: string;
    timeline?: string;
    description: string;
  }): Promise<any> {
    try {
      const subject = `New Quote Request from ${quoteData.name}`;
      const message = `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${quoteData.name}</p>
        <p><strong>Email:</strong> ${quoteData.email}</p>
        ${quoteData.phone ? `<p><strong>Phone:</strong> ${quoteData.phone}</p>` : ''}
        <p><strong>Service:</strong> ${quoteData.service}</p>
        ${quoteData.budget ? `<p><strong>Budget:</strong> ${quoteData.budget}</p>` : ''}
        ${quoteData.timeline ? `<p><strong>Timeline:</strong> ${quoteData.timeline}</p>` : ''}
        <p><strong>Description:</strong></p>
        <p>${quoteData.description}</p>
      `;

      return await this.sendEmail({
        to: smtpConfigModule.smtp.auth.user, // Send to admin
        subject,
        message
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send quote email'
      };
    }
  }

  /**
   * Send quotation email
   */
  static async sendQuotationEmail(
    to: string, 
    quotationData: {
      projectName: string;
      amount: number;
      currency: string;
      validUntil: string;
    }
  ): Promise<ApiResponse<EmailLog>> {
    const emailContent = `
      <h2>Project Quotation - ${quotationData.projectName}</h2>
      <p>Thank you for your interest in our services. Please find your quotation details below:</p>
      
      <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>Project: ${quotationData.projectName}</h3>
        <p><strong>Total Amount:</strong> ${quotationData.currency} ${quotationData.amount.toLocaleString()}</p>
        <p><strong>Valid Until:</strong> ${quotationData.validUntil}</p>
      </div>
      
      <p>This quotation is based on the information provided. Final pricing may vary based on detailed requirements.</p>
      <p>Please contact us if you have any questions or would like to proceed.</p>
      
      <p>Best regards,<br>AKIBEKS Engineering Solutions Team</p>
    `;

    return await this.sendEmail({
      to,
      subject: `Quotation for ${quotationData.projectName}`,
      message: emailContent
    });
  }

  /**
   * Test SMTP connection
   */
  static async testConnection(): Promise<ApiResponse<boolean>> {
    try {
      await this.transporter.verify();
      return {
        success: true,
        data: true,
        message: 'SMTP connection successful'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        error: error instanceof Error ? error.message : 'SMTP connection failed'
      };
    }
  }

  /**
   * Get email templates (mock implementation)
   */
  static async getTemplates(): Promise<ApiResponse<EmailTemplate[]>> {
    // In a real implementation, fetch from database
    const templates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to AKIBEKS Engineering Solutions',
        htmlContent: '<h1>Welcome {{firstName}}!</h1><p>Thank you for joining us.</p>',
        textContent: 'Welcome {{firstName}}! Thank you for joining us.',
        variables: ['firstName'],
        category: EMAIL_CATEGORIES.WELCOME,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'quotation',
        name: 'Quotation Email',
        subject: 'Your Project Quotation',
        htmlContent: '<h2>Project Quotation</h2><p>Amount: {{amount}} {{currency}}</p>',
        textContent: 'Project Quotation - Amount: {{amount}} {{currency}}',
        variables: ['amount', 'currency', 'projectName'],
        category: EMAIL_CATEGORIES.QUOTATION,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return {
      success: true,
      data: templates
    };
  }

  /**
   * Create email template (mock implementation)
   */
  static async createTemplate(templateData: z.infer<typeof createEmailTemplateSchema>): Promise<ApiResponse<EmailTemplate>> {
    try {
      const validatedData = createEmailTemplateSchema.parse(templateData);
      
      const template: EmailTemplate = {
        id: Date.now().toString(),
        ...validatedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // In a real implementation, save to database
      console.log('Template created:', template);

      return {
        success: true,
        data: template,
        message: 'Template created successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template'
      };
    }
  }
}

export default SMTPService;