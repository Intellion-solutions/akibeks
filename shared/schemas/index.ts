// Shared validation schemas for AKIBEKS Engineering Solutions
import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  role: z.enum(['admin', 'user', 'client', 'employee']),
  isActive: z.boolean().default(true),
  isEmailVerified: z.boolean().default(false),
  phoneNumber: z.string().regex(/^\+254[0-9]{9}$/, 'Invalid Kenyan phone number').optional(),
  kraPin: z.string().regex(/^[A-Z][0-9]{9}[A-Z]$/, 'Invalid KRA PIN format').optional(),
  idNumber: z.string().min(7).max(8).optional(),
  county: z.string().max(50).optional(),
  profileImage: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createUserSchema = userSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// Project schemas
export const projectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['planning', 'in_progress', 'completed', 'on_hold']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  startDate: z.string().datetime(),
  estimatedEndDate: z.string().datetime(),
  actualEndDate: z.string().datetime().optional(),
  budget: z.number().positive('Budget must be positive'),
  clientId: z.string().uuid(),
  assignedToId: z.string().uuid(),
  progress: z.number().min(0).max(100),
  location: z.string().max(200).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createProjectSchema = projectSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updateProjectSchema = createProjectSchema.partial();

// Service schemas
export const serviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['design', 'construction', 'consultation', 'maintenance']),
  price: z.number().positive('Price must be positive'),
  duration: z.string().min(1, 'Duration is required'),
  isActive: z.boolean().default(true),
  features: z.array(z.string()),
  requirements: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createServiceSchema = serviceSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updateServiceSchema = createServiceSchema.partial();

// Contact submission schemas
export const contactSubmissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().regex(/^\+254[0-9]{9}$/, 'Invalid phone number').optional(),
  company: z.string().max(255).optional(),
  serviceInterest: z.string().max(100).optional(),
  message: z.string().min(1, 'Message is required'),
  source: z.string().default('website'),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'closed']).default('new'),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createContactSubmissionSchema = contactSubmissionSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true 
});

// Testimonial schemas
export const testimonialSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email().optional(),
  company: z.string().max(255).optional(),
  position: z.string().max(255).optional(),
  message: z.string().min(1, 'Message is required'),
  rating: z.number().min(1).max(5),
  projectType: z.string().max(100).optional(),
  location: z.string().max(255).optional(),
  imageUrl: z.string().url().optional(),
  approved: z.boolean().default(false),
  featured: z.boolean().default(false),
  displayOrder: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createTestimonialSchema = testimonialSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

// SEO Configuration schemas
export const seoConfigurationSchema = z.object({
  id: z.string().uuid(),
  pageUrl: z.string().min(1, 'Page URL is required'),
  title: z.string().min(1, 'Title is required').max(60),
  description: z.string().min(1, 'Description is required').max(160),
  keywords: z.array(z.string()),
  ogTitle: z.string().max(60).optional(),
  ogDescription: z.string().max(160).optional(),
  ogImage: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  robotsDirective: z.string().default('index,follow'),
  structuredData: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createSEOConfigurationSchema = seoConfigurationSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updateSEOConfigurationSchema = createSEOConfigurationSchema.partial();

// Email schemas
export const emailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  from: z.string().email('Invalid from email').optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string()
  })).optional()
});

export const emailTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().min(1, 'HTML content is required'),
  textContent: z.string().min(1, 'Text content is required'),
  variables: z.array(z.string()),
  category: z.enum(['welcome', 'notification', 'invoice', 'quotation', 'alert', 'general']),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createEmailTemplateSchema = emailTemplateSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().regex(/^\+254[0-9]{9}$/, 'Invalid phone number').optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// File upload schemas
export const fileUploadSchema = z.object({
  filename: z.string(),
  originalname: z.string(),
  mimetype: z.string(),
  size: z.number().max(5 * 1024 * 1024, 'File too large'), // 5MB max
  buffer: z.instanceof(Buffer)
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
});

// Export types
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Project = z.infer<typeof projectSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;

export type Service = z.infer<typeof serviceSchema>;
export type CreateService = z.infer<typeof createServiceSchema>;
export type UpdateService = z.infer<typeof updateServiceSchema>;

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
export type CreateContactSubmission = z.infer<typeof createContactSubmissionSchema>;

export type Testimonial = z.infer<typeof testimonialSchema>;
export type CreateTestimonial = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonial = z.infer<typeof updateTestimonialSchema>;

export type SEOConfiguration = z.infer<typeof seoConfigurationSchema>;
export type CreateSEOConfiguration = z.infer<typeof createSEOConfigurationSchema>;
export type UpdateSEOConfiguration = z.infer<typeof updateSEOConfigurationSchema>;

export type EmailData = z.infer<typeof emailSchema>;
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;
export type CreateEmailTemplate = z.infer<typeof createEmailTemplateSchema>;

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

export type FileUpload = z.infer<typeof fileUploadSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type SearchParams = z.infer<typeof searchSchema>;