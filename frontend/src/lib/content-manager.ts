/**
 * Simplified Dynamic Content Management System for AKIBEKS Engineering Solutions
 * Mock implementation for development - would connect to real CMS API in production
 */

export interface WebsiteContent {
  id: string;
  type: 'text' | 'image' | 'video' | 'gallery' | 'form' | 'testimonial';
  title: string;
  content: string;
  metadata: {
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
    author?: string;
    publishDate?: string;
  };
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  sections: WebsiteContent[];
}

export interface EditableProject {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  images: string[];
  featuredImage: string;
  budgetRange: { min: number; max: number };
  budgetKes: number;
  timeline: { start: string; end?: string };
  startDate: string;
  endDate?: string;
  client: string;
  location: string;
  tags: string[];
  technologies?: string[];
  features?: string[];
  challenges?: string;
  solutions?: string;
  teamSize?: number;
  completionPercentage: number;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  testimonial?: {
    content: string;
    clientName: string;
    clientTitle: string;
    rating: number;
  };
}

export interface EditableService {
  id: string;
  title: string;
  description: string;
  category: string;
  features: string[];
  pricing: {
    type: 'fixed' | 'hourly' | 'project-based' | 'consultation';
    basePrice?: number;
    priceRange?: { min: number; max: number };
  };
  duration: string;
  isAvailable: boolean;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Simple cache implementation
class ContentCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export class ContentManager {
  private cache = new ContentCache();

  // Mock data for development
  private mockPages: DynamicPage[] = [
    {
      id: '1',
      title: 'About Us',
      slug: 'about',
      content: 'About AKIBEKS Engineering Solutions - Leading construction and engineering company in Kenya...',
      metaTitle: 'About Us - AKIBEKS Engineering Solutions',
      metaDescription: 'Learn about AKIBEKS Engineering Solutions, Kenya\'s premier construction and engineering company.',
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: []
    },
    {
      id: '2',
      title: 'Our Services',
      slug: 'services',
      content: 'Comprehensive construction and engineering services including residential, commercial, and infrastructure projects...',
      metaTitle: 'Our Services - AKIBEKS Engineering',
      metaDescription: 'Discover our comprehensive construction and engineering services in Kenya.',
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: []
    }
  ];

  private mockProjects: EditableProject[] = [
    {
      id: '1',
      title: 'Luxury Residential Complex - Karen',
      description: 'Modern 50-unit residential complex with premium amenities',
      longDescription: 'This luxury residential complex features state-of-the-art amenities and modern architectural design, setting new standards for residential living in Karen.',
      category: 'Residential',
      status: 'completed',
      images: [],
      featuredImage: '',
      budgetRange: { min: 150000000, max: 200000000 },
      budgetKes: 180000000,
      timeline: { start: '2023-01-01', end: '2023-12-31' },
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      client: 'Karen Properties Ltd',
      location: 'Karen, Nairobi',
      tags: ['luxury', 'residential', 'modern'],
      technologies: ['Smart Home Systems', 'Solar Energy', 'Rainwater Harvesting'],
      features: ['Swimming Pool', 'Gym', 'Playground', 'Security'],
      challenges: 'Managing construction during rainy season while maintaining quality standards.',
      solutions: 'Implemented advanced waterproofing and scheduled critical work during dry periods.',
      teamSize: 25,
      completionPercentage: 100,
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      testimonial: {
        content: 'AKIBEKS delivered exceptional quality and professionalism throughout the project.',
        clientName: 'John Kamau',
        clientTitle: 'Project Director, Karen Properties Ltd',
        rating: 5
      }
    }
  ];

