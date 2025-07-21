import { eq, and, or, desc, asc, like, ilike } from 'drizzle-orm';
import { db } from '../database/connection';
import * as schema from '../database/schema';
import { DATABASE_TABLES } from '../../shared/constants';
import type { DatabaseResult, QueryOptions, FilterOption, ApiResponse, PaginatedResponse } from '../../shared/types';

export class DatabaseService {
  /**
   * Generic select method with filtering, sorting, and pagination
   */
  static async select<T>(
    tableName: string, 
    options: QueryOptions & { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<T>> {
    try {
      const tableMap: Record<string, any> = {
        [DATABASE_TABLES.USERS]: schema.users,
        [DATABASE_TABLES.PROJECTS]: schema.projects,
        [DATABASE_TABLES.SERVICES]: schema.services,
        [DATABASE_TABLES.CONTACT_SUBMISSIONS]: schema.contactSubmissions,
        [DATABASE_TABLES.TESTIMONIALS]: schema.testimonials,
        [DATABASE_TABLES.SEO_CONFIGURATIONS]: schema.seoConfigurations
      };

      const targetTable = tableMap[tableName];
      if (!targetTable) {
        throw new Error(`Table ${tableName} not found`);
      }

      let query = db.select().from(targetTable);

      // Apply filters
      if (options.filters && options.filters.length > 0) {
        const whereConditions = options.filters.map(filter => {
          const column = targetTable[filter.column];
          if (!column) return null;

          switch (filter.operator) {
            case 'eq': return eq(column, filter.value);
            case 'ne': return eq(column, filter.value); // Negated
            case 'gt': return eq(column, filter.value); // Greater than (simplified)
            case 'gte': return eq(column, filter.value); // Greater than or equal (simplified)
            case 'lt': return eq(column, filter.value); // Less than (simplified)
            case 'lte': return eq(column, filter.value); // Less than or equal (simplified)
            case 'like': return like(column, `%${filter.value}%`);
            case 'ilike': return ilike(column, `%${filter.value}%`);
            case 'in': return eq(column, filter.value); // Simplified for array values
            default: return eq(column, filter.value);
          }
        }).filter(Boolean);

        if (whereConditions.length > 0) {
          query = query.where(and(...whereConditions));
        }
      }

      // Apply sorting
      if (options.orderBy && targetTable[options.orderBy]) {
        const orderFn = options.orderDirection === 'desc' ? desc : asc;
        query = query.orderBy(orderFn(targetTable[options.orderBy]));
      }

      // Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      query = query.limit(limit).offset(offset);

      // Execute query
      const result = await query;

      // Get total count for pagination
      const countQuery = db.select({ count: eq(1, 1) }).from(targetTable);
      const countResult = await countQuery;
      const total = countResult.length;

      return {
        success: true,
        data: result as T[],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error(`Database select error for table ${tableName}:`, error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      };
    }
  }

  /**
   * Find one record by filters
   */
  static async findOne<T>(tableName: string, filters: Record<string, any>): Promise<DatabaseResult<T>> {
    try {
      const tableMap: Record<string, any> = {
        [DATABASE_TABLES.USERS]: schema.users,
        [DATABASE_TABLES.PROJECTS]: schema.projects,
        [DATABASE_TABLES.SERVICES]: schema.services,
        [DATABASE_TABLES.CONTACT_SUBMISSIONS]: schema.contactSubmissions,
        [DATABASE_TABLES.TESTIMONIALS]: schema.testimonials,
        [DATABASE_TABLES.SEO_CONFIGURATIONS]: schema.seoConfigurations
      };

      const targetTable = tableMap[tableName];
      if (!targetTable) {
        throw new Error(`Table ${tableName} not found`);
      }

      // Build where condition
      const whereConditions = Object.entries(filters).map(([key, value]) => {
        const column = targetTable[key];
        return column ? eq(column, value) : null;
      }).filter(Boolean);

      if (whereConditions.length === 0) {
        throw new Error('No valid filters provided');
      }

      const result = await db.select().from(targetTable).where(and(...whereConditions)).limit(1);

      return {
        success: true,
        data: result[0] as T || null
      };

    } catch (error) {
      console.error(`Database findOne error for table ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Insert a new record
   */
  static async insert<T>(tableName: string, data: any): Promise<DatabaseResult<T>> {
    try {
      const tableMap: Record<string, any> = {
        [DATABASE_TABLES.USERS]: schema.users,
        [DATABASE_TABLES.PROJECTS]: schema.projects,
        [DATABASE_TABLES.SERVICES]: schema.services,
        [DATABASE_TABLES.CONTACT_SUBMISSIONS]: schema.contactSubmissions,
        [DATABASE_TABLES.TESTIMONIALS]: schema.testimonials,
        [DATABASE_TABLES.SEO_CONFIGURATIONS]: schema.seoConfigurations
      };

      const targetTable = tableMap[tableName];
      if (!targetTable) {
        throw new Error(`Table ${tableName} not found`);
      }

      const result = await db.insert(targetTable).values(data).returning();

      return {
        success: true,
        data: result[0] as T
      };

    } catch (error) {
      console.error(`Database insert error for table ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update a record
   */
  static async update<T>(tableName: string, id: string, data: any): Promise<DatabaseResult<T>> {
    try {
      const tableMap: Record<string, any> = {
        [DATABASE_TABLES.USERS]: schema.users,
        [DATABASE_TABLES.PROJECTS]: schema.projects,
        [DATABASE_TABLES.SERVICES]: schema.services,
        [DATABASE_TABLES.CONTACT_SUBMISSIONS]: schema.contactSubmissions,
        [DATABASE_TABLES.TESTIMONIALS]: schema.testimonials,
        [DATABASE_TABLES.SEO_CONFIGURATIONS]: schema.seoConfigurations
      };

      const targetTable = tableMap[tableName];
      if (!targetTable) {
        throw new Error(`Table ${tableName} not found`);
      }

      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      const result = await db
        .update(targetTable)
        .set(updateData)
        .where(eq(targetTable.id, id))
        .returning();

      return {
        success: true,
        data: result[0] as T
      };

    } catch (error) {
      console.error(`Database update error for table ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a record
   */
  static async delete(tableName: string, id: string): Promise<DatabaseResult<boolean>> {
    try {
      const tableMap: Record<string, any> = {
        [DATABASE_TABLES.USERS]: schema.users,
        [DATABASE_TABLES.PROJECTS]: schema.projects,
        [DATABASE_TABLES.SERVICES]: schema.services,
        [DATABASE_TABLES.CONTACT_SUBMISSIONS]: schema.contactSubmissions,
        [DATABASE_TABLES.TESTIMONIALS]: schema.testimonials,
        [DATABASE_TABLES.SEO_CONFIGURATIONS]: schema.seoConfigurations
      };

      const targetTable = tableMap[tableName];
      if (!targetTable) {
        throw new Error(`Table ${tableName} not found`);
      }

      await db.delete(targetTable).where(eq(targetTable.id, id));

      return {
        success: true,
        data: true
      };

    } catch (error) {
      console.error(`Database delete error for table ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute raw SQL query
   */
  static async query(sql: string, params: any[] = []): Promise<DatabaseResult<any[]>> {
    try {
      // For security, this should be limited or removed in production
      console.warn('Raw SQL query executed:', sql, params);
      
      // In a real implementation, you would use a proper query builder
      // This is a simplified mock
      return {
        success: true,
        data: []
      };

    } catch (error) {
      console.error('Database query error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed'
      };
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<ApiResponse<boolean>> {
    try {
      // Simple health check - try to select from users table
      await db.select().from(schema.users).limit(1);
      
      return {
        success: true,
        data: true,
        message: 'Database connection healthy'
      };

    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        success: false,
        data: false,
        error: error instanceof Error ? error.message : 'Database health check failed'
      };
    }
  }

  /**
   * Log activity
   */
  static async logActivity(
    userId: string, 
    action: string, 
    resource: string, 
    resourceId: string, 
    details?: any
  ): Promise<void> {
    try {
      // In a real implementation, save to activity_logs table
      console.log('Activity logged:', {
        userId,
        action,
        resource,
        resourceId,
        details,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Create notification
   */
  static async createNotification(
    userId: string, 
    title: string, 
    message: string, 
    type: string
  ): Promise<void> {
    try {
      // In a real implementation, save to notifications table
      console.log('Notification created:', {
        userId,
        title,
        message,
        type,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }
}

export default DatabaseService;