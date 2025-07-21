# Web Server Setup for AKIBEKS Engineering Solutions

This document provides comprehensive instructions for setting up Apache or Nginx to serve the AKIBEKS Engineering Solutions project management platform.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Apache Setup](#apache-setup)
4. [Nginx Setup](#nginx-setup)
5. [Automated Deployment](#automated-deployment)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Security Configuration](#security-configuration)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Troubleshooting](#troubleshooting)

## Project Overview

AKIBEKS Engineering Solutions is a comprehensive project management platform built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based with bcrypt password hashing
- **Features**: Project management, invoicing, quotations, admin panel, PWA support

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Web Server    │    │   Node.js    │    │   PostgreSQL    │
│ (Apache/Nginx)  │───▶│   Backend    │───▶│    Database     │
│                 │    │  (Port 3000) │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Static Files   │
│   (React SPA)   │
│     /dist       │
└─────────────────┘
```

### Communication Flow

1. **Browser** → **Web Server** (Apache/Nginx on ports 80/443)
2. **Web Server** → **Static Files** (React SPA from `/dist` directory)
3. **Browser** → **Web Server** → **Backend API** (Express.js on port 3000)
4. **Backend API** → **PostgreSQL Database** (Direct connection via Drizzle ORM)

## Apache Setup

### Prerequisites

```bash
sudo apt update
sudo apt install apache2
sudo a2enmod rewrite ssl headers proxy proxy_http proxy_wstunnel deflate expires
```

### Configuration

1. **Copy the Apache configuration**:
   ```bash
   sudo cp config/apache.conf /etc/apache2/sites-available/akibeks.conf
   ```

2. **Enable the site**:
   ```bash
   sudo a2ensite akibeks.conf
   sudo a2dissite 000-default.conf
   ```

3. **Test configuration**:
   ```bash
   sudo apache2ctl configtest
   ```

4. **Restart Apache**:
   ```bash
   sudo systemctl restart apache2
   sudo systemctl enable apache2
   ```

### Key Apache Features

- **SSL/TLS termination** with modern cipher suites
- **HTTP/2 support** for improved performance
- **Gzip compression** for static assets
- **Security headers** (HSTS, CSP, X-Frame-Options, etc.)
- **Rate limiting** with mod_evasive
- **Proxy configuration** for API endpoints
- **SPA routing** support with mod_rewrite

## Nginx Setup

### Prerequisites

```bash
sudo apt update
sudo apt install nginx
```

### Configuration

1. **Copy the Nginx configuration**:
   ```bash
   sudo cp config/nginx.conf /etc/nginx/sites-available/akibeks.conf
   ```

2. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/akibeks.conf /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   ```

3. **Test configuration**:
   ```bash
   sudo nginx -t
   ```

4. **Restart Nginx**:
   ```bash
   sudo systemctl restart nginx
   sudo systemctl enable nginx
   ```

### Key Nginx Features

- **High-performance static file serving**
- **Advanced rate limiting** with multiple zones
- **Upstream load balancing** support
- **Proxy caching** for API responses
- **WebSocket support** for real-time features
- **Brotli compression** support (if enabled)
- **Advanced security headers**

## Automated Deployment

The project includes an automated deployment script that handles both Apache and Nginx setups.

### Usage

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy with Nginx (default)
sudo ./scripts/deploy.sh nginx akibeks.co.ke true

# Deploy with Apache
sudo ./scripts/deploy.sh apache akibeks.co.ke true

# Deploy without SSL
sudo ./scripts/deploy.sh nginx akibeks.co.ke false
```

### What the Script Does

1. **System Requirements Check**: Verifies Node.js, npm, PostgreSQL
2. **Backup Creation**: Creates timestamped backups of existing deployments
3. **Web Server Setup**: Installs and configures Apache or Nginx
4. **Application Deployment**: Copies files, installs dependencies, builds application
5. **Database Setup**: Runs migrations and schema updates
6. **SSL Certificate Setup**: Uses Let's Encrypt for automatic HTTPS
7. **Service Configuration**: Sets up systemd services for the backend
8. **Security Configuration**: Configures firewall and monitoring
9. **Health Checks**: Verifies all components are working

## SSL/TLS Configuration

### Automatic SSL with Let's Encrypt

The deployment script automatically sets up SSL certificates using Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache python3-certbot-nginx

# Generate certificates (done automatically by deploy script)
sudo certbot --nginx -d akibeks.co.ke -d www.akibeks.co.ke
```

### Manual SSL Setup

1. **Obtain SSL certificates** from your certificate authority
2. **Place certificates** in the configured paths:
   - Certificate: `/etc/ssl/certs/akibeks.co.ke.crt`
   - Private Key: `/etc/ssl/private/akibeks.co.ke.key`
   - Chain: `/etc/ssl/certs/akibeks.co.ke.chain.crt`

3. **Update permissions**:
   ```bash
   sudo chmod 644 /etc/ssl/certs/akibeks.co.ke.crt
   sudo chmod 600 /etc/ssl/private/akibeks.co.ke.key
   sudo chmod 644 /etc/ssl/certs/akibeks.co.ke.chain.crt
   ```

## Performance Optimization

### Static File Caching

Both configurations include optimized caching:

- **CSS/JS/Images**: 1 year cache with immutable flag
- **HTML files**: 1 hour cache with must-revalidate
- **API responses**: 10 minutes cache for GET requests

### Compression

- **Gzip compression** for text-based files
- **Brotli compression** support (Nginx)
- **Pre-compressed file serving** for static assets

### HTTP/2 Support

Both servers are configured with HTTP/2 for:
- **Multiplexed connections**
- **Header compression**
- **Server push** capabilities

## Security Configuration

### Security Headers

Both configurations include comprehensive security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [comprehensive policy]
```

### Rate Limiting

- **API endpoints**: 10 requests/second per IP
- **Authentication**: 5 requests/minute per IP
- **General requests**: 2 requests/second per IP

### Access Control

- **Sensitive files**: Blocked (.env, .git, logs, etc.)
- **Directory listing**: Disabled
- **File upload limits**: 10MB maximum

## Monitoring and Logging

### Log Files

- **Apache**:
  - Access: `/var/log/apache2/akibeks_access.log`
  - Error: `/var/log/apache2/akibeks_error.log`
  - SSL: `/var/log/apache2/akibeks_ssl_access.log`

- **Nginx**:
  - Access: `/var/log/nginx/akibeks_access.log`
  - Error: `/var/log/nginx/akibeks_error.log`

- **Application**:
  - Backend: `/var/log/akibeks/backend.log`
  - Database: `/var/log/akibeks/database.log`

### Log Rotation

Automatic log rotation is configured via logrotate:

```bash
# View logrotate configuration
cat /etc/logrotate.d/akibeks
```

### Health Checks

- **Application Health**: `https://yourdomain.com/api/health`
- **Database Health**: `https://yourdomain.com/api/health/db`
- **Server Status**: Monitor via web server status modules

## Environment Configuration

### Required Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Key variables for web server integration:

```env
# Application
NODE_ENV=production
PORT=3000
VITE_APP_URL=https://akibeks.co.ke

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/akibeks_db

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-32-char-key

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_USER=noreply@akibeks.co.ke
SMTP_PASS=your-app-password
```

## Troubleshooting

### Common Issues

1. **503 Service Unavailable**
   - Check if backend service is running: `systemctl status akibeks-backend`
   - Verify database connection: `curl localhost:3000/api/health/db`

2. **Static Files Not Loading**
   - Verify build directory exists: `ls -la /var/www/akibeks/dist/`
   - Check file permissions: `ls -la /var/www/akibeks/`

3. **SSL Certificate Issues**
   - Check certificate validity: `openssl x509 -in /etc/ssl/certs/akibeks.co.ke.crt -text -noout`
   - Verify certificate chain: `openssl verify -CAfile /etc/ssl/certs/akibeks.co.ke.chain.crt /etc/ssl/certs/akibeks.co.ke.crt`

4. **Database Connection Errors**
   - Test database connection: `psql $DATABASE_URL -c "SELECT 1;"`
   - Check PostgreSQL service: `systemctl status postgresql`

### Debug Commands

```bash
# Check web server status
systemctl status apache2  # or nginx
systemctl status akibeks-backend

# View recent logs
journalctl -u apache2 -f  # or nginx
journalctl -u akibeks-backend -f

# Test configuration
apache2ctl configtest  # or nginx -t

# Check ports
netstat -tlnp | grep :80
netstat -tlnp | grep :443
netstat -tlnp | grep :3000

# Test endpoints
curl -I http://localhost/
curl -I http://localhost/api/health
curl -I https://yourdomain.com/api/health/db
```

### Performance Testing

```bash
# Test static file serving
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com/

# Load testing with Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/

# Check compression
curl -H "Accept-Encoding: gzip" -I https://yourdomain.com/
```

## Maintenance

### Regular Tasks

1. **Update SSL certificates** (automated with Let's Encrypt)
2. **Monitor log file sizes** and rotation
3. **Check for security updates** for web server and dependencies
4. **Backup database** and application files
5. **Monitor performance metrics** and optimize as needed

### Update Procedure

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build application
npm run build

# Restart services
sudo systemctl restart akibeks-backend
sudo systemctl reload apache2  # or nginx
```

## Support

For additional support or questions:

- **Documentation**: Check project README and other markdown files
- **Logs**: Always check application and web server logs first
- **Health Checks**: Use built-in health endpoints for diagnostics
- **Configuration**: Verify all environment variables are set correctly

---

**Note**: This setup provides a production-ready configuration with security, performance, and monitoring built-in. Always test changes in a staging environment before applying to production.