#!/usr/bin/env node

/**
 * AKIBEKS Engineering Solutions - Backend Server
 * Express.js server that serves API endpoints and integrates with PostgreSQL
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.google-analytics.com"],
      connectSrc: ["'self'", "wss:", "ws:"],
      frameSrc: ["'self'", "https://www.google.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:5173',
      'http://localhost:8080',
      'https://akibeks.co.ke',
      'https://www.akibeks.co.ke'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true' || true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    // Import database connection
    const { checkDatabaseHealth } = require('./src/database/connection');
    const healthStatus = await checkDatabaseHealth();
    
    res.json({
      status: 'healthy',
      database: healthStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// SEO endpoints
app.get('/sitemap.xml', async (req, res) => {
  try {
    const { SEOService } = require('./src/core/seo-service');
    const seoService = new SEOService();
    const sitemap = await seoService.generateSitemap();
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/sitemap-:type.xml', async (req, res) => {
  try {
    const { SEOService } = require('./src/core/seo-service');
    const seoService = new SEOService();
    const { type } = req.params;
    
    let sitemap;
    switch (type) {
      case 'services':
        sitemap = await seoService.generateServicesSitemap();
        break;
      case 'projects':
        sitemap = await seoService.generateProjectsSitemap();
        break;
      case 'images':
        sitemap = await seoService.generateImageSitemap();
        break;
      case 'videos':
        sitemap = await seoService.generateVideoSitemap();
        break;
      default:
        return res.status(404).send('Sitemap not found');
    }
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error(`Sitemap ${req.params.type} generation error:`, error);
    res.status(500).send('Internal server error');
  }
});

app.get('/robots.txt', async (req, res) => {
  try {
    const { SEOService } = require('./src/core/seo-service');
    const seoService = new SEOService();
    const robotsTxt = await seoService.generateRobotsTxt();
    
    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    console.error('Robots.txt generation error:', error);
    res.status(500).send('Internal server error');
  }
});

// API routes
app.use('/api/seo', require('./src/api/seo-routes'));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Name, email, and message are required'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }
    
    // Save to database (if database client is available)
    try {
      const { dbClient } = require('./src/core/database-client');
      await dbClient.insert('contactSubmissions', {
        name,
        email,
        phone: phone || null,
        subject: subject || 'General Inquiry',
        message,
        status: 'new',
        submittedAt: new Date().toISOString()
      });
    } catch (dbError) {
      console.warn('Failed to save contact form to database:', dbError.message);
    }
    
    // Send email notification (if SMTP is configured)
    try {
      const { SMTPService } = require('./src/lib/smtp-service');
      const smtpService = new SMTPService();
      
      await smtpService.sendContactFormNotification({
        name,
        email,
        phone,
        subject,
        message
      });
    } catch (emailError) {
      console.warn('Failed to send email notification:', emailError.message);
    }
    
    res.json({
      success: true,
      message: 'Contact form submitted successfully'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to process contact form'
    });
  }
});

// File upload endpoint
app.post('/api/upload', (req, res) => {
  // Placeholder for file upload functionality
  res.status(501).json({
    error: 'File upload not implemented yet'
  });
});

// Authentication endpoints (placeholder)
app.post('/api/auth/login', (req, res) => {
  res.status(501).json({
    error: 'Authentication not implemented yet'
  });
});

app.post('/api/auth/register', (req, res) => {
  res.status(501).json({
    error: 'Authentication not implemented yet'
  });
});

// Serve static files in production
if (NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, 'dist');
  
  // Serve static files
  app.use(express.static(staticPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for HTML
      } else if (path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for assets
      }
    }
  }));
  
  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application not built. Please run "npm run build" first.');
    }
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  // Don't leak error details in production
  const message = NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;
  
  res.status(error.status || 500).json({
    error: message,
    ...(NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 AKIBEKS Engineering Solutions Backend Server
📍 Environment: ${NODE_ENV}
🌐 Server running on port ${PORT}
📊 Health check: http://localhost:${PORT}/api/health
🔧 Database health: http://localhost:${PORT}/api/health/db
📱 Frontend: ${NODE_ENV === 'production' ? `http://localhost:${PORT}` : 'Run "npm run dev" separately'}
  `);
});

module.exports = app;