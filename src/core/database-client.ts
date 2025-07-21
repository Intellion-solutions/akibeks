// Simple Database Client that works in both server and browser environments
// This avoids importing server-side modules in the browser build

// Type definitions for common database operations
export interface QueryOptions {
  filters?: FilterOption[];
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface FilterOption {
  column: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
  value: any;
}

export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string | null;
  count?: number;
}

// Simple Database Client that works in both server and browser environments
export class DatabaseClient {
  private db: any = null;
  private isServer: boolean;
  private mockData: any;
  private initialized: boolean = false;

  constructor() {
    this.isServer = typeof window === 'undefined';
    this.initializeMockData();
    
    if (this.isServer) {
      // Defer server-side initialization to avoid import issues
      this.initializeServerConnection();
    }
  }

  private async initializeServerConnection() {
    if (this.initialized) return;
    
    try {
      // Only import server modules when actually on server
      if (this.isServer) {
        const connectionModule = await import('../database/connection.js');
        this.db = connectionModule.db;
        this.initialized = true;
        console.log('✅ Database client initialized with PostgreSQL connection');
      }
    } catch (error) {
      console.warn('Failed to initialize database connection, using mock data:', error);
      this.initialized = true; // Mark as initialized even if failed
    }
  }

  private initializeMockData() {
    this.mockData = {
      users: [
        {
          id: '1',
          email: 'admin@akibeks.co.ke',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      projects: [
        {
          id: '1',
          title: 'Modern Office Complex',
          description: 'A state-of-the-art office building in Nairobi CBD',
          status: 'in_progress',
          priority: 'high',
          startDate: new Date('2024-01-15'),
          estimatedEndDate: new Date('2024-12-31'),
          budget: 15000000,
          clientId: '1',
          assignedToId: '1',
          progress: 65,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      services: [
        {
          id: '1',
          name: 'Architectural Design',
          description: 'Complete architectural design services',
          category: 'design',
          price: 250000,
          duration: '4-8 weeks',
          isActive: true,
          features: ['3D Modeling', 'Technical Drawings'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      contactSubmissions: [],
      testimonials: [
        {
          id: '1',
          name: 'John Kamau',
          company: 'Kamau Enterprises',
          rating: 5,
          message: 'AKIBEKS Engineering delivered exceptional quality!',
          approved: true,
          createdAt: new Date()
        }
      ],
      seoConfigurations: []
    };
    console.log('📝 Database client initialized with mock data');
  }

  private async ensureInitialized() {
    if (this.isServer && !this.initialized) {
      await this.initializeServerConnection();
    }
  }

  // Generic select method
  async select(tableName: string, options?: QueryOptions): Promise<DatabaseResult<any[]>> {
    try {
      await this.ensureInitialized();
      
      if (this.isServer && this.db) {
        // Server-side database query - import schema only when needed
        const schemaModule = await import('../database/schema/index.js');
        const { eq, desc, asc } = await import('drizzle-orm');
        
        const tableMap: Record<string, any> = {
          users: schemaModule.users,
          projects: schemaModule.projects,
          services: schemaModule.services,
          contactSubmissions: schemaModule.contactSubmissions,
          testimonials: schemaModule.testimonials,
          seoConfigurations: schemaModule.seoConfigurations
        };

        const targetTable = tableMap[tableName];
        if (!targetTable) {
          return { success: false, error: `Table ${tableName} not found` };
        }

        let query = this.db.select().from(targetTable);

        // Apply filters, ordering, and pagination
        if (options?.filters) {
          // Build where conditions - simplified for now
          // In production, you'd want more robust filter handling
        }

        if (options?.orderBy && targetTable[options.orderBy]) {
          const orderFn = options.orderDirection === 'desc' ? desc : asc;
          query = query.orderBy(orderFn(targetTable[options.orderBy]));
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        if (options?.offset) {
          query = query.offset(options.offset);
        }

        const result = await query;
        return { success: true, data: result };
      } else {
        // Browser-side mock data
        const data = this.mockData[tableName] || [];
        let filteredData = [...data];

        if (options?.limit) {
          filteredData = filteredData.slice(options.offset || 0, (options.offset || 0) + options.limit);
        }

        return { success: true, data: filteredData };
      }
    } catch (error) {
      console.error(`Select error for table ${tableName}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  // Find one record
  async findOne(tableName: string, filters: Record<string, any>): Promise<DatabaseResult<any>> {
    try {
      await this.ensureInitialized();
      
      if (this.isServer && this.db) {
        const schemaModule = await import('../database/schema/index.js');
        const { eq } = await import('drizzle-orm');
        
        const tableMap: Record<string, any> = {
          users: schemaModule.users,
          projects: schemaModule.projects,
          services: schemaModule.services,
          contactSubmissions: schemaModule.contactSubmissions,
          testimonials: schemaModule.testimonials,
          seoConfigurations: schemaModule.seoConfigurations
        };

        const targetTable = tableMap[tableName];
        if (!targetTable) {
          return { success: false, error: `Table ${tableName} not found` };
        }

        // Build where condition for first filter (simplified)
        const firstFilter = Object.entries(filters)[0];
        if (!firstFilter) {
          return { success: false, error: 'No filters provided' };
        }

        const [column, value] = firstFilter;
        if (!targetTable[column]) {
          return { success: false, error: `Column ${column} not found` };
        }

        const result = await this.db.select().from(targetTable).where(eq(targetTable[column], value)).limit(1);
        
        return { success: true, data: result[0] || null };
      } else {
        // Browser-side mock data
        const data = this.mockData[tableName] || [];
        const result = data.find((item: any) => {
          return Object.entries(filters).every(([key, value]) => item[key] === value);
        });

        return { success: true, data: result || null };
      }
    } catch (error) {
      console.error(`FindOne error for table ${tableName}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Insert record
  async insert(tableName: string, data: any): Promise<DatabaseResult<any>> {
    try {
      await this.ensureInitialized();
      
      if (this.isServer && this.db) {
        const schemaModule = await import('../database/schema/index.js');
        
        const tableMap: Record<string, any> = {
          users: schemaModule.users,
          projects: schemaModule.projects,
          services: schemaModule.services,
          contactSubmissions: schemaModule.contactSubmissions,
          testimonials: schemaModule.testimonials,
          seoConfigurations: schemaModule.seoConfigurations
        };

        const targetTable = tableMap[tableName];
        if (!targetTable) {
          return { success: false, error: `Table ${tableName} not found` };
        }

        const result = await this.db.insert(targetTable).values(data).returning();
        return { success: true, data: result[0] };
      } else {
        // Browser-side mock data
        const newItem = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        if (!this.mockData[tableName]) {
          this.mockData[tableName] = [];
        }

        this.mockData[tableName].push(newItem);
        return { success: true, data: newItem };
      }
    } catch (error) {
      console.error(`Insert error for table ${tableName}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update record
  async update(tableName: string, id: string, data: any): Promise<DatabaseResult<any>> {
    try {
      await this.ensureInitialized();
      
      if (this.isServer && this.db) {
        const schemaModule = await import('../database/schema/index.js');
        const { eq } = await import('drizzle-orm');
        
        const tableMap: Record<string, any> = {
          users: schemaModule.users,
          projects: schemaModule.projects,
          services: schemaModule.services,
          contactSubmissions: schemaModule.contactSubmissions,
          testimonials: schemaModule.testimonials,
          seoConfigurations: schemaModule.seoConfigurations
        };

        const targetTable = tableMap[tableName];
        if (!targetTable) {
          return { success: false, error: `Table ${tableName} not found` };
        }

        const result = await this.db
          .update(targetTable)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(targetTable.id, id))
          .returning();

        return { success: true, data: result[0] };
      } else {
        // Browser-side mock data
        const items = this.mockData[tableName] || [];
        const index = items.findIndex((item: any) => item.id === id);

        if (index === -1) {
          return { success: false, error: `Item with id ${id} not found` };
        }

        const updatedItem = {
          ...items[index],
          ...data,
          updatedAt: new Date()
        };

        this.mockData[tableName][index] = updatedItem;
        return { success: true, data: updatedItem };
      }
    } catch (error) {
      console.error(`Update error for table ${tableName}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete record
  async delete(tableName: string, id: string): Promise<DatabaseResult<boolean>> {
    try {
      await this.ensureInitialized();
      
      if (this.isServer && this.db) {
        const schemaModule = await import('../database/schema/index.js');
        const { eq } = await import('drizzle-orm');
        
        const tableMap: Record<string, any> = {
          users: schemaModule.users,
          projects: schemaModule.projects,
          services: schemaModule.services,
          contactSubmissions: schemaModule.contactSubmissions,
          testimonials: schemaModule.testimonials,
          seoConfigurations: schemaModule.seoConfigurations
        };

        const targetTable = tableMap[tableName];
        if (!targetTable) {
          return { success: false, error: `Table ${tableName} not found` };
        }

        await this.db.delete(targetTable).where(eq(targetTable.id, id));
        return { success: true, data: true };
      } else {
        // Browser-side mock data
        const items = this.mockData[tableName] || [];
        const index = items.findIndex((item: any) => item.id === id);

        if (index === -1) {
          return { success: false, error: `Item with id ${id} not found` };
        }

        this.mockData[tableName].splice(index, 1);
        return { success: true, data: true };
      }
    } catch (error) {
      console.error(`Delete error for table ${tableName}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Health check
  async healthCheck(): Promise<DatabaseResult<boolean>> {
    try {
      await this.ensureInitialized();
      
      if (this.isServer && this.db) {
        const connectionModule = await import('../database/connection.js');
        const isHealthy = await connectionModule.checkDatabaseConnection();
        return { success: isHealthy, data: isHealthy };
      } else {
        return { success: true, data: true };
      }
    } catch (error) {
      console.error('Health check error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
}

// Export singleton instance
export const dbClient = new DatabaseClient();

// Export table names for type safety
export const Tables = {
  USERS: 'users',
  PROJECTS: 'projects',
  SERVICES: 'services',
  CONTACT_SUBMISSIONS: 'contactSubmissions',
  TESTIMONIALS: 'testimonials',
  SEO_CONFIGURATIONS: 'seoConfigurations'
} as const;

export default dbClient;