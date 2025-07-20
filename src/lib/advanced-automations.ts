import { query } from './database-client';
import DatabaseClient from './database-client';
import { AutomationService } from './automation-service';

export interface AdvancedTrigger {
  id: string;
  type: 'project_status_change' | 'task_completion' | 'milestone_reached' | 'deadline_approaching' | 'team_assignment' | 'file_upload' | 'comment_added' | 'budget_threshold' | 'time_tracking' | 'client_approval' | 'link_shared';
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in' | 'between';
    value: any;
    comparison_field?: string;
  }[];
  schedule?: {
    type: 'immediate' | 'delayed' | 'recurring';
    delay_minutes?: number;
    cron_expression?: string;
    timezone?: string;
  };
  active: boolean;
}

export interface AdvancedAction {
  id: string;
  type: 'team_notification' | 'slack_message' | 'email_template' | 'task_creation' | 'status_update' | 'assign_team_member' | 'create_subtasks' | 'update_timeline' | 'budget_alert' | 'client_notification' | 'file_organization' | 'meeting_schedule' | 'invoice_generation' | 'link_sharing' | 'webhook_call';
  config: {
    [key: string]: any;
  };
  conditional?: {
    if_condition: any;
    then_actions: AdvancedAction[];
    else_actions?: AdvancedAction[];
  };
}

export interface ProjectAutomation {
  id: string;
  name: string;
  description: string;
  project_id?: string; // If null, applies to all projects
  triggers: AdvancedTrigger[];
  actions: AdvancedAction[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  last_executed?: string;
  execution_count: number;
  success_rate: number;
  tags: string[];
  category: 'workflow' | 'notification' | 'integration' | 'reporting' | 'collaboration';
}

export interface TeamCollaboration {
  id: string;
  project_id: string;
  type: 'link_sharing' | 'guest_access' | 'client_portal' | 'external_review';
  participants: {
    user_id?: string;
    email: string;
    role: 'viewer' | 'collaborator' | 'reviewer' | 'admin';
    permissions: string[];
    access_expiry?: string;
  }[];
  shared_resources: {
    type: 'project' | 'task' | 'file' | 'milestone' | 'timeline';
    resource_id: string;
    access_level: 'read' | 'comment' | 'edit';
  }[];
  settings: {
    require_authentication: boolean;
    allow_downloads: boolean;
    allow_comments: boolean;
    track_activity: boolean;
    password_protected: boolean;
    password?: string;
  };
  analytics: {
    views: number;
    downloads: number;
    comments: number;
    last_accessed?: string;
  };
  created_by: string;
  created_at: string;
  expires_at?: string;
}

export interface SmartWorkflow {
  id: string;
  name: string;
  description: string;
  template_category: 'development' | 'design' | 'marketing' | 'consulting' | 'custom';
  phases: WorkflowPhase[];
  dependencies: WorkflowDependency[];
  variables: WorkflowVariable[];
  estimated_duration: number; // in days
  team_roles_required: string[];
  client_involvement_points: string[];
  approval_gates: ApprovalGate[];
  risk_factors: RiskFactor[];
  success_metrics: SuccessMetric[];
  created_by: string;
  usage_count: number;
  rating: number;
}

export interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  estimated_duration: number;
  tasks: WorkflowTask[];
  deliverables: string[];
  required_roles: string[];
  prerequisites: string[];
  automation_rules: ProjectAutomation[];
}

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  type: 'development' | 'design' | 'review' | 'testing' | 'documentation' | 'client_approval' | 'deployment';
  estimated_hours: number;
  required_skills: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  template_content?: string;
  checklist_items: string[];
  dependencies: string[];
  automation_triggers: AdvancedTrigger[];
}

export interface WorkflowDependency {
  from_phase_id: string;
  to_phase_id: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag_days: number;
  conditions?: any[];
}

