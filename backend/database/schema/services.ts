import { pgTable, text, timestamp, boolean, uuid, varchar, integer, decimal, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  longDescription: text('long_description'),
  category: varchar('category', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull().default('building2'),
  features: json('features').$type<string[]>().default([]),
  benefits: json('benefits').$type<string[]>().default([]),
  processSteps: json('process_steps').$type<string[]>().default([]),
  priceRangeMin: decimal('price_range_min', { precision: 15, scale: 2 }),
  priceRangeMax: decimal('price_range_max', { precision: 15, scale: 2 }),
  durationEstimate: varchar('duration_estimate', { length: 100 }),
  imageUrl: text('image_url'),
  images: json('images').$type<string[]>().default([]),
  tags: json('tags').$type<string[]>().default([]),
  requirements: json('requirements').$type<string[]>().default([]),
  deliverables: json('deliverables').$type<string[]>().default([]),
  active: boolean('active').notNull().default(true),
  featured: boolean('featured').notNull().default(false),
  position: integer('position').notNull().default(0),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  seoTitle: varchar('seo_title', { length: 255 }),
  seoDescription: text('seo_description'),
  seoKeywords: json('seo_keywords').$type<string[]>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const serviceInquiries = pgTable('service_inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  company: varchar('company', { length: 255 }),
  location: varchar('location', { length: 255 }),
  county: varchar('county', { length: 50 }),
  projectDescription: text('project_description'),
  budgetRange: varchar('budget_range', { length: 100 }),
  timeline: varchar('timeline', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('new'),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  notes: text('notes'),
  followUpDate: timestamp('follow_up_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Zod schemas
export const insertServiceSchema = createInsertSchema(services, {
  title: z.string().min(1, 'Service title is required').max(255),
  description: z.string().min(1, 'Service description is required'),
  category: z.string().min(1, 'Category is required'),
  priceRangeMin: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  priceRangeMax: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
});

export const insertServiceInquirySchema = createInsertSchema(serviceInquiries, {
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().regex(/^\+254[0-9]{9}$/, 'Invalid Kenyan phone number format').optional(),
  projectDescription: z.string().min(1, 'Project description is required'),
});

export const selectServiceSchema = createSelectSchema(services);
export const selectServiceInquirySchema = createSelectSchema(serviceInquiries);

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type ServiceInquiry = typeof serviceInquiries.$inferSelect;
export type NewServiceInquiry = typeof serviceInquiries.$inferInsert;