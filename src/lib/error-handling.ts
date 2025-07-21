import { v4 as uuidv4 } from 'uuid';
import { supabase } from './db-client';

export interface ErrorDetails {
  id: string;
  error_code: string;
  error_type: 'validation' | 'database' | 'network' | 'auth' | 'business' | 'system' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack_trace?: string;
  context?: any;
  user_id?: string;
  session_id?: string;
  request_id?: string;
  url?: string;
  user_agent?: string;
  ip_address?: string;
  resolution_status: 'open' | 'investigating' | 'resolved' | 'ignored';
  occurred_at: string;
  count?: number;
  first_occurrence?: string;
  last_occurrence?: string;
}

export interface ErrorPattern {
  pattern_id: string;
  error_codes: string[];
  frequency: number;
  severity_trend: 'increasing' | 'stable' | 'decreasing';
  suggested_action?: string;
  identified_at: string;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  DATABASE = 'database',
  NETWORK = 'network',
  AUTH = 'auth',
  BUSINESS = 'business',
  SYSTEM = 'system',
  EXTERNAL = 'external'
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorQueue: ErrorDetails[] = [];
  private isProcessing = false;

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  async handleError(error: Error | ErrorDetails, context?: any): Promise<void> {
    let errorDetails: ErrorDetails;

    if (error instanceof Error) {
      errorDetails = this.createErrorDetails(error, context);
    } else {
      errorDetails = error;
    }

    // Process error immediately
    await this.processError(errorDetails);
  }

  private createErrorDetails(error: Error, context?: any): ErrorDetails {
    return {
      id: uuidv4(),
      error_code: error.name || 'UNKNOWN_ERROR',
      error_type: this.categorizeError(error),
      severity: this.determineSeverity(error),
      message: error.message,
      stack_trace: error.stack,
      context: context || {},
      resolution_status: 'open',
      occurred_at: new Date().toISOString(),
      count: 1,
      first_occurrence: new Date().toISOString(),
      last_occurrence: new Date().toISOString()
    };
  }

