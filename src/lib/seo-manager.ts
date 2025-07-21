import { supabase } from "@/lib/db-client";

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  structuredData?: any;
  robots?: string;
  author?: string;
  publishDate?: string;
  modifiedDate?: string;
  locale?: string;
  alternateLanguages?: { [key: string]: string };
  breadcrumbs?: BreadcrumbItem[];
  faqData?: FAQItem[];
  reviewData?: ReviewData;
  businessData?: BusinessData;
  productData?: ProductData;
  articleData?: ArticleData;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ReviewData {
  reviewCount: number;
  averageRating: number;
  bestRating: number;
  worstRating: number;
  reviews?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: number;
  }>;
}

export interface BusinessData {
  name: string;
  type: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  email: string;
  url: string;
  logo: string;
  image: string[];
  openingHours: string[];
  priceRange: string;
  areaServed: string[];
  serviceType: string[];
  foundingDate: string;
  numberOfEmployees: string;
  slogan: string;
}

export interface ProductData {
  name: string;
  description: string;
  image: string[];
  brand: string;
  model?: string;
  category: string;
  price: number;
  currency: string;
  availability: string;
  condition: string;
  sku?: string;
  gtin?: string;
  mpn?: string;
  offers: {
    price: number;
    currency: string;
    availability: string;
    validFrom?: string;
    validThrough?: string;
  };
}

export interface ArticleData {
  headline: string;
  description: string;
  image: string[];
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
  datePublished: string;
  dateModified: string;
  wordCount: number;
  articleSection: string;
  tags: string[];
}

export class SEOManager {
  private static instance: SEOManager;
  private currentSEO: SEOConfig | null = null;

  static getInstance(): SEOManager {
    if (!SEOManager.instance) {
      SEOManager.instance = new SEOManager();
    }
    return SEOManager.instance;
  }

  // Update document head with SEO configuration
  updateSEO(config: SEOConfig): void {
    this.currentSEO = config;
    this.updateTitle(config.title);
    this.updateMetaTags(config);
    this.updateOpenGraph(config);
    this.updateTwitterCard(config);
    this.updateStructuredData(config);
    this.updateCanonical(config.canonicalUrl);
    this.updateRobots(config.robots);
  }

  private updateTitle(title: string): void {
    document.title = title;
    this.updateMetaTag('property', 'og:title', title);
    this.updateMetaTag('name', 'twitter:title', title);
  }

  private updateMetaTags(config: SEOConfig): void {
    this.updateMetaTag('name', 'description', config.description);
    this.updateMetaTag('name', 'keywords', config.keywords.join(', '));
    
    if (config.author) {
      this.updateMetaTag('name', 'author', config.author);
    }
    
    if (config.publishDate) {
      this.updateMetaTag('name', 'article:published_time', config.publishDate);
    }
    
    if (config.modifiedDate) {
      this.updateMetaTag('name', 'article:modified_time', config.modifiedDate);
    }

    if (config.locale) {
      this.updateMetaTag('property', 'og:locale', config.locale);
    }

    // Add alternate language tags
    if (config.alternateLanguages) {
      Object.entries(config.alternateLanguages).forEach(([lang, url]) => {
        this.updateLinkTag('alternate', url, lang);
      });
    }
  }

  private updateOpenGraph(config: SEOConfig): void {
    this.updateMetaTag('property', 'og:title', config.title);
    this.updateMetaTag('property', 'og:description', config.description);
    this.updateMetaTag('property', 'og:type', config.ogType || 'website');
    this.updateMetaTag('property', 'og:url', config.canonicalUrl || window.location.href);
    
    if (config.ogImage) {
      this.updateMetaTag('property', 'og:image', config.ogImage);
      this.updateMetaTag('property', 'og:image:alt', config.title);
    }

    this.updateMetaTag('property', 'og:site_name', 'AKIBEKS Engineering Solutions');
  }

  private updateTwitterCard(config: SEOConfig): void {
    this.updateMetaTag('name', 'twitter:card', config.twitterCard || 'summary_large_image');
    this.updateMetaTag('name', 'twitter:title', config.title);
    this.updateMetaTag('name', 'twitter:description', config.description);
    
    if (config.ogImage) {
      this.updateMetaTag('name', 'twitter:image', config.ogImage);
    }
  }

