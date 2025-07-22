import { pgTable, text, timestamp, boolean, uuid, varchar, integer, decimal, json, index } from 'drizzle-orm/pg-core';
// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// SEO Configurations Table
export const seoConfigurations = pgTable('seo_configurations', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageType: varchar('page_type', { length: 100 }).notNull(), // 'home', 'service', 'project', 'blog', etc.
  pageId: uuid('page_id'), // Reference to specific page/content
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  keywords: json('keywords').$type<string[]>().default([]),
  canonicalUrl: text('canonical_url'),
  ogTitle: varchar('og_title', { length: 255 }),
  ogDescription: text('og_description'),
  ogImage: text('og_image'),
  ogType: varchar('og_type', { length: 50 }).default('website'),
  twitterCard: varchar('twitter_card', { length: 50 }).default('summary_large_image'),
  twitterTitle: varchar('twitter_title', { length: 255 }),
  twitterDescription: text('twitter_description'),
  twitterImage: text('twitter_image'),
  structuredData: json('structured_data').$type<Record<string, any>>().default({}),
  metaRobots: varchar('meta_robots', { length: 100 }).default('index,follow'),
  isActive: boolean('is_active').notNull().default(true),
  priority: decimal('priority', { precision: 2, scale: 1 }).default('0.5'),
  changeFrequency: varchar('change_frequency', { length: 20 }).default('weekly'),
  customMeta: json('custom_meta').$type<Record<string, string>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    pageTypeIdx: index('idx_seo_page_type').on(table.pageType),
    pageIdIdx: index('idx_seo_page_id').on(table.pageId),
    isActiveIdx: index('idx_seo_is_active').on(table.isActive),
  };
});

// Sitemaps Management Table
export const sitemaps = pgTable('sitemaps', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }).notNull(), // 'main', 'news', 'image', 'video', 'index'
  url: text('url').notNull(),
  lastModified: timestamp('last_modified').notNull(),
  changeFrequency: varchar('change_frequency', { length: 20 }).default('weekly'),
  priority: decimal('priority', { precision: 2, scale: 1 }).default('0.5'),
  isActive: boolean('is_active').notNull().default(true),
  contentType: varchar('content_type', { length: 100 }),
  contentId: uuid('content_id'),
  imageUrls: json('image_urls').$type<string[]>().default([]),
  videoData: json('video_data').$type<{
    thumbnailUrl?: string;
    title?: string;
    description?: string;
    duration?: number;
  }>(),
  newsData: json('news_data').$type<{
    publishDate?: string;
    title?: string;
    keywords?: string[];
    genres?: string[];
  }>(),
  hreflangAlternates: json('hreflang_alternates').$type<{
    hreflang: string;
    href: string;
  }[]>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    typeIdx: index('idx_sitemap_type').on(table.type),
    isActiveIdx: index('idx_sitemap_is_active').on(table.isActive),
    lastModifiedIdx: index('idx_sitemap_last_modified').on(table.lastModified),
  };
});

// SEO Analytics Table
export const seoAnalytics = pgTable('seo_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  pageType: varchar('page_type', { length: 100 }),
  title: varchar('title', { length: 255 }),
  metaDescription: text('meta_description'),
  h1Tags: json('h1_tags').$type<string[]>().default([]),
  h2Tags: json('h2_tags').$type<string[]>().default([]),
  h3Tags: json('h3_tags').$type<string[]>().default([]),
  imageCount: integer('image_count').default(0),
  imagesWithAlt: integer('images_with_alt').default(0),
  internalLinks: integer('internal_links').default(0),
  externalLinks: integer('external_links').default(0),
  wordCount: integer('word_count').default(0),
  readabilityScore: decimal('readability_score', { precision: 5, scale: 2 }),
  loadTime: decimal('load_time', { precision: 8, scale: 3 }), // in seconds
  mobileScore: integer('mobile_score').default(0), // 0-100
  desktopScore: integer('desktop_score').default(0), // 0-100
  seoScore: integer('seo_score').default(0), // 0-100
  issues: json('issues').$type<{
    type: 'error' | 'warning' | 'info';
    message: string;
    element?: string;
  }[]>().default([]),
  recommendations: json('recommendations').$type<string[]>().default([]),
  lastCrawled: timestamp('last_crawled').notNull().defaultNow(),
  isIndexable: boolean('is_indexable').default(true),
  hasSchema: boolean('has_schema').default(false),
  schemaTypes: json('schema_types').$type<string[]>().default([]),
  socialTags: json('social_tags').$type<{
    platform: string;
    property: string;
    content: string;
  }[]>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    urlIdx: index('idx_seo_analytics_url').on(table.url),
    pageTypeIdx: index('idx_seo_analytics_page_type').on(table.pageType),
    lastCrawledIdx: index('idx_seo_analytics_last_crawled').on(table.lastCrawled),
    seoScoreIdx: index('idx_seo_analytics_score').on(table.seoScore),
  };
});