export interface WorkflowVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select';
  default_value?: any;
  options?: string[];
  required: boolean;
  description: string;
}

export interface ApprovalGate {
  id: string;
  name: string;
  phase_id: string;
  required_approvers: string[];
  approval_criteria: string;
  timeout_days: number;
  escalation_rules: {
    after_days: number;
    escalate_to: string[];
    actions: AdvancedAction[];
  }[];
}

export interface RiskFactor {
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation_strategy: string;
  monitoring_indicators: string[];
}

export interface SuccessMetric {
  name: string;
  description: string;
  measurement_method: string;
  target_value: number;
  unit: string;
  tracking_frequency: 'daily' | 'weekly' | 'milestone' | 'completion';
}

export class AdvancedAutomationService {
  // Project Automation Management
  static async createProjectAutomation(automation: Omit<ProjectAutomation, 'id' | 'created_at' | 'execution_count' | 'success_rate'>, userId: string): Promise<ProjectAutomation> {
    const result = await query(
      `INSERT INTO project_automations (name, description, project_id, triggers, actions, is_active, created_by, created_at, execution_count, success_rate, tags, category) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 0, 100, $8, $9) RETURNING *`,
      [
        automation.name,
        automation.description,
        automation.project_id,
        JSON.stringify(automation.triggers),
        JSON.stringify(automation.actions),
        automation.is_active,
        userId,
        JSON.stringify(automation.tags),
        automation.category
      ]
    );

    await DatabaseClient.logActivity(userId, 'CREATE', 'project_automation', result.rows[0].id, automation);
    return this.parseAutomation(result.rows[0]);
  }

  static async executeProjectAutomation(automationId: string, context: any, userId: string): Promise<boolean> {
    try {
      const automation = await this.getProjectAutomation(automationId);
      if (!automation || !automation.is_active) {
        return false;
      }

      // Check triggers
      const triggersPassed = automation.triggers.every(trigger => 
        this.evaluateTrigger(trigger, context)
      );

      if (!triggersPassed) {
        return false;
      }

      // Execute actions
      for (const action of automation.actions) {
        await this.executeAction(action, context, userId);
      }

      // Update execution stats
      await query(
        `UPDATE project_automations SET 
         execution_count = execution_count + 1,
         last_executed = NOW()
         WHERE id = $1`,
        [automationId]
      );

      await DatabaseClient.logActivity(userId, 'EXECUTE', 'project_automation', automationId, context);
      return true;
    } catch (error) {
      console.error('Automation execution failed:', error);
      
      // Update failure rate
      await query(
        `UPDATE project_automations SET 
         execution_count = execution_count + 1,
         success_rate = (success_rate * (execution_count - 1) + 0) / execution_count
         WHERE id = $1`,
        [automationId]
      );
      
      return false;
    }
  }

  static async evaluateTrigger(trigger: AdvancedTrigger, context: any): Promise<boolean> {
    return trigger.conditions.every(condition => {
      const fieldValue = this.getNestedValue(context, condition.field);
      const compareValue = condition.comparison_field 
        ? this.getNestedValue(context, condition.comparison_field)
        : condition.value;

      switch (condition.operator) {
        case 'equals':
          return fieldValue === compareValue;
        case 'not_equals':
          return fieldValue !== compareValue;
        case 'greater_than':
          return fieldValue > compareValue;
        case 'less_than':
          return fieldValue < compareValue;
        case 'contains':
          return String(fieldValue).includes(String(compareValue));
        case 'starts_with':
          return String(fieldValue).startsWith(String(compareValue));
        case 'ends_with':
          return String(fieldValue).endsWith(String(compareValue));
        case 'in':
          return Array.isArray(compareValue) && compareValue.includes(fieldValue);
        case 'not_in':
          return Array.isArray(compareValue) && !compareValue.includes(fieldValue);
        case 'between':
          return Array.isArray(compareValue) && fieldValue >= compareValue[0] && fieldValue <= compareValue[1];
        default:
          return false;
      }
    });
  }

