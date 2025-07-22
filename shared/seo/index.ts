// SEO Configuration and Utilities for AKIBEKS Engineering Solutions
import type { 
  SEOConfig, 
  StructuredData, 
  OpenGraphData, 
  TwitterCardData,
  SEOMetrics,
  SEOAudit 
} from '../types/seo';

// Core SEO Configuration
export const SEO_CONFIG: SEOConfig = {
  siteName: 'AKIBEKS Engineering Solutions',
  siteUrl: 'https://akibeks.co.ke',
  defaultTitle: 'AKIBEKS Engineering Solutions - Premier Engineering Services in Kenya',
  titleTemplate: '%s | AKIBEKS Engineering Solutions',
  defaultDescription: 'Leading engineering consultancy in Kenya providing architectural design, structural engineering, MEP systems, and project management services. ISO certified with 15+ years experience.',
  defaultKeywords: [
    'engineering services kenya',
    'architectural design nairobi',
    'structural engineering',
    'MEP systems design',
    'construction project management',
    'building design kenya',
    'civil engineering consultancy',
    'sustainable building design',
    'LEED certification kenya',
    'infrastructure development'
  ],
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@AkibeksKE',
  facebookPage: 'AkibeksEngineering',
  linkedinPage: 'akibeks-engineering-solutions',
  locale: 'en_KE',
  alternateLocales: ['en_US', 'sw_KE'],
  themeColor: '#2563EB',
  backgroundColor: '#FFFFFF'
};

// Advanced Structured Data Templates
export const STRUCTURED_DATA_TEMPLATES = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AKIBEKS Engineering Solutions',
    url: 'https://akibeks.co.ke',
    logo: 'https://akibeks.co.ke/images/logo.png',
    description: 'Premier engineering consultancy in Kenya providing comprehensive engineering services',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Westlands Business Centre, Waiyaki Way',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
      postalCode: '00100'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-700-123-456',
      contactType: 'customer service',
      email: 'info@akibeks.co.ke',
      availableLanguage: ['English', 'Swahili']
    },
    sameAs: [
      'https://twitter.com/AkibeksKE',
      'https://facebook.com/AkibeksEngineering',
      'https://linkedin.com/company/akibeks-engineering-solutions'
    ],
    foundingDate: '2008',
    numberOfEmployees: '50-100',
    slogan: 'Engineering Excellence, Building Tomorrow'
  },

  service: (service: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'AKIBEKS Engineering Solutions'
    },
    areaServed: {
      '@type': 'Country',
      name: 'Kenya'
    },
    serviceType: service.category,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceRange: service.priceRange || '$$-$$$',
      priceCurrency: 'KES'
    }
  }),

  project: (project: any) => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    creator: {
      '@type': 'Organization',
      name: 'AKIBEKS Engineering Solutions'
    },
    dateCreated: project.startDate,
    dateModified: project.updatedAt,
    locationCreated: {
      '@type': 'Place',
      name: project.location
    },
    workExample: {
      '@type': 'CreativeWork',
      name: project.title,
      description: project.description
    }
  }),

  breadcrumb: (items: Array<{name: string, url: string}>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SEO_CONFIG.siteUrl}${item.url}`
    }))
  }),

  faq: (faqs: Array<{question: string, answer: string}>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }),

  localBusiness: {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'AKIBEKS Engineering Solutions',
    image: 'https://akibeks.co.ke/images/logo.png',
    url: 'https://akibeks.co.ke',
    telephone: '+254-700-123-456',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Westlands Business Centre, Waiyaki Way',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi County',
      postalCode: '00100',
      addressCountry: 'KE'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.2632,
      longitude: 36.7967
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00'
      }
    ],
    priceRange: '$$-$$$',
    currenciesAccepted: 'KES, USD',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer'
  }
};

// SEO Utility Functions
export class SEOManager {
  static generateTitle(pageTitle?: string): string {
    if (!pageTitle) return SEO_CONFIG.defaultTitle;
    return SEO_CONFIG.titleTemplate.replace('%s', pageTitle);
  }

  static generateDescription(pageDescription?: string): string {
    return pageDescription || SEO_CONFIG.defaultDescription;
  }

  static generateKeywords(pageKeywords?: string[]): string {
    const keywords = [...SEO_CONFIG.defaultKeywords];
    if (pageKeywords) {
      keywords.unshift(...pageKeywords);
    }
    return [...new Set(keywords)].join(', ');
  }

  static generateCanonicalUrl(path: string): string {
    return `${SEO_CONFIG.siteUrl}${path}`;
  }

  static generateOpenGraph(data: Partial<OpenGraphData>): OpenGraphData {
    return {
      title: data.title || SEO_CONFIG.defaultTitle,
      description: data.description || SEO_CONFIG.defaultDescription,
      image: data.image || SEO_CONFIG.defaultImage,
      url: data.url || SEO_CONFIG.siteUrl,
      type: data.type || 'website',
      siteName: SEO_CONFIG.siteName,
      locale: data.locale || SEO_CONFIG.locale
    };
  }

  static generateTwitterCard(data: Partial<TwitterCardData>): TwitterCardData {
    return {
      card: data.card || 'summary_large_image',
      site: SEO_CONFIG.twitterHandle,
      creator: data.creator || SEO_CONFIG.twitterHandle,
      title: data.title || SEO_CONFIG.defaultTitle,
      description: data.description || SEO_CONFIG.defaultDescription,
      image: data.image || SEO_CONFIG.defaultImage
    };
  }

  static generateStructuredData(type: keyof typeof STRUCTURED_DATA_TEMPLATES, data?: any): string {
    const template = STRUCTURED_DATA_TEMPLATES[type];
    if (typeof template === 'function') {
      return JSON.stringify(template(data), null, 2);
    }
    return JSON.stringify(template, null, 2);
  }

  static generateRobotsTxt(): string {
    return `# Robots.txt for AKIBEKS Engineering Solutions
