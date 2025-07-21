import { supabase } from "@/lib/db-client";

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{
    url: string;
    caption?: string;
    geoLocation?: string;
    title?: string;
    license?: string;
  }>;
  videos?: Array<{
    thumbnailUrl: string;
    title: string;
    description: string;
    contentUrl: string;
    duration?: number;
    expirationDate?: string;
    rating?: number;
    viewCount?: number;
    publicationDate?: string;
    familyFriendly?: boolean;
    tags?: string[];
  }>;
  news?: {
    publication: {
      name: string;
      language: string;
    };
    publishDate: string;
    title: string;
    keywords?: string;
    genres?: string;
  };
  alternateLanguages?: Array<{
    hreflang: string;
    href: string;
  }>;
}

export interface SitemapIndex {
  url: string;
  lastModified: string;
}

export class SitemapGenerator {
  private static instance: SitemapGenerator;
  private baseUrl: string;
  private staticRoutes: string[] = [
    '/',
    '/about',
    '/services',
    '/projects',
    '/portfolio',
    '/contact',
    '/quote',
    '/blog',
    '/careers',
    '/team',
    '/testimonials',
    '/faq',
    '/gallery',
    '/resources',
    '/news',
    '/case-studies',
    '/industries',
    '/features',
    '/pricing',
    '/solutions',
    '/book-visit',
    '/privacy',
    '/terms',
    '/submit-testimonial'
  ];

  constructor(baseUrl: string = 'https://akibeks.co.ke') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  static getInstance(baseUrl?: string): SitemapGenerator {
    if (!SitemapGenerator.instance) {
      SitemapGenerator.instance = new SitemapGenerator(baseUrl);
    }
    return SitemapGenerator.instance;
  }

  async generateMainSitemap(): Promise<string> {
    const entries = await this.getAllSitemapEntries();
    return this.generateXMLSitemap(entries);
  }

  async generateSitemapIndex(): Promise<string> {
    const sitemaps: SitemapIndex[] = [
      {
        url: `${this.baseUrl}/sitemap-main.xml`,
        lastModified: new Date().toISOString()
      },
      {
        url: `${this.baseUrl}/sitemap-blog.xml`,
        lastModified: await this.getLastModifiedDate('blog_posts') || new Date().toISOString()
      },
      {
        url: `${this.baseUrl}/sitemap-services.xml`,
        lastModified: await this.getLastModifiedDate('services') || new Date().toISOString()
      },
      {
        url: `${this.baseUrl}/sitemap-projects.xml`,
        lastModified: await this.getLastModifiedDate('projects') || new Date().toISOString()
      },
      {
        url: `${this.baseUrl}/sitemap-news.xml`,
        lastModified: await this.getLastModifiedDate('news_articles') || new Date().toISOString()
      }
    ];

    return this.generateSitemapIndexXML(sitemaps);
  }

  async generateBlogSitemap(): Promise<string> {
    const blogEntries = await this.getBlogEntries();
    return this.generateXMLSitemap(blogEntries);
  }

  async generateServicesSitemap(): Promise<string> {
    const serviceEntries = await this.getServiceEntries();
    return this.generateXMLSitemap(serviceEntries);
  }

  async generateProjectsSitemap(): Promise<string> {
    const projectEntries = await this.getProjectEntries();
    return this.generateXMLSitemap(projectEntries);
  }

  async generateNewsSitemap(): Promise<string> {
    const newsEntries = await this.getNewsEntries();
    return this.generateNewsXML(newsEntries);
  }

