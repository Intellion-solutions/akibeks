import { supabase } from "@/integrations/supabase/client";
import { ErrorHandler } from "./error-handling";
import { QueueManager } from "./queue-manager";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  category: 'contact' | 'notification' | 'marketing' | 'system' | 'invoice' | 'reminder';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailMessage {
  id: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  from: string;
  reply_to?: string;
  subject: string;
  html_content: string;
  text_content: string;
  template_id?: string;
  variables?: Record<string, any>;
  attachments?: EmailAttachment[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled';
  scheduled_for?: string;
  sent_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  tracking: {
    opens: number;
    clicks: number;
    bounces: number;
    complaints: number;
  };
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EmailAttachment {
  filename: string;
  content_type: string;
  content: string; // base64 encoded
  size: number;
}

export interface ContactFormSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  form_type: 'general' | 'quote_request' | 'support' | 'partnership' | 'career';
  source_page: string;
  user_agent: string;
  ip_address: string;
  status: 'new' | 'read' | 'responded' | 'closed' | 'spam';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from_name: string;
  from_email: string;
  reply_to?: string;
  max_connections: number;
  rate_limit: number; // emails per minute
}

export class SMTPService {
  private errorHandler: ErrorHandler;
  private queueManager: QueueManager;
  private config: SMTPConfig;

  constructor(config: SMTPConfig) {
    this.errorHandler = new ErrorHandler();
    this.queueManager = new QueueManager();
    this.config = config;
  }

  async submitContactForm(submission: Omit<ContactFormSubmission, 'id' | 'created_at' | 'updated_at'>): Promise<ContactFormSubmission> {
    try {
      // Validate and sanitize input
      const sanitizedSubmission = this.sanitizeContactForm(submission);
      
      // Check for spam
      const isSpam = await this.checkSpam(sanitizedSubmission);
      if (isSpam) {
        sanitizedSubmission.status = 'spam';
        sanitizedSubmission.tags.push('auto-flagged-spam');
      }

      // Save to database
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert(sanitizedSubmission)
        .select('*')
        .single();

      if (error) throw error;

      // Send acknowledgment email to user
      await this.sendContactAcknowledgment(data);

      // Send notification to admin
      await this.sendAdminNotification(data);

      // Auto-assign if rules exist
      await this.autoAssignSubmission(data.id);

      return data;
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.submitContactForm', 'high');
      throw error;
    }
  }

  async sendEmail(message: Omit<EmailMessage, 'id' | 'created_at' | 'updated_at'>): Promise<EmailMessage> {
    try {
      // Create email record
      const { data, error } = await supabase
        .from('email_messages')
        .insert({
          ...message,
          status: 'pending',
          retry_count: 0,
          tracking: {
            opens: 0,
            clicks: 0,
            bounces: 0,
            complaints: 0
          }
        })
        .select('*')
        .single();

      if (error) throw error;

      // Queue for sending
      await this.queueManager.addJob({
        type: 'send_email',
        priority: message.priority === 'urgent' ? 'high' : message.priority,
        scheduled_for: message.scheduled_for ? new Date(message.scheduled_for) : undefined,
        data: {
          email_id: data.id
        }
      });

      return data;
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.sendEmail', 'high');
      throw error;
    }
  }

  async sendBulkEmail(messages: Omit<EmailMessage, 'id' | 'created_at' | 'updated_at'>[]): Promise<EmailMessage[]> {
    try {
      const results: EmailMessage[] = [];
      
      // Create email records in batch
      const { data, error } = await supabase
        .from('email_messages')
        .insert(messages.map(msg => ({
          ...msg,
          status: 'pending',
          retry_count: 0,
          tracking: {
            opens: 0,
            clicks: 0,
            bounces: 0,
            complaints: 0
          }
        })))
        .select('*');

      if (error) throw error;

      // Queue all emails for sending with staggered timing
      for (let i = 0; i < data.length; i++) {
        const email = data[i];
        const delay = Math.floor(i / this.config.rate_limit) * 60000; // Respect rate limit
        
        await this.queueManager.addJob({
          type: 'send_email',
          priority: 'normal',
          scheduled_for: new Date(Date.now() + delay),
          data: {
            email_id: email.id
          }
        });

        results.push(email);
      }

      return results;
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.sendBulkEmail', 'high');
      throw error;
    }
  }

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert(template)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.createTemplate', 'medium');
      throw error;
    }
  }

  async sendTemplateEmail(
    templateId: string,
    to: string[],
    variables: Record<string, any>,
    options: {
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      scheduled_for?: string;
      attachments?: EmailAttachment[];
    } = {}
  ): Promise<EmailMessage> {
    try {
      // Get template
      const { data: template, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single();

      if (error || !template) {
        throw new Error('Template not found or inactive');
      }

      // Render template
      const renderedContent = this.renderTemplate(template, variables);

      // Send email
      return await this.sendEmail({
        to,
        from: this.config.from_email,
        subject: renderedContent.subject,
        html_content: renderedContent.html,
        text_content: renderedContent.text,
        template_id: templateId,
        variables,
        priority: options.priority || 'normal',
        scheduled_for: options.scheduled_for,
        attachments: options.attachments,
        max_retries: 3,
        metadata: {
          template_name: template.name,
          template_category: template.category
        }
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.sendTemplateEmail', 'high');
      throw error;
    }
  }

  async processEmailQueue(): Promise<void> {
    try {
      // Get pending emails
      const { data: pendingEmails, error } = await supabase
        .from('email_messages')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(this.config.rate_limit);

      if (error) throw error;

      if (!pendingEmails?.length) return;

      for (const email of pendingEmails) {
        try {
          await this.sendSingleEmail(email);
        } catch (emailError) {
          await this.handleEmailError(email.id, emailError);
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.processEmailQueue', 'medium');
    }
  }

  private async sendSingleEmail(email: EmailMessage): Promise<void> {
    try {
      // Update status to sending
      await supabase
        .from('email_messages')
        .update({ status: 'sending' })
        .eq('id', email.id);

      // Here you would integrate with actual SMTP service (NodeMailer, SendGrid, etc.)
      // For now, we'll simulate the sending
      const success = await this.simulateEmailSending(email);

      if (success) {
        await supabase
          .from('email_messages')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', email.id);

        await this.logEmailActivity('sent', email.id);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      await this.handleEmailError(email.id, error);
    }
  }

  private async simulateEmailSending(email: EmailMessage): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 95% success rate
    return Math.random() > 0.05;
  }

  private async handleEmailError(emailId: string, error: any): Promise<void> {
    try {
      const { data: email } = await supabase
        .from('email_messages')
        .select('retry_count, max_retries')
        .eq('id', emailId)
        .single();

      if (!email) return;

      const newRetryCount = email.retry_count + 1;
      
      if (newRetryCount < email.max_retries) {
        // Schedule retry with exponential backoff
        const retryDelay = Math.pow(2, newRetryCount) * 60000; // Minutes
        
        await supabase
          .from('email_messages')
          .update({ 
            status: 'pending',
            retry_count: newRetryCount,
            error_message: error.message,
            scheduled_for: new Date(Date.now() + retryDelay).toISOString()
          })
          .eq('id', emailId);
      } else {
        // Mark as failed
        await supabase
          .from('email_messages')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', emailId);

        await this.logEmailActivity('failed', emailId);
      }
    } catch (updateError) {
      this.errorHandler.handleError(updateError, 'SMTPService.handleEmailError', 'medium');
    }
  }

  private sanitizeContactForm(submission: any): any {
    return {
      ...submission,
      name: this.sanitizeString(submission.name),
      email: this.sanitizeEmail(submission.email),
      phone: submission.phone ? this.sanitizeString(submission.phone) : undefined,
      company: submission.company ? this.sanitizeString(submission.company) : undefined,
      subject: this.sanitizeString(submission.subject),
      message: this.sanitizeString(submission.message),
    };
  }

  private sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  private sanitizeEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    return email.toLowerCase().trim();
  }

  private async checkSpam(submission: any): Promise<boolean> {
    const spamKeywords = ['viagra', 'casino', 'loan', 'bitcoin', 'cryptocurrency'];
    const content = `${submission.subject} ${submission.message}`.toLowerCase();
    
    // Simple keyword-based spam detection
    const hasSpamKeywords = spamKeywords.some(keyword => content.includes(keyword));
    
    // Check submission frequency from same IP
    const { data: recentSubmissions } = await supabase
      .from('contact_submissions')
      .select('id')
      .eq('ip_address', submission.ip_address)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()); // Last hour

    const isFrequentSubmitter = (recentSubmissions?.length || 0) > 5;

    return hasSpamKeywords || isFrequentSubmitter;
  }

  private async sendContactAcknowledgment(submission: ContactFormSubmission): Promise<void> {
    try {
      await this.sendTemplateEmail(
        'contact-acknowledgment', 
        [submission.email],
        {
          name: submission.name,
          subject: submission.subject,
          message: submission.message,
          reference_id: submission.id
        },
        { priority: 'high' }
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.sendContactAcknowledgment', 'medium');
    }
  }

  private async sendAdminNotification(submission: ContactFormSubmission): Promise<void> {
    try {
      const { data: adminUsers } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'admin')
        .eq('receive_notifications', true);

      if (!adminUsers?.length) return;

      const adminEmails = adminUsers.map(user => user.email);

      await this.sendTemplateEmail(
        'admin-contact-notification',
        adminEmails,
        {
          submission_id: submission.id,
          name: submission.name,
          email: submission.email,
          subject: submission.subject,
          message: submission.message,
          form_type: submission.form_type,
          priority: submission.priority,
          admin_url: `${window.location.origin}/admin/contacts/${submission.id}`
        },
        { priority: 'high' }
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.sendAdminNotification', 'medium');
    }
  }

  private async autoAssignSubmission(submissionId: string): Promise<void> {
    try {
      // Get assignment rules
      const { data: rules } = await supabase
        .from('assignment_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (!rules?.length) return;

      const { data: submission } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (!submission) return;

      for (const rule of rules) {
        if (this.matchesRule(submission, rule)) {
          await supabase
            .from('contact_submissions')
            .update({ 
              assigned_to: rule.assign_to,
              status: 'read'
            })
            .eq('id', submissionId);
          
          break;
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.autoAssignSubmission', 'low');
    }
  }

  private matchesRule(submission: ContactFormSubmission, rule: any): boolean {
    // Simple rule matching - can be enhanced
    if (rule.conditions.form_type && rule.conditions.form_type !== submission.form_type) {
      return false;
    }
    
    if (rule.conditions.keywords?.length) {
      const content = `${submission.subject} ${submission.message}`.toLowerCase();
      const hasKeyword = rule.conditions.keywords.some((keyword: string) => 
        content.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    return true;
  }

  private renderTemplate(template: EmailTemplate, variables: Record<string, any>): { subject: string; html: string; text: string } {
    const renderString = (content: string) => {
      let rendered = content;
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        rendered = rendered.replace(regex, String(value));
      }
      return rendered;
    };

    return {
      subject: renderString(template.subject),
      html: renderString(template.html_content),
      text: renderString(template.text_content)
    };
  }

  private async logEmailActivity(action: string, emailId: string): Promise<void> {
    try {
      await supabase
        .from('email_activity_log')
        .insert({
          action,
          email_id: emailId,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.logEmailActivity', 'low');
    }
  }

  async getContactSubmissions(filters: any = {}): Promise<ContactFormSubmission[]> {
    try {
      let query = supabase
        .from('contact_submissions')
        .select('*');

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.form_type) {
        query = query.eq('form_type', filters.form_type);
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.getContactSubmissions', 'low');
      return [];
    }
  }

  async updateSubmissionStatus(submissionId: string, status: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      await this.logContactActivity('status_updated', submissionId, userId, { new_status: status });
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.updateSubmissionStatus', 'medium');
      throw error;
    }
  }

  private async logContactActivity(action: string, submissionId: string, userId: string, metadata: any = {}): Promise<void> {
    try {
      await supabase
        .from('contact_activity_log')
        .insert({
          action,
          submission_id: submissionId,
          user_id: userId,
          metadata,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      this.errorHandler.handleError(error, 'SMTPService.logContactActivity', 'low');
    }
  }
}

export default SMTPService;