User-agent: *
Allow: /

# Sitemap
Sitemap: ${SEO_CONFIG.siteUrl}/sitemap.xml

# Specific crawl delays for different bots
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

# Block admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*ref=*

# Allow important pages
Allow: /portfolio/
Allow: /services/
Allow: /about/
Allow: /contact/
Allow: /case-studies/
Allow: /innovation/
Allow: /sustainability/
`;
  }

  static generateSitemap(pages: Array<{url: string, lastmod?: string, priority?: number, changefreq?: string}>): string {
    const urlEntries = pages.map(page => {
      const lastmod = page.lastmod || new Date().toISOString().split('T')[0];
      const priority = page.priority || 0.8;
      const changefreq = page.changefreq || 'weekly';
      
      return `  <url>
    <loc>${SEO_CONFIG.siteUrl}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
  }

  // LLM-Optimized Content Generation
  static generateLLMOptimizedContent(topic: string, keywords: string[]): {
    title: string;
    description: string;
    headings: string[];
    content: string;
  } {
    const keywordString = keywords.join(', ');
    
    return {
      title: `${topic} | Expert ${keywords[0]} Services in Kenya - AKIBEKS`,
      description: `Professional ${topic.toLowerCase()} services in Kenya. AKIBEKS Engineering Solutions offers expert ${keywordString} with 15+ years experience. Contact us for consultation.`,
      headings: [
        `Professional ${topic} Services in Kenya`,
        `Why Choose AKIBEKS for ${topic}?`,
        `Our ${topic} Process`,
        `${topic} Portfolio & Case Studies`,
        `Get Started with Your ${topic} Project`
      ],
      content: `Discover world-class ${topic.toLowerCase()} services with AKIBEKS Engineering Solutions. Our expert team specializes in ${keywordString}, delivering innovative solutions across Kenya. With ISO certification and 15+ years of experience, we ensure quality, sustainability, and client satisfaction in every project.`
    };
  }

  // SEO Audit Functions
  static auditPage(pageData: {
    title?: string;
    description?: string;
    keywords?: string[];
    headings?: string[];
    images?: Array<{alt?: string; src: string}>;
    links?: Array<{href: string; text: string}>;
    content?: string;
  }): SEOAudit {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Title audit
    if (!pageData.title) {
      issues.push('Missing page title');
      score -= 20;
    } else if (pageData.title.length < 30 || pageData.title.length > 60) {
      suggestions.push('Title should be 30-60 characters');
      score -= 5;
    }

    // Description audit
    if (!pageData.description) {
      issues.push('Missing meta description');
      score -= 15;
    } else if (pageData.description.length < 120 || pageData.description.length > 160) {
      suggestions.push('Meta description should be 120-160 characters');
      score -= 5;
    }

    // Headings audit
    if (!pageData.headings || pageData.headings.length === 0) {
      issues.push('No headings found');
      score -= 10;
    }

    // Images audit
    if (pageData.images) {
      const missingAlt = pageData.images.filter(img => !img.alt).length;
      if (missingAlt > 0) {
        issues.push(`${missingAlt} images missing alt text`);
        score -= missingAlt * 2;
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      metrics: {
        titleLength: pageData.title?.length || 0,
        descriptionLength: pageData.description?.length || 0,
        headingCount: pageData.headings?.length || 0,
        imageCount: pageData.images?.length || 0,
        linkCount: pageData.links?.length || 0,
        wordCount: pageData.content?.split(' ').length || 0
      }
    };
  }
}

// Export default configuration
export default {
  config: SEO_CONFIG,
  templates: STRUCTURED_DATA_TEMPLATES,
  manager: SEOManager
};