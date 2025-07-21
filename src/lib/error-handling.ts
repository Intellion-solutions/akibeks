import { dbClient, Tables } from './db-client';
import { z } from 'zod';

// Error types
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'database' | 'api' | 'validation' | 'security' | 'business' | 'system';

export interface ErrorLogEntry {
  id: string;
  level: ErrorSeverity;
  message: string;
  errorCode?: string;
  stack?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  ipAddress?: string;
  context: Record<string, any>;
  count: number;
  lastOccurrence?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export class BusinessRuleError extends Error {
  public code: string;
  public severity: ErrorSeverity;
  public category: ErrorCategory;
  public context: Record<string, any>;

  constructor(
    message: string,
    code: string = 'BUSINESS_RULE_VIOLATION',
    severity: ErrorSeverity = 'medium',
    category: ErrorCategory = 'business',
    context: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'BusinessRuleError';
    this.code = code;
    this.severity = severity;
    this.category = category;
    this.context = context;
  }
}

export class ValidationError extends Error {
  public errors: z.ZodError['errors'];

  constructor(zodError: z.ZodError) {
    const message = zodError.errors.map(e => e.message).join(', ');
    super(message);
    this.name = 'ValidationError';
    this.errors = zodError.errors;
  }
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  // Log error to database
  async logError(
    error: Error,
    severity: ErrorSeverity = 'medium',
    context: Record<string, any> = {}
  ): Promise<string> {
    try {
      const errorData = {
        level: severity,
        message: error.message,
        errorCode: (error as any).code || error.name,
        stack: error.stack,
        userId: context.userId,
        url: context.url,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          errorType: error.constructor.name
        },
        count: 1,
        lastOccurrence: new Date(),
        resolved: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Check for duplicate error
      const existingError = await this.findSimilarError(error.message, errorData.errorCode);
      
      if (existingError) {
        // Update existing error count and last occurrence
        await dbClient.update(Tables.errorLogs, existingError.id, {
          count: existingError.count + 1,
          lastOccurrence: new Date(),
          updatedAt: new Date(),
          context: {
            ...existingError.context,
            occurrences: [...(existingError.context.occurrences || []), errorData.context]
          }
        });
        return existingError.id;
      } else {
        // Create new error log
        const result = await dbClient.insert(Tables.errorLogs, errorData);
        if (result.data) {
          return (result.data as any).id;
        }
      }
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
      // Fallback to console logging
      console.error('Original error:', error);
    }

    return 'error-logging-failed';
  }

  // Handle different types of errors
  async handleError(
    error: Error,
    context: Record<string, any> = {}
  ): Promise<string> {
    let severity: ErrorSeverity = 'medium';
    let enhancedContext = { ...context };

    // Determine severity and enhance context based on error type
    if (error instanceof BusinessRuleError) {
      severity = error.severity;
      enhancedContext = {
        ...enhancedContext,
        code: error.code,
        category: error.category,
        businessContext: error.context
      };
    } else if (error instanceof ValidationError) {
      severity = 'low';
      enhancedContext = {
        ...enhancedContext,
        validationErrors: error.errors
      };
    } else if (error.name === 'DatabaseError' || error.message.includes('database')) {
      severity = 'high';
      enhancedContext = {
        ...enhancedContext,
        category: 'database'
      };
    } else if (error.name === 'SecurityError' || error.message.includes('unauthorized')) {
      severity = 'critical';
      enhancedContext = {
        ...enhancedContext,
        category: 'security'
      };
    }

    // Log the error
    const errorId = await this.logError(error, severity, enhancedContext);

    // Send notifications for critical errors
    if (severity === 'critical') {
      await this.notifyAdministrators(error, errorId, enhancedContext);
    }

    return errorId;
  }

