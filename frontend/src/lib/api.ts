import type { 
  ApiResponse, 
  PaginatedResponse,
  User, 
  Project, 
  Service, 
  ContactSubmission, 
  Testimonial,
  LoginCredentials,
  RegisterData
} from '@shared/types';

// API Configuration
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

// API Client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Remove authentication token
  removeToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Generic request method
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Request failed'
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.post<{ user: User; token: string }>('/auth/login', credentials);
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.post<{ user: User; token: string }>('/auth/register', userData);
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.post<void>('/auth/logout');
    this.removeToken();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get<User>('/auth/me');
  }

  // Project endpoints
  async getProjects(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Project>> {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';

    const response = await this.get<Project[]>(`/projects${queryString}`);
    
    // Convert to paginated response format
    return {
      success: response.success,
      data: response.data || [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: response.data?.length || 0,
        pages: Math.ceil((response.data?.length || 0) / (params?.limit || 10))
      }
    };
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.get<Project>(`/projects/${id}`);
  }

  async createProject(projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.post<Project>('/projects', projectData);
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.put<Project>(`/projects/${id}`, projectData);
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/projects/${id}`);
  }

  // Service endpoints
  async getServices(params?: {
    category?: string;
    active?: boolean;
  }): Promise<ApiResponse<Service[]>> {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';

    return this.get<Service[]>(`/services${queryString}`);
  }

  async getService(id: string): Promise<ApiResponse<Service>> {
    return this.get<Service>(`/services/${id}`);
  }

  async createService(serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    return this.post<Service>('/services', serviceData);
  }

  async updateService(id: string, serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    return this.put<Service>(`/services/${id}`, serviceData);
  }

  async deleteService(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/services/${id}`);
  }

  // Contact endpoints
  async submitContactForm(contactData: Partial<ContactSubmission>): Promise<ApiResponse<ContactSubmission>> {
    return this.post<ContactSubmission>('/contact', contactData);
  }

  async getContactSubmissions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<ContactSubmission>> {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';

    const response = await this.get<ContactSubmission[]>(`/contact${queryString}`);
    
    return {
      success: response.success,
      data: response.data || [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: response.data?.length || 0,
        pages: Math.ceil((response.data?.length || 0) / (params?.limit || 10))
      }
    };
  }

  // Testimonial endpoints
  async getTestimonials(params?: {
    approved?: boolean;
    featured?: boolean;
  }): Promise<ApiResponse<Testimonial[]>> {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';

    return this.get<Testimonial[]>(`/testimonials${queryString}`);
  }

  async createTestimonial(testimonialData: Partial<Testimonial>): Promise<ApiResponse<Testimonial>> {
    return this.post<Testimonial>('/testimonials', testimonialData);
  }

  // File upload endpoint
  async uploadFile(file: File, category: string = 'general'): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const url = `${this.baseURL}/upload`;
      const headers: HeadersInit = {};

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Upload failed'
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get<{ status: string; timestamp: string }>('/health');
  }

  // Email endpoints
  async sendContactEmail(data: {
    name: string;
    email: string;
    message: string;
    company?: string;
    phone?: string;
  }): Promise<ApiResponse<void>> {
    return this.post<void>('/email/contact', data);
  }

  async requestQuotation(data: {
    name: string;
    email: string;
    projectName: string;
    description: string;
    budget?: number;
    timeline?: string;
  }): Promise<ApiResponse<void>> {
    return this.post<void>('/email/quotation', data);
  }
}

// Create and export API client instance
export const api = new ApiClient();

// Export types for convenience
export type { ApiResponse, PaginatedResponse };

export default api;