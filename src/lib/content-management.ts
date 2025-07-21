import { query } from './database-client';
import DatabaseClient from './database-client';

export interface ContentSection {
  id?: string;
  page: string;
  section: string;
  title: string;
  content: any;
  media_urls?: string[];
  is_published: boolean;
  sort_order: number;
  metadata?: any;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceContent {
  id?: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  pricing?: {
    basic?: number;
    pro?: number;
    enterprise?: number;
  };
  gallery: string[];
  testimonials: any[];
  is_featured: boolean;
  is_active: boolean;
  category: string;
  tags: string[];
  seo_meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface ProjectShowcase {
  id?: string;
  title: string;
  description: string;
  client_name: string;
  industry: string;
  project_type: string;
  duration: string;
  team_size: number;
  technologies: string[];
  challenges: string[];
  solutions: string[];
  results: string[];
  images: string[];
  video_url?: string;
  case_study_url?: string;
  is_featured: boolean;
  is_active: boolean;
  completion_date: string;
  budget_range?: string;
  testimonial?: {
    quote: string;
    author: string;
    position: string;
    company: string;
    avatar?: string;
  };
}

export class ContentManagementService {
  // Generic content management
  static async createContent(content: ContentSection, userId: string): Promise<any> {
    const result = await query(
      `INSERT INTO content_sections (page, section, title, content, media_urls, is_published, sort_order, metadata, created_by, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *`,
      [
        content.page,
        content.section,
        content.title,
        JSON.stringify(content.content),
        JSON.stringify(content.media_urls || []),
        content.is_published,
        content.sort_order,
        JSON.stringify(content.metadata || {}),
        userId
      ]
    );

    await DatabaseClient.logActivity(userId, 'CREATE', 'content_section', result.rows[0].id, content);
    return result.rows[0];
  }

  static async getContentByPage(page: string, publishedOnly: boolean = true): Promise<ContentSection[]> {
    let whereClause = 'WHERE page = $1';
    const params = [page];

    if (publishedOnly) {
      whereClause += ' AND is_published = true';
    }

    const result = await query(
      `SELECT * FROM content_sections ${whereClause} ORDER BY sort_order ASC, created_at ASC`,
      params
    );

    return result.rows.map(row => ({
      ...row,
      content: JSON.parse(row.content),
      media_urls: JSON.parse(row.media_urls || '[]'),
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  static async updateContent(id: string, updates: Partial<ContentSection>, userId: string): Promise<any> {
    const setClause = Object.keys(updates).map((key, index) => {
      if (key === 'content' || key === 'media_urls' || key === 'metadata') {
        return `${key} = $${index + 2}`;
      }
      return `${key} = $${index + 2}`;
    }).join(', ');

    const values = Object.values(updates).map(value => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });

    const result = await query(
      `UPDATE content_sections SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    await DatabaseClient.logActivity(userId, 'UPDATE', 'content_section', id, updates);
    return result.rows[0];
  }

  static async deleteContent(id: string, userId: string): Promise<void> {
    await query('DELETE FROM content_sections WHERE id = $1', [id]);
    await DatabaseClient.logActivity(userId, 'DELETE', 'content_section', id);
  }

  // Services content management
  static async createService(service: ServiceContent, userId: string): Promise<any> {
    const result = await query(
      `INSERT INTO services_content (title, description, icon, features, pricing, gallery, testimonials, is_featured, is_active, category, tags, seo_meta, created_by, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) RETURNING *`,
      [
        service.title,
        service.description,
        service.icon,
        JSON.stringify(service.features),
        JSON.stringify(service.pricing || {}),
        JSON.stringify(service.gallery),
        JSON.stringify(service.testimonials),
        service.is_featured,
        service.is_active,
        service.category,
        JSON.stringify(service.tags),
        JSON.stringify(service.seo_meta || {}),
        userId
      ]
    );

    await DatabaseClient.logActivity(userId, 'CREATE', 'service', result.rows[0].id, service);
    return result.rows[0];
  }

  static async getServices(activeOnly: boolean = true): Promise<ServiceContent[]> {
    let whereClause = '';
    if (activeOnly) {
      whereClause = 'WHERE is_active = true';
    }

    const result = await query(
      `SELECT * FROM services_content ${whereClause} ORDER BY is_featured DESC, created_at DESC`
    );

    return result.rows.map(row => ({
      ...row,
      features: JSON.parse(row.features),
      pricing: JSON.parse(row.pricing || '{}'),
      gallery: JSON.parse(row.gallery),
      testimonials: JSON.parse(row.testimonials),
      tags: JSON.parse(row.tags),
      seo_meta: JSON.parse(row.seo_meta || '{}')
    }));
  }

  static async updateService(id: string, updates: Partial<ServiceContent>, userId: string): Promise<any> {
    const setClause = Object.keys(updates).map((key, index) => {
      if (['features', 'pricing', 'gallery', 'testimonials', 'tags', 'seo_meta'].includes(key)) {
        return `${key} = $${index + 2}`;
      }
      return `${key} = $${index + 2}`;
    }).join(', ');

    const values = Object.values(updates).map(value => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });

    const result = await query(
      `UPDATE services_content SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    await DatabaseClient.logActivity(userId, 'UPDATE', 'service', id, updates);
    return result.rows[0];
  }

  static async deleteService(id: string, userId: string): Promise<void> {
    await query('DELETE FROM services_content WHERE id = $1', [id]);
    await DatabaseClient.logActivity(userId, 'DELETE', 'service', id);
  }

  // Project showcase management
  static async createProjectShowcase(project: ProjectShowcase, userId: string): Promise<any> {
    const result = await query(
      `INSERT INTO projects_showcase (title, description, client_name, industry, project_type, duration, team_size, technologies, challenges, solutions, results, images, video_url, case_study_url, is_featured, is_active, completion_date, budget_range, testimonial, created_by, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW()) RETURNING *`,
      [
        project.title,
        project.description,
        project.client_name,
        project.industry,
        project.project_type,
        project.duration,
        project.team_size,
        JSON.stringify(project.technologies),
        JSON.stringify(project.challenges),
        JSON.stringify(project.solutions),
        JSON.stringify(project.results),
        JSON.stringify(project.images),
        project.video_url,
        project.case_study_url,
        project.is_featured,
        project.is_active,
        project.completion_date,
        project.budget_range,
        JSON.stringify(project.testimonial || {}),
        userId
      ]
    );

    await DatabaseClient.logActivity(userId, 'CREATE', 'project_showcase', result.rows[0].id, project);
    return result.rows[0];
  }

  static async getProjectShowcases(activeOnly: boolean = true): Promise<ProjectShowcase[]> {
    let whereClause = '';
    if (activeOnly) {
      whereClause = 'WHERE is_active = true';
    }

    const result = await query(
      `SELECT * FROM projects_showcase ${whereClause} ORDER BY is_featured DESC, completion_date DESC`
    );

    return result.rows.map(row => ({
      ...row,
      technologies: JSON.parse(row.technologies),
      challenges: JSON.parse(row.challenges),
      solutions: JSON.parse(row.solutions),
      results: JSON.parse(row.results),
      images: JSON.parse(row.images),
      testimonial: JSON.parse(row.testimonial || '{}')
    }));
  }

  static async updateProjectShowcase(id: string, updates: Partial<ProjectShowcase>, userId: string): Promise<any> {
    const setClause = Object.keys(updates).map((key, index) => {
      if (['technologies', 'challenges', 'solutions', 'results', 'images', 'testimonial'].includes(key)) {
        return `${key} = $${index + 2}`;
      }
      return `${key} = $${index + 2}`;
    }).join(', ');

    const values = Object.values(updates).map(value => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });

    const result = await query(
      `UPDATE projects_showcase SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    await DatabaseClient.logActivity(userId, 'UPDATE', 'project_showcase', id, updates);
    return result.rows[0];
  }

  static async deleteProjectShowcase(id: string, userId: string): Promise<void> {
    await query('DELETE FROM projects_showcase WHERE id = $1', [id]);
    await DatabaseClient.logActivity(userId, 'DELETE', 'project_showcase', id);
  }

  // Media management
  static async uploadMedia(file: File, category: string, userId: string): Promise<any> {
    // This would integrate with your file storage service
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `/uploads/${category}/${fileName}`;
    
    // In production, upload to cloud storage (AWS S3, Google Cloud, etc.)
    const mediaRecord = await query(
      `INSERT INTO media_library (filename, original_name, file_path, file_size, mime_type, category, uploaded_by, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [fileName, file.name, filePath, file.size, file.type, category, userId]
    );

    await DatabaseClient.logActivity(userId, 'UPLOAD', 'media', mediaRecord.rows[0].id, {
      filename: fileName,
      category,
      size: file.size
    });

    return mediaRecord.rows[0];
  }

  static async getMediaLibrary(category?: string): Promise<any[]> {
    let whereClause = '';
    const params = [];

    if (category) {
      whereClause = 'WHERE category = $1';
      params.push(category);
    }

    const result = await query(
      `SELECT * FROM media_library ${whereClause} ORDER BY created_at DESC`,
      params
    );

    return result.rows;
  }

  static async deleteMedia(id: string, userId: string): Promise<void> {
    await query('DELETE FROM media_library WHERE id = $1', [id]);
    await DatabaseClient.logActivity(userId, 'DELETE', 'media', id);
  }

  // SEO management
  static async updateSEOSettings(page: string, seoData: any, userId: string): Promise<any> {
    const result = await query(
      `INSERT INTO seo_settings (page, title, description, keywords, og_title, og_description, og_image, twitter_title, twitter_description, twitter_image, canonical_url, robots, updated_by, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) 
       ON CONFLICT (page) DO UPDATE SET 
       title = $2, description = $3, keywords = $4, og_title = $5, og_description = $6, og_image = $7, 
       twitter_title = $8, twitter_description = $9, twitter_image = $10, canonical_url = $11, robots = $12, 
       updated_by = $13, updated_at = NOW() RETURNING *`,
      [
        page,
        seoData.title,
        seoData.description,
        JSON.stringify(seoData.keywords || []),
        seoData.og_title,
        seoData.og_description,
        seoData.og_image,
        seoData.twitter_title,
        seoData.twitter_description,
        seoData.twitter_image,
        seoData.canonical_url,
        seoData.robots || 'index,follow',
        userId
      ]
    );

    await DatabaseClient.logActivity(userId, 'UPDATE', 'seo_settings', page, seoData);
    return result.rows[0];
  }

  static async getSEOSettings(page: string): Promise<any> {
    const result = await query('SELECT * FROM seo_settings WHERE page = $1', [page]);
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        ...row,
        keywords: JSON.parse(row.keywords || '[]')
      };
    }
    
    return null;
  }

  // Content analytics
  static async getContentAnalytics(page?: string, startDate?: string, endDate?: string): Promise<any> {
    let whereClause = '1=1';
    const params = [];

    if (page) {
      whereClause += ' AND page = $' + (params.length + 1);
      params.push(page);
    }

    if (startDate) {
      whereClause += ' AND created_at >= $' + (params.length + 1);
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND created_at <= $' + (params.length + 1);
      params.push(endDate);
    }

    const result = await query(
      `SELECT 
        page,
        COUNT(*) as total_sections,
        COUNT(CASE WHEN is_published = true THEN 1 END) as published_sections,
        MAX(updated_at) as last_updated
       FROM content_sections 
       WHERE ${whereClause}
       GROUP BY page
       ORDER BY last_updated DESC`,
      params
    );

    return result.rows;
  }

  // Bulk operations
  static async bulkUpdateContentStatus(ids: string[], isPublished: boolean, userId: string): Promise<void> {
    await query(
      `UPDATE content_sections SET is_published = $1, updated_at = NOW() WHERE id = ANY($2)`,
      [isPublished, ids]
    );

    await DatabaseClient.logActivity(userId, 'BULK_UPDATE', 'content_section', 'multiple', {
      ids,
      action: isPublished ? 'publish' : 'unpublish'
    });
  }

  static async duplicateContent(id: string, userId: string): Promise<any> {
    const original = await query('SELECT * FROM content_sections WHERE id = $1', [id]);
    
    if (original.rows.length === 0) {
      throw new Error('Content not found');
    }

    const originalData = original.rows[0];
    const duplicateData = {
      ...originalData,
      title: `${originalData.title} (Copy)`,
      is_published: false,
      sort_order: originalData.sort_order + 1
    };

    delete duplicateData.id;
    delete duplicateData.created_at;
    delete duplicateData.updated_at;

    const result = await query(
      `INSERT INTO content_sections (page, section, title, content, media_urls, is_published, sort_order, metadata, created_by, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *`,
      [
        duplicateData.page,
        duplicateData.section,
        duplicateData.title,
        duplicateData.content,
        duplicateData.media_urls,
        duplicateData.is_published,
        duplicateData.sort_order,
        duplicateData.metadata,
        userId
      ]
    );

    await DatabaseClient.logActivity(userId, 'DUPLICATE', 'content_section', result.rows[0].id, {
      original_id: id
    });

    return result.rows[0];
  }
}

export default ContentManagementService;