  // Find similar error to avoid duplicates
  private async findSimilarError(message: string, errorCode?: string): Promise<ErrorLogEntry | null> {
    try {
      const filters = [
        { column: 'message', operator: 'eq' as const, value: message },
        { column: 'resolved', operator: 'eq' as const, value: false }
      ];

      if (errorCode) {
        filters.push({ column: 'errorCode', operator: 'eq' as const, value: errorCode });
      }

      const result = await dbClient.select(Tables.errorLogs, {
        filters,
        limit: 1,
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      return result.data && result.data.length > 0 ? result.data[0] as ErrorLogEntry : null;
    } catch (error) {
      console.error('Error finding similar errors:', error);
      return null;
    }
  }

  // Get error statistics
  async getErrorStats(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
    total: number;
    byLevel: Record<ErrorSeverity, number>;
    byCategory: Record<string, number>;
    resolved: number;
    unresolved: number;
  }> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'hour':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const [totalResult, resolvedResult, allErrorsResult] = await Promise.all([
        dbClient.count(Tables.errorLogs, [
          { column: 'createdAt', operator: 'gte', value: startDate.toISOString() }
        ]),
        dbClient.count(Tables.errorLogs, [
          { column: 'createdAt', operator: 'gte', value: startDate.toISOString() },
          { column: 'resolved', operator: 'eq', value: true }
        ]),
        dbClient.select(Tables.errorLogs, {
          filters: [{ column: 'createdAt', operator: 'gte', value: startDate.toISOString() }]
        })
      ]);

      const errors = allErrorsResult.data as ErrorLogEntry[] || [];
      
      const byLevel: Record<ErrorSeverity, number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      };

      const byCategory: Record<string, number> = {};

      errors.forEach(error => {
        byLevel[error.level]++;
        const category = error.context.category || 'unknown';
        byCategory[category] = (byCategory[category] || 0) + 1;
      });

      return {
        total: totalResult.data || 0,
        byLevel,
        byCategory,
        resolved: resolvedResult.data || 0,
        unresolved: (totalResult.data || 0) - (resolvedResult.data || 0)
      };
    } catch (error) {
      console.error('Error getting error stats:', error);
      return {
        total: 0,
        byLevel: { low: 0, medium: 0, high: 0, critical: 0 },
        byCategory: {},
        resolved: 0,
        unresolved: 0
      };
    }
  }

  // Resolve error
  async resolveError(errorId: string, resolvedBy: string, resolution?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await dbClient.update(Tables.errorLogs, errorId, {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
        context: resolution ? { resolution } : {},
        updatedAt: new Date()
      });

      if (result.error) {
        return { success: false, error: 'Failed to resolve error' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error resolving error:', error);
      return { success: false, error: 'Failed to resolve error' };
    }
  }

  // Get recent errors
  async getRecentErrors(limit: number = 50): Promise<{
    errors: ErrorLogEntry[];
    error?: string;
  }> {
    try {
      const result = await dbClient.select(Tables.errorLogs, {
        limit,
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      return { errors: result.data as ErrorLogEntry[] || [] };
    } catch (error) {
      console.error('Error getting recent errors:', error);
      return { errors: [], error: 'Failed to get recent errors' };
    }
  }

  // Notify administrators of critical errors
  private async notifyAdministrators(
    error: Error,
    errorId: string,
    context: Record<string, any>
  ): Promise<void> {
    try {
      // TODO: Implement notification system
      // This could send emails, Slack messages, etc.
      console.error(`CRITICAL ERROR [${errorId}]: ${error.message}`, {
        error: error.message,
        stack: error.stack,
        context
      });

      // Log the notification attempt
      await this.logError(
        new Error(`Critical error notification sent for ${errorId}`),
        'low',
        { originalErrorId: errorId, notificationType: 'admin_alert' }
      );
    } catch (notificationError) {
      console.error('Failed to notify administrators:', notificationError);
    }
  }

  // Validate data with enhanced error handling
  static validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error);
      }
      throw error;
    }
  }

  // Wrap async operations with error handling
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: Record<string, any> = {}
  ): Promise<{ result?: T; error?: string }> {
    try {
      const result = await operation();
      return { result };
    } catch (error) {
      const errorService = ErrorHandlingService.getInstance();
      const errorId = await errorService.handleError(error as Error, context);
      return { error: `Operation failed (Error ID: ${errorId})` };
    }
  }
}

// Export singleton instance and utility functions
export const errorHandler = ErrorHandlingService.getInstance();

// Utility function for throwing business rule errors
export function throwBusinessError(
  message: string,
  code: string = 'BUSINESS_RULE_VIOLATION',
  severity: ErrorSeverity = 'medium',
  context: Record<string, any> = {}
): never {
  throw new BusinessRuleError(message, code, severity, 'business', context);
}

// Utility function for validation with automatic error handling
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return ErrorHandlingService.validateWithSchema(schema, data);
}

export default ErrorHandlingService;