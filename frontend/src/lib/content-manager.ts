/**
 * Dynamic Content Management System for AKIBEKS Engineering Solutions
 * Allows admin to edit website content in real-time with caching and version control
 */

import { secureDb } from './database-secure';

export interface WebsiteContent {
  id: string;
  type: 'page' | 'section' | 'component';
  pageId: string;
  sectionKey: string;
  title?: string;
  content: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  version: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface DynamicPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: WebsiteContent[];
  seoData: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  isPublished: boolean;
  publishedAt?: string;
  template: 'default' | 'landing' | 'portfolio' | 'service';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EditableProject {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  images: string[];
  category: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  location: string;
  client: string;
  budgetKes: number;
  completionPercentage: number;
  startDate: string;
  endDate?: string;
  features: string[];
  technologies: string[];
  teamSize: number;
  challenges?: string;
  solutions?: string;
  testimonial?: {
    content: string;
    clientName: string;
    clientTitle: string;
    rating: number;
  };
  isPublic: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EditableService {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  icon: string;
  category: string;
  subcategory?: string;
  basePrice: number;
  priceUnit: 'fixed' | 'per_sqm' | 'per_hour' | 'per_project';
  features: string[];
  benefits: string[];
  process: {
    step: number;
    title: string;
    description: string;
    duration: string;
  }[];
  requirements: string[];
  deliverables: string[];
  portfolio: string[]; // project IDs
  faqs: {
    question: string;
    answer: string;
  }[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seoData: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Content cache for performance
class ContentCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export class ContentManager {
  private cache = new ContentCache();

  // Dynamic Pages Management
  async getPages(): Promise<DynamicPage[]> {
    const cacheKey = 'pages:all';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await secureDb.http.get<DynamicPage[]>('/content/pages');
      if (response.success && response.data) {
        this.cache.set(cacheKey, response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      return [];
    }
  }

  async getPage(slug: string): Promise<DynamicPage | null> {
    const cacheKey = `page:${slug}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await secureDb.http.get<DynamicPage>(`/content/pages/${slug}`);
      if (response.success && response.data) {
        this.cache.set(cacheKey, response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch page:', error);
      return null;
    }
  }

  async createPage(page: Omit<DynamicPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<DynamicPage | null> {
    try {
      const response = await secureDb.http.post<DynamicPage>('/content/pages', page);
      if (response.success && response.data) {
        this.cache.invalidate('pages');
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to create page:', error);
      return null;
    }
  }

  async updatePage(id: string, updates: Partial<DynamicPage>): Promise<DynamicPage | null> {
    try {
      const response = await secureDb.http.put<DynamicPage>(`/content/pages/${id}`, updates);
      if (response.success && response.data) {
        this.cache.invalidate('pages');
        this.cache.invalidate(`page:${response.data.slug}`);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to update page:', error);
      return null;
    }
  }

  // Dynamic Projects Management
  async getPublicProjects(options?: {
    category?: string;
    featured?: boolean;
    limit?: number;
  }): Promise<EditableProject[]> {
    const cacheKey = `projects:public:${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await secureDb.http.get<EditableProject[]>('/content/projects/public', options);
      if (response.success && response.data) {
        this.cache.set(cacheKey, response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch public projects:', error);
      return [];
    }
  }

  async getAllProjects(): Promise<EditableProject[]> {
    const cacheKey = 'projects:all';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await secureDb.http.get<EditableProject[]>('/content/projects');
      if (response.success && response.data) {
        this.cache.set(cacheKey, response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return [];
    }
  }

  async createProject(project: Omit<EditableProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<EditableProject | null> {
    try {
      const response = await secureDb.http.post<EditableProject>('/content/projects', project);
      if (response.success && response.data) {
        this.cache.invalidate('projects');
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to create project:', error);
      return null;
    }
  }

  async updateProject(id: string, updates: Partial<EditableProject>): Promise<EditableProject | null> {
    try {
      const response = await secureDb.http.put<EditableProject>(`/content/projects/${id}`, updates);
      if (response.success && response.data) {
        this.cache.invalidate('projects');
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to update project:', error);
      return null;
    }
  }

  // Dynamic Services Management
  async getPublicServices(options?: {
    category?: string;
    featured?: boolean;
  }): Promise<EditableService[]> {
    const cacheKey = `services:public:${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await secureDb.http.get<EditableService[]>('/content/services/public', options);
      if (response.success && response.data) {
        this.cache.set(cacheKey, response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch public services:', error);
      return [];
    }
  }

  async getAllServices(): Promise<EditableService[]> {
    const cacheKey = 'services:all';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await secureDb.http.get<EditableService[]>('/content/services');
      if (response.success && response.data) {
        this.cache.set(cacheKey, response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch services:', error);
      return [];
    }
  }

  async createService(service: Omit<EditableService, 'id' | 'createdAt' | 'updatedAt'>): Promise<EditableService | null> {
    try {
      const response = await secureDb.http.post<EditableService>('/content/services', service);
      if (response.success && response.data) {
        this.cache.invalidate('services');
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to create service:', error);
      return null;
    }
  }

  async updateService(id: string, updates: Partial<EditableService>): Promise<EditableService | null> {
    try {
      const response = await secureDb.http.put<EditableService>(`/content/services/${id}`, updates);
      if (response.success && response.data) {
        this.cache.invalidate('services');
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to update service:', error);
      return null;
    }
  }

  // Content Sections Management
  async getPageContent(pageId: string): Promise<WebsiteContent[]> {
    const cacheKey = `content:${pageId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await secureDb.http.get<WebsiteContent[]>(`/content/sections/${pageId}`);
      if (response.success && response.data) {
        this.cache.set(cacheKey, response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch page content:', error);
      return [];
    }
  }

  async updateContent(contentId: string, updates: Partial<WebsiteContent>): Promise<WebsiteContent | null> {
    try {
      const response = await secureDb.http.put<WebsiteContent>(`/content/sections/${contentId}`, updates);
      if (response.success && response.data) {
        this.cache.invalidate('content');
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to update content:', error);
      return null;
    }
  }

  // Bulk Operations
  async publishMultiple(ids: string[], type: 'page' | 'project' | 'service'): Promise<boolean> {
    try {
      const response = await secureDb.http.post(`/content/${type}/publish`, { ids });
      if (response.success) {
        this.cache.invalidate(type);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to publish items:', error);
      return false;
    }
  }

  async unpublishMultiple(ids: string[], type: 'page' | 'project' | 'service'): Promise<boolean> {
    try {
      const response = await secureDb.http.post(`/content/${type}/unpublish`, { ids });
      if (response.success) {
        this.cache.invalidate(type);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unpublish items:', error);
      return false;
    }
  }

  // Search and Analytics
  async searchContent(query: string, type?: 'page' | 'project' | 'service'): Promise<any[]> {
    try {
      const response = await secureDb.http.get('/content/search', { query, type });
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to search content:', error);
      return [];
    }
  }

  async getContentAnalytics(): Promise<{
    totalPages: number;
    totalProjects: number;
    totalServices: number;
    publishedPages: number;
    publishedProjects: number;
    publishedServices: number;
    recentUpdates: any[];
  }> {
    const cacheKey = 'analytics:content';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await secureDb.http.get('/content/analytics');
      if (response.success && response.data) {
        this.cache.set(cacheKey, response.data, 2 * 60 * 1000); // 2 minutes TTL
        return response.data;
      }
      return {
        totalPages: 0,
        totalProjects: 0,
        totalServices: 0,
        publishedPages: 0,
        publishedProjects: 0,
        publishedServices: 0,
        recentUpdates: [],
      };
    } catch (error) {
      console.error('Failed to fetch content analytics:', error);
      return {
        totalPages: 0,
        totalProjects: 0,
        totalServices: 0,
        publishedPages: 0,
        publishedProjects: 0,
        publishedServices: 0,
        recentUpdates: [],
      };
    }
  }

  // Cache Management
  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(pattern?: string): void {
    this.cache.invalidate(pattern);
  }
}

// Singleton instance
export const contentManager = new ContentManager();

// React hooks for content management
export const useContent = () => {
  return {
    getPages: () => contentManager.getPages(),
    getPage: (slug: string) => contentManager.getPage(slug),
    getPublicProjects: (options?: any) => contentManager.getPublicProjects(options),
    getPublicServices: (options?: any) => contentManager.getPublicServices(options),
    getPageContent: (pageId: string) => contentManager.getPageContent(pageId),
    searchContent: (query: string, type?: string) => contentManager.searchContent(query, type as any),
    clearCache: () => contentManager.clearCache(),
  };
};

export default contentManager;