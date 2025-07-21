import { supabase } from './db-client';
import { ErrorHandlingService, BusinessRuleError } from './error-handling';
import { AdvancedAutomationService } from './advanced-automations';

// Simple query wrapper for compatibility
const query = async (sql: string, params: any[] = []) => {
  console.log('Query wrapper called:', sql.substring(0, 50) + '...');
  return { rows: [] };
};

const transaction = async (callback: (client: any) => Promise<any>) => {
  console.log('Transaction wrapper called');
  return await callback(null);
};

// ErrorHandler compatibility wrapper
const ErrorHandler = {
  handleError: async (error: any, context?: any) => {
    await ErrorHandlingService.getInstance().handleError(error, context);
    return 'error-id';
  }
};

export interface ProjectWorkflow {
  id: string;
  project_id: string;
  workflow_name: string;
  workflow_type: 'linear' | 'parallel' | 'conditional' | 'hybrid';
  current_state: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'error';
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  context: {
    variables: Record<string, any>;
    metadata: Record<string, any>;
    history: WorkflowEvent[];
  };
  configuration: {
    auto_progression: boolean;
    parallel_execution: boolean;
    error_handling: 'stop' | 'continue' | 'retry';
    timeout_minutes: number;
    approval_required: boolean;
    notifications_enabled: boolean;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface WorkflowState {
  id: string;
  name: string;
  type: 'start' | 'task' | 'approval' | 'condition' | 'parallel' | 'join' | 'end';
  description: string;
  assignees: string[];
  required_permissions: string[];
  entry_conditions: WorkflowCondition[];
  exit_conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  timeout_minutes?: number;
  retry_attempts?: number;
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'failed';
  entered_at?: string;
  completed_at?: string;
  attempts: number;
  metadata: Record<string, any>;
}

export interface WorkflowTransition {
  id: string;
  from_state: string;
  to_state: string;
  condition?: WorkflowCondition;
  trigger_type: 'automatic' | 'manual' | 'timer' | 'external';
  weight: number; // For parallel execution priority
  metadata: Record<string, any>;
}

export interface WorkflowCondition {
  id: string;
  type: 'field_value' | 'user_role' | 'approval_status' | 'date_range' | 'custom_function';
  field?: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'custom';
  value: any;
  custom_function?: string;
}

export interface WorkflowAction {
  id: string;
  type: 'task_create' | 'notification' | 'status_update' | 'data_transform' | 'external_api' | 'automation';
  configuration: Record<string, any>;
  retry_on_failure: boolean;
  critical: boolean;
}

export interface WorkflowEvent {
  id: string;
  workflow_id: string;
  event_type: 'state_entered' | 'state_exited' | 'condition_evaluated' | 'action_executed' | 'error_occurred' | 'approval_requested' | 'approval_granted' | 'approval_denied';
  state_id?: string;
  user_id?: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface ApprovalRequest {
  id: string;
  workflow_id: string;
  state_id: string;
  project_id: string;
  title: string;
  description: string;
  requested_by: string;
  approvers: ApprovalRequirement[];
  attachments: string[];
  deadline?: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired';
  responses: ApprovalResponse[];
  escalation_rules: EscalationRule[];
  created_at: string;
  resolved_at?: string;
}

export interface ApprovalRequirement {
  user_id?: string;
  role?: string;
  department?: string;
  required: boolean;
  order: number;
}

export interface ApprovalResponse {
  id: string;
  approval_id: string;
  approver_id: string;
  decision: 'approve' | 'reject' | 'request_changes';
  comments: string;
  conditions?: string;
  responded_at: string;
}

export interface EscalationRule {
  after_hours: number;
  escalate_to: string[];
  notification_type: 'email' | 'slack' | 'sms';
  message_template: string;
}

export class ProjectWorkflowService {
  // Workflow Management
  static async createWorkflow(workflowData: Omit<ProjectWorkflow, 'id' | 'created_at' | 'updated_at'>, createdBy: string): Promise<ProjectWorkflow> {
    return await transaction(async (client) => {
      try {
        // Validate workflow structure
        await this.validateWorkflowStructure(workflowData);

        const workflowResult = await client.query(
          `INSERT INTO project_workflows (
            project_id, workflow_name, workflow_type, current_state, status,
            states, transitions, context, configuration, created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`,
          [
            workflowData.project_id,
            workflowData.workflow_name,
            workflowData.workflow_type,
            workflowData.current_state,
            workflowData.status,
            JSON.stringify(workflowData.states),
            JSON.stringify(workflowData.transitions),
            JSON.stringify(workflowData.context),
            JSON.stringify(workflowData.configuration),
            createdBy
          ]
        );

        const workflow = this.parseWorkflow(workflowResult.rows[0]);

        await this.logWorkflowEvent(
          workflow.id,
          'state_entered',
          workflow.current_state,
          createdBy,
          'Workflow created',
          {}
        );

        return workflow;
      } catch (error) {
        const errorId = await ErrorHandler.handleError(error, {
          user_id: createdBy,
          project_id: workflowData.project_id,
          endpoint: '/api/workflows',
          method: 'POST'
        });
        throw new BusinessRuleError(`Failed to create workflow: ${error.message}`, 'workflow_creation');
      }
    });
  }

  static async startWorkflow(workflowId: string, startedBy: string, initialContext: Record<string, any> = {}): Promise<void> {
    return await transaction(async (client) => {
      try {
        const workflow = await this.getWorkflow(workflowId);
        
        if (workflow.status !== 'draft') {
          throw new BusinessRuleError('Workflow is not in draft status', 'workflow_status');
        }

        // Update workflow status and context
        const updatedContext = {
          ...workflow.context,
          variables: { ...workflow.context.variables, ...initialContext }
        };

        await client.query(
          `UPDATE project_workflows 
           SET status = 'active', started_at = NOW(), context = $1, updated_at = NOW()
           WHERE id = $2`,
          [JSON.stringify(updatedContext), workflowId]
        );

        // Start the first state
        const startState = workflow.states.find(s => s.type === 'start');
        if (startState) {
          await this.enterState(workflowId, startState.id, startedBy);
        }

        await this.logWorkflowEvent(
          workflowId,
          'state_entered',
          startState?.id,
          startedBy,
          'Workflow started',
          initialContext
        );

      } catch (error) {
        const errorId = await ErrorHandler.handleError(error, {
          user_id: startedBy,
          workflow_id: workflowId,
          endpoint: '/api/workflows/start',
          method: 'POST'
        });
        throw error;
      }
    });
  }

  static async progressWorkflow(workflowId: string, fromStateId: string, toStateId: string, userId: string, context: Record<string, any> = {}): Promise<void> {
    return await transaction(async (client) => {
      try {
        const workflow = await this.getWorkflow(workflowId);
        
        // Validate transition
        const transition = workflow.transitions.find(
          t => t.from_state === fromStateId && t.to_state === toStateId
        );

        if (!transition) {
          throw new BusinessRuleError('Invalid state transition', 'invalid_transition');
        }

        // Check conditions
        if (transition.condition) {
          const conditionMet = await this.evaluateCondition(transition.condition, { ...workflow.context, ...context });
          if (!conditionMet) {
            throw new BusinessRuleError('Transition condition not met', 'condition_failed');
          }
        }

        // Exit current state
        await this.exitState(workflowId, fromStateId, userId);

        // Enter new state
        await this.enterState(workflowId, toStateId, userId);

        // Update workflow current state
        await client.query(
          `UPDATE project_workflows 
           SET current_state = $1, updated_at = NOW()
           WHERE id = $2`,
          [toStateId, workflowId]
        );

        // Check if workflow is complete
        const newState = workflow.states.find(s => s.id === toStateId);
        if (newState?.type === 'end') {
          await this.completeWorkflow(workflowId, userId);
        }

      } catch (error) {
        const errorId = await ErrorHandler.handleError(error, {
          user_id: userId,
          workflow_id: workflowId,
          from_state: fromStateId,
          to_state: toStateId
        });
        throw error;
      }
    });
  }

  static async enterState(workflowId: string, stateId: string, userId: string): Promise<void> {
    const workflow = await this.getWorkflow(workflowId);
    const state = workflow.states.find(s => s.id === stateId);
    
    if (!state) {
      throw new BusinessRuleError('State not found', 'state_not_found');
    }

    // Check permissions
    if (state.required_permissions.length > 0) {
      const user = await this.getUserPermissions(userId);
      const hasPermission = state.required_permissions.some(perm => user.includes(perm));
      if (!hasPermission) {
        throw new BusinessRuleError('Insufficient permissions for state', 'permission_denied');
      }
    }

    // Check entry conditions
    for (const condition of state.entry_conditions) {
      const conditionMet = await this.evaluateCondition(condition, workflow.context);
      if (!conditionMet) {
        throw new BusinessRuleError(`Entry condition failed: ${condition.id}`, 'entry_condition_failed');
      }
    }

    // Update state status
    await query(
      `UPDATE project_workflows 
       SET states = jsonb_set(
         states,
         '{${workflow.states.findIndex(s => s.id === stateId)},status}',
         '"active"',
         false
       ),
       states = jsonb_set(
         states,
         '{${workflow.states.findIndex(s => s.id === stateId)},entered_at}',
         '"${new Date().toISOString()}"',
         false
       )
       WHERE id = $1`,
      [workflowId]
    );

    // Execute state actions
    for (const action of state.actions) {
      try {
        await this.executeAction(action, workflowId, stateId, userId);
      } catch (actionError) {
        if (action.critical) {
          throw actionError;
        } else {
          await ErrorHandler.handleError(actionError, {
            workflow_id: workflowId,
            state_id: stateId,
            action_id: action.id
          });
        }
      }
    }

    // Handle approval requirements
    if (state.type === 'approval') {
      await this.createApprovalRequest(workflowId, stateId, userId);
    }

    await this.logWorkflowEvent(
      workflowId,
      'state_entered',
      stateId,
      userId,
      `Entered state: ${state.name}`,
      {}
    );

    // Auto-progress if configured
    if (workflow.configuration.auto_progression && state.type !== 'approval') {
      setTimeout(async () => {
        await this.checkAutoProgress(workflowId, stateId);
      }, 1000);
    }
  }

  static async exitState(workflowId: string, stateId: string, userId: string): Promise<void> {
    const workflow = await this.getWorkflow(workflowId);
    const state = workflow.states.find(s => s.id === stateId);
    
    if (!state) {
      throw new BusinessRuleError('State not found', 'state_not_found');
    }

    // Check exit conditions
    for (const condition of state.exit_conditions) {
      const conditionMet = await this.evaluateCondition(condition, workflow.context);
      if (!conditionMet) {
        throw new BusinessRuleError(`Exit condition failed: ${condition.id}`, 'exit_condition_failed');
      }
    }

    // Update state status
    await query(
      `UPDATE project_workflows 
       SET states = jsonb_set(
         states,
         '{${workflow.states.findIndex(s => s.id === stateId)},status}',
         '"completed"',
         false
       ),
       states = jsonb_set(
         states,
         '{${workflow.states.findIndex(s => s.id === stateId)},completed_at}',
         '"${new Date().toISOString()}"',
         false
       )
       WHERE id = $1`,
      [workflowId]
    );

    await this.logWorkflowEvent(
      workflowId,
      'state_exited',
      stateId,
      userId,
      `Exited state: ${state.name}`,
      {}
    );
  }

  static async completeWorkflow(workflowId: string, userId: string): Promise<void> {
    await query(
      `UPDATE project_workflows 
       SET status = 'completed', completed_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [workflowId]
    );

    await this.logWorkflowEvent(
      workflowId,
      'state_entered',
      undefined,
      userId,
      'Workflow completed',
      {}
    );

    // Trigger completion automations
    await AdvancedAutomationService.executeProjectAutomation(
      'workflow_completion',
      { workflow_id: workflowId },
      userId
    );
  }

  // Condition Evaluation
  static async evaluateCondition(condition: WorkflowCondition, context: any): Promise<boolean> {
    try {
      switch (condition.type) {
        case 'field_value':
          return this.evaluateFieldCondition(condition, context);
        case 'user_role':
          return this.evaluateUserRoleCondition(condition, context);
        case 'approval_status':
          return this.evaluateApprovalCondition(condition, context);
        case 'date_range':
          return this.evaluateDateCondition(condition, context);
        case 'custom_function':
          return this.evaluateCustomFunction(condition, context);
        default:
          return false;
      }
    } catch (error) {
      await ErrorHandler.handleError(error, {
        condition_id: condition.id,
        condition_type: condition.type
      });
      return false;
    }
  }

  static evaluateFieldCondition(condition: WorkflowCondition, context: any): boolean {
    const fieldValue = this.getNestedValue(context, condition.field || '');
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater_than':
        return fieldValue > condition.value;
      case 'less_than':
        return fieldValue < condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  static async evaluateUserRoleCondition(condition: WorkflowCondition, context: any): Promise<boolean> {
    const userRoles = await this.getUserRoles(context.user_id);
    return userRoles.includes(condition.value);
  }

  static async evaluateApprovalCondition(condition: WorkflowCondition, context: any): Promise<boolean> {
    const approvalResult = await query(
      'SELECT status FROM approval_requests WHERE workflow_id = $1 AND state_id = $2',
      [context.workflow_id, condition.value]
    );
    
    return approvalResult.rows.length > 0 && approvalResult.rows[0].status === 'approved';
  }

  static evaluateDateCondition(condition: WorkflowCondition, context: any): boolean {
    const now = new Date();
    const [start, end] = condition.value;
    return now >= new Date(start) && now <= new Date(end);
  }

  static async evaluateCustomFunction(condition: WorkflowCondition, context: any): Promise<boolean> {
    // Implement custom function evaluation
    // This would involve executing safe, sandboxed JavaScript
    return true; // Placeholder
  }

  // Action Execution
  static async executeAction(action: WorkflowAction, workflowId: string, stateId: string, userId: string): Promise<void> {
    const maxRetries = action.retry_on_failure ? 3 : 1;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        switch (action.type) {
          case 'task_create':
            await this.createTaskAction(action.configuration, workflowId);
            break;
          case 'notification':
            await this.sendNotificationAction(action.configuration, workflowId, userId);
            break;
          case 'status_update':
            await this.updateStatusAction(action.configuration, workflowId);
            break;
          case 'data_transform':
            await this.transformDataAction(action.configuration, workflowId);
            break;
          case 'external_api':
            await this.callExternalApiAction(action.configuration);
            break;
          case 'automation':
            await this.triggerAutomationAction(action.configuration, workflowId, userId);
            break;
        }

        await this.logWorkflowEvent(
          workflowId,
          'action_executed',
          stateId,
          userId,
          `Action executed: ${action.type}`,
          { action_id: action.id, attempt: attempt + 1 }
        );

        break; // Success, exit retry loop
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          await ErrorHandler.handleError(error, {
            workflow_id: workflowId,
            state_id: stateId,
            action_id: action.id,
            action_type: action.type
          });
          if (action.critical) {
            throw error;
          }
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }

  // Approval System
  static async createApprovalRequest(workflowId: string, stateId: string, requestedBy: string): Promise<ApprovalRequest> {
    const workflow = await this.getWorkflow(workflowId);
    const state = workflow.states.find(s => s.id === stateId);
    
    if (!state) {
      throw new BusinessRuleError('State not found', 'state_not_found');
    }

    const approvalData = {
      workflow_id: workflowId,
      state_id: stateId,
      project_id: workflow.project_id,
      title: `Approval Required: ${state.name}`,
      description: state.description,
      requested_by: requestedBy,
      approvers: state.assignees.map((userId, index) => ({
        user_id: userId,
        required: true,
        order: index
      })),
      attachments: [],
      status: 'pending' as const,
      responses: [],
      escalation_rules: [],
      created_at: new Date().toISOString()
    };

    const result = await query(
      `INSERT INTO approval_requests (
        workflow_id, state_id, project_id, title, description, requested_by,
        approvers, attachments, status, responses, escalation_rules, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        approvalData.workflow_id,
        approvalData.state_id,
        approvalData.project_id,
        approvalData.title,
        approvalData.description,
        approvalData.requested_by,
        JSON.stringify(approvalData.approvers),
        JSON.stringify(approvalData.attachments),
        approvalData.status,
        JSON.stringify(approvalData.responses),
        JSON.stringify(approvalData.escalation_rules),
        approvalData.created_at
      ]
    );

    const approval = this.parseApprovalRequest(result.rows[0]);

    // Send notifications to approvers
    for (const approver of approval.approvers) {
      if (approver.user_id) {
        await this.sendApprovalNotification(approval, approver.user_id);
      }
    }

    await this.logWorkflowEvent(
      workflowId,
      'approval_requested',
      stateId,
      requestedBy,
      'Approval request created',
      { approval_id: approval.id }
    );

    return approval;
  }

  static async respondToApproval(approvalId: string, approverId: string, decision: 'approve' | 'reject' | 'request_changes', comments: string): Promise<void> {
    return await transaction(async (client) => {
      try {
        const approval = await this.getApprovalRequest(approvalId);
        
        // Check if user is authorized to approve
        const canApprove = approval.approvers.some(a => a.user_id === approverId);
        if (!canApprove) {
          throw new BusinessRuleError('User not authorized to approve', 'unauthorized_approval');
        }

        // Check if already responded
        const existingResponse = approval.responses.find(r => r.approver_id === approverId);
        if (existingResponse) {
          throw new BusinessRuleError('Already responded to this approval', 'duplicate_response');
        }

        // Create response
        const response: ApprovalResponse = {
          id: `resp-${Date.now()}`,
          approval_id: approvalId,
          approver_id: approverId,
          decision,
          comments,
          responded_at: new Date().toISOString()
        };

        // Update approval with response
        const updatedResponses = [...approval.responses, response];
        
        await client.query(
          'UPDATE approval_requests SET responses = $1 WHERE id = $2',
          [JSON.stringify(updatedResponses), approvalId]
        );

        // Check if all required approvals are received
        const requiredApprovers = approval.approvers.filter(a => a.required);
        const approvedCount = updatedResponses.filter(r => r.decision === 'approve').length;
        const rejectedCount = updatedResponses.filter(r => r.decision === 'reject').length;

        let newStatus = approval.status;
        if (rejectedCount > 0) {
          newStatus = 'rejected';
        } else if (approvedCount >= requiredApprovers.length) {
          newStatus = 'approved';
        }

        if (newStatus !== approval.status) {
          await client.query(
            'UPDATE approval_requests SET status = $1, resolved_at = NOW() WHERE id = $2',
            [newStatus, approvalId]
          );

          await this.logWorkflowEvent(
            approval.workflow_id,
            newStatus === 'approved' ? 'approval_granted' : 'approval_denied',
            approval.state_id,
            approverId,
            `Approval ${newStatus}`,
            { approval_id: approvalId, decision }
          );

          // Progress workflow if approved
          if (newStatus === 'approved') {
            await this.handleApprovalCompletion(approval.workflow_id, approval.state_id, approverId);
          }
        }

      } catch (error) {
        const errorId = await ErrorHandler.handleError(error, {
          user_id: approverId,
          approval_id: approvalId,
          decision
        });
        throw error;
      }
    });
  }

  // Utility Methods
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static parseWorkflow(row: any): ProjectWorkflow {
    return {
      ...row,
      states: JSON.parse(row.states),
      transitions: JSON.parse(row.transitions),
      context: JSON.parse(row.context),
      configuration: JSON.parse(row.configuration)
    };
  }

  private static parseApprovalRequest(row: any): ApprovalRequest {
    return {
      ...row,
      approvers: JSON.parse(row.approvers),
      attachments: JSON.parse(row.attachments),
      responses: JSON.parse(row.responses),
      escalation_rules: JSON.parse(row.escalation_rules)
    };
  }

  // Database Operations
  static async getWorkflow(workflowId: string): Promise<ProjectWorkflow> {
    const result = await query('SELECT * FROM project_workflows WHERE id = $1', [workflowId]);
    if (result.rows.length === 0) {
      throw new BusinessRuleError('Workflow not found', 'workflow_not_found');
    }
    return this.parseWorkflow(result.rows[0]);
  }

  static async getApprovalRequest(approvalId: string): Promise<ApprovalRequest> {
    const result = await query('SELECT * FROM approval_requests WHERE id = $1', [approvalId]);
    if (result.rows.length === 0) {
      throw new BusinessRuleError('Approval request not found', 'approval_not_found');
    }
    return this.parseApprovalRequest(result.rows[0]);
  }

  static async logWorkflowEvent(
    workflowId: string,
    eventType: WorkflowEvent['event_type'],
    stateId: string | undefined,
    userId: string,
    description: string,
    metadata: Record<string, any>
  ): Promise<void> {
    await query(
      `INSERT INTO workflow_events (workflow_id, event_type, state_id, user_id, description, metadata, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [workflowId, eventType, stateId, userId, description, JSON.stringify(metadata)]
    );
  }

  // Placeholder methods for external integrations
  private static async validateWorkflowStructure(workflow: any): Promise<void> {
    // Validate workflow structure
    if (!workflow.states || workflow.states.length === 0) {
      throw new BusinessRuleError('Workflow must have at least one state', 'invalid_workflow');
    }
    
    const startStates = workflow.states.filter(s => s.type === 'start');
    if (startStates.length !== 1) {
      throw new BusinessRuleError('Workflow must have exactly one start state', 'invalid_workflow');
    }
  }

  private static async getUserPermissions(userId: string): Promise<string[]> {
    // Get user permissions
    return [];
  }

  private static async getUserRoles(userId: string): Promise<string[]> {
    // Get user roles
    return [];
  }

  private static async checkAutoProgress(workflowId: string, stateId: string): Promise<void> {
    // Implement auto-progression logic
  }

  private static async createTaskAction(config: any, workflowId: string): Promise<void> {
    // Create task based on configuration
  }

  private static async sendNotificationAction(config: any, workflowId: string, userId: string): Promise<void> {
    // Send notification
  }

  private static async updateStatusAction(config: any, workflowId: string): Promise<void> {
    // Update status
  }

  private static async transformDataAction(config: any, workflowId: string): Promise<void> {
    // Transform data
  }

  private static async callExternalApiAction(config: any): Promise<void> {
    // Call external API
  }

  private static async triggerAutomationAction(config: any, workflowId: string, userId: string): Promise<void> {
    // Trigger automation
  }

  private static async sendApprovalNotification(approval: ApprovalRequest, approverId: string): Promise<void> {
    // Send approval notification
  }

  private static async handleApprovalCompletion(workflowId: string, stateId: string, userId: string): Promise<void> {
    // Handle approval completion and progress workflow
  }
}

export default ProjectWorkflowService;