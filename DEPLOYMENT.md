# 🚀 Deployment & Hosting Guide

This comprehensive guide covers everything you need to deploy and host your Project Management Platform in production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Application Configuration](#application-configuration)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [VPS/Dedicated Server](#vpsdedicated-server)
  - [Cloud Platforms](#cloud-platforms)
  - [Kubernetes](#kubernetes)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Performance Optimization](#performance-optimization)
- [Security Hardening](#security-hardening)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Scaling Strategies](#scaling-strategies)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- Network: 100 Mbps

**Recommended Requirements:**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 50GB+ SSD
- Network: 1 Gbps

### Software Dependencies

- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v12.0 or higher
- **Redis**: v6.0 or higher (optional, for caching)
- **Nginx**: v1.18 or higher (recommended reverse proxy)
- **Docker**: v20.0 or higher (for containerized deployment)

## 🌍 Environment Setup

### 1. Create Production Environment File

Create a `.env.production` file in your project root:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/project_management_prod
DB_HOST=localhost
DB_PORT=5432
DB_NAME=project_management_prod
DB_USER=pm_user
DB_PASSWORD=your_secure_password_here

# Application Configuration
NODE_ENV=production
PORT=3000
APP_NAME=Project Management System
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Security Configuration
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=7d
SESSION_SECRET=your_secure_session_secret
ENCRYPTION_KEY=your_32_character_encryption_key

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# File Storage Configuration
UPLOAD_PATH=/var/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,xls,xlsx

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/pm-system.log

# Security Headers
FORCE_HTTPS=true
HSTS_MAX_AGE=31536000
CSP_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Backup Configuration
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_LOCATION=/var/backups/pm-system
```

### 2. Secure Environment Variables

```bash
# Set proper permissions
chmod 600 .env.production

# Ensure only the application user can read the file
chown pm-user:pm-user .env.production
```

## 🗄️ Database Setup

### 1. PostgreSQL Installation & Configuration

#### Ubuntu/Debian:
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE project_management_prod;
CREATE USER pm_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE project_management_prod TO pm_user;
ALTER USER pm_user CREATEDB;
\q
EOF
```

#### CentOS/RHEL:
```bash
# Install PostgreSQL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configure PostgreSQL
sudo -u postgres psql << EOF
CREATE DATABASE project_management_prod;
CREATE USER pm_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE project_management_prod TO pm_user;
ALTER USER pm_user CREATEDB;
\q
EOF
```

### 2. Database Security Configuration

Edit PostgreSQL configuration:

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/12/main/postgresql.conf
```

Key security settings:
```conf
# Connection Settings
listen_addresses = 'localhost'
port = 5432
max_connections = 100

# Security Settings
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'

# Logging
log_statement = 'mod'
log_min_duration_statement = 1000
log_connections = on
log_disconnections = on

# Performance
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
```

Configure client authentication:
```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/12/main/pg_hba.conf
```

Add secure authentication rules:
```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

### 3. Initialize Database Schema

```bash
# Run database migrations
psql -U pm_user -d project_management_prod -f database_schema.sql

# Verify database setup
psql -U pm_user -d project_management_prod -c "\dt"
```

## ⚙️ Application Configuration

### 1. Install Dependencies

```bash
# Install production dependencies
npm ci --only=production

# Build the application
npm run build
```

### 2. Create System User

```bash
# Create dedicated user for the application
sudo useradd -m -s /bin/bash pm-user
sudo usermod -aG sudo pm-user

# Create application directories
sudo mkdir -p /opt/pm-system
sudo mkdir -p /var/log/pm-system
sudo mkdir -p /var/uploads/pm-system
sudo mkdir -p /var/backups/pm-system

# Set ownership
sudo chown -R pm-user:pm-user /opt/pm-system
sudo chown -R pm-user:pm-user /var/log/pm-system
sudo chown -R pm-user:pm-user /var/uploads/pm-system
sudo chown -R pm-user:pm-user /var/backups/pm-system
```

### 3. Copy Application Files

```bash
# Copy built application
sudo cp -r dist/* /opt/pm-system/
sudo cp package.json /opt/pm-system/
sudo cp .env.production /opt/pm-system/.env

# Install dependencies in production location
cd /opt/pm-system
sudo -u pm-user npm ci --only=production
```

## 🐳 Deployment Options

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache postgresql-client

# Create application user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S pm-user -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=pm-user:nodejs /app/dist ./dist
COPY --from=builder --chown=pm-user:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=pm-user:nodejs /app/package.json ./

# Create required directories
RUN mkdir -p /var/uploads /var/log /var/backups
RUN chown -R pm-user:nodejs /var/uploads /var/log /var/backups

# Switch to non-root user
USER pm-user

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "dist/main.js"]
```

### 2. Create Docker Compose Configuration

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    volumes:
      - uploads:/var/uploads
      - logs:/var/log
      - backups:/var/backups
    networks:
      - pm-network

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: project_management_prod
      POSTGRES_USER: pm_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database_schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped
    networks:
      - pm-network
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - pm-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - uploads:/var/uploads:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - pm-network

volumes:
  postgres_data:
  redis_data:
  uploads:
  logs:
  backups:

networks:
  pm-network:
    driver: bridge
```

### 3. Deploy with Docker

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale application instances
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

## VPS/Dedicated Server

### 1. Create Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/pm-system.service
```

```ini
[Unit]
Description=Project Management System
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=pm-user
Group=pm-user
WorkingDirectory=/opt/pm-system
Environment=NODE_ENV=production
EnvironmentFile=/opt/pm-system/.env
ExecStart=/usr/bin/node dist/main.js
ExecReload=/bin/kill -USR1 $MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=pm-system

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/uploads/pm-system /var/log/pm-system /var/backups/pm-system

[Install]
WantedBy=multi-user.target
```

### 2. Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/pm-system
```

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

# Upstream servers
upstream pm_backend {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    # Add more servers for load balancing
    # server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-src 'none';" always;
    
    # Gzip compression
    gzip on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/atom+xml image/svg+xml;
    
    # Client body size
    client_max_body_size 10M;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Static files
    location /static/ {
        alias /opt/pm-system/dist/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Uploads
    location /uploads/ {
        alias /var/uploads/pm-system/;
        expires 30d;
        add_header Cache-Control "public";
        
        # Security for uploaded files
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }
    
    # API endpoints with rate limiting
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://pm_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://pm_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://pm_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend application
    location / {
        proxy_pass http://pm_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://pm_backend;
    }
}
```

### 3. Enable and Start Services

```bash
# Enable Nginx site
sudo ln -s /etc/nginx/sites-available/pm-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Enable and start PM system
sudo systemctl enable pm-system
sudo systemctl start pm-system

# Check status
sudo systemctl status pm-system
sudo journalctl -u pm-system -f
```

## ☁️ Cloud Platforms

### AWS Deployment

#### 1. Using AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init pm-system --region us-east-1 --platform node.js

# Create environment
eb create production --cname pm-system-prod

# Deploy
eb deploy
```

#### 2. Using AWS ECS with Fargate

```yaml
# ecs-task-definition.json
{
  "family": "pm-system",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "pm-system",
      "image": "your-account.dkr.ecr.region.amazonaws.com/pm-system:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:pm-system/database"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/pm-system",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Platform

```yaml
# app.yaml for App Engine
runtime: nodejs18

env_variables:
  NODE_ENV: production
  DATABASE_URL: postgresql://user:pass@/db?host=/cloudsql/project:region:instance

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.7

resources:
  cpu: 1
  memory_gb: 2

handlers:
- url: /static
  static_dir: dist/static
  
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
```

### Azure Deployment

```yaml
# azure-pipelines.yml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '18.x'
  azureSubscription: 'your-subscription'
  appName: 'pm-system'

stages:
- stage: Build
  jobs:
  - job: BuildAndTest
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
    - script: npm ci
    - script: npm run build
    - script: npm test
    - task: ArchiveFiles@2
      inputs:
        rootFolderOrFile: '$(System.DefaultWorkingDirectory)'
        includeRootFolder: false
        archiveFile: '$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip'
    - task: PublishBuildArtifacts@1

- stage: Deploy
  dependsOn: Build
  jobs:
  - deployment: DeployToProduction
    environment: production
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            inputs:
              azureSubscription: $(azureSubscription)
              appName: $(appName)
              package: '$(Pipeline.Workspace)/**/*.zip'
```

## 🔒 SSL/TLS Configuration

### 1. Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Setup automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 2. Manual SSL Certificate

```bash
# Generate private key
openssl genrsa -out yourdomain.com.key 2048

# Generate certificate signing request
openssl req -new -key yourdomain.com.key -out yourdomain.com.csr

# Install certificate (after receiving from CA)
sudo cp yourdomain.com.crt /etc/ssl/certs/
sudo cp yourdomain.com.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/yourdomain.com.key
```

## 🚀 Performance Optimization

### 1. Node.js Optimization

```javascript
// pm2.config.js
module.exports = {
  apps: [{
    name: 'pm-system',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '1G',
    node_args: [
      '--max-old-space-size=1024',
      '--optimize-for-size'
    ],
    error_file: '/var/log/pm-system/error.log',
    out_file: '/var/log/pm-system/out.log',
    log_file: '/var/log/pm-system/combined.log',
    time: true
  }]
};
```

```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start pm2.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### 2. Database Optimization

```sql
-- PostgreSQL performance tuning
-- postgresql.conf optimizations

-- Memory settings
shared_buffers = 256MB                # 25% of RAM
effective_cache_size = 1GB            # 75% of RAM
work_mem = 4MB
maintenance_work_mem = 64MB

-- Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

-- Connection settings
max_connections = 100

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_projects_status_created ON projects(status, created_at);
CREATE INDEX CONCURRENTLY idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX CONCURRENTLY idx_time_entries_user_date ON time_entries(user_id, date);
CREATE INDEX CONCURRENTLY idx_invoices_client_status ON invoices(client_id, status);

-- Analyze tables for better query planning
ANALYZE;
```

### 3. Caching Strategy

```javascript
// Redis caching configuration
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Cache frequently accessed data
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      const originalSend = res.json;
      res.json = function(data) {
        client.setex(key, duration, JSON.stringify(data));
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};
```

## 🛡️ Security Hardening

### 1. Application Security

```javascript
// security.js - Express security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Request body size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### 2. System Security

```bash
# Firewall configuration (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp  # PostgreSQL (if needed externally)
sudo ufw enable

# Fail2ban configuration
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit jail.local
sudo nano /etc/fail2ban/jail.local
```

```ini
# jail.local
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
```

### 3. Automated Security Updates

```bash
# Setup unattended upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure automatic security updates
echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades
echo 'Unattended-Upgrade::Remove-Unused-Dependencies "true";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```javascript
// monitoring.js
const prometheus = require('prom-client');

// Create metrics
const httpDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const httpTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Middleware to collect metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpDuration.observe(
      { method: req.method, route, status: res.statusCode },
      duration
    );
    
    httpTotal.inc({
      method: req.method,
      route,
      status: res.statusCode
    });
  });
  
  next();
};

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  const metrics = await prometheus.register.metrics();
  res.end(metrics);
});
```

### 2. Logging Configuration

```javascript
// logger.js
const winston = require('winston');
const { format } = winston;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'pm-system' },
  transports: [
    new winston.transports.File({
      filename: '/var/log/pm-system/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: '/var/log/pm-system/combined.log'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Request logging middleware
const requestLogger = (req, res, next) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
};

module.exports = { logger, requestLogger };
```

### 3. Log Rotation

```bash
# Setup logrotate
sudo nano /etc/logrotate.d/pm-system
```

```
/var/log/pm-system/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 pm-user pm-user
    postrotate
        systemctl reload pm-system
    endscript
}
```

## 💾 Backup & Recovery

### 1. Database Backup Script

```bash
#!/bin/bash
# backup-database.sh

# Configuration
DB_NAME="project_management_prod"
DB_USER="pm_user"
BACKUP_DIR="/var/backups/pm-system"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql.gz"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Database backup completed successfully: $BACKUP_FILE"
    
    # Upload to cloud storage (optional)
    # aws s3 cp $BACKUP_FILE s3://your-backup-bucket/database/
    
    # Remove old backups
    find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    echo "Old backups cleaned up (retention: $RETENTION_DAYS days)"
else
    echo "Database backup failed!"
    exit 1
fi
```

### 2. Application Backup Script

```bash
#!/bin/bash
# backup-application.sh

# Configuration
APP_DIR="/opt/pm-system"
UPLOADS_DIR="/var/uploads/pm-system"
BACKUP_DIR="/var/backups/pm-system"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" -C "$APP_DIR" .
echo "Application backup completed: app_backup_$DATE.tar.gz"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" -C "$UPLOADS_DIR" .
echo "Uploads backup completed: uploads_backup_$DATE.tar.gz"

# Remove old backups
find $BACKUP_DIR -name "*_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "Old backups cleaned up"
```

### 3. Automated Backup with Cron

```bash
# Setup cron jobs
sudo crontab -e -u pm-user
```

```cron
# Database backup every day at 2 AM
0 2 * * * /opt/pm-system/scripts/backup-database.sh

# Application backup every week on Sunday at 3 AM
0 3 * * 0 /opt/pm-system/scripts/backup-application.sh

# System health check every 5 minutes
*/5 * * * * /opt/pm-system/scripts/health-check.sh
```

### 4. Disaster Recovery Plan

```bash
#!/bin/bash
# restore-from-backup.sh

# Configuration
BACKUP_DIR="/var/backups/pm-system"
DB_NAME="project_management_prod"
DB_USER="pm_user"

# Find latest backup
LATEST_DB_BACKUP=$(ls -t $BACKUP_DIR/db_backup_*.sql.gz | head -1)
LATEST_APP_BACKUP=$(ls -t $BACKUP_DIR/app_backup_*.tar.gz | head -1)
LATEST_UPLOADS_BACKUP=$(ls -t $BACKUP_DIR/uploads_backup_*.tar.gz | head -1)

echo "Restoring from backups..."
echo "Database: $LATEST_DB_BACKUP"
echo "Application: $LATEST_APP_BACKUP"
echo "Uploads: $LATEST_UPLOADS_BACKUP"

# Stop application
sudo systemctl stop pm-system

# Restore database
echo "Restoring database..."
gunzip -c $LATEST_DB_BACKUP | psql -U $DB_USER -h localhost $DB_NAME

# Restore application
echo "Restoring application files..."
rm -rf /opt/pm-system/*
tar -xzf $LATEST_APP_BACKUP -C /opt/pm-system

# Restore uploads
echo "Restoring uploads..."
rm -rf /var/uploads/pm-system/*
tar -xzf $LATEST_UPLOADS_BACKUP -C /var/uploads/pm-system

# Set permissions
chown -R pm-user:pm-user /opt/pm-system
chown -R pm-user:pm-user /var/uploads/pm-system

# Start application
sudo systemctl start pm-system

echo "Restore completed!"
```

## 📈 Scaling Strategies

### 1. Horizontal Scaling with Load Balancer

```nginx
# nginx-load-balancer.conf
upstream pm_backend {
    least_conn;
    server 10.0.1.10:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL configuration...
    
    location / {
        proxy_pass http://pm_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Session affinity (if needed)
        # ip_hash;
    }
}
```

### 2. Database Scaling

```sql
-- Read replicas configuration
-- On master server
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 3;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'cp %p /var/lib/postgresql/archive/%f';

-- Create replication user
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'your_replica_password';

-- Configure pg_hba.conf for replication
-- host replication replicator replica_ip/32 md5
```

### 3. Auto-scaling with Docker Swarm

```yaml
# docker-compose.swarm.yml
version: '3.8'

services:
  app:
    image: pm-system:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    networks:
      - pm-network
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    deploy:
      replicas: 2
      placement:
        constraints:
          - node.role == manager
    volumes:
      - ./nginx-swarm.conf:/etc/nginx/nginx.conf
    networks:
      - pm-network

networks:
  pm-network:
    driver: overlay
    attachable: true
```

## 🔧 Maintenance

### 1. Health Check Script

```bash
#!/bin/bash
# health-check.sh

# Configuration
APP_URL="https://yourdomain.com/health"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="project_management_prod"
ALERT_EMAIL="admin@yourdomain.com"

# Function to send alert
send_alert() {
    echo "ALERT: $1" | mail -s "PM System Alert" $ALERT_EMAIL
    echo "$(date): ALERT - $1" >> /var/log/pm-system/alerts.log
}

# Check application health
if ! curl -f -s $APP_URL > /dev/null; then
    send_alert "Application health check failed"
    exit 1
fi

# Check database connectivity
if ! pg_isready -h $DB_HOST -p $DB_PORT -d $DB_NAME > /dev/null; then
    send_alert "Database connectivity check failed"
    exit 1
fi

# Check disk space
DISK_USAGE=$(df /var | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    send_alert "Disk usage is at ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    send_alert "Memory usage is at ${MEMORY_USAGE}%"
fi

echo "$(date): Health check passed" >> /var/log/pm-system/health.log
```

### 2. Maintenance Mode

```javascript
// maintenance.js
const maintenanceMode = (req, res, next) => {
  const maintenanceFlag = process.env.MAINTENANCE_MODE === 'true';
  const isHealthCheck = req.path === '/health';
  const isAdmin = req.user && req.user.role === 'admin';
  
  if (maintenanceFlag && !isHealthCheck && !isAdmin) {
    return res.status(503).json({
      message: 'System is currently under maintenance',
      estimatedCompletion: process.env.MAINTENANCE_END || 'Soon'
    });
  }
  
  next();
};

module.exports = maintenanceMode;
```

### 3. Update Deployment Script

```bash
#!/bin/bash
# deploy-update.sh

# Configuration
APP_DIR="/opt/pm-system"
BACKUP_DIR="/var/backups/pm-system"
REPO_URL="https://github.com/your-org/pm-system.git"
BRANCH="main"

echo "Starting deployment..."

# Enable maintenance mode
export MAINTENANCE_MODE=true

# Create backup before update
./backup-application.sh
./backup-database.sh

# Pull latest code
cd $APP_DIR
git fetch origin $BRANCH
git checkout $BRANCH
git pull origin $BRANCH

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Run database migrations (if any)
npm run migrate

# Restart application
sudo systemctl restart pm-system

# Wait for application to start
sleep 10

# Health check
if curl -f -s https://yourdomain.com/health > /dev/null; then
    echo "Deployment successful!"
    # Disable maintenance mode
    export MAINTENANCE_MODE=false
else
    echo "Deployment failed! Rolling back..."
    # Restore from backup
    ./restore-from-backup.sh
    exit 1
fi

echo "Deployment completed successfully!"
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start

```bash
# Check system service status
sudo systemctl status pm-system

# Check application logs
sudo journalctl -u pm-system -f

# Check for port conflicts
sudo netstat -tulpn | grep :3000

# Check environment variables
sudo -u pm-user env | grep -E "(NODE_ENV|DATABASE_URL|PORT)"

# Test database connection
psql -U pm_user -d project_management_prod -c "SELECT 1;"
```

#### 2. Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Test connection parameters
pg_isready -h localhost -p 5432 -d project_management_prod

# Check database permissions
sudo -u postgres psql -c "\du"
sudo -u postgres psql -c "\l"
```

#### 3. High Memory Usage

```bash
# Check memory usage by process
ps aux --sort=-%mem | head

# Check for memory leaks in Node.js
node --inspect=0.0.0.0:9229 dist/main.js

# Restart application to clear memory
sudo systemctl restart pm-system

# Consider scaling horizontally
pm2 scale pm-system +2
```

#### 4. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/ssl/certs/yourdomain.com.crt -text -noout

# Test SSL configuration
curl -I https://yourdomain.com

# Renew Let's Encrypt certificate
sudo certbot renew --force-renewal

# Check Nginx SSL configuration
sudo nginx -t
```

#### 5. Performance Issues

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check database locks
SELECT blocked_locks.pid AS blocked_pid,
       blocking_locks.pid AS blocking_pid,
       blocked_activity.query AS blocked_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype;
```

#### 6. Disk Space Issues

```bash
# Find large files
du -h /var/log | sort -hr | head -10
du -h /var/uploads | sort -hr | head -10

# Clean up old logs
sudo logrotate -f /etc/logrotate.d/pm-system

# Clean up old backups
find /var/backups/pm-system -mtime +30 -delete

# Check for large temporary files
find /tmp -size +100M -exec ls -lh {} \;
```

### Monitoring Commands

```bash
# Real-time system monitoring
htop

# Check application processes
ps aux | grep pm-system

# Monitor network connections
ss -tulpn | grep :3000

# Check system resources
vmstat 1
iostat 1

# Monitor database connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Check Nginx access logs
tail -f /var/log/nginx/access.log

# Monitor error logs
tail -f /var/log/pm-system/error.log
```

---

## 📞 Support & Contact

For deployment support and questions:

- **Email**: devops@yourdomain.com
- **Documentation**: https://docs.yourdomain.com
- **Support Portal**: https://support.yourdomain.com
- **Emergency Hotline**: +1 (555) 123-4567

---

**Last Updated**: January 2025  
**Version**: 2.0.0