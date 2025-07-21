import { supabase } from "./db-client";
import { ErrorHandlingService } from "./error-handling";
import { QueueManager } from "./queue-manager";
import { SMTPService } from "./smtp-service";
import { CalendarManager } from "./calendar-manager";

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'delay' | 'milestone' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  source: 'system' | 'project' | 'calendar' | 'invoice' | 'user' | 'external';
  entity_type?: 'project' | 'task' | 'milestone' | 'invoice' | 'client' | 'user';
  entity_id?: string;
  recipients: string[];
  channels: ('email' | 'sms' | 'push' | 'dashboard' | 'slack')[];
  conditions: AlertCondition[];
  actions: AlertAction[];
  triggers: AlertTrigger[];
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  expires_at?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  trigger_type: 'schedule' | 'event' | 'condition' | 'threshold' | 'deadline';
  entity_type: 'project' | 'task' | 'milestone' | 'invoice' | 'client' | 'system';
  conditions: AlertCondition[];
  actions: AlertAction[];
  recipients: string[];
  channels: string[];
  frequency: 'once' | 'daily' | 'weekly' | 'on_change' | 'escalating';
  escalation_rules?: EscalationRule[];
  priority: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AlertCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'not_contains' | 'in' | 'not_in';
  value: any;
  data_type: 'string' | 'number' | 'date' | 'boolean' | 'array';
}

export interface AlertAction {
  type: 'notify' | 'email' | 'sms' | 'webhook' | 'auto_assign' | 'create_task' | 'update_status';
  parameters: Record<string, any>;
  delay?: number; // minutes
}

export interface AlertTrigger {
  event: string;
  source: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface EscalationRule {
  level: number;
  delay_minutes: number;
  recipients: string[];
  channels: string[];
  actions?: AlertAction[];
}

export interface AlertDashboard {
  total_alerts: number;
  active_alerts: number;
  critical_alerts: number;
  unacknowledged_alerts: number;
  alerts_by_type: Record<string, number>;
  alerts_by_severity: Record<string, number>;
  recent_alerts: Alert[];
  trending_issues: any[];
}

export class AlertSystem {
  private errorHandler: ErrorHandler;
  private queueManager: QueueManager;
  private smtpService: SMTPService;
  private calendarManager: CalendarManager;

  constructor() {
    this.errorHandler = ErrorHandlingService.getInstance();
    this.queueManager = new QueueManager();
    this.smtpService = new SMTPService({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      from_name: 'Project Management System',
      from_email: process.env.SMTP_FROM || 'alerts@yourcompany.com',
      max_connections: 10,
      rate_limit: 60
    });
    this.calendarManager = new CalendarManager();
  }

  async createAlert(alert: Omit<Alert, 'id' | 'created_at' | 'updated_at'>): Promise<Alert> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert(alert)
        .select('*')
        .single();

      if (error) throw error;

      // Process alert actions
      await this.processAlertActions(data);

      // Send notifications
      await this.sendAlertNotifications(data);

