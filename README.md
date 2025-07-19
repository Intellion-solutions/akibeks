# AKIBEKS Engineering Solutions - Complete Project Management System

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4-646CFF.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.38-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3-38B2AC.svg)](https://tailwindcss.com/)

## 🏗️ Overview

AKIBEKS Engineering Solutions is a comprehensive project management system designed for construction and engineering companies. It provides a complete suite of tools for project management, client collaboration, invoice management, quotation handling, and team coordination.

### 🎯 Key Features

#### 📊 **Project Management Dashboard**
- **Advanced Project Tracking**: Real-time progress monitoring with visual indicators
- **Project Health Analytics**: Automated health scoring based on budget, time, and completion metrics
- **Multi-view Task Management**: Kanban boards, list views, and Gantt chart support
- **Resource Management**: Track team members, equipment, and materials
- **Time Tracking**: Billable and non-billable time logging with task assignment
- **Risk Management**: Identify, assess, and mitigate project risks
- **Comprehensive Reporting**: Budget analysis, task distribution, and progress reports

#### 💰 **Invoice Management System**
- **Professional Invoice Generation**: Multiple template designs with company branding
- **Payment Tracking**: Real-time payment status and balance monitoring
- **Client Portal Access**: Secure invoice viewing via email or invoice number
- **PDF Generation**: High-quality, professional invoice documents
- **Status Management**: Draft, sent, paid, overdue, and cancelled statuses
- **Search & Filter**: Advanced filtering by status, client, and date ranges

#### 📋 **Quotation Management**
- **Online Quote Requests**: Comprehensive project quotation request forms
- **Quote Status Tracking**: Monitor quotation lifecycle from draft to acceptance
- **Professional Quote PDFs**: Multiple design templates with validity tracking
- **Digital Acceptance**: Built-in signature areas and acceptance workflow
- **Validity Management**: Automatic expiration warnings and status updates
- **Client Communication**: Direct quote acceptance and rejection features

#### 👥 **Team Collaboration**
- **Real-time Chat**: Project-specific messaging with file sharing
- **Meeting Scheduling**: Integrated calendar and video conferencing
- **File Management**: Centralized document storage with version control
- **Notifications**: Real-time project updates and alerts
- **Team Status**: Online/offline status tracking
- **Communication Tools**: Direct messaging, voice, and video calls

#### 🏢 **Client Portal**
- **Unified Dashboard**: Single access point for all client services
- **Secure Access**: Email-based authentication with project number verification
- **Mobile Responsive**: Full functionality on all device types
- **Help & Support**: Integrated support system with multiple contact methods
- **Document Management**: Easy access to all project documents

#### ⚙️ **Admin Management**
- **User Management**: Role-based access control and permissions
- **Project Administration**: Complete project lifecycle management
- **Template Management**: Customizable invoice and quotation templates
- **Analytics & Reporting**: Comprehensive business intelligence dashboard
- **System Configuration**: Company settings and integration management

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** or **bun**
- **Supabase** account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/akibeks-engineering.git
   cd akibeks-engineering
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   
   Run the SQL migrations in your Supabase dashboard:
   ```sql
   -- Core tables for project management
   CREATE TABLE projects (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_number VARCHAR NOT NULL UNIQUE,
     title VARCHAR NOT NULL,
     description TEXT,
     client_name VARCHAR NOT NULL,
     client_email VARCHAR,
     client_phone VARCHAR,
     location VARCHAR NOT NULL,
     total_budget DECIMAL(15,2) NOT NULL,
     spent_amount DECIMAL(15,2) DEFAULT 0,
     status VARCHAR DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
     priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
     start_date DATE NOT NULL,
     expected_completion DATE NOT NULL,
     actual_completion DATE,
     completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
     project_manager VARCHAR,
     team_members TEXT[],
     tags TEXT[],
     risk_level VARCHAR DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
     client_satisfaction INTEGER CHECK (client_satisfaction >= 1 AND client_satisfaction <= 5),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tasks management
   CREATE TABLE project_tasks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     title VARCHAR NOT NULL,
     description TEXT,
     assigned_to VARCHAR NOT NULL,
     status VARCHAR DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed')),
     priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
     due_date DATE NOT NULL,
     estimated_hours INTEGER DEFAULT 0,
     actual_hours INTEGER,
     dependencies UUID[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     completed_at TIMESTAMP WITH TIME ZONE
   );

   -- Resource management
   CREATE TABLE project_resources (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     name VARCHAR NOT NULL,
     type VARCHAR CHECK (type IN ('human', 'equipment', 'material')),
     cost_per_unit DECIMAL(10,2) NOT NULL,
     quantity INTEGER NOT NULL,
     status VARCHAR DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'in_use', 'maintenance')),
     allocation_start DATE,
     allocation_end DATE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Time tracking
   CREATE TABLE time_entries (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
     user_name VARCHAR NOT NULL,
     hours DECIMAL(5,2) NOT NULL,
     date DATE NOT NULL,
     description TEXT,
     billable BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Risk management
   CREATE TABLE project_risks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     title VARCHAR NOT NULL,
     description TEXT,
     probability VARCHAR CHECK (probability IN ('low', 'medium', 'high')),
     impact VARCHAR CHECK (impact IN ('low', 'medium', 'high')),
     mitigation_strategy TEXT,
     status VARCHAR DEFAULT 'identified' CHECK (status IN ('identified', 'mitigating', 'resolved', 'occurred')),
     owner VARCHAR NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Team collaboration
   CREATE TABLE project_team_members (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     name VARCHAR NOT NULL,
     role VARCHAR NOT NULL,
     email VARCHAR NOT NULL,
     avatar VARCHAR,
     status VARCHAR DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
     last_seen TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Project messaging
   CREATE TABLE project_messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     sender_id VARCHAR NOT NULL,
     sender_name VARCHAR NOT NULL,
     sender_avatar VARCHAR,
     content TEXT NOT NULL,
     message_type VARCHAR DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
     file_url VARCHAR,
     file_name VARCHAR,
     reply_to UUID REFERENCES project_messages(id),
     pinned BOOLEAN DEFAULT false,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     edited_at TIMESTAMP WITH TIME ZONE
   );

   -- Notifications
   CREATE TABLE project_notifications (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     user_id VARCHAR NOT NULL,
     title VARCHAR NOT NULL,
     description TEXT,
     type VARCHAR DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
     read BOOLEAN DEFAULT false,
     action_url VARCHAR,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Meetings
   CREATE TABLE project_meetings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     title VARCHAR NOT NULL,
     description TEXT,
     start_time TIMESTAMP WITH TIME ZONE NOT NULL,
     end_time TIMESTAMP WITH TIME ZONE NOT NULL,
     meeting_url VARCHAR,
     attendees TEXT[],
     created_by VARCHAR NOT NULL,
     status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- File sharing
   CREATE TABLE project_files (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     file_name VARCHAR NOT NULL,
     file_size BIGINT NOT NULL,
     file_type VARCHAR NOT NULL,
     file_url VARCHAR NOT NULL,
     uploaded_by VARCHAR NOT NULL,
     description TEXT,
     tags TEXT[],
     folder VARCHAR,
     uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Invoices (existing table structure)
   CREATE TABLE invoices (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     invoice_number VARCHAR NOT NULL UNIQUE,
     client_name VARCHAR NOT NULL,
     client_address TEXT,
     client_phone VARCHAR,
     client_email VARCHAR,
     issue_date DATE NOT NULL,
     due_date DATE NOT NULL,
     subtotal DECIMAL(15,2) NOT NULL,
     tax_rate DECIMAL(5,2) DEFAULT 0,
     tax_amount DECIMAL(15,2) DEFAULT 0,
     discount_amount DECIMAL(15,2) DEFAULT 0,
     total_amount DECIMAL(15,2) NOT NULL,
     paid_amount DECIMAL(15,2) DEFAULT 0,
     status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
     notes TEXT,
     payment_terms TEXT,
     template_type VARCHAR DEFAULT 'modern',
     letterhead_enabled BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Quotations
   CREATE TABLE quotations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     quote_number VARCHAR NOT NULL UNIQUE,
     client_name VARCHAR NOT NULL,
     client_address TEXT,
     client_phone VARCHAR,
     client_email VARCHAR,
     issue_date DATE NOT NULL,
     valid_until DATE NOT NULL,
     subtotal DECIMAL(15,2) NOT NULL,
     tax_rate DECIMAL(5,2) DEFAULT 0,
     tax_amount DECIMAL(15,2) DEFAULT 0,
     discount_amount DECIMAL(15,2) DEFAULT 0,
     total_amount DECIMAL(15,2) NOT NULL,
     status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
     project_description TEXT,
     terms TEXT,
     notes TEXT,
     template_type VARCHAR DEFAULT 'modern',
     letterhead_enabled BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;
   ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
   ALTER TABLE project_risks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
   ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE project_notifications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE project_meetings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
   ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
   ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

6. **Access the application**
   - Open [http://localhost:5173](http://localhost:5173) in your browser
   - The application will be running with hot reload enabled

## 📁 Project Structure

```
akibeks-engineering/
├── public/                          # Static assets
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                     # Base UI components (buttons, inputs, etc.)
│   │   ├── admin/                  # Admin-specific components
│   │   │   ├── invoices/          # Invoice management components
│   │   │   └── projects/          # Project management components
│   │   ├── enhanced/              # Enhanced UI components
│   │   ├── InvoicePDF.tsx         # Invoice PDF generation
│   │   ├── QuotationPDF.tsx       # Quotation PDF generation
│   │   ├── TeamCollaboration.tsx  # Team collaboration features
│   │   ├── Navbar.tsx             # Main navigation
│   │   └── Footer.tsx             # Site footer
│   ├── pages/                      # Application pages
│   │   ├── admin/                 # Admin panel pages
│   │   │   ├── AdminDashboard.tsx # Admin dashboard
│   │   │   ├── AdminProjects.tsx  # Project management
│   │   │   ├── AdminInvoices.tsx  # Invoice management
│   │   │   ├── AdminQuotations.tsx # Quotation management
│   │   │   └── ...                # Other admin pages
│   │   ├── ClientPortal.tsx       # Main client portal
│   │   ├── ProjectDashboard.tsx   # Advanced project dashboard
│   │   ├── ProjectTracking.tsx    # Project progress tracking
│   │   ├── InvoiceManagement.tsx  # Client invoice management
│   │   ├── QuotationManagement.tsx # Client quotation management
│   │   ├── Index.tsx              # Homepage
│   │   └── ...                    # Other public pages
│   ├── contexts/                   # React contexts
│   │   └── AdminContext.tsx       # Admin authentication context
│   ├── hooks/                      # Custom React hooks
│   │   └── use-toast.tsx          # Toast notification hook
│   ├── integrations/              # External service integrations
│   │   └── supabase/              # Supabase configuration
│   ├── lib/                       # Utility libraries
│   ├── App.tsx                    # Main application component
│   └── main.tsx                   # Application entry point
├── .env.example                   # Environment variables template
├── package.json                   # Project dependencies
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts               # Vite build configuration
└── README.md                    # This file
```

## 🎨 Technology Stack

### Frontend Technologies
- **React 18.2** - Modern React with hooks and concurrent features
- **TypeScript 5.0** - Type-safe JavaScript with advanced IntelliSense
- **Vite 4.4** - Lightning-fast build tool with HMR
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **React Router v6** - Declarative routing for React
- **Radix UI** - Unstyled, accessible UI components
- **Lucide React** - Beautiful & consistent icon set
- **React Hook Form** - Performant forms with easy validation
- **React Query** - Powerful data synchronization for React

### Backend & Database
- **Supabase** - Open source Firebase alternative
  - PostgreSQL database with real-time subscriptions
  - Row Level Security (RLS) for data protection
  - Authentication and user management
  - File storage and CDN
  - Edge functions for serverless logic

### Development Tools
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **Husky** - Git hooks for code quality
- **PostCSS** - CSS processing and optimization

## 🔐 Security Features

### Authentication & Authorization
- **Row Level Security (RLS)** - Database-level access control
- **Email-based Authentication** - Secure client access via email verification
- **Project Number Verification** - Additional security layer for project access
- **Role-based Access Control** - Admin, manager, and client permission levels

### Data Protection
- **Encrypted Data Storage** - All sensitive data encrypted at rest
- **Secure API Endpoints** - Protected with authentication tokens
- **Input Validation** - Client and server-side validation
- **SQL Injection Prevention** - Parameterized queries and ORM protection

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full feature set with multi-column layouts
- **Tablet**: Adaptive layouts with collapsible sidebars
- **Mobile**: Touch-optimized interface with mobile-first design
- **Progressive Web App (PWA)**: Can be installed on mobile devices

## 🚀 Deployment

### Production Build
```bash
npm run build
# or
yarn build
# or
bun run build
```

### Deployment Options

#### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

#### 2. Netlify
```bash
# Build the project
npm run build

# Deploy the dist/ folder to Netlify
```

#### 3. Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_APP_URL=https://your-domain.com
```

## 📖 Usage Guide

### For Clients

#### Accessing Your Projects
1. Visit the **Client Portal** at `/client-portal`
2. Enter your email address or project number
3. Access your project dashboard with real-time updates

#### Managing Invoices
1. Navigate to **Invoice Management** (`/invoices`)
2. Search for invoices using email or invoice number
3. View payment status and download PDF invoices
4. Track payment history and outstanding balances

#### Requesting Quotations
1. Go to **Quotation Management** (`/quotations`)
2. Fill out the comprehensive project request form
3. Track quotation status and validity
4. Accept or reject quotations digitally

#### Project Collaboration
1. Access the **Project Dashboard** (`/project-dashboard`)
2. View real-time project progress and milestones
3. Communicate with the project team via integrated chat
4. Access shared files and project documentation

### For Administrators

#### Project Management
1. Access **Admin Dashboard** (`/admin`)
2. Create and manage projects with full lifecycle tracking
3. Assign team members and allocate resources
4. Monitor project health and performance metrics

#### Invoice & Quotation Management
1. Generate professional invoices with multiple templates
2. Track payment status and send automated reminders
3. Create detailed quotations with itemized breakdowns
4. Manage client communications and approvals

#### Team Coordination
1. Manage team members and roles
2. Track time entries and billable hours
3. Schedule meetings and video conferences
4. Monitor team productivity and resource utilization

## 🔧 API Reference

### Core Endpoints

#### Projects API
```typescript
// Get all projects
GET /api/projects
Query Parameters: status, priority, client_email

// Get project by ID
GET /api/projects/:id

// Create new project
POST /api/projects
Body: ProjectCreateRequest

// Update project
PUT /api/projects/:id
Body: ProjectUpdateRequest

// Delete project
DELETE /api/projects/:id
```

#### Tasks API
```typescript
// Get project tasks
GET /api/projects/:projectId/tasks
Query Parameters: status, assigned_to, priority

// Create task
POST /api/projects/:projectId/tasks
Body: TaskCreateRequest

// Update task status
PUT /api/tasks/:id/status
Body: { status: 'todo' | 'in_progress' | 'review' | 'completed' }
```

#### Time Tracking API
```typescript
// Log time entry
POST /api/time-entries
Body: {
  project_id: string;
  task_id?: string;
  hours: number;
  description: string;
  billable: boolean;
}

// Get time entries
GET /api/projects/:projectId/time-entries
Query Parameters: start_date, end_date, user_name
```

### Real-time Features

The application uses Supabase real-time subscriptions for:
- **Live chat messages** - Instant team communication
- **Project updates** - Real-time progress notifications
- **Task status changes** - Immediate task board updates
- **New notifications** - Instant alert delivery

## 🧪 Testing

### Running Tests
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

### Testing Strategy
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing with Playwright
- **Visual Regression Tests**: UI consistency testing

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

#### Database Connection Issues
1. Verify Supabase URL and API key in `.env.local`
2. Check database permissions and RLS policies
3. Ensure network connectivity to Supabase

#### Authentication Problems
1. Verify email-based authentication setup
2. Check browser local storage for session data
3. Ensure CORS settings are configured correctly

#### Performance Issues
1. Enable React DevTools Profiler
2. Check bundle size with `npm run build:analyze`
3. Optimize images and assets
4. Implement code splitting for large pages

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled with proper typing
- **ESLint**: Enforce consistent code style
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages
- **Test Coverage**: Minimum 80% coverage for new features

### Pull Request Process
1. Update documentation for any new features
2. Add tests for new functionality
3. Ensure all existing tests pass
4. Update the README if needed
5. Request review from maintainers

## 📊 Performance Metrics

### Core Web Vitals
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Bundle Size
- **Initial Bundle**: ~200KB gzipped
- **Code Splitting**: Lazy-loaded route chunks
- **Asset Optimization**: Optimized images and fonts
- **Tree Shaking**: Unused code elimination

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Supabase Team** - For the incredible backend platform
- **Tailwind CSS** - For the utility-first CSS framework
- **Radix UI** - For accessible component primitives
- **Lucide** - For the beautiful icon set

## 📞 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Email**: support@akibeks.com for urgent matters

### Support Channels
- 📧 **Email Support**: support@akibeks.com
- 📱 **Phone Support**: +254 123 456 789
- 💬 **Live Chat**: Available during business hours
- 🐛 **Bug Reports**: GitHub Issues
- 💡 **Feature Requests**: GitHub Discussions

## 🔮 Roadmap

### Upcoming Features
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Enhanced business intelligence dashboard
- **AI Integration**: Intelligent project insights and recommendations
- **API Webhooks**: External system integrations
- **Multi-language Support**: Internationalization (i18n)
- **Advanced Permissions**: Granular role-based access control
- **Automated Testing**: Comprehensive test automation suite
- **Performance Monitoring**: Real-time application monitoring

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced project dashboard and team collaboration
- **v1.2.0** - Advanced invoice and quotation management
- **v1.3.0** - Real-time features and notifications
- **v2.0.0** - Complete UI overhaul and performance optimization (planned)

---

**Built with ❤️ by the AKIBEKS Engineering Team**

*For more information, visit [www.akibeks.com](https://www.akibeks.com)*
