/**
 * AKIBEKS Engineering Solutions - Configuration
 * Simple configuration file for easy deployment and editing
 */

// Database Configuration (Edit these values for your hosting panel)
export const DATABASE_CONFIG = {
  // cPanel PostgreSQL Database Settings
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'akibeks_db',
  username: process.env.DB_USER || 'akibeks_user',
  password: process.env.DB_PASS || 'your_database_password',
  
  // Connection settings
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum number of connections
  min: 2,  // Minimum number of connections
  
  // Full connection URL (will be constructed automatically)
  get url() {
    return `postgresql://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}`;
  }
};

// Application Configuration
export const APP_CONFIG = {
  // Basic App Settings
  name: 'AKIBEKS Engineering Solutions',
  url: process.env.APP_URL || 'https://akibeks.co.ke',
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  
  // Contact Information
  contact: {
    email: 'info@akibeks.co.ke',
    phone: '+254 700 000 000',
    address: 'Nairobi, Kenya',
    workingHours: 'Mon-Fri 8:00 AM - 6:00 PM EAT'
  },
  
  // Social Media
  social: {
    facebook: 'https://facebook.com/akibeksengineering',
    twitter: 'https://twitter.com/akibekseng',
    linkedin: 'https://linkedin.com/company/akibeks',
    instagram: 'https://instagram.com/akibeksengineering'
  },
  
  // Kenya Specific Settings
  kenya: {
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    vatRate: 0.16, // 16% VAT
    language: 'en-KE'
  }
};

// Email Configuration (for contact forms)
export const EMAIL_CONFIG = {
  smtp: {
    host: process.env.SMTP_HOST || 'mail.akibeks.co.ke',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'noreply@akibeks.co.ke',
      pass: process.env.SMTP_PASS || 'your_email_password'
    }
  },
  
  // Email addresses
  addresses: {
    from: 'noreply@akibeks.co.ke',
    to: 'info@akibeks.co.ke',
    support: 'support@akibeks.co.ke'
  }
};

// Security Configuration
export const SECURITY_CONFIG = {
  // JWT Settings
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-this-in-production',
    expiresIn: '7d'
  },
  
  // Password settings
  password: {
    saltRounds: 12,
    minLength: 8
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
  uploadDir: './uploads'
};

// SEO Configuration
export const SEO_CONFIG = {
  defaultTitle: 'AKIBEKS Engineering Solutions - Leading Construction Company in Kenya',
  defaultDescription: 'Professional construction and engineering services across Kenya. Quality building, renovation, and infrastructure development.',
  defaultKeywords: ['construction Kenya', 'engineering services', 'building contractors', 'renovation Kenya'],
  siteName: 'AKIBEKS Engineering Solutions',
  twitterHandle: '@akibekseng',
  facebookPage: 'akibeksengineering'
};

// Website Pages Configuration
export const PAGES_CONFIG = {
  // Main navigation pages
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
  
  // Footer pages
  footer: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Careers', path: '/careers' },
    { name: 'News', path: '/news' },
    { name: 'FAQ', path: '/faq' }
  ]
};

export default {
  DATABASE_CONFIG,
  APP_CONFIG,
  EMAIL_CONFIG,
  SECURITY_CONFIG,
  UPLOAD_CONFIG,
  SEO_CONFIG,
  PAGES_CONFIG
};