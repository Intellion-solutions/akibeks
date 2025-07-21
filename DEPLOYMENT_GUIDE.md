# AKIBEKS Engineering Solutions - Deployment Guide

## 🚀 Project Restructuring Complete

The AKIBEKS Engineering Solutions platform has been successfully restructured for simplified deployment and production readiness. All major components are now integrated and functional.

## ✅ Key Achievements

### 1. **Database Migration & Centralization**
- ✅ Completely removed Supabase dependencies
- ✅ Migrated to PostgreSQL with Drizzle ORM
- ✅ Centralized database credentials in `config.js` for easy editing
- ✅ Simplified database setup with `database-setup.js` for cPanel environments
- ✅ Unified `DatabaseClient` supporting both server and browser environments

### 2. **Web Server Integration**
- ✅ Apache configuration (`config/apache.conf`) with SSL, security headers, rate limiting
- ✅ Nginx configuration (`config/nginx.conf`) with caching, compression, performance optimization
- ✅ Proper reverse proxy setup for React frontend + Express.js backend
- ✅ SEO-friendly SPA routing with fallback handling

### 3. **Consistent UI/UX**
- ✅ All website pages now have consistent Header and Footer
- ✅ Layout component wrapping all public routes
- ✅ Theme provider for dark/light mode support
- ✅ Responsive design for mobile compatibility

### 4. **Enhanced Content**
- ✅ Added 3 new website pages: Sustainability, Innovation, Case Studies
- ✅ Redesigned homepage with modern UI/UX
- ✅ Kenya-specific localization (KES currency, phone validation, counties)
- ✅ Professional contact forms with SMTP integration

### 5. **Production-Ready Backend**
- ✅ Express.js server (`server.cjs`) with security middleware
- ✅ Health check endpoints (`/api/health`, `/api/health/db`)
- ✅ Contact form processing with email notifications
- ✅ SEO endpoints (`/sitemap.xml`, `/robots.txt`)
- ✅ File upload handling and static asset serving

### 6. **Automated Deployment**
- ✅ Complete deployment script (`scripts/deploy.sh`)
- ✅ Support for both Apache and Nginx
- ✅ SSL certificate automation with Certbot
- ✅ Systemd service configuration for backend
- ✅ Firewall setup and security hardening

## 🏗️ Architecture Overview

```
Browser → Web Server (Apache/Nginx:80/443) → React SPA (Static Files)
                                           ↓
                                    API Proxy → Express.js (Port 3000)
                                                     ↓
                                              PostgreSQL Database
```

## 📁 Project Structure

```
/workspace/
├── config/
│   ├── apache.conf          # Apache virtual host configuration
│   ├── nginx.conf           # Nginx server block configuration
│   └── config.js            # Centralized application configuration
├── scripts/
│   └── deploy.sh            # Automated deployment script
├── src/
│   ├── components/layout/   # Header, Footer, Layout components
│   ├── pages/               # Website pages (Index, Services, About, etc.)
│   ├── pages/admin/         # Admin dashboard pages
│   ├── core/                # Core services (database, security, SEO)
│   ├── database/            # Drizzle schemas and connection
│   └── contexts/            # React contexts (Admin, Theme)
├── server.cjs               # Express.js backend server
├── database-setup.js        # Simplified database setup for cPanel
├── .env.example             # Environment variables template
└── dist/                    # Build output directory
```

## 🚀 Deployment Instructions

### Quick Deployment (Automated)

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy with Nginx (recommended)
sudo ./scripts/deploy.sh nginx akibeks.co.ke true

# Deploy with Apache
sudo ./scripts/deploy.sh apache akibeks.co.ke true
```

### Manual Deployment Steps

1. **Server Preparation**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib -y
   ```

2. **Database Setup**
   ```bash
   # Configure database credentials in config.js
   nano config.js
   
   # Run database setup
   node database-setup.js
   ```

3. **Application Build**
   ```bash
   # Install dependencies
   npm install
   
   # Build for production
   npm run build
   ```

4. **Web Server Configuration**
   
   **For Nginx:**
   ```bash
   sudo cp config/nginx.conf /etc/nginx/sites-available/akibeks.conf
   sudo ln -s /etc/nginx/sites-available/akibeks.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl restart nginx
   ```
   
   **For Apache:**
   ```bash
   sudo cp config/apache.conf /etc/apache2/sites-available/akibeks.conf
   sudo a2ensite akibeks.conf
   sudo a2enmod rewrite ssl headers deflate
   sudo systemctl restart apache2
   ```

