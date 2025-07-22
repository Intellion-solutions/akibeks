// Export all tables and schemas
export * from './users';
export * from './projects';
export * from './services';
export * from './seo';

// Additional tables for completeness
import { pgTable, text, timestamp, boolean, uuid, varchar, integer, decimal, json } from 'drizzle-orm/pg-core';
// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './users';

// Contact submissions table
export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  company: varchar('company', { length: 255 }),
  serviceInterest: varchar('service_interest', { length: 100 }),
  message: text('message').notNull(),
  source: varchar('source', { length: 50 }).notNull().default('website'),
  status: varchar('status', { length: 50 }).notNull().default('new'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Testimonials table
export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  company: varchar('company', { length: 255 }),
  position: varchar('position', { length: 255 }),
  message: text('message').notNull(),
  rating: integer('rating').notNull().default(5),
  projectType: varchar('project_type', { length: 100 }),
  location: varchar('location', { length: 255 }),
  imageUrl: text('image_url'),
  approved: boolean('approved').notNull().default(false),
  featured: boolean('featured').notNull().default(false),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Error logs table
export const errorLogs = pgTable('error_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  level: varchar('level', { length: 20 }).notNull(),
  message: text('message').notNull(),
  errorCode: varchar('error_code', { length: 100 }),
  stack: text('stack'),
  userId: uuid('user_id').references(() => users.id),
  url: text('url'),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  context: json('context').$type<Record<string, any>>().default({}),
  count: integer('count').notNull().default(1),
  lastOccurrence: timestamp('last_occurrence'),
  resolved: boolean('resolved').notNull().default(false),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Session management table
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  refreshToken: text('refresh_token').notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at').notNull(),
  refreshExpiresAt: timestamp('refresh_expires_at').notNull(),
  lastAccessedAt: timestamp('last_accessed_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Activity logs table
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }),
  resourceId: uuid('resource_id'),
  details: json('details').$type<Record<string, any>>().default({}),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  sessionId: uuid('session_id').references(() => sessions.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Temporarily commented out drizzle-zod schemas due to version conflicts
// export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions, {
//   id: z.string().cuid(),
//   name: z.string().min(2).max(100),
//   email: z.string().email(),
//   phone: z.string().optional(),
//   createdAt: z.string()
// });

// export const insertTestimonialSchema = createInsertSchema(testimonials, {
//   id: z.string().cuid(),
//   clientId: z.string(),
//   rating: z.number().min(1).max(5),
//   projectId: z.string().optional(),
// });

// export const insertErrorLogSchema = createInsertSchema(errorLogs);
// export const insertSessionSchema = createInsertSchema(sessions);
// export const insertActivityLogSchema = createInsertSchema(activityLogs);

// Types
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type ErrorLog = typeof errorLogs.$inferSelect;
export type NewErrorLog = typeof errorLogs.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;