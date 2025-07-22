/**
 * Secure Database Client for AKIBEKS Engineering Solutions
 * Enterprise-grade security with encryption, token management, and audit logging
 */

import { SecurityService } from './security';

// Enhanced types with security metadata
export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  budgetKes: number;
  location: string;
  completionPercentage: number;
  clientId?: string;
  managerId?: string;
  teamIds: string[];
  startDate: string;
  endDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  attachments: Attachment[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  subcategory?: string;
  features: string[];
  isActive: boolean;
  duration: number; // in days
  requirements: string[];
  deliverables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'engineer' | 'client' | 'viewer';
  department?: string;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: string;
  profileImage?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  skills: string[];
  certifications: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  website?: string;
  taxId?: string;
  projects: string[]; // project IDs
  totalValue: number;
  status: 'active' | 'inactive' | 'prospect';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  clientId: string;
  clientName: string;
  company?: string;
  content: string;
  rating: number;
  projectId?: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  compressedSize?: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  completedAt?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignedTo: string[];
  dependencies: string[]; // milestone IDs
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  milestoneId?: string;
  assignedTo: string;
  assignedBy: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
  ip: string;
  userAgent: string;
  timestamp: string;
}

// Database response types
export interface SecureResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: string;
    requestId: string;
    userId?: string;
    permissions?: string[];
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Security configuration
const SECURITY_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key',
  enableAuditLog: true,
  enableEncryption: import.meta.env.MODE === 'production',
};

// Encryption utilities
class EncryptionService {
  private static key = SECURITY_CONFIG.encryptionKey;

  static async encrypt(data: string): Promise<string> {
    if (!SECURITY_CONFIG.enableEncryption) return data;
    
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.key.padEnd(32, '0').slice(0, 32));
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = encoder.encode(data);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encodedData
      );

      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encrypted), iv.length);
      
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Fallback to unencrypted
    }
  }

  static async decrypt(encryptedData: string): Promise<string> {
    if (!SECURITY_CONFIG.enableEncryption) return encryptedData;
    
    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const keyData = encoder.encode(this.key.padEnd(32, '0').slice(0, 32));
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      const iv = data.slice(0, 12);
      const encrypted = data.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encrypted
      );

      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Fallback to encrypted data
    }
  }
}

