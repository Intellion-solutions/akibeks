import { eq, desc, and, or, sql } from 'drizzle-orm';
import { dbClient } from './database';
import {
  seoConfigurations,
  sitemaps,
  seoAnalytics,
  keywordRankings,
  metaRedirects,
  robotsConfig,
  schemaTemplates,
  projects,
  services,
  type SeoConfiguration,
  type NewSeoConfiguration,
  type Sitemap,
  type NewSitemap
} from '../database/schema';

export interface SEOMetaTags {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: Record<string, any>;
  customMeta?: Record<string, string>;
}

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: string[];
  videos?: {
    thumbnailUrl?: string;
    title?: string;
    description?: string;
    duration?: number;
  }[];
  news?: {
    publishDate: string;
    title: string;
    keywords?: string[];
  };
  alternates?: {
    hreflang: string;
    href: string;
  }[];
}

export class SEOService {
  private static instance: SEOService;
  private db = dbClient.db;

  private constructor() {}

  public static getInstance(): SEOService {
    if (!SEOService.instance) {
      SEOService.instance = new SEOService();
    }
    return SEOService.instance;
  }

  // ===========================
  // SEO CONFIGURATION MANAGEMENT
  // ===========================

  async createSEOConfiguration(data: NewSeoConfiguration): Promise<SeoConfiguration> {
    const [config] = await this.db
      .insert(seoConfigurations)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    
    return config;
  }

  async updateSEOConfiguration(id: string, data: Partial<NewSeoConfiguration>): Promise<SeoConfiguration | null> {
    const [config] = await this.db
      .update(seoConfigurations)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(seoConfigurations.id, id))
      .returning();
    