  private updateStructuredData(config: SEOConfig): void {
    const structuredDataArray = [];

    // Website/Organization structured data
    const organizationData = this.generateOrganizationSchema();
    structuredDataArray.push(organizationData);

    // Breadcrumbs
    if (config.breadcrumbs) {
      const breadcrumbData = this.generateBreadcrumbSchema(config.breadcrumbs);
      structuredDataArray.push(breadcrumbData);
    }

    // FAQ
    if (config.faqData) {
      const faqData = this.generateFAQSchema(config.faqData);
      structuredDataArray.push(faqData);
    }

    // Reviews
    if (config.reviewData) {
      const reviewData = this.generateReviewSchema(config.reviewData);
      structuredDataArray.push(reviewData);
    }

    // Business/Local Business
    if (config.businessData) {
      const businessData = this.generateBusinessSchema(config.businessData);
      structuredDataArray.push(businessData);
    }

    // Product
    if (config.productData) {
      const productData = this.generateProductSchema(config.productData);
      structuredDataArray.push(productData);
    }

    // Article
    if (config.articleData) {
      const articleData = this.generateArticleSchema(config.articleData);
      structuredDataArray.push(articleData);
    }

    // Custom structured data
    if (config.structuredData) {
      structuredDataArray.push(config.structuredData);
    }

    this.updateStructuredDataScript(structuredDataArray);
  }