// Secure HTTP client
class SecureHttpClient {
  private baseUrl: string;
  private timeout: number;
  private authToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string, timeout = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.loadTokens();
  }

  private loadTokens() {
    this.authToken = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokens(authToken: string, refreshToken?: string) {
    this.authToken = authToken;
    localStorage.setItem('auth_token', authToken);
    
    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  private clearTokens() {
    this.authToken = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  private async refreshAuthToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.saveTokens(data.accessToken, data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearTokens();
    return false;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<SecureResponse<T>> {
    const requestId = SecurityService.generateSecureId();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Client-Version': '1.0.0',
        ...((options.headers as Record<string, string>) || {}),
      };

      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      // Encrypt sensitive data
      let body = options.body;
      if (body && typeof body === 'string') {
        body = await EncryptionService.encrypt(body);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers,
        body,
      });

      clearTimeout(timeoutId);

      // Handle authentication errors
      if (response.status === 401 && this.authToken) {
        if (await this.refreshAuthToken()) {
          return this.request(endpoint, options, retryCount);
        } else {
          return {
            success: false,
            error: 'Authentication required',
            metadata: { timestamp: new Date().toISOString(), requestId }
          };
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let responseText = await response.text();
      
      // Decrypt response if needed
      if (responseText && SECURITY_CONFIG.enableEncryption) {
        responseText = await EncryptionService.decrypt(responseText);
      }

      const data = responseText ? JSON.parse(responseText) : null;

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId,
          userId: this.getCurrentUserId(),
        }
      };
    } catch (error) {
      console.error(`Secure request failed for ${endpoint}:`, error);

      // Retry logic for network errors
      if (retryCount < SECURITY_CONFIG.maxRetries && 
          (error instanceof TypeError || (error as Error).name === 'AbortError')) {
        await new Promise(resolve => 
          setTimeout(resolve, SECURITY_CONFIG.retryDelay * (retryCount + 1))
        );
        return this.request(endpoint, options, retryCount + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: { timestamp: new Date().toISOString(), requestId }
      };
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('admin_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (error) {
      console.error('Failed to get current user ID:', error);
    }
    return undefined;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<SecureResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<SecureResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<SecureResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<SecureResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  setAuthToken(token: string, refreshToken?: string) {
    this.saveTokens(token, refreshToken);
  }

  clearAuth() {
    this.clearTokens();
  }
}

// Secure Database Client
export class SecureDatabaseClient {
  protected http: SecureHttpClient;
  private auditLog: AuditLog[] = [];

  constructor() {
    this.http = new SecureHttpClient(SECURITY_CONFIG.apiUrl, SECURITY_CONFIG.timeout);
  }

  private async logAction(action: string, resource: string, resourceId: string, changes?: any) {
    if (!SECURITY_CONFIG.enableAuditLog) return;

    const logEntry: AuditLog = {
      id: SecurityService.generateSecureId(),
      userId: this.getCurrentUserId() || 'anonymous',
      action,
      resource,
      resourceId,
      changes: changes || {},
      ip: 'client-side', // In production, this would be set by the server
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    this.auditLog.push(logEntry);
    
    // Send to server (in production)
    try {
      await this.http.post('/audit-logs', logEntry);
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('admin_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (error) {
      console.error('Failed to get current user ID:', error);
    }
    return undefined;
  }

  // Authentication
  async authenticate(email: string, password: string): Promise<SecureResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    const result = await this.http.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      email: SecurityService.sanitizeInput(email),
      password, // Password should be hashed on the server
    });

    if (result.success && result.data) {
      this.http.setAuthToken(result.data.accessToken, result.data.refreshToken);
      await this.logAction('authenticate', 'user', result.data.user.id);
    }

    return result;
  }

  async logout(): Promise<SecureResponse<void>> {
    const userId = this.getCurrentUserId();
    const result = await this.http.post<void>('/auth/logout', {});
    
    if (result.success) {
      this.http.clearAuth();
      if (userId) {
        await this.logAction('logout', 'user', userId);
      }
    }

    return result;
  }

  // Projects
  async getProjects(options?: {
    limit?: number;
    offset?: number;
    status?: string;
    clientId?: string;
    managerId?: string;
    search?: string;
  }): Promise<SecureResponse<PaginatedResponse<Project>>> {
    const result = await this.http.get<PaginatedResponse<Project>>('/projects', options);
    await this.logAction('read', 'projects', 'collection');
    return result;
  }

  async getProject(id: string): Promise<SecureResponse<Project>> {
    const result = await this.http.get<Project>(`/projects/${id}`);
    await this.logAction('read', 'project', id);
    return result;
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<SecureResponse<Project>> {
    const result = await this.http.post<Project>('/projects', {
      ...project,
      createdBy: this.getCurrentUserId(),
    });
    
    if (result.success && result.data) {
      await this.logAction('create', 'project', result.data.id, project);
    }
    
    return result;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<SecureResponse<Project>> {
    const result = await this.http.put<Project>(`/projects/${id}`, {
      ...updates,
      updatedBy: this.getCurrentUserId(),
    });
    
    if (result.success) {
      await this.logAction('update', 'project', id, updates);
    }
    
    return result;
  }

  async deleteProject(id: string): Promise<SecureResponse<void>> {
    const result = await this.http.delete<void>(`/projects/${id}`);
    
    if (result.success) {
      await this.logAction('delete', 'project', id);
    }
    
    return result;
  }

  // Services
  async getServices(options?: {
    limit?: number;
    category?: string;
    isActive?: boolean;
  }): Promise<SecureResponse<Service[]>> {
    const result = await this.http.get<Service[]>('/services', options);
    await this.logAction('read', 'services', 'collection');
    return result;
  }

  async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecureResponse<Service>> {
    const result = await this.http.post<Service>('/services', service);
    
    if (result.success && result.data) {
      await this.logAction('create', 'service', result.data.id, service);
    }
    
    return result;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<SecureResponse<Service>> {
    const result = await this.http.put<Service>(`/services/${id}`, updates);
    
    if (result.success) {
      await this.logAction('update', 'service', id, updates);
    }
    
    return result;
  }

  async deleteService(id: string): Promise<SecureResponse<void>> {
    const result = await this.http.delete<void>(`/services/${id}`);
    
    if (result.success) {
      await this.logAction('delete', 'service', id);
    }
    
    return result;
  }

  // Users
  async getUsers(options?: {
    limit?: number;
    role?: string;
    department?: string;
    isActive?: boolean;
  }): Promise<SecureResponse<User[]>> {
    const result = await this.http.get<User[]>('/users', options);
    await this.logAction('read', 'users', 'collection');
    return result;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecureResponse<User>> {
    const result = await this.http.post<User>('/users', user);
    
    if (result.success && result.data) {
      await this.logAction('create', 'user', result.data.id, { ...user, password: '[REDACTED]' });
    }
    
    return result;
  }

  // Clients
  async getClients(options?: {
    limit?: number;
    status?: string;
    industry?: string;
  }): Promise<SecureResponse<Client[]>> {
    const result = await this.http.get<Client[]>('/clients', options);
    await this.logAction('read', 'clients', 'collection');
    return result;
  }

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecureResponse<Client>> {
    const result = await this.http.post<Client>('/clients', client);
    
    if (result.success && result.data) {
      await this.logAction('create', 'client', result.data.id, client);
    }
    
    return result;
  }

  // Tasks
  async getTasks(options?: {
    limit?: number;
    projectId?: string;
    assignedTo?: string;
    status?: string;
  }): Promise<SecureResponse<Task[]>> {
    const result = await this.http.get<Task[]>('/tasks', options);
    await this.logAction('read', 'tasks', 'collection');
    return result;
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecureResponse<Task>> {
    const result = await this.http.post<Task>('/tasks', {
      ...task,
      assignedBy: this.getCurrentUserId(),
    });
    
    if (result.success && result.data) {
      await this.logAction('create', 'task', result.data.id, task);
    }
    
    return result;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<SecureResponse<Task>> {
    const result = await this.http.put<Task>(`/tasks/${id}`, updates);
    
    if (result.success) {
      await this.logAction('update', 'task', id, updates);
    }
    
    return result;
  }

  // Milestones
  async getMilestones(projectId: string): Promise<SecureResponse<Milestone[]>> {
    const result = await this.http.get<Milestone[]>(`/projects/${projectId}/milestones`);
    await this.logAction('read', 'milestones', projectId);
    return result;
  }

  async createMilestone(milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecureResponse<Milestone>> {
    const result = await this.http.post<Milestone>('/milestones', milestone);
    
    if (result.success && result.data) {
      await this.logAction('create', 'milestone', result.data.id, milestone);
    }
    
    return result;
  }

  // Testimonials
  async getTestimonials(options?: {
    limit?: number;
    approved?: boolean;
    featured?: boolean;
  }): Promise<SecureResponse<Testimonial[]>> {
    const result = await this.http.get<Testimonial[]>('/testimonials', options);
    await this.logAction('read', 'testimonials', 'collection');
    return result;
  }

  // Dashboard & Analytics
  async getDashboardStats(): Promise<SecureResponse<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalUsers: number;
    totalClients: number;
    totalRevenue: number;
    monthlyRevenue: number;
    tasksCompleted: number;
    tasksPending: number;
  }>> {
    const result = await this.http.get<{
      totalProjects: number;
      activeProjects: number;
      completedProjects: number;
      totalUsers: number;
      totalClients: number;
      totalRevenue: number;
      monthlyRevenue: number;
      tasksCompleted: number;
      tasksPending: number;
    }>('/dashboard/stats');
    await this.logAction('read', 'dashboard', 'stats');
    return result;
  }

  async getAnalyticsData(period: string = '12months'): Promise<SecureResponse<any>> {
    const result = await this.http.get(`/analytics/${period}`);
    await this.logAction('read', 'analytics', period);
    return result;
  }

  // Audit logs
  async getAuditLogs(options?: {
    limit?: number;
    userId?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SecureResponse<PaginatedResponse<AuditLog>>> {
    const result = await this.http.get<PaginatedResponse<AuditLog>>('/audit-logs', options);
    await this.logAction('read', 'audit-logs', 'collection');
    return result;
  }

  // Contact & Newsletter
  async submitContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<SecureResponse<{ id: string }>> {
    const sanitizedData = {
      name: SecurityService.sanitizeInput(data.name),
      email: SecurityService.sanitizeInput(data.email),
      phone: data.phone ? SecurityService.sanitizeInput(data.phone) : undefined,
      subject: SecurityService.sanitizeInput(data.subject),
      message: SecurityService.sanitizeInput(data.message),
    };

    const result = await this.http.post<{ id: string }>('/contact', sanitizedData);
    
    if (result.success && result.data) {
      await this.logAction('create', 'contact-submission', result.data.id, sanitizedData);
    }
    
    return result;
  }

  // File uploads
  async uploadFile(file: File, projectId?: string): Promise<SecureResponse<Attachment>> {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) formData.append('projectId', projectId);

    // Use a public method for file uploads
    const headers: Record<string, string> = {};
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${SECURITY_CONFIG.apiUrl}/files/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

            const data = await response.json();
      const result = { success: true, data } as SecureResponse<Attachment>;

      if (result.success && result.data) {
        await this.logAction('create', 'attachment', result.data.id, {
          filename: file.name,
          size: file.size,
          projectId,
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: { timestamp: new Date().toISOString(), requestId: 'upload-' + Date.now() }
      };
    }
  }
}

// Export singleton instance
export const secureDb = new SecureDatabaseClient();

// Development mode helper - NO MORE MOCK DATA
export const isDevelopment = import.meta.env.DEV;

export default secureDb;