// Keyword Rankings Table
export const keywordRankings = pgTable('keyword_rankings', {
  id: uuid('id').primaryKey().defaultRandom(),
  keyword: varchar('keyword', { length: 255 }).notNull(),
  url: text('url').notNull(),
  searchEngine: varchar('search_engine', { length: 50 }).notNull().default('google'),
  country: varchar('country', { length: 5 }).notNull().default('KE'),
  language: varchar('language', { length: 5 }).notNull().default('en'),
  position: integer('position'),
  previousPosition: integer('previous_position'),
  bestPosition: integer('best_position'),
  worstPosition: integer('worst_position'),
  averagePosition: decimal('average_position', { precision: 5, scale: 2 }),
  searchVolume: integer('search_volume'),
  competition: varchar('competition', { length: 20 }), // 'low', 'medium', 'high'
  cpc: decimal('cpc', { precision: 8, scale: 2 }), // Cost per click in KES
  difficulty: integer('difficulty').default(0), // 0-100
  targetPosition: integer('target_position').default(1),
  isTracked: boolean('is_tracked').notNull().default(true),
  tags: json('tags').$type<string[]>().default([]),
  notes: text('notes'),
  lastChecked: timestamp('last_checked').notNull().defaultNow(),
  firstRanked: timestamp('first_ranked'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    keywordIdx: index('idx_keyword_rankings_keyword').on(table.keyword),
    urlIdx: index('idx_keyword_rankings_url').on(table.url),
    positionIdx: index('idx_keyword_rankings_position').on(table.position),
    searchEngineIdx: index('idx_keyword_rankings_search_engine').on(table.searchEngine),
    isTrackedIdx: index('idx_keyword_rankings_is_tracked').on(table.isTracked),
  };
});

// Meta Redirects Table
export const metaRedirects = pgTable('meta_redirects', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromUrl: text('from_url').notNull().unique(),
  toUrl: text('to_url').notNull(),
  redirectType: integer('redirect_type').notNull().default(301), // 301, 302, 307, 308
  isActive: boolean('is_active').notNull().default(true),
  description: text('description'),
  hitCount: integer('hit_count').default(0),
  lastHit: timestamp('last_hit'),
  isRegex: boolean('is_regex').notNull().default(false),
  preserveQueryString: boolean('preserve_query_string').notNull().default(true),
  createdBy: uuid('created_by'), // Reference to user
  reason: varchar('reason', { length: 255 }), // 'moved_permanently', 'rebranding', 'seo_optimization'
  expiresAt: timestamp('expires_at'), // For temporary redirects
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    fromUrlIdx: index('idx_redirects_from_url').on(table.fromUrl),
    isActiveIdx: index('idx_redirects_is_active').on(table.isActive),
    redirectTypeIdx: index('idx_redirects_type').on(table.redirectType),
  };
});

// Robots.txt Management Table
export const robotsConfig = pgTable('robots_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  userAgent: varchar('user_agent', { length: 100 }).notNull().default('*'),
  directive: varchar('directive', { length: 20 }).notNull(), // 'allow', 'disallow', 'crawl-delay', 'sitemap'
  value: text('value').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  priority: integer('priority').notNull().default(100), // Order of directives
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    userAgentIdx: index('idx_robots_user_agent').on(table.userAgent),
    directiveIdx: index('idx_robots_directive').on(table.directive),
    isActiveIdx: index('idx_robots_is_active').on(table.isActive),
    priorityIdx: index('idx_robots_priority').on(table.priority),
  };
});

// Schema Markup Templates Table
export const schemaTemplates = pgTable('schema_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // 'Organization', 'LocalBusiness', 'Article', etc.
  template: json('template').$type<Record<string, any>>().notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  isDefault: boolean('is_default').notNull().default(false),
  applicablePages: json('applicable_pages').$type<string[]>().default([]), // page types where this applies
  variables: json('variables').$type<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
    defaultValue?: any;
  }[]>().default([]),
  createdBy: uuid('created_by'),
  version: varchar('version', { length: 20 }).default('1.0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    typeIdx: index('idx_schema_templates_type').on(table.type),
    isActiveIdx: index('idx_schema_templates_is_active').on(table.isActive),
    isDefaultIdx: index('idx_schema_templates_is_default').on(table.isDefault),
  };
});