  private generateOrganizationSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "AKIBEKS Engineering Solutions",
      "url": "https://akibeks.co.ke",
      "logo": "https://akibeks.co.ke/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+254-710-245-118",
        "contactType": "customer service",
        "areaServed": "KE",
        "availableLanguage": ["English", "Swahili"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Westlands",
        "addressLocality": "Nairobi",
        "addressRegion": "Nairobi County",
        "postalCode": "00100",
        "addressCountry": "KE"
      },
      "currenciesAccepted": "KES",
      "priceRange": "KES 50,000 - KES 5,000,000",
      "foundingDate": "2008",
      "numberOfEmployees": "50-100",
      "areaServed": {
        "@type": "Country",
        "name": "Kenya"
      },
      "sameAs": [
        "https://facebook.com/akibeks",
        "https://twitter.com/akibeks",
        "https://linkedin.com/company/akibeks"
      ]
    };
  }

  private generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map(crumb => ({
        "@type": "ListItem",
        "position": crumb.position,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
  }

  private generateFAQSchema(faqData: FAQItem[]) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }

  private generateReviewSchema(reviewData: ReviewData) {
    return {
      "@context": "https://schema.org",
      "@type": "AggregateRating",
      "ratingValue": reviewData.averageRating,
      "reviewCount": reviewData.reviewCount,
      "bestRating": reviewData.bestRating,
      "worstRating": reviewData.worstRating
    };
  }

  private generateBusinessSchema(businessData: BusinessData) {
    return {
      "@context": "https://schema.org",
      "@type": businessData.type,
      "name": businessData.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": businessData.address.streetAddress,
        "addressLocality": businessData.address.addressLocality,
        "addressRegion": businessData.address.addressRegion,
        "postalCode": businessData.address.postalCode,
        "addressCountry": businessData.address.addressCountry
      },
      "telephone": businessData.telephone,
      "email": businessData.email,
      "url": businessData.url,
      "logo": businessData.logo,
      "image": businessData.image,
      "openingHours": businessData.openingHours,
      "priceRange": businessData.priceRange,
      "areaServed": businessData.areaServed,
      "serviceType": businessData.serviceType,
      "foundingDate": businessData.foundingDate,
      "numberOfEmployees": businessData.numberOfEmployees,
      "slogan": businessData.slogan
    };
  }

  private generateProductSchema(productData: ProductData) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": productData.name,
      "description": productData.description,
      "image": productData.image,
      "brand": {
        "@type": "Brand",
        "name": productData.brand
      },
      "model": productData.model,
      "category": productData.category,
      "sku": productData.sku,
      "gtin": productData.gtin,
      "mpn": productData.mpn,
      "offers": {
        "@type": "Offer",
        "price": productData.offers.price,
        "priceCurrency": productData.offers.currency,
        "availability": `https://schema.org/${productData.offers.availability}`,
        "validFrom": productData.offers.validFrom,
        "validThrough": productData.offers.validThrough
      }
    };
  }

  private generateArticleSchema(articleData: ArticleData) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": articleData.headline,
      "description": articleData.description,
      "image": articleData.image,
      "author": {
        "@type": "Person",
        "name": articleData.author.name,
        "url": articleData.author.url
      },
      "publisher": {
        "@type": "Organization",
        "name": articleData.publisher.name,
        "logo": {
          "@type": "ImageObject",
          "url": articleData.publisher.logo
        }
      },
      "datePublished": articleData.datePublished,
      "dateModified": articleData.dateModified,
      "wordCount": articleData.wordCount,
      "articleSection": articleData.articleSection,
      "keywords": articleData.tags.join(', ')
    };
  }

  private updateMetaTag(attribute: string, value: string, content: string): void {
    let element = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, value);
      document.head.appendChild(element);
    }
    
    element.content = content;
  }

  private updateLinkTag(rel: string, href: string, hreflang?: string): void {
    let element = document.querySelector(`link[rel="${rel}"][href="${href}"]`) as HTMLLinkElement;
    
    if (!element) {
      element = document.createElement('link');
      element.rel = rel;
      element.href = href;
      if (hreflang) element.hreflang = hreflang;
      document.head.appendChild(element);
    }
  }

  private updateCanonical(url?: string): void {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    
    canonical.href = url || window.location.href;
  }

  private updateRobots(robots?: string): void {
    this.updateMetaTag('name', 'robots', robots || 'index, follow');
  }

  private updateStructuredDataScript(data: any[]): void {
    // Remove existing structured data scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    data.forEach(item => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
    });
  }

  // SEO Analytics and optimization methods
  async analyzePage(): Promise<SEOAnalysis> {
    const analysis: SEOAnalysis = {
      title: this.analyzeTitle(),
      description: this.analyzeDescription(),
      keywords: this.analyzeKeywords(),
      headings: this.analyzeHeadings(),
      images: this.analyzeImages(),
      links: this.analyzeLinks(),
      performance: await this.analyzePerformance(),
      accessibility: this.analyzeAccessibility(),
      structuredData: this.analyzeStructuredData(),
      score: 0
    };

    analysis.score = this.calculateSEOScore(analysis);
    return analysis;
  }

  private analyzeTitle(): TitleAnalysis {
    const title = document.title;
    return {
      length: title.length,
      isOptimal: title.length >= 30 && title.length <= 60,
      hasKeywords: this.currentSEO?.keywords.some(keyword => 
        title.toLowerCase().includes(keyword.toLowerCase())
      ) || false,
      recommendations: title.length < 30 ? ['Title too short'] : 
                     title.length > 60 ? ['Title too long'] : []
    };
  }

  private analyzeDescription(): DescriptionAnalysis {
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    return {
      length: description.length,
      isOptimal: description.length >= 120 && description.length <= 160,
      hasKeywords: this.currentSEO?.keywords.some(keyword => 
        description.toLowerCase().includes(keyword.toLowerCase())
      ) || false,
      recommendations: description.length < 120 ? ['Description too short'] : 
                      description.length > 160 ? ['Description too long'] : []
    };
  }

  private analyzeKeywords(): KeywordAnalysis {
    const content = document.body.textContent || '';
    const keywords = this.currentSEO?.keywords || [];
    
    return {
      density: keywords.map(keyword => ({
        keyword,
        count: (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length,
        density: ((content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length / content.split(' ').length) * 100
      })),
      recommendations: []
    };
  }

  private analyzeHeadings(): HeadingAnalysis {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const h1Count = document.querySelectorAll('h1').length;
    
    return {
      structure: headings.map((h, index) => ({
        level: parseInt(h.tagName.charAt(1)),
        text: h.textContent || '',
        position: index
      })),
      h1Count,
      hasKeywords: headings.some(h => 
        this.currentSEO?.keywords.some(keyword => 
          (h.textContent || '').toLowerCase().includes(keyword.toLowerCase())
        )
      ),
      recommendations: h1Count !== 1 ? ['Should have exactly one H1 tag'] : []
    };
  }

  private analyzeImages(): ImageAnalysis {
    const images = Array.from(document.querySelectorAll('img'));
    const imagesWithoutAlt = images.filter(img => !img.alt);
    
    return {
      totalImages: images.length,
      imagesWithoutAlt: imagesWithoutAlt.length,
      recommendations: imagesWithoutAlt.length > 0 ? 
        [`${imagesWithoutAlt.length} images missing alt text`] : []
    };
  }

  private analyzeLinks(): LinkAnalysis {
    const internalLinks = Array.from(document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]'));
    const externalLinks = Array.from(document.querySelectorAll('a[href^="http"]'));
    
    return {
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      recommendations: []
    };
  }

  private async analyzePerformance(): Promise<PerformanceAnalysis> {
    return {
      loadTime: performance.now(),
      recommendations: []
    };
  }

  private analyzeAccessibility(): AccessibilityAnalysis {
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    
    return {
      focusableElements: focusableElements.length,
      recommendations: []
    };
  }

  private analyzeStructuredData(): StructuredDataAnalysis {
    const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    return {
      hasStructuredData: structuredDataScripts.length > 0,
      types: Array.from(structuredDataScripts).map(script => {
        try {
          const data = JSON.parse(script.textContent || '');
          return data['@type'] || 'Unknown';
        } catch {
          return 'Invalid';
        }
      }),
      recommendations: structuredDataScripts.length === 0 ? ['Add structured data'] : []
    };
  }

  private calculateSEOScore(analysis: SEOAnalysis): number {
    let score = 100;
    
    if (!analysis.title.isOptimal) score -= 10;
    if (!analysis.description.isOptimal) score -= 10;
    if (analysis.headings.h1Count !== 1) score -= 5;
    if (analysis.images.imagesWithoutAlt > 0) score -= analysis.images.imagesWithoutAlt * 2;
    if (!analysis.structuredData.hasStructuredData) score -= 15;
    
    return Math.max(0, score);
  }

  // Database methods for SEO management
  async saveSEOConfig(pageId: string, config: SEOConfig): Promise<void> {
    try {
      await supabase.from('seo_configurations').upsert({
        page_id: pageId,
        title: config.title,
        description: config.description,
        keywords: config.keywords,
        canonical_url: config.canonicalUrl,
        og_image: config.ogImage,
        og_type: config.ogType,
        twitter_card: config.twitterCard,
        structured_data: config.structuredData,
        robots: config.robots,
        author: config.author,
        publish_date: config.publishDate,
        modified_date: config.modifiedDate,
        locale: config.locale,
        alternate_languages: config.alternateLanguages,
        breadcrumbs: config.breadcrumbs,
        faq_data: config.faqData,
        review_data: config.reviewData,
        business_data: config.businessData,
        product_data: config.productData,
        article_data: config.articleData,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving SEO config:', error);
    }
  }

  async loadSEOConfig(pageId: string): Promise<SEOConfig | null> {
    try {
      const { data, error } = await supabase
        .from('seo_configurations')
        .select('*')
        .eq('page_id', pageId)
        .single();

      if (error || !data) return null;

      return {
        title: data.title,
        description: data.description,
        keywords: data.keywords || [],
        canonicalUrl: data.canonical_url,
        ogImage: data.og_image,
        ogType: data.og_type,
        twitterCard: data.twitter_card,
        structuredData: data.structured_data,
        robots: data.robots,
        author: data.author,
        publishDate: data.publish_date,
        modifiedDate: data.modified_date,
        locale: data.locale,
        alternateLanguages: data.alternate_languages,
        breadcrumbs: data.breadcrumbs,
        faqData: data.faq_data,
        reviewData: data.review_data,
        businessData: data.business_data,
        productData: data.product_data,
        articleData: data.article_data
      };
    } catch (error) {
      console.error('Error loading SEO config:', error);
      return null;
    }
  }
}

// Type definitions for SEO analysis
export interface SEOAnalysis {
  title: TitleAnalysis;
  description: DescriptionAnalysis;
  keywords: KeywordAnalysis;
  headings: HeadingAnalysis;
  images: ImageAnalysis;
  links: LinkAnalysis;
  performance: PerformanceAnalysis;
  accessibility: AccessibilityAnalysis;
  structuredData: StructuredDataAnalysis;
  score: number;
}

export interface TitleAnalysis {
  length: number;
  isOptimal: boolean;
  hasKeywords: boolean;
  recommendations: string[];
}

export interface DescriptionAnalysis {
  length: number;
  isOptimal: boolean;
  hasKeywords: boolean;
  recommendations: string[];
}

export interface KeywordAnalysis {
  density: Array<{
    keyword: string;
    count: number;
    density: number;
  }>;
  recommendations: string[];
}

export interface HeadingAnalysis {
  structure: Array<{
    level: number;
    text: string;
    position: number;
  }>;
  h1Count: number;
  hasKeywords: boolean;
  recommendations: string[];
}

export interface ImageAnalysis {
  totalImages: number;
  imagesWithoutAlt: number;
  recommendations: string[];
}

export interface LinkAnalysis {
  internalLinks: number;
  externalLinks: number;
  recommendations: string[];
}

export interface PerformanceAnalysis {
  loadTime: number;
  recommendations: string[];
}

export interface AccessibilityAnalysis {
  focusableElements: number;
  recommendations: string[];
}

export interface StructuredDataAnalysis {
  hasStructuredData: boolean;
  types: string[];
  recommendations: string[];
}

export const seoManager = SEOManager.getInstance();