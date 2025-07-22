import { pgTable, text, timestamp, boolean, uuid, varchar, integer, decimal, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './users';

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  longDescription: text('long_description'),
  clientId: uuid('client_id').references(() => users.id),
  managerId: uuid('manager_id').references(() => users.id),
  projectType: varchar('project_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('planning'),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  budgetKes: decimal('budget_kes', { precision: 15, scale: 2 }).notNull(),
  actualCostKes: decimal('actual_cost_kes', { precision: 15, scale: 2 }).default('0'),
  location: varchar('location', { length: 255 }),
  county: varchar('county', { length: 50 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  completionPercentage: integer('completion_percentage').notNull().default(0),
  featured: boolean('featured').notNull().default(false),
  imageUrl: text('image_url'),
  images: json('images').$type<string[]>().default([]),
  documents: json('documents').$type<{ name: string; url: string; type: string }[]>().default([]),
  tags: json('tags').$type<string[]>().default([]),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  kraPin: varchar('kra_pin', { length: 20 }),
  permitNumber: varchar('permit_number', { length: 100 }),
  contractValue: decimal('contract_value', { precision: 15, scale: 2 }),
  vatAmount: decimal('vat_amount', { precision: 15, scale: 2 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const projectMilestones = pgTable('project_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date').notNull(),
  completedAt: timestamp('completed_at'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  progress: integer('progress').notNull().default(0),
  budgetKes: decimal('budget_kes', { precision: 15, scale: 2 }),
  actualCostKes: decimal('actual_cost_kes', { precision: 15, scale: 2 }),
  dependencies: json('dependencies').$type<string[]>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const projectTasks = pgTable('project_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  milestoneId: uuid('milestone_id').references(() => projectMilestones.id, { onDelete: 'set null' }),
  assigneeId: uuid('assignee_id').references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('todo'),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours').default(0),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  position: integer('position').notNull().default(0),
  tags: json('tags').$type<string[]>().default([]),
  attachments: json('attachments').$type<{ name: string; url: string; type: string }[]>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Zod schemas
export const insertProjectSchema = createInsertSchema(projects, {
  title: z.string().min(1, 'Project title is required').max(255),
  budgetKes: z.string().transform(val => parseFloat(val)),
  completionPercentage: z.number().min(0).max(100),
  location: z.string().min(1, 'Location is required'),
});

export const insertMilestoneSchema = createInsertSchema(projectMilestones, {
  title: z.string().min(1, 'Milestone title is required'),
  dueDate: z.date(),
  progress: z.number().min(0).max(100),
});

export const insertTaskSchema = createInsertSchema(projectTasks, {
  title: z.string().min(1, 'Task title is required'),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
});

export const selectProjectSchema = createSelectSchema(projects);
export const selectMilestoneSchema = createSelectSchema(projectMilestones);
export const selectTaskSchema = createSelectSchema(projectTasks);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type NewProjectMilestone = typeof projectMilestones.$inferInsert;
export type ProjectTask = typeof projectTasks.$inferSelect;
export type NewProjectTask = typeof projectTasks.$inferInsert;