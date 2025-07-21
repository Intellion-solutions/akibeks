import { v4 as uuidv4 } from 'uuid';
import { query } from './database-client';

export interface ErrorDetails {
  id: string;
  error_code: string;
  error_type: 'validation' | 'database' | 'network' | 'auth' | 'business' | 'system' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack_trace?: string;
  context: {
    user_id?: string;
    session_id?: string;
    request_id?: string;
    endpoint?: string;
    method?: string;
    ip_address?: string;
    user_agent?: string;
    project_id?: string;
    task_id?: string;
    additional_data?: any;
  };
  resolution_status: 'unresolved' | 'investigating' | 'resolved' | 'ignored';
  resolution_notes?: string;
  occurred_at: string;
  resolved_at?: string;
  count: number;
  first_occurrence: string;
  last_occurrence: string;
}

export interface ErrorPattern {
  pattern_id: string;
  error_signature: string;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact_score: number;
  affected_users: string[];
  created_at: string;
}

export class ErrorHandler {
  private static readonly MAX_STACK_LENGTH = 5000;
  private static readonly ERROR_RETENTION_DAYS = 90;
  private static readonly ALERT_THRESHOLDS = {
    critical: 1,
    high: 5,
    medium: 20,
    low: 100
  };

  static async handleError(error: Error, context: any = {}): Promise<string> {
    try {
      const errorId = uuidv4();
      const errorDetails = await this.processError(error, context, errorId);
      
      // Log to database
      await this.logError(errorDetails);
      
      // Check for patterns and alerts
      await this.analyzeErrorPattern(errorDetails);
      
      // Send notifications if needed
      await this.sendAlertIfNeeded(errorDetails);
      
      // Attempt recovery if possible
      await this.attemptRecovery(errorDetails);
      
      return errorId;
    } catch (loggingError) {
      // Fallback logging
      console.error('Error logging failed:', loggingError);
      console.error('Original error:', error);
      return 'unknown';
    }
  }

  static async processError(error: Error, context: any, errorId: string): Promise<ErrorDetails> {
    const errorType = this.categorizeError(error);
    const severity = this.determineSeverity(error, errorType, context);
    const errorCode = this.generateErrorCode(error, errorType);

    return {
      id: errorId,
      error_code: errorCode,
      error_type: errorType,
      severity,
      message: error.message || 'Unknown error',
      stack_trace: error.stack?.substring(0, this.MAX_STACK_LENGTH),
      context: {
        user_id: context.user_id,
        session_id: context.session_id,
        request_id: context.request_id,
        endpoint: context.endpoint,
        method: context.method,
        ip_address: context.ip_address,
        user_agent: context.user_agent,
        project_id: context.project_id,
        task_id: context.task_id,
        additional_data: context.additional_data
      },
      resolution_status: 'unresolved',
      occurred_at: new Date().toISOString(),
      count: 1,
      first_occurrence: new Date().toISOString(),
      last_occurrence: new Date().toISOString()
    };
  }

  static categorizeError(error: Error): ErrorDetails['error_type'] {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('validation') || message.includes('validation')) {
      return 'validation';
    }
    if (name.includes('database') || message.includes('database') || message.includes('sql')) {
      return 'database';
    }
    if (name.includes('network') || message.includes('network') || message.includes('timeout')) {
      return 'network';
    }
    if (name.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'auth';
    }
    if (message.includes('business rule') || message.includes('constraint')) {
      return 'business';
    }
    if (message.includes('external') || message.includes('api')) {
      return 'external';
    }
    
