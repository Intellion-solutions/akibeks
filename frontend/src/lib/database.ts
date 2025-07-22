/**
 * Clean Database Client for AKIBEKS Engineering Solutions
 * Handles all database operations with proper TypeScript types
 */

// Base types
export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  budgetKes: number;
  location: string;
  completionPercentage: number;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'client';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  company?: string;
  content: string;
  rating: number;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

// Database response types
export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Database configuration
const DB_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
};

// HTTP client utility
class HttpClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<DatabaseResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`Database request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<DatabaseResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<DatabaseResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<DatabaseResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<DatabaseResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Database client
class DatabaseClient {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient(DB_CONFIG.apiUrl, DB_CONFIG.timeout);
  }

  // Projects
  async getProjects(options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<DatabaseResponse<PaginatedResponse<Project>>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.status) params.append('status', options.status);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.http.get<PaginatedResponse<Project>>(`/projects${query}`);
  }

  async getProject(id: string): Promise<DatabaseResponse<Project>> {
    return this.http.get<Project>(`/projects/${id}`);
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResponse<Project>> {
    return this.http.post<Project>('/projects', project);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<DatabaseResponse<Project>> {
    return this.http.put<Project>(`/projects/${id}`, updates);
  }

  async deleteProject(id: string): Promise<DatabaseResponse<void>> {
    return this.http.delete<void>(`/projects/${id}`);
  }

  // Services
  async getServices(options?: {
    limit?: number;
    category?: string;
  }): Promise<DatabaseResponse<Service[]>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.category) params.append('category', options.category);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.http.get<Service[]>(`/services${query}`);
  }

  async getService(id: string): Promise<DatabaseResponse<Service>> {
    return this.http.get<Service>(`/services/${id}`);
  }

  async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResponse<Service>> {
    return this.http.post<Service>('/services', service);
  }

  async updateService(id: string, updates: Partial<Service>): Promise<DatabaseResponse<Service>> {
    return this.http.put<Service>(`/services/${id}`, updates);
  }

  // Users
  async getUsers(options?: {
    limit?: number;
    role?: string;
  }): Promise<DatabaseResponse<User[]>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.role) params.append('role', options.role);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.http.get<User[]>(`/users${query}`);
  }

  async getUser(id: string): Promise<DatabaseResponse<User>> {
    return this.http.get<User>(`/users/${id}`);
  }

  // Authentication
  async authenticate(email: string, password: string): Promise<DatabaseResponse<{ user: User; token: string }>> {
    return this.http.post<{ user: User; token: string }>('/auth/login', {
      email,
      password,
    });
  }

  async refreshToken(token: string): Promise<DatabaseResponse<{ token: string }>> {
    return this.http.post<{ token: string }>('/auth/refresh', { token });
  }

  // Testimonials
  async getTestimonials(options?: {
    limit?: number;
    approved?: boolean;
    featured?: boolean;
  }): Promise<DatabaseResponse<Testimonial[]>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.approved !== undefined) params.append('approved', options.approved.toString());
    if (options?.featured !== undefined) params.append('featured', options.featured.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.http.get<Testimonial[]>(`/testimonials${query}`);
  }

  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt'>): Promise<DatabaseResponse<Testimonial>> {
    return this.http.post<Testimonial>('/testimonials', testimonial);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DatabaseResponse<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalUsers: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }>> {
    return this.http.get('/dashboard/stats');
  }

  // Contact form
  async submitContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<DatabaseResponse<{ id: string }>> {
    return this.http.post('/contact', data);
  }

  // Newsletter subscription
  async subscribeNewsletter(email: string): Promise<DatabaseResponse<{ id: string }>> {
    return this.http.post('/newsletter/subscribe', { email });
  }
}

// Export singleton instance
export const db = new DatabaseClient();

// Mock data fallback for development
export const mockData = {
  projects: [
    {
      id: '1',
      title: 'Westlands Office Complex',
      description: 'Modern office complex with sustainable design',
      status: 'in-progress' as const,
      budgetKes: 25000000,
      location: 'Westlands, Nairobi',
      completionPercentage: 75,
      clientId: '1',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    },
    {
      id: '2',
      title: 'Karen Residential Estate',
      description: 'Luxury residential development with modern amenities',
      status: 'planning' as const,
      budgetKes: 18000000,
      location: 'Karen, Nairobi',
      completionPercentage: 30,
      clientId: '2',
      createdAt: '2024-02-01T09:00:00Z',
      updatedAt: '2024-02-05T16:00:00Z',
    },
    {
      id: '3',
      title: 'Industrial Park Phase 2',
      description: 'Expansion of existing industrial facilities',
      status: 'in-progress' as const,
      budgetKes: 35000000,
      location: 'Thika, Kenya',
      completionPercentage: 60,
      clientId: '3',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-02-10T12:00:00Z',
    },
  ] as Project[],

  services: [
    {
      id: '1',
      name: 'Residential Construction',
      description: 'Complete residential building services',
      basePrice: 15000,
      category: 'Construction',
      features: ['Design', 'Construction', 'Project Management'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Commercial Buildings',
      description: 'Office buildings and commercial spaces',
      basePrice: 25000,
      category: 'Construction',
      features: ['Design', 'Construction', 'MEP Systems'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ] as Service[],

  testimonials: [
    {
      id: '1',
      clientName: 'John Doe',
      company: 'ABC Corporation',
      content: 'Excellent work on our office building project.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      company: 'XYZ Ltd',
      content: 'Professional service and quality construction.',
      rating: 5,
      isApproved: true,
      isFeatured: false,
      createdAt: '2024-01-20T14:00:00Z',
    },
  ] as Testimonial[],
};

// Development mode helper
export const isDevelopment = import.meta.env.DEV;

// Helper function to use mock data in development
export async function withFallback<T>(
  apiCall: () => Promise<DatabaseResponse<T>>,
  mockFallback: T
): Promise<DatabaseResponse<T>> {
  if (isDevelopment) {
    try {
      const result = await apiCall();
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
    }
    
    // Return mock data as fallback
    return { success: true, data: mockFallback };
  }
  
  return apiCall();
}