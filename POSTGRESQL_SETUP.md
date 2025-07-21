# PostgreSQL Setup Guide

This document outlines the steps to migrate from Supabase to PostgreSQL and set up the complete project management system.

## Prerequisites

- PostgreSQL 13 or higher
- Node.js 18 or higher
- npm or yarn package manager

## Database Setup

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (with Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Create Database and User

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database
CREATE DATABASE project_management;

# Create user (optional - you can use postgres user)
CREATE USER pm_admin WITH ENCRYPTED PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE project_management TO pm_admin;

# Exit PostgreSQL
\q
```

### 3. Run Database Schema

```bash
# Connect to your database
psql -U postgres -d project_management

# Or if using custom user
psql -U pm_admin -d project_management

# Run the schema file
\i database_schema.sql

# Exit
\q
```

## Environment Configuration

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your database credentials:
```env
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=project_management
VITE_DB_USER=postgres
VITE_DB_PASSWORD=your_password
```

## Installation and Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## New Features Added

### 1. Calendar Management (`/admin/calendar`)
- **Event Creation**: Create meetings, deadlines, milestones, and reminders
- **Multiple Views**: Month, week, day, and agenda views
- **Recurring Events**: Support for recurring events with custom patterns
- **Reminders**: Email, SMS, and push notification reminders
- **Project Integration**: Sync with project milestones and deadlines
- **Real-time Updates**: Live calendar updates for team collaboration

**Key Features:**
- Drag-and-drop event creation
- Color-coded event types
- Search and filter functionality
- Export to external calendars
- Automated deadline alerts

### 2. File Management (`/admin/files`)
- **File Upload**: Drag-and-drop file upload with progress tracking
- **Folder Organization**: Hierarchical folder structure
- **File Sharing**: Secure link sharing with expiration and password protection
- **Version Control**: File versioning and history tracking
- **Storage Management**: Storage usage monitoring and limits
- **File Preview**: Thumbnail generation for images and documents

**Key Features:**
- Multiple view modes (grid/list)
- Bulk file operations
- Advanced search and filtering
- File tagging and metadata
- Virus scanning integration
- Download tracking

### 3. Enhanced Contact System
- **SMTP Integration**: Background email processing for contact forms
- **Auto-responses**: Automated acknowledgment emails
- **Form Types**: Different contact form types with priority handling
- **Spam Protection**: Built-in spam detection and filtering
- **Admin Notifications**: Real-time notifications for new submissions

### 4. Alert System
- **Project Monitoring**: Automated monitoring of project deadlines
- **Task Delays**: Detection and alerting for overdue tasks
- **Invoice Alerts**: Payment reminders and overdue notifications
- **Custom Rules**: Configurable alert rules and conditions
- **Multi-channel Notifications**: Email, SMS, and in-app notifications
- **Escalation**: Automated escalation for critical alerts

### 5. Admin Personnel Management (`/admin/personnel`)
- **User Management**: Complete CRUD operations for admin users
- **Role-based Access**: Granular permission management
- **Security Monitoring**: Login attempts and security events tracking
- **Audit Logging**: Comprehensive activity logging
- **Bulk Operations**: Batch user management operations

## Database Schema Overview

The system includes the following main entities:

### Core Tables
- `users` - System users with roles and permissions
- `clients` - Client information and contact details
- `projects` - Project management with status tracking
- `tasks` - Task management with assignments and dependencies
- `invoices` - Invoice generation and payment tracking
- `quotations` - Quote management and client approvals

### New Tables
- `calendar_events` - Event management and scheduling
- `file_metadata` - File storage and organization
- `email_templates` - Email template management
- `alerts` - Alert system and notifications
- `user_sessions` - Session management and security
- `activity_logs` - Comprehensive audit trail

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Session management with timeout
- Rate limiting and brute force protection
- SQL injection prevention
- XSS protection
- CSRF protection

## API Architecture

The system uses a modular service-based architecture:

### Core Services
- **DatabaseClient**: Unified database access layer
- **AuthenticationService**: User authentication and authorization
- **ErrorHandlingService**: Centralized error management
- **ConnectionPoolService**: Database connection pooling
- **QueueManager**: Background job processing

### Feature Services
- **CalendarManager**: Calendar and event management
- **FileStorageManager**: File upload and management
- **SMTPService**: Email sending and template management
- **AlertSystem**: Monitoring and notification system

## Performance Optimizations

### Database
- Connection pooling with health monitoring
- Query optimization with proper indexing
- Transaction management for data consistency
- Database-level constraints and triggers

### File Storage
- Chunked file uploads for large files
- Thumbnail generation for images
- File compression and optimization
- CDN integration ready

### Caching
- In-memory caching for frequently accessed data
- Redis integration ready
- Browser caching for static assets

## Security Best Practices

### Authentication
- Strong password requirements
- Account lockout after failed attempts
- Session timeout and rotation
- Two-factor authentication support

### Data Protection
- Encrypted sensitive data storage
- Secure file upload validation
- Input sanitization and validation
- SQL injection prevention

### Network Security
- HTTPS enforcement
- CORS configuration
- Rate limiting
- API key management

## Monitoring and Logging

### Application Monitoring
- Real-time error tracking
- Performance metrics
- User activity monitoring
- System health checks

### Audit Logging
- User action logging
- Security event tracking
- Data change history
- System access logs

## Backup and Recovery

### Database Backup
- Automated daily backups
- Point-in-time recovery
- Backup verification
- Offsite backup storage

### File Backup
- File versioning
- Incremental backups
- Cloud storage integration
- Disaster recovery planning

## Development Guidelines

### Code Structure
- Modular service architecture
- TypeScript for type safety
- React with modern hooks
- Tailwind CSS for styling

### Testing
- Unit tests for core functions
- Integration tests for API endpoints
- E2E tests for critical workflows
- Performance testing

### Deployment
- Environment-specific configurations
- Docker containerization ready
- CI/CD pipeline integration
- Health check endpoints

## Support and Maintenance

### Regular Maintenance
- Database optimization
- Log rotation
- Security updates
- Performance monitoring

### Troubleshooting
- Error log analysis
- Performance profiling
- Database query optimization
- User support documentation

## Migration from Supabase

The system has been completely migrated from Supabase to PostgreSQL:

1. **Database Migration**: All Supabase tables recreated in PostgreSQL
2. **Authentication**: Custom JWT-based authentication replacing Supabase Auth
3. **Real-time**: Polling-based real-time updates replacing Supabase Realtime
4. **Storage**: Custom file storage replacing Supabase Storage
5. **API**: REST API with PostgreSQL replacing Supabase API

### Benefits of Migration
- Full control over database schema
- Better performance with optimized queries
- Reduced external dependencies
- Cost optimization
- Enhanced security controls
- Custom business logic implementation

## Next Steps

1. Set up production PostgreSQL instance
2. Configure SMTP server for email functionality
3. Set up file storage (local or cloud)
4. Configure monitoring and alerting
5. Set up backup procedures
6. Deploy to production environment

For additional support or questions, please refer to the documentation or contact the development team.