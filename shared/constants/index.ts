// Shared constants for AKIBEKS Engineering Solutions

export const APP_CONFIG = {
  name: 'AKIBEKS Engineering Solutions',
  url: process.env.APP_URL || 'https://akibeks.co.ke',
  contact: {
    email: 'info@akibeks.co.ke',
    phone: '+254 700 000 000',
    address: 'Nairobi, Kenya',
    workingHours: 'Mon-Fri 8:00 AM - 6:00 PM EAT'
  },
  social: {
    facebook: 'https://facebook.com/akibeksengineering',
    twitter: 'https://twitter.com/akibekseng',
    linkedin: 'https://linkedin.com/company/akibeks',
    instagram: 'https://instagram.com/akibeksengineering'
  },
  kenya: {
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    vatRate: 0.16,
    language: 'en-KE'
  }
};

export const PAGES_CONFIG = {
  navigation: [
    { name: 'Home', path: '/', exact: true },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Innovation', path: '/innovation' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: 'Sustainability', path: '/sustainability' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' }
  ],
  footer: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Careers', path: '/careers' },
    { name: 'News', path: '/news' },
    { name: 'FAQ', path: '/faq' }
  ]
};

export const DATABASE_TABLES = {
  USERS: 'users',
  PROJECTS: 'projects',
  SERVICES: 'services',
  CONTACT_SUBMISSIONS: 'contactSubmissions',
  TESTIMONIALS: 'testimonials',
  SEO_CONFIGURATIONS: 'seoConfigurations',
  SESSIONS: 'sessions',
  ACTIVITY_LOGS: 'activityLogs',
  ERROR_LOGS: 'errorLogs'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  CLIENT: 'client',
  EMPLOYEE: 'employee'
} as const;

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold'
} as const;

export const PROJECT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export const SERVICE_CATEGORIES = {
  DESIGN: 'design',
  CONSTRUCTION: 'construction',
  CONSULTATION: 'consultation',
  MAINTENANCE: 'maintenance'
} as const;

export const CONTACT_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  CONVERTED: 'converted',
  CLOSED: 'closed'
} as const;

export const EMAIL_CATEGORIES = {
  WELCOME: 'welcome',
  NOTIFICATION: 'notification',
  INVOICE: 'invoice',
  QUOTATION: 'quotation',
  ALERT: 'alert',
  GENERAL: 'general'
} as const;

export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  DELIVERED: 'delivered',
  BOUNCED: 'bounced'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+254[0-9]{9}$/,
  KRA_PIN_REGEX: /^[A-Z][0-9]{9}[A-Z]$/,
  PASSWORD_MIN_LENGTH: 8,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
};

export const CACHE_KEYS = {
  USER_SESSION: 'user_session',
  PROJECTS: 'projects',
  SERVICES: 'services',
  TESTIMONIALS: 'testimonials',
  SEO_CONFIG: 'seo_config'
} as const;

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid Kenyan phone number (+254XXXXXXXXX)',
  INVALID_KRA_PIN: 'Please enter a valid KRA PIN',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  REQUIRED_FIELD: 'This field is required',
  FILE_TOO_LARGE: 'File size must be less than 5MB',
  INVALID_FILE_TYPE: 'Invalid file type',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'An internal error occurred. Please try again later.'
} as const;