  private mockServices: EditableService[] = [
    {
      id: '1',
      title: 'Residential Construction',
      description: 'Complete residential construction services from design to completion',
      category: 'Construction',
      features: ['Architectural Design', 'Construction Management', 'Quality Assurance', 'Project Supervision'],
      pricing: {
        type: 'project-based',
        priceRange: { min: 5000000, max: 50000000 }
      },
      duration: '6-18 months',
      isAvailable: true,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Dynamic Pages Management
  async getPages(): Promise<DynamicPage[]> {
    const cacheKey = 'pages:all';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Mock implementation - in production, this would fetch from API
      this.cache.set(cacheKey, this.mockPages);
      return this.mockPages;
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
      // Mock implementation
      const page = this.mockPages.find(p => p.slug === slug) || null;
      if (page) {
        this.cache.set(cacheKey, page);
      }
      return page;
    } catch (error) {
      console.error('Failed to fetch page:', error);
      return null;
    }
  }

  async createPage(page: Omit<DynamicPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<DynamicPage | null> {
    try {
      // Mock implementation
      const newPage: DynamicPage = {
        ...page,
        id: `page_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.mockPages.push(newPage);
      this.cache.invalidate('pages:');
      return newPage;
    } catch (error) {
      console.error('Failed to create page:', error);
      return null;
    }
  }

  async updatePage(id: string, updates: Partial<DynamicPage>): Promise<DynamicPage | null> {
    try {
      // Mock implementation
      const pageIndex = this.mockPages.findIndex(p => p.id === id);
      if (pageIndex === -1) return null;

      this.mockPages[pageIndex] = {
        ...this.mockPages[pageIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.cache.invalidate('pages:');
      this.cache.invalidate(`page:${this.mockPages[pageIndex].slug}`);
      return this.mockPages[pageIndex];
    } catch (error) {
      console.error('Failed to update page:', error);
      return null;
    }
  }

  // Dynamic Projects Management
  async getPublicProjects(options?: any): Promise<EditableProject[]> {
    try {
      // Mock implementation
      return this.mockProjects.filter(p => p.isPublished);
    } catch (error) {
      console.error('Failed to fetch public projects:', error);
      return [];
    }
  }

  async getAllProjects(): Promise<EditableProject[]> {
    try {
      // Mock implementation
      return this.mockProjects;
    } catch (error) {
      console.error('Failed to fetch all projects:', error);
      return [];
    }
  }

  async createProject(project: Omit<EditableProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<EditableProject | null> {
    try {
      // Mock implementation
      const newProject: EditableProject = {
        ...project,
        id: `project_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.mockProjects.push(newProject);
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      return null;
    }
  }

  async updateProject(id: string, updates: Partial<EditableProject>): Promise<EditableProject | null> {
    try {
      // Mock implementation
      const projectIndex = this.mockProjects.findIndex(p => p.id === id);
      if (projectIndex === -1) return null;

      this.mockProjects[projectIndex] = {
        ...this.mockProjects[projectIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      return this.mockProjects[projectIndex];
    } catch (error) {
      console.error('Failed to update project:', error);
      return null;
    }
  }

  // Dynamic Services Management
  async getPublicServices(options?: any): Promise<EditableService[]> {
    try {
      // Mock implementation
      return this.mockServices.filter(s => s.isPublished && s.isAvailable);
    } catch (error) {
      console.error('Failed to fetch public services:', error);
      return [];
    }
  }

  async getAllServices(): Promise<EditableService[]> {
    try {
      // Mock implementation
      return this.mockServices;
    } catch (error) {
      console.error('Failed to fetch all services:', error);
      return [];
    }
  }

  async createService(service: Omit<EditableService, 'id' | 'createdAt' | 'updatedAt'>): Promise<EditableService | null> {
    try {
      // Mock implementation
      const newService: EditableService = {
        ...service,
        id: `service_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.mockServices.push(newService);
      return newService;
    } catch (error) {
      console.error('Failed to create service:', error);
      return null;
    }
  }

  async updateService(id: string, updates: Partial<EditableService>): Promise<EditableService | null> {
    try {
      // Mock implementation
      const serviceIndex = this.mockServices.findIndex(s => s.id === id);
      if (serviceIndex === -1) return null;

      this.mockServices[serviceIndex] = {
        ...this.mockServices[serviceIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      return this.mockServices[serviceIndex];
    } catch (error) {
      console.error('Failed to update service:', error);
      return null;
    }
  }

  // Content Sections Management
  async getPageContent(pageId: string): Promise<WebsiteContent[]> {
    try {
      // Mock implementation
      const page = this.mockPages.find(p => p.id === pageId);
      return page?.sections || [];
    } catch (error) {
      console.error('Failed to fetch page content:', error);
      return [];
    }
  }

  async updateContent(contentId: string, updates: Partial<WebsiteContent>): Promise<WebsiteContent | null> {
    try {
      // Mock implementation - would update content in database
      console.log(`Updating content ${contentId}:`, updates);
      return null; // Would return updated content
    } catch (error) {
      console.error('Failed to update content:', error);
      return null;
    }
  }

  // Bulk Operations
  async publishMultiple(ids: string[], type: 'page' | 'project' | 'service'): Promise<boolean> {
    try {
      // Mock implementation
      console.log(`Publishing ${type}s:`, ids);
      return true;
    } catch (error) {
      console.error(`Failed to publish ${type}s:`, error);
      return false;
    }
  }

  async unpublishMultiple(ids: string[], type: 'page' | 'project' | 'service'): Promise<boolean> {
    try {
      // Mock implementation
      console.log(`Unpublishing ${type}s:`, ids);
      return true;
    } catch (error) {
      console.error(`Failed to unpublish ${type}s:`, error);
      return false;
    }
  }

  // Search and Analytics
  async searchContent(query: string, type?: 'page' | 'project' | 'service'): Promise<any[]> {
    try {
      // Mock implementation
      const results: any[] = [];
      
      if (!type || type === 'page') {
        results.push(...this.mockPages.filter(p => 
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.content.toLowerCase().includes(query.toLowerCase())
        ));
      }
      
      if (!type || type === 'project') {
        results.push(...this.mockProjects.filter(p => 
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
        ));
      }
      
      if (!type || type === 'service') {
        results.push(...this.mockServices.filter(s => 
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase())
        ));
      }
      
      return results;
    } catch (error) {
      console.error('Failed to search content:', error);
      return [];
    }
  }

  async getContentAnalytics(): Promise<any> {
    try {
      // Mock implementation
      return {
        totalPages: this.mockPages.length,
        publishedPages: this.mockPages.filter(p => p.status === 'published').length,
        totalProjects: this.mockProjects.length,
        publishedProjects: this.mockProjects.filter(p => p.isPublished).length,
        totalServices: this.mockServices.length,
        publishedServices: this.mockServices.filter(s => s.isPublished).length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get content analytics:', error);
      return null;
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

export const contentManager = new ContentManager();

// React hooks for convenience
export const useContent = () => {
  return {
    getPages: () => contentManager.getPages(),
    getPage: (slug: string) => contentManager.getPage(slug),
    getPublicProjects: () => contentManager.getPublicProjects(),
    getPublicServices: () => contentManager.getPublicServices(),
    searchContent: (query: string, type?: 'page' | 'project' | 'service') => 
      contentManager.searchContent(query, type),
  };
};

export default contentManager;