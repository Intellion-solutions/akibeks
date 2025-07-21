import { query } from './database-client';
import DatabaseClient from './database-client';

export interface AutomationTrigger {
  type: 'project_created' | 'task_completed' | 'invoice_overdue' | 'deadline_approaching' | 'time_logged' | 'status_changed';
  conditions: {
    field?: string;
    operator?: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals';
    value?: any;
    days_before?: number;
  };
}

export interface AutomationAction {
  type: 'send_email' | 'create_notification' | 'update_status' | 'assign_user' | 'create_task' | 'send_webhook';
  parameters: {
    template_id?: string;
    recipient?: string;
    message?: string;
    status?: string;
    user_id?: string;
    task_data?: any;
    webhook_url?: string;
  };
}

export interface Automation {
  id?: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_conditions: AutomationTrigger;
  actions: AutomationAction[];
  is_active: boolean;
  created_by?: string;
}

export class AutomationService {
  // Automation CRUD operations
  static async createAutomation(automation: Automation, userId: string): Promise<any> {
    const result = await query(
      'INSERT INTO automations (name, description, trigger_type, trigger_conditions, actions, is_active, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [
        automation.name,
        automation.description,
        automation.trigger_type,
        JSON.stringify(automation.trigger_conditions),
        JSON.stringify(automation.actions),
        automation.is_active,
        userId
      ]
    );