// Temporarily commented out drizzle-zod schemas due to version conflicts
// All schema exports commented out for now

// Temporarily commented out drizzle-zod schemas due to version conflicts
// export const insertSeoConfigurationSchema = createInsertSchema(seoConfigurations, {
//   pageType: z.string().min(1, 'Page type is required'),
//   title: z.string().min(1, 'Title is required').max(255),
//   description: z.string().min(1, 'Description is required').max(160, 'Description should be under 160 characters'),
//   keywords: z.array(z.string()).optional(),
//   priority: z.string().transform(val => parseFloat(val)).optional(),
// });

// export const insertSitemapSchema = createInsertSchema(sitemaps, {
//   type: z.string().min(1, 'Sitemap type is required'),
//   url: z.string().url('Invalid URL format'),
//   lastModified: z.date(),
//   priority: z.string().transform(val => parseFloat(val)).optional(),
// });

// export const insertSeoAnalyticsSchema = createInsertSchema(seoAnalytics, {
//   url: z.string().url('Invalid URL format'),
//   seoScore: z.number().min(0).max(100).optional(),
//   mobileScore: z.number().min(0).max(100).optional(),
//   desktopScore: z.number().min(0).max(100).optional(),
// });

// export const insertKeywordRankingSchema = createInsertSchema(keywordRankings, {
//   keyword: z.string().min(1, 'Keyword is required'),
//   url: z.string().url('Invalid URL format'),
//   position: z.number().min(1).optional(),
//   searchVolume: z.number().min(0).optional(),
// });

// export const insertMetaRedirectSchema = createInsertSchema(metaRedirects, {
//   fromUrl: z.string().min(1, 'From URL is required'),
//   toUrl: z.string().url('Invalid destination URL'),
//   redirectType: z.number().refine(val => [301, 302, 307, 308].includes(val), 'Invalid redirect type'),
// });

// export const insertRobotsConfigSchema = createInsertSchema(robotsConfig, {
//   userAgent: z.string().min(1, 'User agent is required'),
//   directive: z.enum(['allow', 'disallow', 'crawl-delay', 'sitemap']),
//   value: z.string().min(1, 'Value is required'),
//   priority: z.number().min(1).max(1000),
// });

// export const insertSchemaTemplateSchema = createInsertSchema(schemaTemplates, {
//   name: z.string().min(1, 'Template name is required'),
//   type: z.string().min(1, 'Schema type is required'),
//   template: z.record(z.any()),
// });

// // Select schemas
// export const selectSeoConfigurationSchema = createSelectSchema(seoConfigurations);
// export const selectSitemapSchema = createSelectSchema(sitemaps);
// export const selectSeoAnalyticsSchema = createSelectSchema(seoAnalytics);
// export const selectKeywordRankingSchema = createSelectSchema(keywordRankings);
// export const selectMetaRedirectSchema = createSelectSchema(metaRedirects);
// export const selectRobotsConfigSchema = createSelectSchema(robotsConfig);
// export const selectSchemaTemplateSchema = createSelectSchema(schemaTemplates);

// Types
export type SeoConfiguration = typeof seoConfigurations.$inferSelect;
export type NewSeoConfiguration = typeof seoConfigurations.$inferInsert;
export type Sitemap = typeof sitemaps.$inferSelect;
export type NewSitemap = typeof sitemaps.$inferInsert;
export type SeoAnalytics = typeof seoAnalytics.$inferSelect;
export type NewSeoAnalytics = typeof seoAnalytics.$inferInsert;
export type KeywordRanking = typeof keywordRankings.$inferSelect;
export type NewKeywordRanking = typeof keywordRankings.$inferInsert;
export type MetaRedirect = typeof metaRedirects.$inferSelect;
export type NewMetaRedirect = typeof metaRedirects.$inferInsert;
export type RobotsConfig = typeof robotsConfig.$inferSelect;
export type NewRobotsConfig = typeof robotsConfig.$inferInsert;
export type SchemaTemplate = typeof schemaTemplates.$inferSelect;
export type NewSchemaTemplate = typeof schemaTemplates.$inferInsert;