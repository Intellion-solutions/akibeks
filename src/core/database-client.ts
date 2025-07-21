import { eq, and, or, gte, lte, desc, asc, count, like, ilike } from 'drizzle-orm';
import { DATABASE_CONFIG } from '../../config.js';
import { 
  users, 
  projects, 
  services, 
  contactSubmissions, 
  testimonials,
  seoConfigurations 
} from '../database/schema';

// Type definitions for common database operations
export interface QueryFilters {
  where?: any;
  orderBy?: any;
  limit?: number;
  offset?: number;
  select?: any;
}

export interface DatabaseOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

// Unified Database Client that works in both server and browser environments
export class DatabaseClient {
  private isServer: boolean;
  private db: any;
  private mockData: any;

  constructor() {
    this.isServer = typeof window === 'undefined';
    
    if (this.isServer) {
      // Server-side: Use actual PostgreSQL connection
      try {
        const { db } = require('../database/connection');
        this.db = db;
      } catch (error) {
        console.warn('Database connection not available:', error);
        this.db = null;
      }
    } else {
      // Browser-side: Use mock data
      this.initializeMockData();
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
          budget: 15000000, // KES
          clientId: '1',
          assignedToId: '1',
          progress: 65,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: 'Residential Villa Project',
          description: 'Luxury villa construction in Karen',
          status: 'planning',
          priority: 'medium',
          startDate: new Date('2024-03-01'),
          estimatedEndDate: new Date('2025-02-28'),
          budget: 8500000, // KES
          clientId: '2',
          assignedToId: '1',
          progress: 25,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      services: [
        {
          id: '1',
          name: 'Architectural Design',
          description: 'Complete architectural design services for residential and commercial projects',
          category: 'design',
          price: 250000, // KES
          duration: '4-8 weeks',
          isActive: true,
          features: ['3D Modeling', 'Technical Drawings', 'Site Planning'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Construction Management',
          description: 'Full project management from foundation to completion',
          category: 'construction',
          price: 500000, // KES
          duration: '6-18 months',
          isActive: true,
          features: ['Project Planning', 'Quality Control', 'Timeline Management'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      contactSubmissions: [],
      testimonials: [
        {
          id: '1',
          clientName: 'John Kamau',
          companyName: 'Kamau Enterprises',
          rating: 5,
          message: 'AKIBEKS Engineering delivered our office complex on time and within budget. Exceptional quality!',
          projectId: '1',
          isApproved: true,
          createdAt: new Date()
        }
      ],
      seoConfigurations: [
        {
          id: '1',
          pageUrl: '/',
          title: 'AKIBEKS Engineering Solutions - Leading Construction Company in Kenya',
          description: 'Premier engineering and construction services in Kenya. Architectural design, project management, and sustainable building solutions.',
          keywords: ['construction Kenya', 'engineering services', 'architectural design', 'project management'],
          ogTitle: 'AKIBEKS Engineering Solutions',
          ogDescription: 'Leading construction and engineering company in Kenya',
          ogImage: '/images/akibeks-logo.jpg',
          canonicalUrl: 'https://akibeks.co.ke/',
          robotsDirective: 'index,follow',
          structuredData: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    };
  }

  // Generic query method
  async query<T>(
    table: string, 
    filters?: QueryFilters
  ): Promise<DatabaseOperationResult<T[]>> {
    try {
      if (this.isServer && this.db) {
        // Server-side database query
        const tableMap: { [key: string]: any } = {
          users,
          projects,
          services,
          contactSubmissions,
          testimonials,
          seoConfigurations
        };

        const targetTable = tableMap[table];
        if (!targetTable) {
          throw new Error(`Table ${table} not found`);
        }

        let query = this.db.select().from(targetTable);

        // Apply filters
        if (filters?.where) {
          query = query.where(filters.where);
        }

        if (filters?.orderBy) {
          query = query.orderBy(filters.orderBy);
        }

        if (filters?.limit) {
          query = query.limit(filters.limit);
        }

        if (filters?.offset) {
          query = query.offset(filters.offset);
        }

        const result = await query;
        return { success: true, data: result };
      } else {
        // Browser-side mock data
        const data = this.mockData[table] || [];
        let filteredData = [...data];

        // Apply basic filtering for mock data
        if (filters?.limit) {
          filteredData = filteredData.slice(0, filters.limit);
        }

        return { success: true, data: filteredData };
      }
    } catch (error) {
      console.error(`Query error for table ${table}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  // Generic insert method
  async insert<T>(
    table: string, 
    data: Partial<T>
  ): Promise<DatabaseOperationResult<T>> {
    try {
      if (this.isServer && this.db) {
        // Server-side database insert
        const tableMap: { [key: string]: any } = {
          users,
          projects,
          services,
          contactSubmissions,
          testimonials,
          seoConfigurations
        };

        const targetTable = tableMap[table];
        if (!targetTable) {
          throw new Error(`Table ${table} not found`);
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

        if (!this.mockData[table]) {
          this.mockData[table] = [];
        }

        this.mockData[table].push(newItem);
        return { success: true, data: newItem as T };
      }
    } catch (error) {
      console.error(`Insert error for table ${table}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generic update method
  async update<T>(
    table: string, 
    id: string, 
    data: Partial<T>
  ): Promise<DatabaseOperationResult<T>> {
    try {
      if (this.isServer && this.db) {
        // Server-side database update
        const tableMap: { [key: string]: any } = {
          users,
          projects,
          services,
          contactSubmissions,
          testimonials,
          seoConfigurations
        };

        const targetTable = tableMap[table];
        if (!targetTable) {
          throw new Error(`Table ${table} not found`);
        }

        const result = await this.db
          .update(targetTable)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(targetTable.id, id))
          .returning();

        return { success: true, data: result[0] };
      } else {
        // Browser-side mock data
        const items = this.mockData[table] || [];
        const index = items.findIndex((item: any) => item.id === id);

        if (index === -1) {
          throw new Error(`Item with id ${id} not found`);
        }

        const updatedItem = {
          ...items[index],
          ...data,
          updatedAt: new Date()
        };

        this.mockData[table][index] = updatedItem;
        return { success: true, data: updatedItem as T };
      }
    } catch (error) {
      console.error(`Update error for table ${table}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generic delete method
  async delete(table: string, id: string): Promise<DatabaseOperationResult<boolean>> {
    try {
      if (this.isServer && this.db) {
        // Server-side database delete
        const tableMap: { [key: string]: any } = {
          users,
          projects,
          services,
          contactSubmissions,
          testimonials,
          seoConfigurations
        };

        const targetTable = tableMap[table];
        if (!targetTable) {
          throw new Error(`Table ${table} not found`);
        }

        await this.db.delete(targetTable).where(eq(targetTable.id, id));
        return { success: true, data: true };
      } else {
        // Browser-side mock data
        const items = this.mockData[table] || [];
        const index = items.findIndex((item: any) => item.id === id);

        if (index === -1) {
          throw new Error(`Item with id ${id} not found`);
        }

        this.mockData[table].splice(index, 1);
        return { success: true, data: true };
      }
    } catch (error) {
      console.error(`Delete error for table ${table}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Authentication methods
  async authenticate(email: string, password: string): Promise<DatabaseOperationResult<any>> {
    try {
      if (this.isServer && this.db) {
        // Server-side authentication with actual database
        const user = await this.db.query.users.findFirst({
          where: and(eq(users.email, email), eq(users.isActive, true))
        });

        if (!user) {
          return { success: false, error: 'User not found' };
        }

        // In a real implementation, you would verify the password hash here
        // For now, return the user (password verification would be handled by auth service)
        return { success: true, data: user };
      } else {
        // Browser-side mock authentication
        const user = this.mockData.users.find((u: any) => 
          u.email === email && u.isActive
        );

        if (!user) {
          return { success: false, error: 'User not found' };
        }

        return { success: true, data: user };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<DatabaseOperationResult<any>> {
    try {
      if (this.isServer && this.db) {
        // Server-side: Get real statistics
        const [projectsResult, servicesResult, usersResult] = await Promise.all([
          this.query('projects'),
          this.query('services'),
          this.query('users')
        ]);

        const stats = {
          totalProjects: projectsResult.data?.length || 0,
          activeProjects: projectsResult.data?.filter((p: any) => p.status === 'in_progress').length || 0,
          totalServices: servicesResult.data?.length || 0,
          totalUsers: usersResult.data?.length || 0,
          recentProjects: projectsResult.data?.slice(0, 5) || [],
          projectsByStatus: {
            planning: projectsResult.data?.filter((p: any) => p.status === 'planning').length || 0,
            in_progress: projectsResult.data?.filter((p: any) => p.status === 'in_progress').length || 0,
            completed: projectsResult.data?.filter((p: any) => p.status === 'completed').length || 0,
            on_hold: projectsResult.data?.filter((p: any) => p.status === 'on_hold').length || 0
          }
        };

        return { success: true, data: stats };
      } else {
        // Browser-side: Return mock statistics
        const stats = {
          totalProjects: this.mockData.projects.length,
          activeProjects: this.mockData.projects.filter((p: any) => p.status === 'in_progress').length,
          totalServices: this.mockData.services.length,
          totalUsers: this.mockData.users.length,
          recentProjects: this.mockData.projects.slice(0, 5),
          projectsByStatus: {
            planning: this.mockData.projects.filter((p: any) => p.status === 'planning').length,
            in_progress: this.mockData.projects.filter((p: any) => p.status === 'in_progress').length,
            completed: this.mockData.projects.filter((p: any) => p.status === 'completed').length,
            on_hold: this.mockData.projects.filter((p: any) => p.status === 'on_hold').length
          }
        };

        return { success: true, data: stats };
      }
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get dashboard stats'
      };
    }
  }

  // Health check
  async healthCheck(): Promise<DatabaseOperationResult<boolean>> {
    try {
      if (this.isServer && this.db) {
        // Server-side: Check actual database connection
        const { checkDatabaseConnection } = require('../database/connection');
        const isHealthy = await checkDatabaseConnection();
        return { success: isHealthy, data: isHealthy };
      } else {
        // Browser-side: Always healthy for mock data
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
export default dbClient;