  private async getAllSitemapEntries(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = [];

    // Add static routes
    for (const route of this.staticRoutes) {
      entries.push({
        url: `${this.baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: this.getChangeFrequency(route),
        priority: this.getPriority(route)
      });
    }

    // Add dynamic routes
    const [blogEntries, serviceEntries, projectEntries, careerEntries] = await Promise.all([
      this.getBlogEntries(),
      this.getServiceEntries(),
      this.getProjectEntries(),
      this.getCareerEntries()
    ]);

    entries.push(...blogEntries, ...serviceEntries, ...projectEntries, ...careerEntries);

    return entries;
  }

  private async getBlogEntries(): Promise<SitemapEntry[]> {
    try {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('slug, updated_at, title, featured_image, tags')
        .eq('status', 'published');

      if (error || !posts) return [];

      return posts.map(post => ({
        url: `${this.baseUrl}/blog/${post.slug}`,
        lastModified: post.updated_at,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        images: post.featured_image ? [{
          url: post.featured_image,
          title: post.title
        }] : undefined
      }));
    } catch (error) {
      console.error('Error fetching blog entries:', error);
      return [];
    }
  }

  private async getServiceEntries(): Promise<SitemapEntry[]> {
    try {
      const { data: services, error } = await supabase
        .from('services')
        .select('id, updated_at, title, image_url, description')
        .eq('status', 'active');

      if (error || !services) return [];

      return services.map(service => ({
        url: `${this.baseUrl}/services/${service.id}`,
        lastModified: service.updated_at,
        changeFrequency: 'monthly' as const,
        priority: 0.9,
        images: service.image_url ? [{
          url: service.image_url,
          title: service.title,
          caption: service.description
        }] : undefined
      }));
    } catch (error) {
      console.error('Error fetching service entries:', error);
      return [];
    }
  }

  private async getProjectEntries(): Promise<SitemapEntry[]> {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, updated_at, title, featured_image, gallery_images')
        .eq('status', 'completed');

      if (error || !projects) return [];

      return projects.map(project => {
        const images: Array<{ url: string; title: string }> = [];
        
        if (project.featured_image) {
          images.push({
            url: project.featured_image,
            title: project.title
          });
        }
        
        if (project.gallery_images && Array.isArray(project.gallery_images)) {
          project.gallery_images.forEach((img: string, index: number) => {
            images.push({
              url: img,
              title: `${project.title} - Image ${index + 1}`
            });
          });
        }

        return {
          url: `${this.baseUrl}/projects/${project.id}`,
          lastModified: project.updated_at,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
          images: images.length > 0 ? images : undefined
        };
      });
    } catch (error) {
      console.error('Error fetching project entries:', error);
      return [];
    }
  }

  private async getCareerEntries(): Promise<SitemapEntry[]> {
    try {
      const { data: careers, error } = await supabase
        .from('careers')
        .select('id, updated_at')
        .eq('status', 'active');

      if (error || !careers) return [];

      return careers.map(career => ({
        url: `${this.baseUrl}/careers/${career.id}`,
        lastModified: career.updated_at,
        changeFrequency: 'weekly' as const,
        priority: 0.6
      }));
    } catch (error) {
      console.error('Error fetching career entries:', error);
      return [];
    }
  }

  private async getNewsEntries(): Promise<SitemapEntry[]> {
    try {
      const { data: news, error } = await supabase
        .from('news_articles')
        .select('slug, updated_at, title, featured_image, published_at, tags')
        .eq('status', 'published');

      if (error || !news) return [];

      return news.map(article => ({
        url: `${this.baseUrl}/news/${article.slug}`,
        lastModified: article.updated_at,
        changeFrequency: 'daily' as const,
        priority: 0.7,
        images: article.featured_image ? [{
          url: article.featured_image,
          title: article.title
        }] : undefined,
        news: {
          publication: {
            name: 'AKIBEKS Engineering Solutions',
            language: 'en'
          },
          publishDate: article.published_at,
          title: article.title,
          keywords: Array.isArray(article.tags) ? article.tags.join(', ') : undefined
        }
      }));
    } catch (error) {
      console.error('Error fetching news entries:', error);
      return [];
    }
  }

  private getChangeFrequency(route: string): SitemapEntry['changeFrequency'] {
    const frequencyMap: Record<string, SitemapEntry['changeFrequency']> = {
      '/': 'daily',
      '/news': 'daily',
      '/blog': 'daily',
      '/careers': 'weekly',
      '/testimonials': 'weekly',
      '/projects': 'monthly',
      '/services': 'monthly',
      '/about': 'monthly',
      '/team': 'monthly',
      '/contact': 'yearly',
      '/privacy': 'yearly',
      '/terms': 'yearly'
    };

    return frequencyMap[route] || 'monthly';
  }

  private getPriority(route: string): number {
    const priorityMap: Record<string, number> = {
      '/': 1.0,
      '/services': 0.9,
      '/projects': 0.9,
      '/about': 0.8,
      '/contact': 0.8,
      '/blog': 0.7,
      '/news': 0.7,
      '/careers': 0.6,
      '/testimonials': 0.6,
      '/team': 0.5,
      '/faq': 0.5,
      '/gallery': 0.5,
      '/privacy': 0.3,
      '/terms': 0.3
    };

    return priorityMap[route] || 0.5;
  }

  private async getLastModifiedDate(table: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      return data?.updated_at || null;
    } catch (error) {
      console.error(`Error fetching last modified date for ${table}:`, error);
      return null;
    }
  }

  private generateXMLSitemap(entries: SitemapEntry[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
    xml += '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"\n';
    xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
    xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    for (const entry of entries) {
      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXML(entry.url)}</loc>\n`;
      
      if (entry.lastModified) {
        xml += `    <lastmod>${entry.lastModified.split('T')[0]}</lastmod>\n`;
      }
      
      if (entry.changeFrequency) {
        xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
      }
      
      if (entry.priority !== undefined) {
        xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      }

      // Add alternate language links
      if (entry.alternateLanguages) {
        for (const alt of entry.alternateLanguages) {
          xml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${this.escapeXML(alt.href)}" />\n`;
        }
      }

      // Add image information
      if (entry.images) {
        for (const image of entry.images) {
          xml += '    <image:image>\n';
          xml += `      <image:loc>${this.escapeXML(image.url)}</image:loc>\n`;
          if (image.caption) {
            xml += `      <image:caption>${this.escapeXML(image.caption)}</image:caption>\n`;
          }
          if (image.title) {
            xml += `      <image:title>${this.escapeXML(image.title)}</image:title>\n`;
          }
          if (image.geoLocation) {
            xml += `      <image:geo_location>${this.escapeXML(image.geoLocation)}</image:geo_location>\n`;
          }
          if (image.license) {
            xml += `      <image:license>${this.escapeXML(image.license)}</image:license>\n`;
          }
          xml += '    </image:image>\n';
        }
      }

      // Add video information
      if (entry.videos) {
        for (const video of entry.videos) {
          xml += '    <video:video>\n';
          xml += `      <video:thumbnail_loc>${this.escapeXML(video.thumbnailUrl)}</video:thumbnail_loc>\n`;
          xml += `      <video:title>${this.escapeXML(video.title)}</video:title>\n`;
          xml += `      <video:description>${this.escapeXML(video.description)}</video:description>\n`;
          xml += `      <video:content_loc>${this.escapeXML(video.contentUrl)}</video:content_loc>\n`;
          
          if (video.duration) {
            xml += `      <video:duration>${video.duration}</video:duration>\n`;
          }
          if (video.expirationDate) {
            xml += `      <video:expiration_date>${video.expirationDate}</video:expiration_date>\n`;
          }
          if (video.rating) {
            xml += `      <video:rating>${video.rating}</video:rating>\n`;
          }
          if (video.viewCount) {
            xml += `      <video:view_count>${video.viewCount}</video:view_count>\n`;
          }
          if (video.publicationDate) {
            xml += `      <video:publication_date>${video.publicationDate}</video:publication_date>\n`;
          }
          if (video.familyFriendly !== undefined) {
            xml += `      <video:family_friendly>${video.familyFriendly ? 'yes' : 'no'}</video:family_friendly>\n`;
          }
          if (video.tags) {
            for (const tag of video.tags) {
              xml += `      <video:tag>${this.escapeXML(tag)}</video:tag>\n`;
            }
          }
          xml += '    </video:video>\n';
        }
      }

      xml += '  </url>\n';
    }

    xml += '</urlset>';
    return xml;
  }

  private generateNewsXML(entries: SitemapEntry[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

    for (const entry of entries) {
      if (!entry.news) continue;

      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXML(entry.url)}</loc>\n`;
      xml += '    <news:news>\n';
      xml += '      <news:publication>\n';
      xml += `        <news:name>${this.escapeXML(entry.news.publication.name)}</news:name>\n`;
      xml += `        <news:language>${entry.news.publication.language}</news:language>\n`;
      xml += '      </news:publication>\n';
      xml += `      <news:publication_date>${entry.news.publishDate}</news:publication_date>\n`;
      xml += `      <news:title>${this.escapeXML(entry.news.title)}</news:title>\n`;
      
      if (entry.news.keywords) {
        xml += `      <news:keywords>${this.escapeXML(entry.news.keywords)}</news:keywords>\n`;
      }
      if (entry.news.genres) {
        xml += `      <news:genres>${this.escapeXML(entry.news.genres)}</news:genres>\n`;
      }
      
      xml += '    </news:news>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';
    return xml;
  }

  private generateSitemapIndexXML(sitemaps: SitemapIndex[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const sitemap of sitemaps) {
      xml += '  <sitemap>\n';
      xml += `    <loc>${this.escapeXML(sitemap.url)}</loc>\n`;
      xml += `    <lastmod>${sitemap.lastModified.split('T')[0]}</lastmod>\n`;
      xml += '  </sitemap>\n';
    }

    xml += '</sitemapindex>';
    return xml;
  }

  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Generate robots.txt
  generateRobotsTxt(): string {
    let robots = 'User-agent: *\n';
    robots += 'Allow: /\n';
    robots += 'Disallow: /admin/\n';
    robots += 'Disallow: /client/\n';
    robots += 'Disallow: /api/\n';
    robots += 'Disallow: /*.pdf\n';
    robots += 'Disallow: /private/\n';
    robots += '\n';
    robots += `Sitemap: ${this.baseUrl}/sitemap.xml\n`;
    robots += `Sitemap: ${this.baseUrl}/sitemap-news.xml\n`;
    robots += '\n';
    robots += '# Crawl-delay for respectful crawling\n';
    robots += 'Crawl-delay: 10\n';
    robots += '\n';
    robots += '# Block specific bots if needed\n';
    robots += 'User-agent: BadBot\n';
    robots += 'Disallow: /\n';

    return robots;
  }

  // Save sitemaps to database for caching
  async saveSitemapToDatabase(type: string, content: string): Promise<void> {
    try {
      await supabase.from('sitemaps').upsert({
        type,
        content,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
    } catch (error) {
      console.error('Error saving sitemap to database:', error);
    }
  }

  // Load cached sitemap from database
  async loadSitemapFromDatabase(type: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('sitemaps')
        .select('content, expires_at')
        .eq('type', type)
        .single();

      if (error || !data) return null;

      // Check if sitemap is still valid
      if (new Date(data.expires_at) < new Date()) {
        return null; // Expired
      }

      return data.content;
    } catch (error) {
      console.error('Error loading sitemap from database:', error);
      return null;
    }
  }
}

export const sitemapGenerator = SitemapGenerator.getInstance();