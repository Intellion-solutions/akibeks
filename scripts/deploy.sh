#!/bin/bash

# AKIBEKS Engineering Solutions - Deployment Script
# This script handles the deployment of the application with Apache/Nginx

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="akibeks"
PROJECT_DIR="/var/www/akibeks"
BACKUP_DIR="/backup/akibeks"
LOG_FILE="/var/log/akibeks-deploy.log"
USER="www-data"
GROUP="www-data"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    echo "[ERROR] $1" >> "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
    echo "[WARNING] $1" >> "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
    echo "[INFO] $1" >> "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18+ first."
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_VERSION -lt 18 ]]; then
        error "Node.js version 18+ is required. Current version: $(node --version)"
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        warning "PostgreSQL client not found. Database operations may fail."
    fi
    
    log "System requirements check completed"
}

# Setup web server
setup_webserver() {
    local webserver=$1
    
    log "Setting up $webserver..."
    
    case $webserver in
        "apache")
            setup_apache
            ;;
        "nginx")
            setup_nginx
            ;;
        *)
            error "Unsupported web server: $webserver. Use 'apache' or 'nginx'"
            ;;
    esac
}

# Setup Apache
setup_apache() {
    log "Setting up Apache..."
    
    # Install Apache if not installed
    if ! command -v apache2 &> /dev/null; then
        info "Installing Apache..."
        apt-get update
        apt-get install -y apache2
    fi
    
    # Enable required modules
    a2enmod rewrite
    a2enmod ssl
    a2enmod headers
    a2enmod proxy
    a2enmod proxy_http
    a2enmod proxy_wstunnel
    a2enmod deflate
    a2enmod expires
    a2enmod evasive24 || warning "mod_evasive not available"
    
    # Copy configuration
    if [[ -f "config/apache.conf" ]]; then
        cp config/apache.conf /etc/apache2/sites-available/akibeks.conf
        log "Apache configuration copied"
    else
        error "Apache configuration file not found at config/apache.conf"
    fi
    
    # Enable site
    a2ensite akibeks.conf
    a2dissite 000-default.conf || true
    
    # Test configuration
    apache2ctl configtest
    
    # Restart Apache
    systemctl restart apache2
    systemctl enable apache2
    
    log "Apache setup completed"
}

# Setup Nginx
setup_nginx() {
    log "Setting up Nginx..."
    
    # Install Nginx if not installed
    if ! command -v nginx &> /dev/null; then
        info "Installing Nginx..."
        apt-get update
        apt-get install -y nginx
    fi
    
    # Copy configuration
    if [[ -f "config/nginx.conf" ]]; then
        cp config/nginx.conf /etc/nginx/sites-available/akibeks.conf
        log "Nginx configuration copied"
    else
        error "Nginx configuration file not found at config/nginx.conf"
    fi
    
    # Enable site
    ln -sf /etc/nginx/sites-available/akibeks.conf /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    
    # Restart Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    log "Nginx setup completed"
}

# Create backup
create_backup() {
    if [[ -d "$PROJECT_DIR" ]]; then
        log "Creating backup..."
        mkdir -p "$BACKUP_DIR"
        
        BACKUP_NAME="akibeks-backup-$(date +%Y%m%d-%H%M%S)"
        tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$(dirname $PROJECT_DIR)" "$(basename $PROJECT_DIR)"
        
        log "Backup created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
        
        # Keep only last 5 backups
        cd "$BACKUP_DIR"
        ls -t akibeks-backup-*.tar.gz | tail -n +6 | xargs -r rm --
    fi
}

# Setup project directory
setup_project_dir() {
    log "Setting up project directory..."
    
    # Create project directory
    mkdir -p "$PROJECT_DIR"
    
    # Set ownership
    chown -R "$USER:$GROUP" "$PROJECT_DIR"
    
    log "Project directory setup completed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd "$PROJECT_DIR"
    
    # Install npm dependencies
    npm ci --only=production
    
    log "Dependencies installed"
}

# Build application
build_application() {
    log "Building application..."
    
    cd "$PROJECT_DIR"
    
    # Build the application
    npm run build
    
    log "Application built successfully"
}

