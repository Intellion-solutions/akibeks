// SEO Types for AKIBEKS Engineering Solutions
export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultImage: string;
  twitterHandle: string;
  facebookPage: string;
  linkedinPage: string;
  locale: string;
  alternateLocales: string[];
  themeColor: string;
  backgroundColor: string;
}

export interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
  locale: string;
}

export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site: string;
  creator: string;
  title: string;
  description: string;
  image: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface SEOMetrics {
  titleLength: number;
  descriptionLength: number;
  headingCount: number;
  imageCount: number;
  linkCount: number;
  wordCount: number;
}

export interface SEOAudit {
  score: number;
  issues: string[];
  suggestions: string[];
  metrics: SEOMetrics;
}

export interface PageSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  alternateUrls?: Record<string, string>;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOPage {
  seo: PageSEO;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  structuredData?: StructuredData[];
}

export interface SitemapPage {
  url: string;
  lastmod?: string;
  priority?: number;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

export interface RobotsConfig {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
  sitemap?: string;
}

export interface LLMOptimizedContent {
  title: string;
  description: string;
  headings: string[];
  content: string;
  keywords: string[];
  readabilityScore?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface ContentAnalysis {
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  sentimentScore: number;
  topicRelevance: number;
  uniquenessScore: number;
  suggestions: string[];
}

export interface SEOReport {
  url: string;
  title: string;
  description: string;
  score: number;
  issues: string[];
  opportunities: string[];
  technicalIssues: string[];
  contentIssues: string[];
  performanceMetrics: {
    loadTime: number;
    mobileScore: number;
    desktopScore: number;
    coreWebVitals: {
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
    };
  };
  recommendations: string[];
}

export interface CompetitorAnalysis {
  competitor: string;
  url: string;
  keywords: string[];
  backlinks: number;
  domainAuthority: number;
  contentGaps: string[];
  opportunities: string[];
}

export interface KeywordResearch {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  relatedKeywords: string[];
  questions: string[];
}

export interface LocalSEO {
  businessName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  website: string;
  categories: string[];
  hours: Record<string, string>;
  reviews: {
    platform: string;
    rating: number;
    count: number;
  }[];
}