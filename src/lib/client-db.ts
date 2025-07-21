// Client-safe database wrapper
// This file provides database functionality without importing server modules at build time

export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string | null;
  count?: number;
}

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

// Mock data for client-side usage
const mockData = {
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

// Client-safe database operations
export const clientDb = {
  async select(tableName: string, options?: QueryOptions): Promise<DatabaseResult<any[]>> {
    try {
      const data = mockData[tableName as keyof typeof mockData] || [];
      let filteredData = [...data];

      if (options?.limit) {
        filteredData = filteredData.slice(options.offset || 0, (options.offset || 0) + options.limit);
      }

      return { success: true, data: filteredData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  },

  async findOne(tableName: string, filters: Record<string, any>): Promise<DatabaseResult<any>> {
    try {
      const data = mockData[tableName as keyof typeof mockData] || [];
      const result = data.find((item: any) => {
        return Object.entries(filters).every(([key, value]) => item[key] === value);
      });

      return { success: true, data: result || null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async insert(tableName: string, data: any): Promise<DatabaseResult<any>> {
    try {
      const newItem = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!mockData[tableName as keyof typeof mockData]) {
        (mockData as any)[tableName] = [];
      }

      (mockData as any)[tableName].push(newItem);
      return { success: true, data: newItem };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async update(tableName: string, id: string, data: any): Promise<DatabaseResult<any>> {
    try {
      const items = mockData[tableName as keyof typeof mockData] || [];
      const index = items.findIndex((item: any) => item.id === id);

      if (index === -1) {
        return { success: false, error: `Item with id ${id} not found` };
      }

      const updatedItem = {
        ...items[index],
        ...data,
        updatedAt: new Date()
      };

      (mockData as any)[tableName][index] = updatedItem;
      return { success: true, data: updatedItem };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async delete(tableName: string, id: string): Promise<DatabaseResult<boolean>> {
    try {
      const items = mockData[tableName as keyof typeof mockData] || [];
      const index = items.findIndex((item: any) => item.id === id);

      if (index === -1) {
        return { success: false, error: `Item with id ${id} not found` };
      }

      (mockData as any)[tableName].splice(index, 1);
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async healthCheck(): Promise<DatabaseResult<boolean>> {
    return { success: true, data: true };
  }
};

// Table names
export const Tables = {
  USERS: 'users',
  PROJECTS: 'projects',
  SERVICES: 'services',
  CONTACT_SUBMISSIONS: 'contactSubmissions',
  TESTIMONIALS: 'testimonials',
  SEO_CONFIGURATIONS: 'seoConfigurations'
} as const;

export default clientDb;