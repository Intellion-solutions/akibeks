"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSchema = exports.paginationSchema = exports.fileUploadSchema = exports.registerSchema = exports.loginSchema = exports.createEmailTemplateSchema = exports.emailTemplateSchema = exports.emailSchema = exports.updateSEOConfigurationSchema = exports.createSEOConfigurationSchema = exports.seoConfigurationSchema = exports.updateTestimonialSchema = exports.createTestimonialSchema = exports.testimonialSchema = exports.createContactSubmissionSchema = exports.contactSubmissionSchema = exports.updateServiceSchema = exports.createServiceSchema = exports.serviceSchema = exports.updateProjectSchema = exports.createProjectSchema = exports.projectSchema = exports.updateUserSchema = exports.createUserSchema = exports.userSchema = void 0;
// Shared validation schemas for AKIBEKS Engineering Solutions
const zod_1 = require("zod");
// User schemas
exports.userSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email('Invalid email format'),
    firstName: zod_1.z.string().min(1, 'First name is required').max(100),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(100),
    role: zod_1.z.enum(['admin', 'user', 'client', 'employee']),
    isActive: zod_1.z.boolean().default(true),
    isEmailVerified: zod_1.z.boolean().default(false),
    phoneNumber: zod_1.z.string().regex(/^\+254[0-9]{9}$/, 'Invalid Kenyan phone number').optional(),
    kraPin: zod_1.z.string().regex(/^[A-Z][0-9]{9}[A-Z]$/, 'Invalid KRA PIN format').optional(),
    idNumber: zod_1.z.string().min(7).max(8).optional(),
    county: zod_1.z.string().max(50).optional(),
    profileImage: zod_1.z.string().url().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
exports.createUserSchema = exports.userSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
}).extend({
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters')
});
exports.updateUserSchema = exports.createUserSchema.partial().omit({ password: true });
// Project schemas
exports.projectSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1, 'Title is required').max(200),
    description: zod_1.z.string().min(1, 'Description is required'),
    status: zod_1.z.enum(['planning', 'in_progress', 'completed', 'on_hold']),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']),
    startDate: zod_1.z.string().datetime(),
    estimatedEndDate: zod_1.z.string().datetime(),
    actualEndDate: zod_1.z.string().datetime().optional(),
    budget: zod_1.z.number().positive('Budget must be positive'),
    clientId: zod_1.z.string().uuid(),
    assignedToId: zod_1.z.string().uuid(),
    progress: zod_1.z.number().min(0).max(100),
    location: zod_1.z.string().max(200).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
exports.createProjectSchema = exports.projectSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.updateProjectSchema = exports.createProjectSchema.partial();
// Service schemas
exports.serviceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Name is required').max(200),
    description: zod_1.z.string().min(1, 'Description is required'),
    category: zod_1.z.enum(['design', 'construction', 'consultation', 'maintenance']),
    price: zod_1.z.number().positive('Price must be positive'),
    duration: zod_1.z.string().min(1, 'Duration is required'),
    isActive: zod_1.z.boolean().default(true),
    features: zod_1.z.array(zod_1.z.string()),
    requirements: zod_1.z.array(zod_1.z.string()).optional(),
    deliverables: zod_1.z.array(zod_1.z.string()).optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
exports.createServiceSchema = exports.serviceSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.updateServiceSchema = exports.createServiceSchema.partial();
// Contact submission schemas
exports.contactSubmissionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Name is required').max(255),
    email: zod_1.z.string().email('Invalid email format'),
    phoneNumber: zod_1.z.string().regex(/^\+254[0-9]{9}$/, 'Invalid phone number').optional(),
    company: zod_1.z.string().max(255).optional(),
    serviceInterest: zod_1.z.string().max(100).optional(),
    message: zod_1.z.string().min(1, 'Message is required'),
    source: zod_1.z.string().default('website'),
    status: zod_1.z.enum(['new', 'contacted', 'qualified', 'converted', 'closed']).default('new'),
    ipAddress: zod_1.z.string().ip().optional(),
    userAgent: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
exports.createContactSubmissionSchema = exports.contactSubmissionSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true
});
// Testimonial schemas
exports.testimonialSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Name is required').max(255),
    email: zod_1.z.string().email().optional(),
    company: zod_1.z.string().max(255).optional(),
    position: zod_1.z.string().max(255).optional(),
    message: zod_1.z.string().min(1, 'Message is required'),
    rating: zod_1.z.number().min(1).max(5),
    projectType: zod_1.z.string().max(100).optional(),
    location: zod_1.z.string().max(255).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    approved: zod_1.z.boolean().default(false),
    featured: zod_1.z.boolean().default(false),
    displayOrder: zod_1.z.number().default(0),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
exports.createTestimonialSchema = exports.testimonialSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.updateTestimonialSchema = exports.createTestimonialSchema.partial();
// SEO Configuration schemas
exports.seoConfigurationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    pageUrl: zod_1.z.string().min(1, 'Page URL is required'),
    title: zod_1.z.string().min(1, 'Title is required').max(60),
    description: zod_1.z.string().min(1, 'Description is required').max(160),
    keywords: zod_1.z.array(zod_1.z.string()),
    ogTitle: zod_1.z.string().max(60).optional(),
    ogDescription: zod_1.z.string().max(160).optional(),
    ogImage: zod_1.z.string().url().optional(),
    canonicalUrl: zod_1.z.string().url().optional(),
    robotsDirective: zod_1.z.string().default('index,follow'),
    structuredData: zod_1.z.record(zod_1.z.any()).optional(),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
exports.createSEOConfigurationSchema = exports.seoConfigurationSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
exports.updateSEOConfigurationSchema = exports.createSEOConfigurationSchema.partial();
// Email schemas
exports.emailSchema = zod_1.z.object({
    to: zod_1.z.string().email('Invalid email address'),
    subject: zod_1.z.string().min(1, 'Subject is required'),
    message: zod_1.z.string().min(1, 'Message is required'),
    from: zod_1.z.string().email('Invalid from email').optional(),
    cc: zod_1.z.array(zod_1.z.string().email()).optional(),
    bcc: zod_1.z.array(zod_1.z.string().email()).optional(),
    attachments: zod_1.z.array(zod_1.z.object({
        filename: zod_1.z.string(),
        content: zod_1.z.string(),
        contentType: zod_1.z.string()
    })).optional()
});
exports.emailTemplateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Name is required'),
    subject: zod_1.z.string().min(1, 'Subject is required'),
    htmlContent: zod_1.z.string().min(1, 'HTML content is required'),
    textContent: zod_1.z.string().min(1, 'Text content is required'),
    variables: zod_1.z.array(zod_1.z.string()),
    category: zod_1.z.enum(['welcome', 'notification', 'invoice', 'quotation', 'alert', 'general']),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
exports.createEmailTemplateSchema = exports.emailTemplateSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
// Authentication schemas
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: zod_1.z.string(),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    phoneNumber: zod_1.z.string().regex(/^\+254[0-9]{9}$/, 'Invalid phone number').optional()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
// File upload schemas
exports.fileUploadSchema = zod_1.z.object({
    filename: zod_1.z.string(),
    originalname: zod_1.z.string(),
    mimetype: zod_1.z.string(),
    size: zod_1.z.number().max(5 * 1024 * 1024, 'File too large'), // 5MB max
    buffer: zod_1.z.instanceof(Buffer)
});
// Query parameter schemas
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(10),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
exports.searchSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional()
});
//# sourceMappingURL=index.js.map