  static async executeAction(action: AdvancedAction, context: any, userId: string): Promise<void> {
    switch (action.type) {
      case 'team_notification':
        await this.sendTeamNotification(action.config, context);
        break;
      case 'slack_message':
        await this.sendSlackMessage(action.config, context);
        break;
      case 'email_template':
        await this.sendEmailTemplate(action.config, context);
        break;
      case 'task_creation':
        await this.createAutomaticTask(action.config, context, userId);
        break;
      case 'status_update':
        await this.updateStatus(action.config, context, userId);
        break;
      case 'assign_team_member':
        await this.assignTeamMember(action.config, context, userId);
        break;
      case 'create_subtasks':
        await this.createSubtasks(action.config, context, userId);
        break;
      case 'update_timeline':
        await this.updateTimeline(action.config, context, userId);
        break;
      case 'budget_alert':
        await this.sendBudgetAlert(action.config, context);
        break;
      case 'client_notification':
        await this.sendClientNotification(action.config, context);
        break;
      case 'file_organization':
        await this.organizeFiles(action.config, context, userId);
        break;
      case 'meeting_schedule':
        await this.scheduleMeeting(action.config, context, userId);
        break;
      case 'invoice_generation':
        await this.generateInvoice(action.config, context, userId);
        break;
      case 'link_sharing':
        await this.shareProjectLink(action.config, context, userId);
        break;
      case 'webhook_call':
        await this.callWebhook(action.config, context);
        break;
    }
  }

  // Team Collaboration
  static async createTeamCollaboration(collaboration: Omit<TeamCollaboration, 'id' | 'created_at' | 'analytics'>, userId: string): Promise<TeamCollaboration> {
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await query(
      `INSERT INTO team_collaborations (id, project_id, type, participants, shared_resources, settings, analytics, created_by, created_at, expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9) RETURNING *`,
      [
        shareId,
        collaboration.project_id,
        collaboration.type,
        JSON.stringify(collaboration.participants),
        JSON.stringify(collaboration.shared_resources),
        JSON.stringify(collaboration.settings),
        JSON.stringify({ views: 0, downloads: 0, comments: 0 }),
        userId,
        collaboration.expires_at
      ]
    );

    // Send invitation emails
    for (const participant of collaboration.participants) {
      if (participant.email && !participant.user_id) {
        await this.sendCollaborationInvite(participant.email, shareId, collaboration);
      }
    }

    await DatabaseClient.logActivity(userId, 'CREATE', 'team_collaboration', shareId, collaboration);
    return this.parseCollaboration(result.rows[0]);
  }

  static async shareProjectLink(config: any, context: any, userId: string): Promise<void> {
    const collaboration: Omit<TeamCollaboration, 'id' | 'created_at' | 'analytics'> = {
      project_id: context.project_id,
      type: config.type || 'link_sharing',
      participants: config.participants || [],
      shared_resources: config.shared_resources || [
        {
          type: 'project',
          resource_id: context.project_id,
          access_level: config.access_level || 'read'
        }
      ],
      settings: {
        require_authentication: config.require_authentication || false,
        allow_downloads: config.allow_downloads || true,
        allow_comments: config.allow_comments || true,
        track_activity: config.track_activity || true,
        password_protected: config.password_protected || false,
        password: config.password
      },
      created_by: userId,
      expires_at: config.expires_at
    };

    await this.createTeamCollaboration(collaboration, userId);
  }