    await DatabaseClient.logActivity(userId, 'CREATE', 'automation', result.rows[0].id, automation);
    return result.rows[0];
  }

  static async getAutomations(activeOnly: boolean = false): Promise<any[]> {
    let whereClause = '';
    if (activeOnly) {
      whereClause = 'WHERE is_active = true';
    }

    const result = await query(
      `SELECT a.*, u.name as created_by_name FROM automations a 
       LEFT JOIN users u ON a.created_by = u.id 
       ${whereClause} 
       ORDER BY a.created_at DESC`
    );

    return result.rows.map(row => ({
      ...row,
      trigger_conditions: JSON.parse(row.trigger_conditions),
      actions: JSON.parse(row.actions)
    }));
  }

  static async updateAutomation(id: string, updates: Partial<Automation>, userId: string): Promise<any> {
    const setClause = Object.keys(updates).map((key, index) => {
      if (key === 'trigger_conditions' || key === 'actions') {
        return `${key} = $${index + 2}`;
      }
      return `${key} = $${index + 2}`;
    }).join(', ');

    const values = Object.values(updates).map(value => {
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value;
    });

    const result = await query(
      `UPDATE automations SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    await DatabaseClient.logActivity(userId, 'UPDATE', 'automation', id, updates);
    return result.rows[0];
  }

  static async deleteAutomation(id: string, userId: string): Promise<void> {
    await query('DELETE FROM automations WHERE id = $1', [id]);
    await DatabaseClient.logActivity(userId, 'DELETE', 'automation', id);
  }

  // Trigger execution
  static async executeTrigger(triggerType: string, data: any): Promise<void> {
    const automations = await this.getAutomations(true);
    const matchingAutomations = automations.filter(automation => 
      automation.trigger_type === triggerType
    );

    for (const automation of matchingAutomations) {
      try {
        const shouldExecute = this.evaluateConditions(automation.trigger_conditions, data);
        
        if (shouldExecute) {
          await this.executeActions(automation.actions, data, automation.id);
          
          // Log successful execution
          await query(
            'INSERT INTO automation_logs (automation_id, trigger_data, executed_actions, status, execution_time, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
            [automation.id, JSON.stringify(data), JSON.stringify(automation.actions), 'success', Date.now()]
          );
        }
      } catch (error) {
        console.error(`Automation execution failed for ${automation.id}:`, error);
        
        // Log failed execution
        await query(
          'INSERT INTO automation_logs (automation_id, trigger_data, status, error_message, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [automation.id, JSON.stringify(data), 'error', error.message]
        );
      }
    }
  }

  // Condition evaluation
  private static evaluateConditions(conditions: AutomationTrigger, data: any): boolean {
    if (!conditions.conditions) return true;

    const { field, operator, value, days_before } = conditions.conditions;

    if (days_before && data.due_date) {
      const dueDate = new Date(data.due_date);
      const today = new Date();
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return daysDiff <= days_before;
    }

    if (!field || !operator) return true;

    const fieldValue = this.getNestedValue(data, field);

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      default:
        return true;
    }
  }

  // Action execution
  private static async executeActions(actions: AutomationAction[], triggerData: any, automationId: string): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'send_email':
            await this.sendEmail(action, triggerData);
            break;
          case 'create_notification':
            await this.createNotification(action, triggerData);
            break;
          case 'update_status':
            await this.updateStatus(action, triggerData);
            break;
          case 'assign_user':
            await this.assignUser(action, triggerData);
            break;
          case 'create_task':
            await this.createTask(action, triggerData);
            break;
          case 'send_webhook':
            await this.sendWebhook(action, triggerData);
            break;
        }
      } catch (error) {
        console.error(`Action execution failed:`, error);
        throw error;
      }
    }
  }

  // Individual action handlers
  private static async sendEmail(action: AutomationAction, data: any): Promise<void> {
    // Implement email sending logic
    const { template_id, recipient } = action.parameters;
    
    if (template_id) {
      const template = await query('SELECT * FROM email_templates WHERE id = $1', [template_id]);
      if (template.rows.length > 0) {
        const emailTemplate = template.rows[0];
        const processedBody = this.processTemplate(emailTemplate.body, data);
        const processedSubject = this.processTemplate(emailTemplate.subject, data);
        
        // Here you would integrate with your email service (SendGrid, NodeMailer, etc.)
        console.log(`Sending email to ${recipient}: ${processedSubject}`);
      }
    }
  }

  private static async createNotification(action: AutomationAction, data: any): Promise<void> {
    const { recipient, message } = action.parameters;
    
    if (recipient && message) {
      const processedMessage = this.processTemplate(message, data);
      await DatabaseClient.createNotification(recipient, 'Automation Alert', processedMessage, 'automation');
    }
  }

  private static async updateStatus(action: AutomationAction, data: any): Promise<void> {
    const { status } = action.parameters;
    
    if (status && data.id && data.table) {
      await query(
        `UPDATE ${data.table} SET status = $1, updated_at = NOW() WHERE id = $2`,
        [status, data.id]
      );
    }
  }

  private static async assignUser(action: AutomationAction, data: any): Promise<void> {
    const { user_id } = action.parameters;
    
    if (user_id && data.id && data.table) {
      await query(
        `UPDATE ${data.table} SET assigned_to = $1, updated_at = NOW() WHERE id = $2`,
        [user_id, data.id]
      );
    }
  }

  private static async createTask(action: AutomationAction, data: any): Promise<void> {
    const { task_data } = action.parameters;
    
    if (task_data && data.project_id) {
      const processedTaskData = {
        ...task_data,
        project_id: data.project_id,
        title: this.processTemplate(task_data.title, data),
        description: this.processTemplate(task_data.description, data)
      };

      await query(
        'INSERT INTO tasks (title, description, project_id, status, priority, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [processedTaskData.title, processedTaskData.description, processedTaskData.project_id, 'pending', 'medium']
      );
    }
  }

  private static async sendWebhook(action: AutomationAction, data: any): Promise<void> {
    const { webhook_url } = action.parameters;
    
    if (webhook_url) {
      try {
        await fetch(webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trigger_data: data,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Webhook sending failed:', error);
        throw error;
      }
    }
  }

  // Utility methods
  private static processTemplate(template: string, data: any): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
      return value !== undefined ? String(value) : match;
    });
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Scheduled automation checks
  static async runScheduledChecks(): Promise<void> {
    // Check for overdue invoices
    const overdueInvoices = await query(`
      SELECT * FROM invoices 
      WHERE status = 'sent' AND due_date < NOW() - INTERVAL '1 day'
    `);

    for (const invoice of overdueInvoices.rows) {
      await this.executeTrigger('invoice_overdue', { ...invoice, table: 'invoices' });
    }

    // Check for approaching deadlines
    const approachingDeadlines = await query(`
      SELECT * FROM tasks 
      WHERE status != 'completed' AND due_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    `);

    for (const task of approachingDeadlines.rows) {
      await this.executeTrigger('deadline_approaching', { ...task, table: 'tasks' });
    }

    // Check for project deadlines
    const projectDeadlines = await query(`
      SELECT * FROM projects 
      WHERE status = 'active' AND end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    `);

    for (const project of projectDeadlines.rows) {
      await this.executeTrigger('deadline_approaching', { ...project, table: 'projects' });
    }
  }

  // Email template management
  static async createEmailTemplate(template: any, userId: string): Promise<any> {
    const result = await query(
      'INSERT INTO email_templates (name, subject, body, template_type, variables, is_active, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [template.name, template.subject, template.body, template.template_type, JSON.stringify(template.variables), template.is_active, userId]
    );

    await DatabaseClient.logActivity(userId, 'CREATE', 'email_template', result.rows[0].id, template);
    return result.rows[0];
  }

  static async getEmailTemplates(type?: string): Promise<any[]> {
    let whereClause = 'WHERE is_active = true';
    const params = [];

    if (type) {
      whereClause += ' AND template_type = $1';
      params.push(type);
    }

    const result = await query(
      `SELECT * FROM email_templates ${whereClause} ORDER BY created_at DESC`,
      params
    );

    return result.rows.map(row => ({
      ...row,
      variables: JSON.parse(row.variables || '[]')
    }));
  }

  static async updateEmailTemplate(id: string, updates: any, userId: string): Promise<any> {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates).map(value => {
      if (key === 'variables' && typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value;
    });

    const result = await query(
      `UPDATE email_templates SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    await DatabaseClient.logActivity(userId, 'UPDATE', 'email_template', id, updates);
    return result.rows[0];
  }

  static async deleteEmailTemplate(id: string, userId: string): Promise<void> {
    await query('DELETE FROM email_templates WHERE id = $1', [id]);
    await DatabaseClient.logActivity(userId, 'DELETE', 'email_template', id);
  }

  // Common automation triggers that can be called from other parts of the application
  static async triggerProjectCreated(project: any): Promise<void> {
    await this.executeTrigger('project_created', { ...project, table: 'projects' });
  }

  static async triggerTaskCompleted(task: any): Promise<void> {
    await this.executeTrigger('task_completed', { ...task, table: 'tasks' });
  }

  static async triggerStatusChanged(entity: any, oldStatus: string, newStatus: string, table: string): Promise<void> {
    await this.executeTrigger('status_changed', { 
      ...entity, 
      table, 
      old_status: oldStatus, 
      new_status: newStatus 
    });
  }

  static async triggerTimeLogged(timeEntry: any): Promise<void> {
    await this.executeTrigger('time_logged', { ...timeEntry, table: 'time_entries' });
  }
}

export default AutomationService;