  private async processError(errorDetails: ErrorDetails): Promise<void> {
    try {
      // Log error to database
      await this.logError(errorDetails);
      
      // Analyze error patterns
      await this.analyzeErrorPattern(errorDetails);
      
      // Send alerts if necessary
      await this.sendAlertIfNeeded(errorDetails);
      
      // Attempt recovery if possible
      await this.attemptRecovery(errorDetails);
    } catch (processingError) {
      console.error('Error processing error:', processingError);
      // Add to queue for retry
      this.errorQueue.push(errorDetails);
    }
  }

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes('database') || message.includes('sql') || message.includes('connection')) {
      return ErrorCategory.DATABASE;
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('auth') || message.includes('permission') || message.includes('unauthorized')) {
      return ErrorCategory.AUTH;
    }
    if (stack.includes('business') || message.includes('rule')) {
      return ErrorCategory.BUSINESS;
    }
    if (message.includes('system') || message.includes('memory') || message.includes('disk')) {
      return ErrorCategory.SYSTEM;
    }
    
    return ErrorCategory.EXTERNAL;
  }

  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal') || message.includes('crashed')) {
      return ErrorSeverity.CRITICAL;
    }
    if (message.includes('error') || message.includes('failed') || message.includes('exception')) {
      return ErrorSeverity.HIGH;
    }
    if (message.includes('warning') || message.includes('deprecated')) {
      return ErrorSeverity.MEDIUM;
    }
    
    return ErrorSeverity.LOW;
  }

  async logError(errorDetails: ErrorDetails): Promise<void> {
    try {
      // Check if similar error exists today
      const { data: existingErrors } = await supabase
        .from('error_logs')
        .select('*')
        .eq('error_code', errorDetails.error_code)
        .gte('occurred_at', new Date().toISOString().split('T')[0])
        .order('occurred_at', { ascending: false })
        .limit(1);

      if (existingErrors && existingErrors.length > 0) {
        // Update existing error count
        const existingError = existingErrors[0];
        await supabase
          .from('error_logs')
          .update({
            count: (existingError.count || 1) + 1,
            last_occurrence: errorDetails.occurred_at,
            context: errorDetails.context
          })
          .eq('id', existingError.id);
      } else {
        // Insert new error
        await supabase
          .from('error_logs')
          .insert([{
            id: errorDetails.id,
            error_code: errorDetails.error_code,
            error_type: errorDetails.error_type,
            severity: errorDetails.severity,
            message: errorDetails.message,
            stack_trace: errorDetails.stack_trace,
            context: errorDetails.context,
            user_id: errorDetails.user_id,
            session_id: errorDetails.session_id,
            request_id: errorDetails.request_id,
            url: errorDetails.url,
            user_agent: errorDetails.user_agent,
            ip_address: errorDetails.ip_address,
            resolution_status: errorDetails.resolution_status,
            occurred_at: errorDetails.occurred_at,
            count: 1,
            first_occurrence: errorDetails.occurred_at,
            last_occurrence: errorDetails.occurred_at
          }]);
      }
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
    }
  }

  async analyzeErrorPattern(errorDetails: ErrorDetails): Promise<void> {
    try {
      // Get similar errors from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: similarErrors } = await supabase
        .from('error_logs')
        .select('*')
        .eq('error_type', errorDetails.error_type)
        .gte('occurred_at', yesterday.toISOString())
        .order('occurred_at', { ascending: false });

      if (similarErrors && similarErrors.length >= 5) {
        // Pattern detected
        const patternId = uuidv4();
        await supabase
          .from('error_patterns')
          .insert([{
            pattern_id: patternId,
            error_codes: [errorDetails.error_code],
            frequency: similarErrors.length,
            severity_trend: 'increasing',
            identified_at: new Date().toISOString()
          }]);
      }
    } catch (patternError) {
      console.error('Error analyzing pattern:', patternError);
    }
  }

  async sendAlertIfNeeded(errorDetails: ErrorDetails): Promise<void> {
    try {
      // Check if we should send alert based on severity and frequency
      if (errorDetails.severity === ErrorSeverity.CRITICAL) {
        // Get error count in last hour
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        const { data: recentErrors, count } = await supabase
          .from('error_logs')
          .select('*', { count: 'exact' })
          .eq('error_code', errorDetails.error_code)
          .gte('occurred_at', oneHourAgo.toISOString());

        if (count && count >= 3) {
          // Check if alert was sent recently
          const { data: recentAlerts } = await supabase
            .from('alert_activity_log')
            .select('*')
            .eq('alert_type', 'critical_error')
            .gte('created_at', oneHourAgo.toISOString())
            .limit(1);

          if (!recentAlerts || recentAlerts.length === 0) {
            // Send alert
            await supabase
              .from('alerts')
              .insert([{
                id: uuidv4(),
                title: `Critical Error Alert: ${errorDetails.error_code}`,
                message: `Critical error occurred ${count} times in the last hour: ${errorDetails.message}`,
                type: 'critical_error',
                severity: 'high',
                source: 'error_handler',
                created_at: new Date().toISOString()
              }]);

            // Log alert activity
            await supabase
              .from('alert_activity_log')
              .insert([{
                id: uuidv4(),
                alert_type: 'critical_error',
                recipient: 'admin',
                status: 'sent',
                created_at: new Date().toISOString()
              }]);
          }
        }
      }
    } catch (alertError) {
      console.error('Error sending alert:', alertError);
    }
  }

  async attemptRecovery(errorDetails: ErrorDetails): Promise<void> {
    try {
      // Basic recovery strategies based on error type
      switch (errorDetails.error_type) {
        case ErrorCategory.DATABASE:
          // Try to reconnect or retry query
          console.log('Attempting database recovery...');
          break;
        case ErrorCategory.NETWORK:
          // Retry network request with exponential backoff
          console.log('Attempting network recovery...');
          break;
        case ErrorCategory.AUTH:
          // Refresh tokens or redirect to login
          console.log('Attempting auth recovery...');
          break;
        default:
          // Log recovery attempt
          console.log(`No automatic recovery available for ${errorDetails.error_type}`);
      }

      // Log recovery attempt
      await supabase
        .from('error_logs')
        .update({
          resolution_status: 'investigating'
        })
        .eq('id', errorDetails.id);

    } catch (recoveryError) {
      console.error('Error during recovery attempt:', recoveryError);
    }
  }

  async getErrorSummary(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<any> {
    try {
      const timeMap = {
        hour: 1,
        day: 24,
        week: 168
      };

      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - timeMap[timeRange]);

      const { data: errors } = await supabase
        .from('error_logs')
        .select('*')
        .gte('occurred_at', hoursAgo.toISOString());

      if (!errors) return { total: 0, by_severity: {}, by_type: {} };

      const summary = {
        total: errors.length,
        by_severity: {} as Record<string, number>,
        by_type: {} as Record<string, number>
      };

      errors.forEach(error => {
        summary.by_severity[error.severity] = (summary.by_severity[error.severity] || 0) + 1;
        summary.by_type[error.error_type] = (summary.by_type[error.error_type] || 0) + 1;
      });

      return summary;
    } catch (error) {
      console.error('Error getting error summary:', error);
      return { total: 0, by_severity: {}, by_type: {} };
    }
  }

  async getTopErrors(limit: number = 10): Promise<any[]> {
    try {
      const { data: errors } = await supabase
        .from('error_logs')
        .select('error_code, error_type, severity, count, message')
        .order('count', { ascending: false })
        .limit(limit);

      return errors || [];
    } catch (error) {
      console.error('Error getting top errors:', error);
      return [];
    }
  }

  async resolveError(errorId: string, resolution: string): Promise<void> {
    try {
      await supabase
        .from('error_logs')
        .update({
          resolution_status: 'resolved',
          resolution_notes: resolution,
          resolved_at: new Date().toISOString()
        })
        .eq('id', errorId);
    } catch (error) {
      console.error('Error resolving error:', error);
    }
  }

  async cleanupOldErrors(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      await supabase
        .from('error_logs')
        .delete()
        .lt('occurred_at', cutoffDate.toISOString());
    } catch (error) {
      console.error('Error cleaning up old errors:', error);
    }
  }
}

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public query?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string, public rule?: string) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public endpoint?: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Global error handler instance
export const errorHandler = ErrorHandlingService.getInstance();

// Utility functions for common error scenarios
export const handleAsyncError = async (fn: () => Promise<any>, context?: any) => {
  try {
    return await fn();
  } catch (error) {
    await errorHandler.handleError(error as Error, context);
    throw error;
  }
};

export const withErrorHandling = (fn: Function, context?: any) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      await errorHandler.handleError(error as Error, { ...context, args });
      throw error;
    }
  };
};

export default ErrorHandlingService;