    return 'system';
  }

  static determineSeverity(error: Error, errorType: string, context: any): ErrorDetails['severity'] {
    // Critical errors
    if (
      errorType === 'database' && error.message.includes('connection') ||
      errorType === 'auth' && context.user_id && error.message.includes('security') ||
      error.message.includes('payment') ||
      error.message.includes('data corruption')
    ) {
      return 'critical';
    }

    // High severity
    if (
      errorType === 'database' ||
      errorType === 'auth' ||
      context.project_id && errorType === 'business' ||
      error.message.includes('failed to save')
    ) {
      return 'high';
    }

    // Medium severity
    if (
      errorType === 'network' ||
      errorType === 'external' ||
      context.endpoint?.includes('/api/')
    ) {
      return 'medium';
    }

    return 'low';
  }

  static generateErrorCode(error: Error, errorType: string): string {
    const timestamp = Date.now().toString(36);
    const typeCode = errorType.substring(0, 3).toUpperCase();
    const hash = this.hashString(error.message).substring(0, 4);
    
    return `${typeCode}-${hash}-${timestamp}`;
  }

  static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  static async logError(errorDetails: ErrorDetails): Promise<void> {
    try {
      // Check if similar error exists
      const existingError = await query(
        `SELECT * FROM error_logs 
         WHERE error_code = $1 AND DATE(occurred_at) = CURRENT_DATE 
         ORDER BY occurred_at DESC LIMIT 1`,
        [errorDetails.error_code]
      );

      if (existingError.rows.length > 0) {
        // Update existing error count
        await query(
          `UPDATE error_logs 
           SET count = count + 1, last_occurrence = $1, context = $2
           WHERE id = $3`,
          [errorDetails.occurred_at, JSON.stringify(errorDetails.context), existingError.rows[0].id]
        );
      } else {
        // Insert new error
        await query(
          `INSERT INTO error_logs (
            id, error_code, error_type, severity, message, stack_trace, 
            context, resolution_status, occurred_at, count, first_occurrence, last_occurrence
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            errorDetails.id,
            errorDetails.error_code,
            errorDetails.error_type,
            errorDetails.severity,
            errorDetails.message,
            errorDetails.stack_trace,
            JSON.stringify(errorDetails.context),
            errorDetails.resolution_status,
            errorDetails.occurred_at,
            errorDetails.count,
            errorDetails.first_occurrence,
            errorDetails.last_occurrence
          ]
        );
      }
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
      // Fallback to file logging
      await this.logToFile(errorDetails);
    }
  }

  static async logToFile(errorDetails: ErrorDetails): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      await fs.mkdir(logsDir, { recursive: true });
      
      const logFile = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = `${new Date().toISOString()} [${errorDetails.severity.toUpperCase()}] ${errorDetails.error_code}: ${errorDetails.message}\n`;
      
      await fs.appendFile(logFile, logEntry);
    } catch (fileError) {
      console.error('Failed to log to file:', fileError);
    }
  }

  static async analyzeErrorPattern(errorDetails: ErrorDetails): Promise<void> {
    try {
      // Get similar errors from last 24 hours
      const similarErrors = await query(
        `SELECT COUNT(*) as count, MIN(occurred_at) as first_seen
         FROM error_logs 
         WHERE error_type = $1 AND severity = $2 
         AND occurred_at > NOW() - INTERVAL '24 hours'`,
        [errorDetails.error_type, errorDetails.severity]
      );

      const count = parseInt(similarErrors.rows[0].count);
      
      if (count > 10) {
        // Pattern detected - create or update pattern record
        const patternId = `${errorDetails.error_type}-${errorDetails.severity}`;
        
        await query(
          `INSERT INTO error_patterns (pattern_id, error_signature, frequency, trend, impact_score, affected_users, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (pattern_id) 
           DO UPDATE SET frequency = EXCLUDED.frequency, impact_score = EXCLUDED.impact_score`,
          [
            patternId,
            `${errorDetails.error_type}:${errorDetails.severity}`,
            count,
            this.calculateTrend(count),
            this.calculateImpactScore(errorDetails, count),
            JSON.stringify([errorDetails.context.user_id].filter(Boolean))
          ]
        );
      }
    } catch (error) {
      console.error('Error pattern analysis failed:', error);
    }
  }

  static calculateTrend(currentCount: number): 'increasing' | 'decreasing' | 'stable' {
    // This would typically compare with historical data
    // For now, simplified logic
    return currentCount > 20 ? 'increasing' : 'stable';
  }

  static calculateImpactScore(errorDetails: ErrorDetails, frequency: number): number {
    let score = 0;
    
    // Severity weight
    const severityWeights = { critical: 100, high: 50, medium: 20, low: 5 };
    score += severityWeights[errorDetails.severity];
    
    // Frequency weight
    score += Math.min(frequency * 2, 100);
    
    // User impact weight
    if (errorDetails.context.user_id) score += 20;
    if (errorDetails.context.project_id) score += 30;
    
    return Math.min(score, 1000);
  }

  static async sendAlertIfNeeded(errorDetails: ErrorDetails): Promise<void> {
    const threshold = this.ALERT_THRESHOLDS[errorDetails.severity];
    
    // Check if we should send an alert based on frequency
    const recentCount = await query(
      `SELECT COUNT(*) as count FROM error_logs 
       WHERE error_type = $1 AND severity = $2 
       AND occurred_at > NOW() - INTERVAL '1 hour'`,
      [errorDetails.error_type, errorDetails.severity]
    );

    const count = parseInt(recentCount.rows[0].count);
    
    if (count >= threshold) {
      await this.sendAlert(errorDetails, count);
    }
  }

  static async sendAlert(errorDetails: ErrorDetails, count: number): Promise<void> {
    // Check if alert was already sent recently
    const recentAlert = await query(
      `SELECT * FROM error_alerts 
       WHERE error_type = $1 AND severity = $2 
       AND sent_at > NOW() - INTERVAL '1 hour'`,
      [errorDetails.error_type, errorDetails.severity]
    );

    if (recentAlert.rows.length > 0) {
      return; // Don't spam alerts
    }

    // Log the alert
    await query(
      `INSERT INTO error_alerts (error_type, severity, count, message, sent_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [errorDetails.error_type, errorDetails.severity, count, errorDetails.message]
    );

    // Send notifications (implement based on your notification system)
    await this.notifyAdministrators(errorDetails, count);
  }

  static async notifyAdministrators(errorDetails: ErrorDetails, count: number): Promise<void> {
    try {
      // Get admin users
      const admins = await query(
        "SELECT email, name FROM users WHERE role IN ('super_admin', 'admin') AND is_active = true"
      );

      const subject = `[${errorDetails.severity.toUpperCase()}] Error Alert: ${errorDetails.error_type}`;
      const message = `
        Error Alert Triggered
        
        Error Type: ${errorDetails.error_type}
        Severity: ${errorDetails.severity}
        Count: ${count} occurrences in the last hour
        Error Code: ${errorDetails.error_code}
        Message: ${errorDetails.message}
        
        Context:
        - User ID: ${errorDetails.context.user_id || 'N/A'}
        - Project ID: ${errorDetails.context.project_id || 'N/A'}
        - Endpoint: ${errorDetails.context.endpoint || 'N/A'}
        
        Please investigate this issue promptly.
      `;

      // Send emails to admins (implement based on your email service)
      for (const admin of admins.rows) {
        console.log(`Would send alert to ${admin.email}: ${subject}`);
        // await sendEmail(admin.email, subject, message);
      }
    } catch (error) {
      console.error('Failed to notify administrators:', error);
    }
  }

  static async attemptRecovery(errorDetails: ErrorDetails): Promise<void> {
    try {
      switch (errorDetails.error_type) {
        case 'database':
          await this.attemptDatabaseRecovery(errorDetails);
          break;
        case 'network':
          await this.attemptNetworkRecovery(errorDetails);
          break;
        case 'external':
          await this.attemptExternalServiceRecovery(errorDetails);
          break;
        default:
          // No automatic recovery for other types
          break;
      }
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
    }
  }

  static async attemptDatabaseRecovery(errorDetails: ErrorDetails): Promise<void> {
    // Attempt to retry database operations
    if (errorDetails.message.includes('timeout')) {
      // Log retry attempt
      await query(
        `INSERT INTO error_recovery_attempts (error_id, recovery_type, attempted_at, status)
         VALUES ($1, 'database_retry', NOW(), 'attempted')`,
        [errorDetails.id]
      );
    }
  }

  static async attemptNetworkRecovery(errorDetails: ErrorDetails): Promise<void> {
    // Log network recovery attempt
    await query(
      `INSERT INTO error_recovery_attempts (error_id, recovery_type, attempted_at, status)
       VALUES ($1, 'network_retry', NOW(), 'attempted')`,
      [errorDetails.id]
    );
  }

  static async attemptExternalServiceRecovery(errorDetails: ErrorDetails): Promise<void> {
    // Implement circuit breaker pattern
    await query(
      `INSERT INTO error_recovery_attempts (error_id, recovery_type, attempted_at, status)
       VALUES ($1, 'circuit_breaker', NOW(), 'attempted')`,
      [errorDetails.id]
    );
  }

  // Error reporting and analytics
  static async getErrorSummary(filters: any = {}): Promise<any> {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.start_date) {
      whereClause += ` AND occurred_at >= $${paramIndex}`;
      params.push(filters.start_date);
      paramIndex++;
    }

    if (filters.end_date) {
      whereClause += ` AND occurred_at <= $${paramIndex}`;
      params.push(filters.end_date);
      paramIndex++;
    }

    if (filters.severity) {
      whereClause += ` AND severity = $${paramIndex}`;
      params.push(filters.severity);
      paramIndex++;
    }

    const result = await query(
      `SELECT 
        error_type,
        severity,
        COUNT(*) as total_count,
        SUM(count) as total_occurrences,
        AVG(count) as avg_occurrences,
        MIN(occurred_at) as first_seen,
        MAX(occurred_at) as last_seen
       FROM error_logs 
       ${whereClause}
       GROUP BY error_type, severity
       ORDER BY total_occurrences DESC`,
      params
    );

    return result.rows;
  }

  static async getTopErrors(limit: number = 10): Promise<any[]> {
    const result = await query(
      `SELECT 
        error_code,
        message,
        error_type,
        severity,
        SUM(count) as total_count,
        COUNT(*) as unique_occurrences,
        MAX(occurred_at) as last_occurrence
       FROM error_logs 
       WHERE occurred_at > NOW() - INTERVAL '7 days'
       GROUP BY error_code, message, error_type, severity
       ORDER BY total_count DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  static async resolveError(errorId: string, resolvedBy: string, notes: string): Promise<void> {
    await query(
      `UPDATE error_logs 
       SET resolution_status = 'resolved', 
           resolved_at = NOW(), 
           resolution_notes = $1
       WHERE id = $2`,
      [notes, errorId]
    );

    // Log the resolution
    await query(
      `INSERT INTO error_resolutions (error_id, resolved_by, resolution_notes, resolved_at)
       VALUES ($1, $2, $3, NOW())`,
      [errorId, resolvedBy, notes]
    );
  }

  // Cleanup old errors
  static async cleanupOldErrors(): Promise<void> {
    try {
      const result = await query(
        `DELETE FROM error_logs 
         WHERE occurred_at < NOW() - INTERVAL '${this.ERROR_RETENTION_DAYS} days'
         AND resolution_status IN ('resolved', 'ignored')`
      );

      console.log(`Cleaned up ${result.rowCount} old error records`);
    } catch (error) {
      console.error('Error cleanup failed:', error);
    }
  }
}

// Custom error classes for better categorization
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
  constructor(message: string, public code?: string) {
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

export class ExternalServiceError extends Error {
  constructor(message: string, public service?: string, public statusCode?: number) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

export default ErrorHandler;