# Setup database
setup_database() {
    log "Setting up database..."
    
    # Check if .env file exists
    if [[ ! -f "$PROJECT_DIR/.env" ]]; then
        warning ".env file not found. Please create it before running database setup."
        return
    fi
    
    cd "$PROJECT_DIR"
    
    # Run database migrations
    npm run db:push || warning "Database migration failed. Please check manually."
    
    log "Database setup completed"
}

# Setup SSL certificates
setup_ssl() {
    local domain=$1
    
    log "Setting up SSL certificates for $domain..."
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        info "Installing certbot..."
        apt-get update
        apt-get install -y certbot python3-certbot-apache python3-certbot-nginx
    fi
    
    # Generate certificates
    if [[ "$WEBSERVER" == "apache" ]]; then
        certbot --apache -d "$domain" -d "www.$domain" --non-interactive --agree-tos --email "admin@$domain"
    else
        certbot --nginx -d "$domain" -d "www.$domain" --non-interactive --agree-tos --email "admin@$domain"
    fi
    
    # Setup auto-renewal
    crontab -l | grep -q "certbot renew" || (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log "SSL certificates setup completed"
}

# Setup systemd service for backend
setup_backend_service() {
    log "Setting up backend service..."
    
    cat > /etc/systemd/system/akibeks-backend.service << EOF
[Unit]
Description=AKIBEKS Backend API Server
After=network.target
Wants=postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
EnvironmentFile=$PROJECT_DIR/.env
ExecStart=/usr/bin/node server.cjs
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=akibeks-backend

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable akibeks-backend.service
    
    log "Backend service setup completed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create log directories
    mkdir -p /var/log/akibeks
    chown -R "$USER:$GROUP" /var/log/akibeks
    
    # Setup log rotation
    cat > /etc/logrotate.d/akibeks << EOF
/var/log/akibeks/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $GROUP
    postrotate
        systemctl reload akibeks-backend || true
    endscript
}
EOF
    
    log "Monitoring setup completed"
}

# Setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    # Install UFW if not installed
    if ! command -v ufw &> /dev/null; then
        apt-get update
        apt-get install -y ufw
    fi
    
    # Configure firewall rules
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Enable firewall
    ufw --force enable
    
    log "Firewall setup completed"
}

# Main deployment function
deploy() {
    local webserver=${1:-nginx}
    local domain=${2:-akibeks.co.ke}
    local ssl=${3:-true}
    
    log "Starting deployment with $webserver for $domain..."
    
    # Pre-deployment checks
    check_root
    check_requirements
    
    # Create backup if existing deployment
    create_backup
    
    # Setup project
    setup_project_dir
    
    # Copy application files
    if [[ -f "package.json" ]]; then
        log "Copying application files..."
        rsync -av --exclude=node_modules --exclude=.git --exclude=dist . "$PROJECT_DIR/"
    else
        error "package.json not found. Please run this script from the project root."
    fi
    
    # Install dependencies and build
    install_dependencies
    build_application
    
    # Setup web server
    setup_webserver "$webserver"
    
    # Setup backend service
    setup_backend_service
    
    # Setup database
    setup_database
    
    # Setup SSL if requested
    if [[ "$ssl" == "true" ]]; then
        setup_ssl "$domain"
    fi
    
    # Setup monitoring and security
    setup_monitoring
    setup_firewall
    
    # Final permissions
    chown -R "$USER:$GROUP" "$PROJECT_DIR"
    chmod -R 755 "$PROJECT_DIR"
    
    # Start services
    systemctl start akibeks-backend.service
    
    log "Deployment completed successfully!"
    info "Application available at: https://$domain"
    info "Admin panel available at: https://$domain/admin"
}

# Show usage
usage() {
    echo "Usage: $0 [webserver] [domain] [ssl]"
    echo "  webserver: apache|nginx (default: nginx)"
    echo "  domain: your domain name (default: akibeks.co.ke)"
    echo "  ssl: true|false (default: true)"
    echo ""
    echo "Examples:"
    echo "  $0 nginx akibeks.co.ke true"
    echo "  $0 apache example.com false"
}

# Script entry point
main() {
    case "${1:-}" in
        -h|--help)
            usage
            exit 0
            ;;
        *)
            WEBSERVER="${1:-nginx}"
            deploy "$1" "$2" "$3"
            ;;
    esac
}

# Create log file if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

# Run main function
main "$@"