5. **Backend Service Setup**
   ```bash
   # Create systemd service
   sudo tee /etc/systemd/system/akibeks-backend.service > /dev/null <<EOF
   [Unit]
   Description=AKIBEKS Engineering Backend
   After=network.target
   
   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/akibeks
   ExecStart=/usr/bin/node server.cjs
   Restart=always
   Environment=NODE_ENV=production
   
   [Install]
   WantedBy=multi-user.target
   EOF
   
   sudo systemctl enable akibeks-backend
   sudo systemctl start akibeks-backend
   ```

6. **SSL Certificate**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d akibeks.co.ke -d www.akibeks.co.ke
   ```

## 🔧 Configuration

### Database Configuration (`config.js`)

```javascript
export const DATABASE_CONFIG = {
  host: 'localhost',           // Change for remote database
  port: 5432,
  user: 'akibeks_user',       // Change as needed
  password: 'your_password',   // Change as needed
  database: 'akibeks_db',     // Change as needed
  // ... other settings
};
```

### Environment Variables (`.env`)

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/akibeks_db

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key

# SMTP for contact forms
SMTP_HOST=your_smtp_host
SMTP_USER=your_email@akibeks.co.ke
SMTP_PASS=your_email_password

# Application
DOMAIN=akibeks.co.ke
APP_URL=https://akibeks.co.ke
```

## 🔒 Security Features

- **SSL/TLS Encryption** with automatic HTTPS redirect
- **Security Headers** (HSTS, CSP, X-Frame-Options, etc.)
- **Rate Limiting** on API endpoints and forms
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests
- **Firewall Rules** (UFW) for port management
- **Database Security** with connection pooling and prepared statements

## 📊 Performance Optimizations

- **Gzip/Brotli Compression** for static assets
- **Static File Caching** with proper cache headers
- **API Response Caching** with Nginx proxy cache
- **Database Connection Pooling** with health monitoring
- **Code Splitting** and lazy loading for React components
- **Image Optimization** and WebP support

## 🇰🇪 Kenya-Specific Features

- **Currency**: Kenyan Shilling (KES) formatting
- **Phone Numbers**: +254 validation and formatting
- **Geography**: Counties, cities, postal codes
- **Business**: KRA PIN, ID number validation
- **Timezone**: Africa/Nairobi
- **Tax**: 16% VAT calculations

## 🔍 SEO Optimizations

- **Dynamic Meta Tags** for each page
- **Structured Data** (Schema.org) for local business
- **XML Sitemaps** with automatic generation
- **Robots.txt** with proper directives
- **Canonical URLs** to prevent duplicate content
- **Open Graph** tags for social media
- **Page Speed** optimizations

## 📱 Mobile & PWA Features

- **Responsive Design** for all screen sizes
- **Progressive Web App** (PWA) capabilities
- **Service Worker** for offline functionality
- **App Manifest** for home screen installation
- **Touch-friendly** interface and navigation

## 🚨 Monitoring & Maintenance

### Health Checks
- **Application Health**: `https://akibeks.co.ke/api/health`
- **Database Health**: `https://akibeks.co.ke/api/health/db`

### Log Monitoring
- **Application Logs**: `/var/log/akibeks/`
- **Web Server Logs**: `/var/log/nginx/` or `/var/log/apache2/`
- **System Logs**: `journalctl -u akibeks-backend`

### Database Backup
```bash
# Automated daily backup
pg_dump akibeks_db > backup_$(date +%Y%m%d).sql
```

## 🎯 Admin Panel Access

- **URL**: `https://akibeks.co.ke/admin`
- **PWA**: Can be installed as a standalone app
- **Features**: Projects, Services, Users, Calendar, Invoices, Analytics

## 🤝 Support & Maintenance

For technical support or maintenance requests:

- **Documentation**: This deployment guide
- **Configuration**: Centralized in `config.js`
- **Logs**: Structured logging for debugging
- **Monitoring**: Health checks and performance metrics

---

## 🎉 Deployment Complete!

Your AKIBEKS Engineering Solutions platform is now fully deployed and production-ready with:

✅ **Professional Website** with modern UI/UX
✅ **Admin Dashboard** for complete management
✅ **PostgreSQL Database** with optimized performance
✅ **Security Hardening** following best practices
✅ **SEO Optimization** for Kenya market
✅ **Mobile Responsiveness** and PWA features
✅ **Automated Deployment** for easy updates

The platform is designed for Kenya's construction industry with proper localization, currency formatting, and business integrations. All components are production-tested and ready for high-traffic usage.