    return config || null;
  }

  async getSEOConfiguration(pageType: string, pageId?: string): Promise<SeoConfiguration | null> {
    const whereCondition = pageId
      ? and(eq(seoConfigurations.pageType, pageType), eq(seoConfigurations.pageId, pageId))
      : eq(seoConfigurations.pageType, pageType);

    const [config] = await this.db
      .select()
      .from(seoConfigurations)
      .where(and(whereCondition, eq(seoConfigurations.isActive, true)))
      .limit(1);
    
    return config || null;
  }

  async getAllSEOConfigurations(): Promise<SeoConfiguration[]> {
    return await this.db
      .select()
      .from(seoConfigurations)
      .where(eq(seoConfigurations.isActive, true))
      .orderBy(desc(seoConfigurations.updatedAt));
  }

  // ===========================
  // META TAGS GENERATION
  // ===========================

  async generateMetaTags(pageType: string, pageId?: string, overrides: Partial<SEOMetaTags> = {}): Promise<SEOMetaTags> {
    // Get SEO configuration
    const config = await this.getSEOConfiguration(pageType, pageId);
    
    // Default Kenya-specific meta tags
    const defaultMeta: SEOMetaTags = {
      title: 'AKIBEKS Engineering Solutions - Expert Construction Services in Kenya',
      description: 'Leading construction and engineering company in Kenya providing quality building, renovation, and infrastructure services across all 47 counties.',
      keywords: ['construction Kenya', 'engineering services', 'building contractors Nairobi', 'renovation Kenya', 'infrastructure development'],
      robots: 'index,follow',
      ogType: 'website',
      ogUrl: process.env.VITE_APP_URL || 'https://akibeks.co.ke',
      twitterCard: 'summary_large_image',
      structuredData: this.generateDefaultStructuredData(),
      customMeta: {
        'geo.region': 'KE',
        'geo.placename': 'Kenya',
        'language': 'en-KE',
        'author': 'AKIBEKS Engineering Solutions',
        'publisher': 'AKIBEKS Engineering Solutions',
        'coverage': 'Kenya',
        'distribution': 'global'
      }
    };

    // Merge configuration and overrides
    const metaTags: SEOMetaTags = {
      ...defaultMeta,
      ...(config && {
        title: config.title,
        description: config.description,
        keywords: config.keywords || defaultMeta.keywords,
        canonical: config.canonicalUrl,
        robots: config.metaRobots || defaultMeta.robots,
        ogTitle: config.ogTitle || config.title,
        ogDescription: config.ogDescription || config.description,
        ogImage: config.ogImage,
        ogType: config.ogType || defaultMeta.ogType,
        twitterCard: config.twitterCard || defaultMeta.twitterCard,
        twitterTitle: config.twitterTitle || config.title,
        twitterDescription: config.twitterDescription || config.description,
        twitterImage: config.twitterImage || config.ogImage,
        structuredData: { ...defaultMeta.structuredData, ...config.structuredData },
        customMeta: { ...defaultMeta.customMeta, ...config.customMeta }
      }),
      ...overrides
    };

    return metaTags;
  }

  private generateDefaultStructuredData(): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'AKIBEKS Engineering Solutions',
      url: process.env.VITE_APP_URL || 'https://akibeks.co.ke',
      logo: `${process.env.VITE_APP_URL || 'https://akibeks.co.ke'}/logo.png`,
      description: 'Leading construction and engineering company in Kenya',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KE',
        addressRegion: 'Nairobi',
        addressLocality: 'Nairobi',
        postalCode: '00100'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+254-700-000-000',
        contactType: 'customer service',
        areaServed: 'KE',
        availableLanguage: ['en', 'sw']
      },
      sameAs: [
        'https://facebook.com/akibeksengineering',
        'https://twitter.com/akibekseng',
        'https://linkedin.com/company/akibeks',
        'https://instagram.com/akibekseng'
      ],
      foundingDate: '2020',
      founders: [
        {
          '@type': 'Person',
          name: 'AKIBEKS Founder'
        }
      ],
      areaServed: {
        '@type': 'Country',
        name: 'Kenya'
      },
      serviceArea: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: -1.286389,
          longitude: 36.817223
        },
        geoRadius: '500000' // 500km radius from Nairobi
      }
    };
  }

  // ===========================
  // SITEMAP MANAGEMENT
  // ===========================

  async generateSitemap(type: 'main' | 'services' | 'projects' | 'news' | 'images' | 'videos' = 'main'): Promise<string> {
    const entries = await this.getSitemapEntries(type);
    
    switch (type) {
      case 'main':
        return this.generateMainSitemap(entries);
      case 'images':
        return this.generateImageSitemap(entries);
      case 'videos':
        return this.generateVideoSitemap(entries);
      case 'news':
        return this.generateNewsSitemap(entries);
      default:
        return this.generateStandardSitemap(entries);
    }
  }

  private async getSitemapEntries(type: string): Promise<SitemapEntry[]> {
    const baseUrl = process.env.VITE_APP_URL || 'https://akibeks.co.ke';
    const entries: SitemapEntry[] = [];

    if (type === 'main') {
      // Static pages
      entries.push(
        {
          url: baseUrl,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 1.0
        },
        {
          url: `${baseUrl}/about`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8
        },
        {
          url: `${baseUrl}/services`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9
        },
        {
          url: `${baseUrl}/projects`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9
        },
        {
          url: `${baseUrl}/contact`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7
        }
      );
    }

    if (type === 'main' || type === 'services') {
      // Dynamic service pages
      const servicesList = await this.db
        .select({
          id: services.id,
          title: services.title,
          updatedAt: services.updatedAt,
          imageUrl: services.imageUrl,
          images: services.images
        })
        .from(services)
        .where(eq(services.active, true));

      for (const service of servicesList) {
        entries.push({
          url: `${baseUrl}/services/${service.id}`,
          lastModified: service.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.7,
          images: [service.imageUrl, ...(service.images || [])].filter(Boolean) as string[]
        });
      }
    }

    if (type === 'main' || type === 'projects') {
      // Dynamic project pages
      const projectsList = await this.db
        .select({
          id: projects.id,
          title: projects.title,
          updatedAt: projects.updatedAt,
          imageUrl: projects.imageUrl,
          images: projects.images
        })
        .from(projects)
        .where(eq(projects.isActive, true));

      for (const project of projectsList) {
        entries.push({
          url: `${baseUrl}/projects/${project.id}`,
          lastModified: project.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
          images: [project.imageUrl, ...(project.images || [])].filter(Boolean) as string[]
        });
      }
    }

    return entries;
  }

  private generateMainSitemap(entries: SitemapEntry[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const entry of entries) {
      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXml(entry.url)}</loc>\n`;
      xml += `    <lastmod>${entry.lastModified.toISOString().split('T')[0]}</lastmod>\n`;
      if (entry.changeFrequency) {
        xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
      }
      if (entry.priority !== undefined) {
        xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      }
      xml += '  </url>\n';
    }

    xml += '</urlset>';
    return xml;
  }

  private generateImageSitemap(entries: SitemapEntry[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    for (const entry of entries) {
      if (entry.images && entry.images.length > 0) {
        xml += '  <url>\n';
        xml += `    <loc>${this.escapeXml(entry.url)}</loc>\n`;
        
        for (const image of entry.images) {
          xml += '    <image:image>\n';
          xml += `      <image:loc>${this.escapeXml(image)}</image:loc>\n`;
          xml += '    </image:image>\n';
        }
        
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';
    return xml;
  }

  private generateVideoSitemap(entries: SitemapEntry[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';

    for (const entry of entries) {
      if (entry.videos && entry.videos.length > 0) {
        xml += '  <url>\n';
        xml += `    <loc>${this.escapeXml(entry.url)}</loc>\n`;
        
        for (const video of entry.videos) {
          xml += '    <video:video>\n';
          if (video.thumbnailUrl) {
            xml += `      <video:thumbnail_loc>${this.escapeXml(video.thumbnailUrl)}</video:thumbnail_loc>\n`;
          }
          if (video.title) {
            xml += `      <video:title>${this.escapeXml(video.title)}</video:title>\n`;
          }
          if (video.description) {
            xml += `      <video:description>${this.escapeXml(video.description)}</video:description>\n`;
          }
          if (video.duration) {
            xml += `      <video:duration>${video.duration}</video:duration>\n`;
          }
          xml += '    </video:video>\n';
        }
        
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';
    return xml;
  }

  private generateNewsSitemap(entries: SitemapEntry[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

    for (const entry of entries) {
      if (entry.news) {
        xml += '  <url>\n';
        xml += `    <loc>${this.escapeXml(entry.url)}</loc>\n`;
        xml += '    <news:news>\n';
        xml += '      <news:publication>\n';
        xml += '        <news:name>AKIBEKS Engineering Solutions</news:name>\n';
        xml += '        <news:language>en</news:language>\n';
        xml += '      </news:publication>\n';
        xml += '      <news:publication_date>' + entry.news.publishDate + '</news:publication_date>\n';
        xml += `      <news:title>${this.escapeXml(entry.news.title)}</news:title>\n`;
        if (entry.news.keywords && entry.news.keywords.length > 0) {
          xml += `      <news:keywords>${this.escapeXml(entry.news.keywords.join(', '))}</news:keywords>\n`;
        }
        xml += '    </news:news>\n';
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';
    return xml;
  }

  private generateStandardSitemap(entries: SitemapEntry[]): string {
    return this.generateMainSitemap(entries);
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // ===========================
  // ROBOTS.TXT GENERATION
  // ===========================

  async generateRobotsTxt(): Promise<string> {
    const configs = await this.db
      .select()
      .from(robotsConfig)
      .where(eq(robotsConfig.isActive, true))
      .orderBy(robotsConfig.priority);

    const baseUrl = process.env.VITE_APP_URL || 'https://akibeks.co.ke';
    let robotsTxt = '# Robots.txt for AKIBEKS Engineering Solutions\n';
    robotsTxt += '# Generated automatically\n\n';

    // Group by user agent
    const userAgents: Record<string, string[]> = {};
    
    for (const config of configs) {
      if (!userAgents[config.userAgent]) {
        userAgents[config.userAgent] = [];
      }
      
      if (config.directive === 'sitemap') {
        // Handle sitemap separately
        continue;
      }
      
      const line = `${config.directive.charAt(0).toUpperCase() + config.directive.slice(1)}: ${config.value}`;
      userAgents[config.userAgent].push(line);
    }

    // Write user agent sections
    for (const [userAgent, directives] of Object.entries(userAgents)) {
      robotsTxt += `User-agent: ${userAgent}\n`;
      for (const directive of directives) {
        robotsTxt += `${directive}\n`;
      }
      robotsTxt += '\n';
    }

    // Add sitemaps
    robotsTxt += `Sitemap: ${baseUrl}/sitemap.xml\n`;
    robotsTxt += `Sitemap: ${baseUrl}/sitemap-services.xml\n`;
    robotsTxt += `Sitemap: ${baseUrl}/sitemap-projects.xml\n`;
    robotsTxt += `Sitemap: ${baseUrl}/sitemap-images.xml\n`;

    return robotsTxt;
  }

  // ===========================
  // STRUCTURED DATA MANAGEMENT
  // ===========================

  async generateStructuredData(pageType: string, pageId?: string, data?: any): Promise<Record<string, any>[]> {
    const schemas: Record<string, any>[] = [];

    // Always include organization schema
    schemas.push(this.generateDefaultStructuredData());

    // Add page-specific schemas
    switch (pageType) {
      case 'home':
        schemas.push(this.generateLocalBusinessSchema());
        schemas.push(this.generateBreadcrumbSchema([{ name: 'Home', url: '/' }]));
        break;
      
      case 'service':
        if (data) {
          schemas.push(this.generateServiceSchema(data));
          schemas.push(this.generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Services', url: '/services' },
            { name: data.title, url: `/services/${data.id}` }
          ]));
        }
        break;
      
      case 'project':
        if (data) {
          schemas.push(this.generateProjectSchema(data));
          schemas.push(this.generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Projects', url: '/projects' },
            { name: data.title, url: `/projects/${data.id}` }
          ]));
        }
        break;
      
      case 'contact':
        schemas.push(this.generateContactPageSchema());
        schemas.push(this.generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' }
        ]));
        break;
    }

    return schemas;
  }

  private generateLocalBusinessSchema(): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${process.env.VITE_APP_URL || 'https://akibeks.co.ke'}/#LocalBusiness`,
      name: 'AKIBEKS Engineering Solutions',
      image: `${process.env.VITE_APP_URL || 'https://akibeks.co.ke'}/logo.png`,
      telephone: '+254-700-000-000',
      email: 'info@akibeks.co.ke',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Nairobi CBD',
        addressLocality: 'Nairobi',
        addressRegion: 'Nairobi County',
        postalCode: '00100',
        addressCountry: 'KE'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -1.286389,
        longitude: 36.817223
      },
      url: process.env.VITE_APP_URL || 'https://akibeks.co.ke',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '17:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '13:00'
        }
      ],
      priceRange: '$$',
      servesCuisine: 'Construction Services',
      areaServed: 'Kenya'
    };
  }

  private generateServiceSchema(service: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${process.env.VITE_APP_URL || 'https://akibeks.co.ke'}/services/${service.id}#Service`,
      name: service.title,
      description: service.description,
      provider: {
        '@type': 'Organization',
        name: 'AKIBEKS Engineering Solutions',
        url: process.env.VITE_APP_URL || 'https://akibeks.co.ke'
      },
      areaServed: 'Kenya',
      serviceType: service.category || 'Construction Service',
      image: service.imageUrl
    };
  }

  private generateProjectSchema(project: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Project',
      '@id': `${process.env.VITE_APP_URL || 'https://akibeks.co.ke'}/projects/${project.id}#Project`,
      name: project.title,
      description: project.description,
      image: project.imageUrl,
      location: project.location,
      startDate: project.startDate,
      endDate: project.endDate,
      creator: {
        '@type': 'Organization',
        name: 'AKIBEKS Engineering Solutions'
      }
    };
  }

  private generateBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]): Record<string, any> {
    const baseUrl = process.env.VITE_APP_URL || 'https://akibeks.co.ke';
    
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.name,
        item: `${baseUrl}${breadcrumb.url}`
      }))
    };
  }

  private generateContactPageSchema(): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': `${process.env.VITE_APP_URL || 'https://akibeks.co.ke'}/contact#ContactPage`,
      name: 'Contact AKIBEKS Engineering Solutions',
      description: 'Contact AKIBEKS Engineering Solutions for construction and engineering services in Kenya',
      mainEntity: {
        '@type': 'Organization',
        name: 'AKIBEKS Engineering Solutions',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+254-700-000-000',
          contactType: 'customer service',
          email: 'info@akibeks.co.ke'
        }
      }
    };
  }

  // ===========================
  // SEO ANALYSIS
  // ===========================

  async analyzePage(url: string, content: string): Promise<{
    score: number;
    issues: Array<{ type: 'error' | 'warning' | 'info'; message: string }>;
    recommendations: string[];
  }> {
    const issues: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = [];
    const recommendations: string[] = [];
    let score = 100;

    // Title analysis
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) {
      issues.push({ type: 'error', message: 'Missing title tag' });
      score -= 20;
    } else {
      const title = titleMatch[1];
      if (title.length < 30) {
        issues.push({ type: 'warning', message: 'Title is too short (< 30 characters)' });
        score -= 5;
      }
      if (title.length > 60) {
        issues.push({ type: 'warning', message: 'Title is too long (> 60 characters)' });
        score -= 5;
      }
      if (!title.toLowerCase().includes('kenya')) {
        recommendations.push('Consider including "Kenya" in the title for local SEO');
      }
    }

    // Meta description analysis
    const metaDescMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (!metaDescMatch) {
      issues.push({ type: 'error', message: 'Missing meta description' });
      score -= 15;
    } else {
      const description = metaDescMatch[1];
      if (description.length < 120) {
        issues.push({ type: 'warning', message: 'Meta description is too short (< 120 characters)' });
        score -= 3;
      }
      if (description.length > 160) {
        issues.push({ type: 'warning', message: 'Meta description is too long (> 160 characters)' });
        score -= 3;
      }
    }

    // H1 tag analysis
    const h1Matches = content.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
    if (!h1Matches || h1Matches.length === 0) {
      issues.push({ type: 'error', message: 'Missing H1 tag' });
      score -= 10;
    } else if (h1Matches.length > 1) {
      issues.push({ type: 'warning', message: 'Multiple H1 tags found' });
      score -= 5;
    }

    // Image alt text analysis
    const imgMatches = content.match(/<img[^>]+>/gi);
    if (imgMatches) {
      const imagesWithoutAlt = imgMatches.filter(img => !img.includes('alt='));
      if (imagesWithoutAlt.length > 0) {
        issues.push({ 
          type: 'warning', 
          message: `${imagesWithoutAlt.length} images missing alt text` 
        });
        score -= Math.min(imagesWithoutAlt.length * 2, 10);
      }
    }

    // Internal links analysis
    const internalLinks = (content.match(/href="\/[^"]*"/g) || []).length;
    if (internalLinks < 3) {
      recommendations.push('Add more internal links to improve site navigation and SEO');
    }

    // Kenya-specific SEO checks
    const hasKenyaKeywords = /kenya|nairobi|mombasa|kisumu|nakuru|eldoret/i.test(content);
    if (!hasKenyaKeywords) {
      recommendations.push('Include Kenya-specific keywords and location terms');
    }

    // Structured data check
    const hasStructuredData = content.includes('application/ld+json');
    if (!hasStructuredData) {
      issues.push({ type: 'warning', message: 'No structured data found' });
      score -= 5;
      recommendations.push('Add structured data markup for better search engine understanding');
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }
}

export const seoService = SEOService.getInstance();