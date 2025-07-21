import { eq, desc, asc, and, or, sql, like, count, sum } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import * as schema from '../database/schema';

// Database operation interfaces
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: FilterOption[];
}

export interface FilterOption {
  column: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'in';
  value: any;
}

export interface DatabaseResult<T = any> {
  data: T | T[] | null;
  error: Error | null;
  count?: number;
}

export interface PaginatedResult<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Table names enum for type safety
export enum Tables {
  users = 'users',
  projects = 'projects',
  services = 'services',
  contactSubmissions = 'contactSubmissions',
  testimonials = 'testimonials',
  activityLogs = 'activityLogs',
  sessions = 'sessions',
  errorLogs = 'errorLogs',
  seoConfigurations = 'seoConfigurations',
  sitemaps = 'sitemaps',
  seoAnalytics = 'seoAnalytics',
  keywordRankings = 'keywordRankings',
  metaRedirects = 'metaRedirects',
  robotsConfig = 'robotsConfig',
  schemaTemplates = 'schemaTemplates'
}

// Mock data for development/browser environment
const mockData = {
  users: [
    {
      id: '1',
      email: 'admin@akibeks.co.ke',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      phoneNumber: '+254712345678',
      county: 'Nairobi',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    },
    {
      id: '2',
      email: 'client@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'client',
      isActive: true,
      phoneNumber: '+254787654321',
      county: 'Mombasa',
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    }
  ],
  projects: [
    {
      id: '1',
      title: 'Residential Complex in Nairobi',
      description: 'Modern residential complex with 50 units',
      status: 'active',
      budgetKes: 15000000,
      clientId: '2',
      location: 'Westlands, Nairobi',
      county: 'Nairobi',
      completionPercentage: 65,
      featured: true,
      imageUrl: '/images/project-1.jpg',
      startDate: new Date('2024-01-15').toISOString(),
      endDate: new Date('2024-12-31').toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: '2',
      title: 'Commercial Building in Mombasa',
      description: 'Office complex with retail space',
      status: 'planning',
      budgetKes: 25000000,
      clientId: '2',
      location: 'CBD, Mombasa',
      county: 'Mombasa',
      completionPercentage: 0,
      featured: false,
      imageUrl: '/images/project-2.jpg',
      startDate: new Date('2024-03-01').toISOString(),
      endDate: new Date('2025-06-30').toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    }
  ],
  services: [
    {
      id: '1',
      title: 'Residential Construction',
      description: 'Complete residential building services from foundation to finishing',
      category: 'construction',
      icon: 'home',
      features: ['Foundation work', 'Structural construction', 'Finishing work', 'Interior design'],
      priceRangeMin: 500000,
      priceRangeMax: 10000000,
      durationEstimate: '6-18 months',
      active: true,
      featured: true,
      imageUrl: '/images/service-residential.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Commercial Construction',
      description: 'Office buildings, retail spaces, and commercial complexes',
      category: 'construction',
      icon: 'building',
      features: ['Commercial design', 'Large-scale construction', 'MEP systems', 'Project management'],
      priceRangeMin: 2000000,
      priceRangeMax: 50000000,
      durationEstimate: '12-36 months',
      active: true,
      featured: true,
      imageUrl: '/images/service-commercial.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  contactSubmissions: [],
  testimonials: [
    {
      id: '1',
      name: 'Mary Wanjiku',
      company: 'Wanjiku Enterprises',
      position: 'CEO',
      message: 'AKIBEKS delivered our office building on time and within budget. Excellent work!',
      rating: 5,
      approved: true,
      featured: true,
      location: 'Nairobi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  activityLogs: [],
  sessions: [],
  errorLogs: [],
  seoConfigurations: [],
  sitemaps: [],
  seoAnalytics: [],
  keywordRankings: [],
  metaRedirects: [],
  robotsConfig: [],
  schemaTemplates: []
};

// Enhanced Database Client with proper SQL operations
export class DatabaseClient {
  private static instance: DatabaseClient;
  private isServerEnvironment: boolean;
  private db: PgDatabase<typeof schema> | null = null;

  private constructor() {
    this.isServerEnvironment = typeof window === 'undefined' && typeof global !== 'undefined';
    if (this.isServerEnvironment) {
      this.initializeServerDatabase();
    }
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  private async initializeServerDatabase(): Promise<void> {
    try {
      if (this.isServerEnvironment) {
        const { db } = await import('../database/connection');
        this.db = db;
        console.log('PostgreSQL database client initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Fall back to mock data in case of database connection issues
    }
  }

  // Generic CRUD operations
  async select<T>(tableName: string, options: QueryOptions = {}): Promise<DatabaseResult<T[]>> {
    try {
      if (this.db && this.isServerEnvironment) {
        // Server-side: Use actual database
        const table = this.getTable(tableName);
        if (!table) {
          throw new Error(`Table ${tableName} not found`);
        }

        let query = this.db.select().from(table);

        // Apply filters
        if (options.filters && options.filters.length > 0) {
          const conditions = options.filters.map(filter => {
            const column = table[filter.column];
            if (!column) return null;

            switch (filter.operator) {
              case 'eq': return eq(column, filter.value);
              case 'ne': return sql`${column} != ${filter.value}`;
              case 'gt': return sql`${column} > ${filter.value}`;
              case 'lt': return sql`${column} < ${filter.value}`;
              case 'gte': return sql`${column} >= ${filter.value}`;
              case 'lte': return sql`${column} <= ${filter.value}`;
              case 'like': return like(column, `%${filter.value}%`);
              case 'in': return sql`${column} = ANY(${filter.value})`;
              default: return null;
            }
          }).filter(Boolean);

          if (conditions.length > 0) {
            query = query.where(and(...conditions));
          }
        }

        // Apply ordering
        if (options.orderBy) {
          const column = table[options.orderBy];
          if (column) {
            query = options.orderDirection === 'desc' 
              ? query.orderBy(desc(column))
              : query.orderBy(asc(column));
          }
        }

        // Apply pagination
        if (options.limit) {
          query = query.limit(options.limit);
        }
        if (options.offset) {
          query = query.offset(options.offset);
        }

        const result = await query.execute();
        return { data: result as T[], error: null };
      } else {
        // Browser environment: Use mock data
        const data = (mockData as any)[tableName] || [];
        let filteredData = [...data];

        // Apply filters to mock data
        if (options.filters) {
          filteredData = filteredData.filter(item => {
            return options.filters!.every(filter => {
              const value = item[filter.column];
              switch (filter.operator) {
                case 'eq': return value === filter.value;
                case 'ne': return value !== filter.value;
                case 'gt': return value > filter.value;
                case 'lt': return value < filter.value;
                case 'gte': return value >= filter.value;
                case 'lte': return value <= filter.value;
                case 'like': return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                case 'in': return Array.isArray(filter.value) && filter.value.includes(value);
                default: return true;
              }
            });
          });
        }

        // Apply ordering to mock data
        if (options.orderBy) {
          filteredData.sort((a, b) => {
            const aVal = a[options.orderBy!];
            const bVal = b[options.orderBy!];
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return options.orderDirection === 'desc' ? -comparison : comparison;
          });
        }

        // Apply pagination to mock data
        if (options.offset) {
          filteredData = filteredData.slice(options.offset);
        }
        if (options.limit) {
          filteredData = filteredData.slice(0, options.limit);
        }

        return { data: filteredData as T[], error: null };
      }
    } catch (error) {
      console.error(`Error selecting from ${tableName}:`, error);
      return { data: [], error: error as Error };
    }
  }

  async selectPaginated<T>(
    tableName: string, 
    page: number = 1, 
    pageSize: number = 10, 
    options: Omit<QueryOptions, 'limit' | 'offset'> = {}
  ): Promise<PaginatedResult<T>> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count
      const countResult = await this.count(tableName, options.filters);
      const total = countResult.data || 0;
      
      // Get paginated data
      const result = await this.select<T>(tableName, {
        ...options,
        limit: pageSize,
        offset
      });

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: result.data || [],
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      console.error(`Error in paginated select from ${tableName}:`, error);
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      };
    }
  }

  async findOne<T>(tableName: string, filters: Record<string, any>): Promise<DatabaseResult<T>> {
    const filterOptions = Object.entries(filters).map(([column, value]) => ({
      column,
      operator: 'eq' as const,
      value
    }));

    const result = await this.select<T>(tableName, { 
      filters: filterOptions, 
      limit: 1 
    });

    return {
      data: result.data && result.data.length > 0 ? result.data[0] : null,
      error: result.error
    };
  }

  async insert<T>(tableName: string, data: any): Promise<DatabaseResult<T>> {
    try {
      if (this.db && this.isServerEnvironment) {
        const table = this.getTable(tableName);
        if (!table) {
          throw new Error(`Table ${tableName} not found`);
        }

        const result = await this.db.insert(table).values(data).returning().execute();
        return { data: result[0] as T, error: null };
      } else {
        // Browser environment: Simulate insert
        const newItem = {
          id: Math.random().toString(36).substr(2, 9),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const mockTable = (mockData as any)[tableName];
        if (mockTable) {
          mockTable.push(newItem);
        }
        
        return { data: newItem as T, error: null };
      }
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      return { data: null, error: error as Error };
    }
  }

  async update<T>(tableName: string, id: string, data: any): Promise<DatabaseResult<T>> {
    try {
      if (this.db && this.isServerEnvironment) {
        const table = this.getTable(tableName);
        if (!table) {
          throw new Error(`Table ${tableName} not found`);
        }

        const updateData = {
          ...data,
          updatedAt: new Date()
        };

        const result = await this.db
          .update(table)
          .set(updateData)
          .where(eq(table.id, id))
          .returning()
          .execute();

        return { data: result[0] as T, error: null };
      } else {
        // Browser environment: Simulate update
        const mockTable = (mockData as any)[tableName];
        if (mockTable) {
          const index = mockTable.findIndex((item: any) => item.id === id);
          if (index !== -1) {
            mockTable[index] = {
              ...mockTable[index],
              ...data,
              updatedAt: new Date().toISOString()
            };
            return { data: mockTable[index] as T, error: null };
          }
        }
        
        throw new Error('Record not found');
      }
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      return { data: null, error: error as Error };
    }
  }

  async delete(tableName: string, id: string): Promise<DatabaseResult<boolean>> {
    try {
      if (this.db && this.isServerEnvironment) {
        const table = this.getTable(tableName);
        if (!table) {
          throw new Error(`Table ${tableName} not found`);
        }

        await this.db.delete(table).where(eq(table.id, id)).execute();
        return { data: true, error: null };
      } else {
        // Browser environment: Simulate delete
        const mockTable = (mockData as any)[tableName];
        if (mockTable) {
          const index = mockTable.findIndex((item: any) => item.id === id);
          if (index !== -1) {
            mockTable.splice(index, 1);
            return { data: true, error: null };
          }
        }
        
        throw new Error('Record not found');
      }
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      return { data: false, error: error as Error };
    }
  }

  async count(tableName: string, filters?: FilterOption[]): Promise<DatabaseResult<number>> {
    try {
      if (this.db && this.isServerEnvironment) {
        const table = this.getTable(tableName);
        if (!table) {
          throw new Error(`Table ${tableName} not found`);
        }

        let query = this.db.select({ count: count() }).from(table);

        if (filters && filters.length > 0) {
          const conditions = filters.map(filter => {
            const column = table[filter.column];
            if (!column) return null;

            switch (filter.operator) {
              case 'eq': return eq(column, filter.value);
              case 'ne': return sql`${column} != ${filter.value}`;
              case 'gt': return sql`${column} > ${filter.value}`;
              case 'lt': return sql`${column} < ${filter.value}`;
              case 'gte': return sql`${column} >= ${filter.value}`;
              case 'lte': return sql`${column} <= ${filter.value}`;
              case 'like': return like(column, `%${filter.value}%`);
              case 'in': return sql`${column} = ANY(${filter.value})`;
              default: return null;
            }
          }).filter(Boolean);

          if (conditions.length > 0) {
            query = query.where(and(...conditions));
          }
        }

        const result = await query.execute();
        return { data: result[0]?.count || 0, error: null };
      } else {
        // Browser environment: Count mock data
        let data = (mockData as any)[tableName] || [];
        
        if (filters) {
          data = data.filter((item: any) => {
            return filters.every(filter => {
              const value = item[filter.column];
              switch (filter.operator) {
                case 'eq': return value === filter.value;
                case 'ne': return value !== filter.value;
                case 'gt': return value > filter.value;
                case 'lt': return value < filter.value;
                case 'gte': return value >= filter.value;
                case 'lte': return value <= filter.value;
                case 'like': return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                case 'in': return Array.isArray(filter.value) && filter.value.includes(value);
                default: return true;
              }
            });
          });
        }
        
        return { data: data.length, error: null };
      }
    } catch (error) {
      console.error(`Error counting ${tableName}:`, error);
      return { data: 0, error: error as Error };
    }
  }

  // Health check
  async checkHealth(): Promise<{ isHealthy: boolean; message: string }> {
    try {
      if (this.db && this.isServerEnvironment) {
        const { checkDatabaseHealth } = await import('../database/connection');
        const health = await checkDatabaseHealth();
        return {
          isHealthy: health.isHealthy,
          message: health.isHealthy ? 'Database connection is healthy' : 'Database connection issues detected'
        };
      } else {
        return {
          isHealthy: true,
          message: 'Using mock data (browser environment)'
        };
      }
    } catch (error) {
      return {
        isHealthy: false,
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get table reference for Drizzle operations
  private getTable(tableName: string) {
    const tableMap: Record<string, any> = {
      users: schema.users,
      projects: schema.projects,
      services: schema.services,
      contactSubmissions: schema.contactSubmissions,
      testimonials: schema.testimonials,
      activityLogs: schema.activityLogs,
      sessions: schema.sessions,
      errorLogs: schema.errorLogs,
      seoConfigurations: schema.seoConfigurations,
      sitemaps: schema.sitemaps,
      seoAnalytics: schema.seoAnalytics,
      keywordRankings: schema.keywordRankings,
      metaRedirects: schema.metaRedirects,
      robotsConfig: schema.robotsConfig,
      schemaTemplates: schema.schemaTemplates
    };

    return tableMap[tableName];
  }
}

// Export singleton instance and class
export const dbClient = DatabaseClient.getInstance();
export { DatabaseClient as default };