      return data;
    } catch (error) {
      this.errorHandler.handleError(error, 'AlertSystem.createAlert', 'high');
      throw error;
    }
  }

  async createAlertRule(rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>): Promise<AlertRule> {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .insert(rule)
        .select('*')
        .single();

      if (error) throw error;

      // Schedule rule evaluation if it's time-based
      if (rule.trigger_type === 'schedule') {
        await this.scheduleRuleEvaluation(data.id);
      }

      return data;
    } catch (error) {
      this.errorHandler.handleError(error, 'AlertSystem.createAlertRule', 'medium');
      throw error;
    }
  }

  async checkProjectDeadlines(): Promise<void> {
    try {
      const now = new Date();
      const warningThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      const criticalThreshold = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours

      // Check upcoming deadlines
      const { data: upcomingDeadlines } = await supabase
        .from('projects')
        .select(`
          *,
          project_milestones (*)
        `)
        .gte('deadline', now.toISOString())
        .lte('deadline', warningThreshold.toISOString())
        .neq('status', 'completed');

      if (upcomingDeadlines?.length) {
        for (const project of upcomingDeadlines) {
          const timeUntilDeadline = new Date(project.deadline).getTime() - now.getTime();
          const severity = timeUntilDeadline <= criticalThreshold.getTime() ? 'critical' : 'high';

          await this.createAlert({
            title: `Project Deadline Approaching`,
            message: `Project "${project.title}" is due in ${Math.round(timeUntilDeadline / (60 * 60 * 1000))} hours`,
            type: 'deadline',
            severity,
            status: 'active',
            source: 'system',
            entity_type: 'project',
            entity_id: project.id,
            recipients: [project.manager_id, ...project.team_members],
            channels: ['email', 'dashboard'],
            conditions: [],
            actions: [],
            triggers: [{
              event: 'deadline_check',
              source: 'system',
              timestamp: now.toISOString(),
              data: { project_id: project.id, deadline: project.deadline }
            }],
            metadata: {
              project_title: project.title,
              deadline: project.deadline,
              time_remaining: timeUntilDeadline
            },
            created_by: 'system'
          });
        }
      }

      // Check overdue projects
      const { data: overdueProjects } = await supabase
        .from('projects')
        .select('*')
        .lt('deadline', now.toISOString())
        .neq('status', 'completed');

      if (overdueProjects?.length) {
        for (const project of overdueProjects) {
          const overdueDuration = now.getTime() - new Date(project.deadline).getTime();

          await this.createAlert({
            title: `Project Overdue`,
            message: `Project "${project.title}" is overdue by ${Math.round(overdueDuration / (24 * 60 * 60 * 1000))} days`,
            type: 'delay',
            severity: 'critical',
            status: 'active',
            source: 'system',
            entity_type: 'project',
            entity_id: project.id,
            recipients: [project.manager_id, ...project.team_members],
            channels: ['email', 'dashboard', 'sms'],
            conditions: [],
            actions: [],
            triggers: [{
              event: 'overdue_check',
              source: 'system',
              timestamp: now.toISOString(),
              data: { project_id: project.id, deadline: project.deadline }
            }],
            metadata: {
              project_title: project.title,
              deadline: project.deadline,
              overdue_duration: overdueDuration
            },
            created_by: 'system'
          });
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'AlertSystem.checkProjectDeadlines', 'medium');
    }
  }

  async checkTaskDelays(): Promise<void> {
    try {
      const now = new Date();

      // Check for tasks that are taking longer than estimated
      const { data: delayedTasks } = await supabase
        .from('project_tasks')
        .select(`
          *,
          projects (title, manager_id)
        `)
        .eq('status', 'in_progress')
        .not('estimated_hours', 'is', null);

      if (delayedTasks?.length) {
        for (const task of delayedTasks) {
          const startDate = new Date(task.started_at || task.created_at);
          const elapsedHours = (now.getTime() - startDate.getTime()) / (60 * 60 * 1000);
          
          if (elapsedHours > task.estimated_hours * 1.5) { // 50% over estimate
            await this.createAlert({
              title: `Task Running Behind Schedule`,
              message: `Task "${task.title}" is taking ${Math.round((elapsedHours - task.estimated_hours) * 100) / 100} hours longer than estimated`,
              type: 'delay',
              severity: 'medium',
              status: 'active',
              source: 'system',
              entity_type: 'task',
              entity_id: task.id,
              recipients: [task.assigned_to, task.projects.manager_id],
              channels: ['email', 'dashboard'],
              conditions: [],
              actions: [],
              triggers: [{
                event: 'task_delay_check',
                source: 'system',
                timestamp: now.toISOString(),
                data: { task_id: task.id, estimated_hours: task.estimated_hours, elapsed_hours: elapsedHours }
              }],
              metadata: {
                task_title: task.title,
                project_title: task.projects.title,
                estimated_hours: task.estimated_hours,
                elapsed_hours: elapsedHours
              },
              created_by: 'system'
            });
          }
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'AlertSystem.checkTaskDelays', 'medium');
    }
  }

  async checkInvoiceAlerts(): Promise<void> {
    try {
      const now = new Date();
      const warningThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Check for invoices due soon
      const { data: dueInvoices } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (name, email)
        `)
        .eq('status', 'sent')
        .gte('due_date', now.toISOString())
        .lte('due_date', warningThreshold.toISOString());

      if (dueInvoices?.length) {
        for (const invoice of dueInvoices) {
          const daysUntilDue = Math.ceil((new Date(invoice.due_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

          await this.createAlert({
            title: `Invoice Due Soon`,
            message: `Invoice #${invoice.invoice_number} for ${invoice.clients.name} is due in ${daysUntilDue} days`,
            type: 'deadline',
            severity: 'medium',
            status: 'active',
            source: 'system',
            entity_type: 'invoice',
            entity_id: invoice.id,
            recipients: [invoice.created_by],
            channels: ['email', 'dashboard'],
            conditions: [],
            actions: [],
            triggers: [{
              event: 'invoice_due_check',
              source: 'system',
              timestamp: now.toISOString(),
              data: { invoice_id: invoice.id, due_date: invoice.due_date }
            }],
            metadata: {
              invoice_number: invoice.invoice_number,
              client_name: invoice.clients.name,
              amount: invoice.total_amount,
              due_date: invoice.due_date
            },
            created_by: 'system'
          });
        }
      }

      // Check for overdue invoices
      const { data: overdueInvoices } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (name, email)
        `)
        .eq('status', 'sent')
        .lt('due_date', now.toISOString());

      if (overdueInvoices?.length) {
        for (const invoice of overdueInvoices) {
          const daysOverdue = Math.ceil((now.getTime() - new Date(invoice.due_date).getTime()) / (24 * 60 * 60 * 1000));

          await this.createAlert({
            title: `Overdue Invoice`,
            message: `Invoice #${invoice.invoice_number} for ${invoice.clients.name} is ${daysOverdue} days overdue`,
            type: 'delay',
            severity: 'high',
            status: 'active',
            source: 'system',
            entity_type: 'invoice',
            entity_id: invoice.id,
            recipients: [invoice.created_by],
            channels: ['email', 'dashboard'],
            conditions: [],
            actions: [{
              type: 'email',
              parameters: {
                template: 'overdue-invoice-reminder',
                recipient: invoice.clients.email
              }
            }],
            triggers: [{
              event: 'invoice_overdue_check',
              source: 'system',
              timestamp: now.toISOString(),
              data: { invoice_id: invoice.id, due_date: invoice.due_date }
            }],
            metadata: {
              invoice_number: invoice.invoice_number,
              client_name: invoice.clients.name,
              amount: invoice.total_amount,
              due_date: invoice.due_date,
              days_overdue: daysOverdue
            },
            created_by: 'system'
          });
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'AlertSystem.checkInvoiceAlerts', 'medium');
    }
  }

  async evaluateAlertRules(): Promise<void> {
    try {
      const { data: activeRules } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('is_active', true);

      if (!activeRules?.length) return;

      for (const rule of activeRules) {
        try {
          await this.evaluateRule(rule);
        } catch (ruleError) {
          this.errorHandler.handleError(ruleError, `AlertSystem.evaluateRule.${rule.id}`, 'medium');
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'AlertSystem.evaluateAlertRules', 'medium');
    }
  }

  private async evaluateRule(rule: AlertRule): Promise<void> {
    // Get data based on entity type
    const entityData = await this.getEntityData(rule.entity_type, rule.conditions);
    
    if (!entityData?.length) return;

    for (const entity of entityData) {
      const conditionsMet = this.evaluateConditions(entity, rule.conditions);
      
      if (conditionsMet) {
        // Check if alert already exists for this entity
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('entity_type', rule.entity_type)
          .eq('entity_id', entity.id)
          .eq('status', 'active')
          .eq('type', this.getAlertTypeFromRule(rule))
          .single();

        if (!existingAlert) {
          await this.createAlert({
            title: this.generateAlertTitle(rule, entity),
            message: this.generateAlertMessage(rule, entity),
            type: this.getAlertTypeFromRule(rule),
            severity: this.getSeverityFromRule(rule),
            status: 'active',
            source: 'system',
            entity_type: rule.entity_type,
            entity_id: entity.id,
            recipients: rule.recipients,
            channels: rule.channels as any,
            conditions: rule.conditions,
            actions: rule.actions,
            triggers: [{
              event: 'rule_evaluation',
              source: rule.id,
              timestamp: new Date().toISOString(),
              data: { rule_id: rule.id, entity_id: entity.id }
            }],
            metadata: {
              rule_name: rule.name,
              entity_data: entity
            },
            created_by: 'system'
          });
        }
      }
    }
  }

  private async getEntityData(entityType: string, conditions: AlertCondition[]): Promise<any[]> {
    let tableName = '';
    switch (entityType) {
      case 'project': tableName = 'projects'; break;
      case 'task': tableName = 'project_tasks'; break;
      case 'milestone': tableName = 'project_milestones'; break;
      case 'invoice': tableName = 'invoices'; break;
      case 'client': tableName = 'clients'; break;
      default: return [];
    }

    let query = supabase.from(tableName).select('*');

    // Apply basic conditions as filters
    for (const condition of conditions) {
      if (condition.operator === 'eq') {
        query = query.eq(condition.field, condition.value);
      } else if (condition.operator === 'neq') {
        query = query.neq(condition.field, condition.value);
      } else if (condition.operator === 'gt') {
        query = query.gt(condition.field, condition.value);
      } else if (condition.operator === 'gte') {
        query = query.gte(condition.field, condition.value);
      } else if (condition.operator === 'lt') {
        query = query.lt(condition.field, condition.value);
      } else if (condition.operator === 'lte') {
        query = query.lte(condition.field, condition.value);
      }
    }

    const { data } = await query;
    return data || [];
  }

  private evaluateConditions(entity: any, conditions: AlertCondition[]): boolean {
    return conditions.every(condition => {
      const fieldValue = entity[condition.field];
      
      switch (condition.operator) {
        case 'eq': return fieldValue === condition.value;
        case 'neq': return fieldValue !== condition.value;
        case 'gt': return fieldValue > condition.value;
        case 'gte': return fieldValue >= condition.value;
        case 'lt': return fieldValue < condition.value;
        case 'lte': return fieldValue <= condition.value;
        case 'contains': return fieldValue?.includes(condition.value);
        case 'not_contains': return !fieldValue?.includes(condition.value);
        case 'in': return condition.value.includes(fieldValue);
        case 'not_in': return !condition.value.includes(fieldValue);
        default: return false;
      }
    });
  }

  private async processAlertActions(alert: Alert): Promise<void> {
    for (const action of alert.actions) {
      try {
        await this.executeAlertAction(action, alert);
      } catch (actionError) {
        this.errorHandler.handleError(actionError, `AlertSystem.executeAlertAction.${action.type}`, 'medium');
      }
    }
  }

  private async executeAlertAction(action: AlertAction, alert: Alert): Promise<void> {
    const delay = action.delay ? action.delay * 60 * 1000 : 0;
    
    if (delay > 0) {
      // Schedule delayed action
      await this.queueManager.addJob({
        type: 'alert_action',
        priority: 'medium',
        scheduled_for: new Date(Date.now() + delay),
        data: { action, alert_id: alert.id }
      });
      return;
    }

    switch (action.type) {
      case 'email':
        await this.sendActionEmail(action, alert);
        break;
      case 'auto_assign':
        await this.autoAssignEntity(action, alert);
        break;
      case 'create_task':
        await this.createActionTask(action, alert);
        break;
      case 'update_status':
        await this.updateEntityStatus(action, alert);
        break;
      case 'webhook':
        await this.sendWebhook(action, alert);
        break;
    }
  }

  private async sendAlertNotifications(alert: Alert): Promise<void> {
    for (const channel of alert.channels) {
      switch (channel) {
        case 'email':
          await this.sendEmailNotification(alert);
          break;
        case 'sms':
          await this.sendSMSNotification(alert);
          break;
        case 'push':
          await this.sendPushNotification(alert);
          break;
        case 'dashboard':
          // Dashboard notifications are handled by real-time updates
          break;
      }
    }
  }

  private async sendEmailNotification(alert: Alert): Promise<void> {
    try {
      await this.smtpService.sendTemplateEmail(
        'alert-notification',
        alert.recipients,
        {
          alert_title: alert.title,
          alert_message: alert.message,
          alert_type: alert.type,
          alert_severity: alert.severity,
          alert_url: `${window.location.origin}/admin/alerts/${alert.id}`,
          entity_url: alert.entity_id ? `${window.location.origin}/admin/${alert.entity_type}s/${alert.entity_id}` : null
        },
        { priority: alert.severity === 'critical' ? 'urgent' : 'normal' }
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'AlertSystem.sendEmailNotification', 'medium');
    }
  }

  private async sendSMSNotification(alert: Alert): Promise<void> {
    // Implement SMS sending logic here
    // This would integrate with services like Twilio, AWS SNS, etc.
  }

  private async sendPushNotification(alert: Alert): Promise<void> {
    // Implement push notification logic here
    // This would integrate with services like Firebase, OneSignal, etc.
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          status: 'acknowledged',
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      await this.logAlertActivity('acknowledged', alertId, userId);
    } catch (error) {
      this.errorHandler.handleError(error, 'AlertSystem.acknowledgeAlert', 'medium');
      throw error;
    }
  }

  async resolveAlert(alertId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      await this.logAlertActivity('resolved', alertId, userId);
    } catch (error) {
      this.errorHandler.handleError(error, 'AlertSystem.resolveAlert', 'medium');
      throw error;
    }
  }

  async getAlertDashboard(): Promise<AlertDashboard> {
    try {
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!alerts) {
        return {
          total_alerts: 0,
          active_alerts: 0,
          critical_alerts: 0,
          unacknowledged_alerts: 0,
          alerts_by_type: {},
          alerts_by_severity: {},
          recent_alerts: [],
          trending_issues: []
        };
      }

      const activeAlerts = alerts.filter(a => a.status === 'active');
      const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active');
      const unacknowledgedAlerts = alerts.filter(a => a.status === 'active');

      const alertsByType = alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const alertsBySeverity = alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total_alerts: alerts.length,
        active_alerts: activeAlerts.length,
        critical_alerts: criticalAlerts.length,
        unacknowledged_alerts: unacknowledgedAlerts.length,
        alerts_by_type: alertsByType,
        alerts_by_severity: alertsBySeverity,
        recent_alerts: alerts.slice(0, 10),
        trending_issues: [] // Can be enhanced to analyze patterns
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'AlertSystem.getAlertDashboard', 'low');
      return {
        total_alerts: 0,
        active_alerts: 0,
        critical_alerts: 0,
        unacknowledged_alerts: 0,
        alerts_by_type: {},
        alerts_by_severity: {},
        recent_alerts: [],
        trending_issues: []
      };
    }
  }

  private async scheduleRuleEvaluation(ruleId: string): Promise<void> {
    await this.queueManager.addJob({
      type: 'evaluate_alert_rule',
      priority: 'low',
      scheduled_for: new Date(Date.now() + 60000), // Evaluate every minute
      data: { rule_id: ruleId }
    });
  }

  private getAlertTypeFromRule(rule: AlertRule): Alert['type'] {
    switch (rule.trigger_type) {
      case 'deadline': return 'deadline';
      case 'threshold': return 'warning';
      default: return 'info';
    }
  }

  private getSeverityFromRule(rule: AlertRule): Alert['severity'] {
    return rule.priority > 7 ? 'critical' : rule.priority > 5 ? 'high' : rule.priority > 3 ? 'medium' : 'low';
  }

  private generateAlertTitle(rule: AlertRule, entity: any): string {
    return `${rule.name}: ${entity.title || entity.name || entity.id}`;
  }

  private generateAlertMessage(rule: AlertRule, entity: any): string {
    return `${rule.description} for ${entity.title || entity.name || entity.id}`;
  }

  private async sendActionEmail(action: AlertAction, alert: Alert): Promise<void> {
    // Implementation for sending action-specific emails
  }

  private async autoAssignEntity(action: AlertAction, alert: Alert): Promise<void> {
    // Implementation for auto-assigning entities
  }

  private async createActionTask(action: AlertAction, alert: Alert): Promise<void> {
    // Implementation for creating tasks from alerts
  }

  private async updateEntityStatus(action: AlertAction, alert: Alert): Promise<void> {
    // Implementation for updating entity status
  }

  private async sendWebhook(action: AlertAction, alert: Alert): Promise<void> {
    // Implementation for sending webhooks
  }

  private async logAlertActivity(action: string, alertId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('alert_activity_log')
        .insert({
          action,
          alert_id: alertId,
          user_id: userId,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      this.errorHandler.handleError(error, 'AlertSystem.logAlertActivity', 'low');
    }
  }
}

export default AlertSystem;