  // Smart Workflows
  static async createSmartWorkflow(workflow: Omit<SmartWorkflow, 'id' | 'usage_count' | 'rating'>, userId: string): Promise<SmartWorkflow> {
    const result = await query(
      `INSERT INTO smart_workflows (name, description, template_category, phases, dependencies, variables, estimated_duration, team_roles_required, client_involvement_points, approval_gates, risk_factors, success_metrics, created_by, usage_count, rating) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0, 0) RETURNING *`,
      [
        workflow.name,
        workflow.description,
        workflow.template_category,
        JSON.stringify(workflow.phases),
        JSON.stringify(workflow.dependencies),
        JSON.stringify(workflow.variables),
        workflow.estimated_duration,
        JSON.stringify(workflow.team_roles_required),
        JSON.stringify(workflow.client_involvement_points),
        JSON.stringify(workflow.approval_gates),
        JSON.stringify(workflow.risk_factors),
        JSON.stringify(workflow.success_metrics),
        userId
      ]
    );

    await DatabaseClient.logActivity(userId, 'CREATE', 'smart_workflow', result.rows[0].id, workflow);
    return this.parseWorkflow(result.rows[0]);
  }

  static async applyWorkflowToProject(workflowId: string, projectId: string, variables: { [key: string]: any }, userId: string): Promise<void> {
    const workflow = await this.getSmartWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Create project phases based on workflow
    for (const phase of workflow.phases) {
      const phaseResult = await query(
        `INSERT INTO project_phases (project_id, name, description, estimated_duration, order_index, status, created_by, created_at) 
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW()) RETURNING *`,
        [
          projectId,
          this.replaceVariables(phase.name, variables),
          this.replaceVariables(phase.description, variables),
          phase.estimated_duration,
          phase.order,
          userId
        ]
      );

      const phaseId = phaseResult.rows[0].id;

      // Create tasks for each phase
      for (const task of phase.tasks) {
        await query(
          `INSERT INTO tasks (project_id, phase_id, title, description, type, estimated_hours, priority, status, checklist_items, dependencies, created_by, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10, NOW())`,
          [
            projectId,
            phaseId,
            this.replaceVariables(task.title, variables),
            this.replaceVariables(task.description, variables),
            task.type,
            task.estimated_hours,
            task.priority,
            JSON.stringify(task.checklist_items),
            JSON.stringify(task.dependencies),
            userId
          ]
        );
      }

      // Create automation rules for the phase
      for (const automation of phase.automation_rules) {
        await this.createProjectAutomation({
          ...automation,
          project_id: projectId
        }, userId);
      }
    }

    // Update workflow usage count
    await query(
      `UPDATE smart_workflows SET usage_count = usage_count + 1 WHERE id = $1`,
      [workflowId]
    );

    await DatabaseClient.logActivity(userId, 'APPLY_WORKFLOW', 'project', projectId, {
      workflow_id: workflowId,
      variables
    });
  }

