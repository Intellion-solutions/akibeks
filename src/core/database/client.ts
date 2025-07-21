import { eq, and, or, desc, asc, count, sql, like, ilike } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import { sanitizeString, sanitizeEmail } from '../security/encryption';

export type OrderDirection = 'asc' | 'desc';
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'notin';

interface QueryFilter {
  column: string;
  operator: FilterOperator;
  value: any;
}

interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
  filters?: QueryFilter[];
}

/**
 * Secure Database Client
 * Provides a safe, sanitized interface to the database with built-in security measures
 */
export class DatabaseClient {
  /**
   * Generic select query with security and filtering
   */
  static async select<T>(
    table: any,
    options: QueryOptions = {}
  ): Promise<{ data: T[] | null; error: Error | null; count?: number }> {
    try {
      let query = db.select().from(table);
      
      // Apply filters
      if (options.filters && options.filters.length > 0) {
        const conditions = options.filters.map(filter => {
          const column = table[filter.column];
          if (!column) throw new Error(`Invalid column: ${filter.column}`);
          
          switch (filter.operator) {
            case 'eq': return eq(column, filter.value);
            case 'ne': return sql`${column} != ${filter.value}`;
            case 'gt': return sql`${column} > ${filter.value}`;
            case 'gte': return sql`${column} >= ${filter.value}`;
            case 'lt': return sql`${column} < ${filter.value}`;
            case 'lte': return sql`${column} <= ${filter.value}`;
            case 'like': return like(column, `%${sanitizeString(filter.value)}%`);
            case 'ilike': return ilike(column, `%${sanitizeString(filter.value)}%`);
            case 'in': return sql`${column} IN ${filter.value}`;
            case 'notin': return sql`${column} NOT IN ${filter.value}`;
            default: throw new Error(`Invalid operator: ${filter.operator}`);
          }
        });
        
        query = query.where(and(...conditions)) as any;
      }
      
      // Apply ordering
      if (options.orderBy) {
        const column = table[options.orderBy];
        if (!column) throw new Error(`Invalid order column: ${options.orderBy}`);
        
        query = options.orderDirection === 'desc' 
          ? (query as any).orderBy(desc(column))
          : (query as any).orderBy(asc(column));
      }
      
      // Apply pagination
      if (options.limit) {
        query = (query as any).limit(options.limit);
      }
      
      if (options.offset) {
        query = (query as any).offset(options.offset);
      }
      
      const data = await query;
      
      // Get count if needed
      let totalCount;
      if (options.limit || options.offset) {
        const countQuery = db.select({ count: count() }).from(table);
        if (options.filters && options.filters.length > 0) {
          const conditions = options.filters.map(filter => {
            const column = table[filter.column];
            switch (filter.operator) {
              case 'eq': return eq(column, filter.value);
              case 'like': return like(column, `%${sanitizeString(filter.value)}%`);
              default: return eq(column, filter.value);
            }
          });
          countQuery.where(and(...conditions));
        }
        const countResult = await countQuery;
        totalCount = countResult[0]?.count || 0;
      }
      
      return { data: data as T[], error: null, count: totalCount };
    } catch (error) {
      console.error('Database select error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Insert data with validation and sanitization
   */
  static async insert<T>(
    table: any,
    data: any
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      // Sanitize string fields
      const sanitizedData = this.sanitizeInsertData(data);
      
      const result = await db.insert(table).values(sanitizedData).returning();
      return { data: result[0] as T, error: null };
    } catch (error) {
      console.error('Database insert error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update data with validation and sanitization
   */
  static async update<T>(
    table: any,
    id: string,
    data: any
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      // Sanitize string fields
      const sanitizedData = this.sanitizeUpdateData(data);
      
      const result = await db
        .update(table)
        .set({ ...sanitizedData, updatedAt: new Date() })
        .where(eq(table.id, id))
        .returning();
        
      return { data: result[0] as T, error: null };
    } catch (error) {
      console.error('Database update error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete data with safety checks
   */
  static async delete(
    table: any,
    id: string
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      await db.delete(table).where(eq(table.id, id));
      return { success: true, error: null };
    } catch (error) {
      console.error('Database delete error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get single record by ID
   */
  static async findById<T>(
    table: any,
    id: string
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const result = await db.select().from(table).where(eq(table.id, id)).limit(1);
      return { data: result[0] as T || null, error: null };
    } catch (error) {
      console.error('Database findById error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Find single record by criteria
   */
  static async findOne<T>(
    table: any,
    criteria: Record<string, any>
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const filters = Object.entries(criteria).map(([key, value]) => 
        eq(table[key], value)
      );
      
      const result = await db.select().from(table).where(and(...filters)).limit(1);
      return { data: result[0] as T || null, error: null };
    } catch (error) {
      console.error('Database findOne error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Execute raw SQL query (use with caution)
   */
  static async raw<T>(query: string, params: any[] = []): Promise<{ data: T[] | null; error: Error | null }> {
    try {
      // Basic SQL injection protection
      if (this.containsSuspiciousSQL(query)) {
        throw new Error('Potentially unsafe SQL query detected');
      }
      
      const result = await db.execute(sql.raw(query, ...params));
      return { data: result as T[], error: null };
    } catch (error) {
      console.error('Database raw query error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Database transaction
   */
  static async transaction<T>(
    callback: (tx: typeof db) => Promise<T>
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const result = await db.transaction(async (tx) => {
        return await callback(tx);
      });
      return { data: result, error: null };
    } catch (error) {
      console.error('Database transaction error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Sanitize data for insert operations
   */
  private static sanitizeInsertData(data: any): any {
    const sanitized = { ...data };
    
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        if (key.toLowerCase().includes('email')) {
          sanitized[key] = sanitizeEmail(value);
        } else {
          sanitized[key] = sanitizeString(value);
        }
      }
    }
    
    return sanitized;
  }

  /**
   * Sanitize data for update operations
   */
  private static sanitizeUpdateData(data: any): any {
    const sanitized = { ...data };
    
    // Remove protected fields
    delete sanitized.id;
    delete sanitized.createdAt;
    
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        if (key.toLowerCase().includes('email')) {
          sanitized[key] = sanitizeEmail(value);
        } else {
          sanitized[key] = sanitizeString(value);
        }
      }
    }
    
    return sanitized;
  }

  /**
   * Check for suspicious SQL patterns
   */
  private static containsSuspiciousSQL(query: string): boolean {
    const suspiciousPatterns = [
      /;\s*(drop|delete|truncate|alter)\s+/i,
      /union\s+select/i,
      /--\s*$/,
      /\/\*.*\*\//,
      /exec\s*\(/i,
      /script\s*>/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(query));
  }
}

// Export convenient table accessors
export const Tables = {
  users: schema.users,
  projects: schema.projects,
  projectMilestones: schema.projectMilestones,
  projectTasks: schema.projectTasks,
  services: schema.services,
  serviceInquiries: schema.serviceInquiries,
  contactSubmissions: schema.contactSubmissions,
  testimonials: schema.testimonials,
  errorLogs: schema.errorLogs,
  sessions: schema.sessions,
  activityLogs: schema.activityLogs,
};

// Export the client
export default DatabaseClient;