  // AI-Powered Suggestions
  static async getAutomationSuggestions(projectId: string, userId: string): Promise<any[]> {
    // Analyze project patterns and suggest automations
    const projectData = await query(
      `SELECT p.*, 
       COUNT(t.id) as task_count,
       COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
       AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600) as avg_task_duration
       FROM projects p
       LEFT JOIN tasks t ON p.id = t.project_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [projectId]
    );

    const suggestions = [];

    if (projectData.rows.length > 0) {
      const project = projectData.rows[0];

      // Suggest task completion notifications
      if (project.completed_tasks > 0) {
        suggestions.push({
          type: 'task_completion_notification',
          title: 'Task Completion Notifications',
          description: 'Automatically notify team members when tasks are completed',
          estimated_impact: 'high',
          setup_difficulty: 'easy'
        });
      }

      // Suggest deadline reminders
      suggestions.push({
        type: 'deadline_reminders',
        title: 'Deadline Reminders',
        description: 'Send automatic reminders before task and milestone deadlines',
        estimated_impact: 'medium',
        setup_difficulty: 'easy'
      });

      // Suggest budget tracking
      if (project.budget_amount) {
        suggestions.push({
          type: 'budget_tracking',
          title: 'Budget Alert System',
          description: 'Get notified when project budget reaches certain thresholds',
          estimated_impact: 'high',
          setup_difficulty: 'medium'
        });
      }

      // Suggest client update automation
      suggestions.push({
        type: 'client_updates',
        title: 'Automated Client Updates',
        description: 'Send regular progress updates to clients automatically',
        estimated_impact: 'high',
        setup_difficulty: 'medium'
      });
    }

    return suggestions;
  }

  // Utility methods
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static replaceVariables(text: string, variables: { [key: string]: any }): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
  }

  private static parseAutomation(row: any): ProjectAutomation {
    return {
      ...row,
      triggers: JSON.parse(row.triggers),
      actions: JSON.parse(row.actions),
      tags: JSON.parse(row.tags)
    };
  }

  private static parseCollaboration(row: any): TeamCollaboration {
    return {
      ...row,
      participants: JSON.parse(row.participants),
      shared_resources: JSON.parse(row.shared_resources),
      settings: JSON.parse(row.settings),
      analytics: JSON.parse(row.analytics)
    };
  }

  private static parseWorkflow(row: any): SmartWorkflow {
    return {
      ...row,
      phases: JSON.parse(row.phases),
      dependencies: JSON.parse(row.dependencies),
      variables: JSON.parse(row.variables),
      team_roles_required: JSON.parse(row.team_roles_required),
      client_involvement_points: JSON.parse(row.client_involvement_points),
      approval_gates: JSON.parse(row.approval_gates),
      risk_factors: JSON.parse(row.risk_factors),
      success_metrics: JSON.parse(row.success_metrics)
    };
  }

  // Action implementations
  private static async sendTeamNotification(config: any, context: any): Promise<void> {
    // Implementation for team notifications
  }

  private static async sendSlackMessage(config: any, context: any): Promise<void> {
    // Implementation for Slack integration
  }

  private static async sendEmailTemplate(config: any, context: any): Promise<void> {
    // Implementation for email templates
  }

  private static async createAutomaticTask(config: any, context: any, userId: string): Promise<void> {
    // Implementation for automatic task creation
  }

  private static async updateStatus(config: any, context: any, userId: string): Promise<void> {
    // Implementation for status updates
  }

  private static async assignTeamMember(config: any, context: any, userId: string): Promise<void> {
    // Implementation for team member assignment
  }

  private static async createSubtasks(config: any, context: any, userId: string): Promise<void> {
    // Implementation for subtask creation
  }

  private static async updateTimeline(config: any, context: any, userId: string): Promise<void> {
    // Implementation for timeline updates
  }

  private static async sendBudgetAlert(config: any, context: any): Promise<void> {
    // Implementation for budget alerts
  }

  private static async sendClientNotification(config: any, context: any): Promise<void> {
    // Implementation for client notifications
  }

  private static async organizeFiles(config: any, context: any, userId: string): Promise<void> {
    // Implementation for file organization
  }

  private static async scheduleMeeting(config: any, context: any, userId: string): Promise<void> {
    // Implementation for meeting scheduling
  }

  private static async generateInvoice(config: any, context: any, userId: string): Promise<void> {
    // Implementation for invoice generation
  }

  private static async callWebhook(config: any, context: any): Promise<void> {
    // Implementation for webhook calls
  }

  private static async sendCollaborationInvite(email: string, shareId: string, collaboration: any): Promise<void> {
    // Implementation for collaboration invites
  }

  private static async getProjectAutomation(id: string): Promise<ProjectAutomation | null> {
    const result = await query('SELECT * FROM project_automations WHERE id = $1', [id]);
    return result.rows.length > 0 ? this.parseAutomation(result.rows[0]) : null;
  }

  private static async getSmartWorkflow(id: string): Promise<SmartWorkflow | null> {
    const result = await query('SELECT * FROM smart_workflows WHERE id = $1', [id]);
    return result.rows.length > 0 ? this.parseWorkflow(result.rows[0]) : null;
  }
}

export default AdvancedAutomationService;