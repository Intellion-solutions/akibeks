-- Project Management System Database Schema
-- PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    department VARCHAR(100),
    location VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    address TEXT,
    contact_person VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    budget DECIMAL(15,2),
    spent_amount DECIMAL(15,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time entries table
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hours DECIMAL(5,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    billable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    due_date DATE,
    paid_date DATE,
    items JSONB,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotations table
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(100) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    valid_until DATE,
    accepted_date DATE,
    items JSONB,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('invoice', 'quotation', 'letterhead', 'report')),
    content JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    due_date DATE,
    completed_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    amount DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project team members table
CREATE TABLE project_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'member',
    hourly_rate DECIMAL(10,2),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    commentable_type VARCHAR(50) NOT NULL CHECK (commentable_type IN ('project', 'task', 'milestone')),
    commentable_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID NOT NULL,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table for enhanced security
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow automations table
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(100) NOT NULL,
    trigger_conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation logs table
CREATE TABLE automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    trigger_data JSONB,
    executed_actions JSONB,
    status VARCHAR(50) DEFAULT 'success',
    error_message TEXT,
    execution_time INTEGER, -- milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates table
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API keys table for integrations
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    permissions JSONB NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_manager_id ON projects(manager_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_quotations_client_id ON quotations(client_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_project_team_members_project_id ON project_team_members(project_id);
CREATE INDEX idx_project_team_members_user_id ON project_team_members(user_id);
CREATE INDEX idx_comments_commentable ON comments(commentable_type, commentable_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_automations_trigger_type ON automations(trigger_type);
CREATE INDEX idx_automation_logs_automation_id ON automation_logs(automation_id);
CREATE INDEX idx_email_templates_type ON email_templates(template_type);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, name, role, password_hash, is_active) VALUES 
('admin@company.com', 'System Administrator', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBNhg6UqVr3EFy', true);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES 
('company_name', '"Project Management System"', 'Company name for documents and branding'),
('company_email', '"info@company.com"', 'Default company email address'),
('company_phone', '"+1 234 567 8900"', 'Company phone number'),
('company_address', '"123 Business Street, City, State 12345"', 'Company address'),
('tax_rate', '0.1', 'Default tax rate (10%)'),
('currency', '"USD"', 'Default currency'),
('invoice_prefix', '"INV-"', 'Invoice number prefix'),
('quotation_prefix', '"QUO-"', 'Quotation number prefix'),
('timezone', '"America/New_York"', 'Default timezone'),
('date_format', '"MM/DD/YYYY"', 'Default date format');

-- Sample data for development
INSERT INTO clients (name, email, phone, company, address) VALUES 
('Tech Solutions Inc.', 'contact@techsolutions.com', '+1 555 0101', 'Tech Solutions Inc.', '123 Tech Street, Silicon Valley, CA 94000'),
('Global Enterprises', 'info@globalent.com', '+1 555 0202', 'Global Enterprises', '456 Business Ave, New York, NY 10001'),
('Innovation Labs', 'hello@innovationlabs.com', '+1 555 0303', 'Innovation Labs', '789 Innovation Blvd, Austin, TX 73301');

INSERT INTO projects (name, description, status, priority, client_id, manager_id, budget, start_date, end_date) VALUES 
('Website Redesign', 'Complete redesign of company website with modern UI/UX', 'active', 'high', 
 (SELECT id FROM clients WHERE name = 'Tech Solutions Inc.' LIMIT 1),
 (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
 50000.00, '2024-01-15', '2024-04-15'),
('Mobile App Development', 'Native mobile application for iOS and Android', 'planning', 'medium',
 (SELECT id FROM clients WHERE name = 'Global Enterprises' LIMIT 1),
 (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
 75000.00, '2024-02-01', '2024-08-01'),
('E-commerce Platform', 'Custom e-commerce solution with payment integration', 'active', 'high',
 (SELECT id FROM clients WHERE name = 'Innovation Labs' LIMIT 1),
 (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
 100000.00, '2024-01-01', '2024-06-30');

-- Enhanced schema for advanced features

-- Content Management Tables
CREATE TABLE IF NOT EXISTS content_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page VARCHAR(100) NOT NULL,
    section VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    media_urls JSONB DEFAULT '[]',
    is_published BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    features JSONB DEFAULT '[]',
    pricing JSONB DEFAULT '{}',
    gallery JSONB DEFAULT '[]',
    testimonials JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',
    seo_meta JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects_showcase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_name VARCHAR(255),
    industry VARCHAR(100),
    project_type VARCHAR(100),
    duration VARCHAR(100),
    team_size INTEGER,
    technologies JSONB DEFAULT '[]',
    challenges JSONB DEFAULT '[]',
    solutions JSONB DEFAULT '[]',
    results JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    video_url VARCHAR(500),
    case_study_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    completion_date DATE,
    budget_range VARCHAR(100),
    testimonial JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    category VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_settings (
    page VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    keywords JSONB DEFAULT '[]',
    og_title VARCHAR(255),
    og_description TEXT,
    og_image VARCHAR(500),
    twitter_title VARCHAR(255),
    twitter_description TEXT,
    twitter_image VARCHAR(500),
    canonical_url VARCHAR(500),
    robots VARCHAR(100) DEFAULT 'index,follow',
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Task Management
CREATE TABLE IF NOT EXISTS project_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration INTEGER, -- in days
    order_index INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add enhanced task columns if they don't exist
DO $$ 
BEGIN
    -- Add new columns to tasks table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='phase_id') THEN
        ALTER TABLE tasks ADD COLUMN phase_id UUID REFERENCES project_phases(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='type') THEN
        ALTER TABLE tasks ADD COLUMN type VARCHAR(50) DEFAULT 'general';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='estimated_hours') THEN
        ALTER TABLE tasks ADD COLUMN estimated_hours DECIMAL(8,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='actual_hours') THEN
        ALTER TABLE tasks ADD COLUMN actual_hours DECIMAL(8,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='tags') THEN
        ALTER TABLE tasks ADD COLUMN tags JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='dependencies') THEN
        ALTER TABLE tasks ADD COLUMN dependencies JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='subtasks') THEN
        ALTER TABLE tasks ADD COLUMN subtasks JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='attachments') THEN
        ALTER TABLE tasks ADD COLUMN attachments JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='task_comments') THEN
        ALTER TABLE tasks ADD COLUMN task_comments JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='milestone_id') THEN
        ALTER TABLE tasks ADD COLUMN milestone_id UUID REFERENCES milestones(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='automation_triggers') THEN
        ALTER TABLE tasks ADD COLUMN automation_triggers JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='checklist_items') THEN
        ALTER TABLE tasks ADD COLUMN checklist_items JSONB DEFAULT '[]';
    END IF;
END $$;

-- Advanced Automations
CREATE TABLE IF NOT EXISTS project_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    triggers JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    last_executed TIMESTAMP,
    execution_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 100,
    tags JSONB DEFAULT '[]',
    category VARCHAR(50) DEFAULT 'workflow'
);

-- Team Collaboration
CREATE TABLE IF NOT EXISTS team_collaborations (
    id VARCHAR(50) PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    participants JSONB NOT NULL,
    shared_resources JSONB NOT NULL,
    settings JSONB NOT NULL,
    analytics JSONB DEFAULT '{"views": 0, "downloads": 0, "comments": 0}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Smart Workflows
CREATE TABLE IF NOT EXISTS smart_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_category VARCHAR(50) NOT NULL,
    phases JSONB NOT NULL,
    dependencies JSONB DEFAULT '[]',
    variables JSONB DEFAULT '[]',
    estimated_duration INTEGER,
    team_roles_required JSONB DEFAULT '[]',
    client_involvement_points JSONB DEFAULT '[]',
    approval_gates JSONB DEFAULT '[]',
    risk_factors JSONB DEFAULT '[]',
    success_metrics JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0
);

-- Enhanced quotations and invoices support
DO $$ 
BEGIN
    -- Add enhanced columns to quotations table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='sections') THEN
        ALTER TABLE quotations ADD COLUMN sections JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='quote_milestones') THEN
        ALTER TABLE quotations ADD COLUMN quote_milestones JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='assumptions') THEN
        ALTER TABLE quotations ADD COLUMN assumptions JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='exclusions') THEN
        ALTER TABLE quotations ADD COLUMN exclusions JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='executive_summary') THEN
        ALTER TABLE quotations ADD COLUMN executive_summary TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='value_proposition') THEN
        ALTER TABLE quotations ADD COLUMN value_proposition TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='project_scope') THEN
        ALTER TABLE quotations ADD COLUMN project_scope TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='template') THEN
        ALTER TABLE quotations ADD COLUMN template VARCHAR(50) DEFAULT 'professional';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='color_scheme') THEN
        ALTER TABLE quotations ADD COLUMN color_scheme VARCHAR(50) DEFAULT 'blue';
    END IF;
    
    -- Add enhanced columns to invoices table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='company_logo') THEN
        ALTER TABLE invoices ADD COLUMN company_logo TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='company_name') THEN
        ALTER TABLE invoices ADD COLUMN company_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='template') THEN
        ALTER TABLE invoices ADD COLUMN template VARCHAR(50) DEFAULT 'modern';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='color_scheme') THEN
        ALTER TABLE invoices ADD COLUMN color_scheme VARCHAR(50) DEFAULT 'blue';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='show_logo') THEN
        ALTER TABLE invoices ADD COLUMN show_logo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Additional indexes for enhanced features
CREATE INDEX IF NOT EXISTS idx_content_sections_page ON content_sections(page);
CREATE INDEX IF NOT EXISTS idx_content_sections_published ON content_sections(is_published);
CREATE INDEX IF NOT EXISTS idx_services_content_category ON services_content(category);
CREATE INDEX IF NOT EXISTS idx_services_content_featured ON services_content(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_showcase_industry ON projects_showcase(industry);
CREATE INDEX IF NOT EXISTS idx_projects_showcase_featured ON projects_showcase(is_featured);
CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_phase_id ON tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_automations_project_id ON project_automations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_automations_active ON project_automations(is_active);
CREATE INDEX IF NOT EXISTS idx_team_collaborations_project_id ON team_collaborations(project_id);
CREATE INDEX IF NOT EXISTS idx_smart_workflows_category ON smart_workflows(template_category);

-- =====================================================
-- ADMIN PERSONNEL MANAGEMENT SYSTEM TABLES
-- =====================================================

-- Enhanced Users Table with Admin Personnel Features
DO $$
BEGIN
    -- Add admin-specific columns to existing users table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='salt') THEN
        ALTER TABLE users ADD COLUMN salt VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='account_locked') THEN
        ALTER TABLE users ADD COLUMN account_locked BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='account_locked_reason') THEN
        ALTER TABLE users ADD COLUMN account_locked_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='account_locked_until') THEN
        ALTER TABLE users ADD COLUMN account_locked_until TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='failed_login_attempts') THEN
        ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login_ip') THEN
        ALTER TABLE users ADD COLUMN last_login_ip INET;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_changed_at') THEN
        ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='two_factor_enabled') THEN
        ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='two_factor_secret') THEN
        ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone_verified') THEN
        ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='department') THEN
        ALTER TABLE users ADD COLUMN department VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='location') THEN
        ALTER TABLE users ADD COLUMN location VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='metadata') THEN
        ALTER TABLE users ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_by') THEN
        ALTER TABLE users ADD COLUMN created_by UUID REFERENCES users(id);
    END IF;
END $$;

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    conditions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Permissions Table
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    conditions JSONB DEFAULT '{}',
    UNIQUE(user_id, permission_id)
);

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    event_type VARCHAR(50) NOT NULL,
    event_subtype VARCHAR(50),
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium',
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    details JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Queue Jobs Table
CREATE TABLE IF NOT EXISTS queue_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 3,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    data JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    dependencies UUID[] DEFAULT '{}',
    tags VARCHAR(50)[] DEFAULT '{}',
    scheduled_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    worker_id VARCHAR(255),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Error Logs Table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    error_code VARCHAR(50),
    details JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    ip_address INET,
    user_agent TEXT,
    stack_trace TEXT,
    context JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    states JSONB NOT NULL DEFAULT '[]',
    transitions JSONB NOT NULL DEFAULT '[]',
    configuration JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow Instances Table
CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    current_state_id VARCHAR(100) NOT NULL,
    initiated_by UUID REFERENCES users(id),
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Workflow Events Table
CREATE TABLE IF NOT EXISTS workflow_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id),
    event_type VARCHAR(50) NOT NULL,
    from_state_id VARCHAR(100),
    to_state_id VARCHAR(100),
    triggered_by UUID REFERENCES users(id),
    event_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Approval Requests Table
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id),
    requester_id UUID NOT NULL REFERENCES users(id),
    approver_id UUID NOT NULL REFERENCES users(id),
    approval_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority INTEGER DEFAULT 3,
    deadline TIMESTAMP,
    approval_data JSONB DEFAULT '{}',
    response_data JSONB DEFAULT '{}',
    approved_at TIMESTAMP,
    comments TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR ADMIN PERSONNEL MANAGEMENT
-- =====================================================

-- User management indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_locked ON users(account_locked);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Session management indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_ip ON user_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON user_sessions(last_activity);

-- Role and permission indexes
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_level ON roles(level);
CREATE INDEX IF NOT EXISTS idx_roles_active ON roles(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_permissions_active ON permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_granted_by ON user_permissions(granted_by);

-- Security event indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_session_id ON security_events(session_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- Queue job indexes
CREATE INDEX IF NOT EXISTS idx_queue_jobs_status ON queue_jobs(status);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_priority ON queue_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_type ON queue_jobs(type);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_scheduled ON queue_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_worker ON queue_jobs(worker_id);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_created ON queue_jobs(created_at);

-- Error log indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_category ON error_logs(category);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);

-- Workflow indexes
CREATE INDEX IF NOT EXISTS idx_workflows_name ON workflows(name);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_workflow_id ON workflow_instances(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_state ON workflow_instances(current_state_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_active ON workflow_instances(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_events_instance_id ON workflow_events(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_type ON workflow_events(event_type);
CREATE INDEX IF NOT EXISTS idx_workflow_events_created ON workflow_events(created_at);

-- Approval request indexes
CREATE INDEX IF NOT EXISTS idx_approval_requests_workflow_instance ON approval_requests(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requester ON approval_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_approver ON approval_requests(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_priority ON approval_requests(priority);
CREATE INDEX IF NOT EXISTS idx_approval_requests_deadline ON approval_requests(deadline);

-- =====================================================
-- DEFAULT DATA FOR ADMIN PERSONNEL MANAGEMENT
-- =====================================================

-- Insert default roles
INSERT INTO roles (name, display_name, description, level) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions', 1),
('admin', 'Administrator', 'Administrative access with most permissions', 2),
('manager', 'Manager', 'Management access with limited permissions', 3),
('operator', 'Operator', 'Operational access with basic permissions', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
('users.create', 'Create Users', 'Create new user accounts', 'users', 'create'),
('users.read', 'Read Users', 'View user information', 'users', 'read'),
('users.update', 'Update Users', 'Modify user accounts', 'users', 'update'),
('users.delete', 'Delete Users', 'Remove user accounts', 'users', 'delete'),
('roles.manage', 'Manage Roles', 'Manage user roles and permissions', 'roles', 'manage'),
('security.monitor', 'Monitor Security', 'View security events and logs', 'security', 'monitor'),
('security.respond', 'Respond to Security', 'Respond to security incidents', 'security', 'respond'),
('system.configure', 'Configure System', 'Modify system configuration', 'system', 'configure'),
('audit.view', 'View Audit Logs', 'Access audit trail information', 'audit', 'view'),
('workflow.manage', 'Manage Workflows', 'Create and modify workflows', 'workflow', 'manage'),
('queue.monitor', 'Monitor Queue', 'View and manage job queues', 'queue', 'monitor'),
('personnel.manage', 'Manage Personnel', 'Full admin personnel management', 'personnel', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Create triggers for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
DO $$
BEGIN
    -- Users table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Roles table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_roles_updated_at') THEN
        CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Permissions table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_permissions_updated_at') THEN
        CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Queue jobs table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_queue_jobs_updated_at') THEN
        CREATE TRIGGER update_queue_jobs_updated_at BEFORE UPDATE ON queue_jobs
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Error logs table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_error_logs_updated_at') THEN
        CREATE TRIGGER update_error_logs_updated_at BEFORE UPDATE ON error_logs
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Workflows table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workflows_updated_at') THEN
        CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Approval requests table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_approval_requests_updated_at') THEN
        CREATE TRIGGER update_approval_requests_updated_at BEFORE UPDATE ON approval_requests
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =========================================
-- CALENDAR AND EVENTS SYSTEM TABLES
-- =========================================

-- Calendar events table
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('meeting', 'deadline', 'milestone', 'appointment', 'reminder', 'project_phase')),
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    assigned_to TEXT[], -- Array of user IDs
    location VARCHAR(255),
    meeting_link VARCHAR(500),
    attachments TEXT[], -- Array of file paths
    recurrence JSONB, -- Recurrence rules
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar reminders table
CREATE TABLE calendar_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'sms', 'push', 'system')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    recipients TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar activity log
CREATE TABLE calendar_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- FILE STORAGE SYSTEM TABLES
-- =========================================

-- File folders table
CREATE TABLE file_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    parent_folder_id UUID REFERENCES file_folders(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{"read": [], "write": [], "delete": []}',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File metadata table
CREATE TABLE file_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('document', 'image', 'video', 'audio', 'archive', 'other')),
    category VARCHAR(100) NOT NULL CHECK (category IN ('project', 'invoice', 'quotation', 'client', 'template', 'asset', 'backup')),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES file_folders(id) ON DELETE SET NULL,
    version INTEGER NOT NULL DEFAULT 1,
    parent_file_id UUID REFERENCES file_metadata(id) ON DELETE CASCADE,
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'client', 'public')),
    shared_with TEXT[],
    access_permissions JSONB NOT NULL DEFAULT '{"read": [], "write": [], "delete": []}',
    virus_scan_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'failed')),
    thumbnail_path TEXT,
    preview_path TEXT,
    metadata JSONB DEFAULT '{}',
    upload_progress INTEGER NOT NULL DEFAULT 0,
    upload_status VARCHAR(20) NOT NULL DEFAULT 'uploading' CHECK (upload_status IN ('uploading', 'completed', 'failed', 'processing')),
    uploaded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- File share links table
CREATE TABLE file_share_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES file_metadata(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    permissions VARCHAR(20) NOT NULL CHECK (permissions IN ('view', 'download', 'edit')),
    password_protected BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    download_limit INTEGER,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File activity log
CREATE TABLE file_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    file_id UUID NOT NULL REFERENCES file_metadata(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- SMTP AND EMAIL SYSTEM TABLES
-- =========================================

-- Email templates table
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    category VARCHAR(50) NOT NULL CHECK (category IN ('contact', 'notification', 'marketing', 'system', 'invoice', 'reminder')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email messages table
CREATE TABLE email_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_emails TEXT[] NOT NULL,
    cc_emails TEXT[],
    bcc_emails TEXT[],
    from_email VARCHAR(255) NOT NULL,
    reply_to VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT NOT NULL,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    variables JSONB,
    attachments JSONB,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    tracking JSONB DEFAULT '{"opens": 0, "clicks": 0, "bounces": 0, "complaints": 0}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact form submissions table
CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    form_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (form_type IN ('general', 'quote_request', 'support', 'partnership', 'career')),
    source_page VARCHAR(500) NOT NULL,
    user_agent TEXT NOT NULL,
    ip_address INET NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'closed', 'spam')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email activity log
CREATE TABLE email_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    email_id UUID REFERENCES email_messages(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact activity log
CREATE TABLE contact_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    submission_id UUID NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- ALERT SYSTEM TABLES
-- =========================================

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'deadline', 'delay', 'milestone', 'system')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    source VARCHAR(50) NOT NULL CHECK (source IN ('system', 'project', 'calendar', 'invoice', 'user', 'external')),
    entity_type VARCHAR(50) CHECK (entity_type IN ('project', 'task', 'milestone', 'invoice', 'client', 'user')),
    entity_id UUID,
    recipients TEXT[] NOT NULL,
    channels TEXT[] NOT NULL,
    conditions JSONB DEFAULT '[]',
    actions JSONB DEFAULT '[]',
    triggers JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Alert rules table
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('schedule', 'event', 'condition', 'threshold', 'deadline')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('project', 'task', 'milestone', 'invoice', 'client', 'system')),
    conditions JSONB NOT NULL DEFAULT '[]',
    actions JSONB NOT NULL DEFAULT '[]',
    recipients TEXT[] NOT NULL,
    channels TEXT[] NOT NULL,
    frequency VARCHAR(50) NOT NULL DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'on_change', 'escalating')),
    escalation_rules JSONB,
    priority INTEGER NOT NULL DEFAULT 5,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert activity log
CREATE TABLE alert_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- INDEXES FOR NEW TABLES
-- =========================================

-- Calendar indexes
CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX idx_calendar_events_project_id ON calendar_events(project_id);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
CREATE INDEX idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_reminders_reminder_time ON calendar_reminders(reminder_time);

-- File storage indexes
CREATE INDEX idx_file_metadata_category ON file_metadata(category);
CREATE INDEX idx_file_metadata_project_id ON file_metadata(project_id);
CREATE INDEX idx_file_metadata_folder_id ON file_metadata(folder_id);
CREATE INDEX idx_file_metadata_uploaded_by ON file_metadata(uploaded_by);
CREATE INDEX idx_file_metadata_file_type ON file_metadata(file_type);
CREATE INDEX idx_file_folders_parent_folder_id ON file_folders(parent_folder_id);

-- Email and contact indexes
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_form_type ON contact_submissions(form_type);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX idx_email_messages_status ON email_messages(status);
CREATE INDEX idx_email_messages_scheduled_for ON email_messages(scheduled_for);

-- Alert indexes
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_entity ON alerts(entity_type, entity_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_alert_rules_is_active ON alert_rules(is_active);

-- =========================================
-- UPDATE TRIGGERS FOR NEW TABLES
-- =========================================

-- Calendar events trigger
CREATE TRIGGER update_calendar_events_updated_at 
    BEFORE UPDATE ON calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- File folders trigger
CREATE TRIGGER update_file_folders_updated_at 
    BEFORE UPDATE ON file_folders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- File metadata trigger
CREATE TRIGGER update_file_metadata_updated_at 
    BEFORE UPDATE ON file_metadata 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Email templates trigger
CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Email messages trigger
CREATE TRIGGER update_email_messages_updated_at 
    BEFORE UPDATE ON email_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Contact submissions trigger
CREATE TRIGGER update_contact_submissions_updated_at 
    BEFORE UPDATE ON contact_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Alerts trigger
CREATE TRIGGER update_alerts_updated_at 
    BEFORE UPDATE ON alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Alert rules trigger
CREATE TRIGGER update_alert_rules_updated_at 
    BEFORE UPDATE ON alert_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- DEFAULT EMAIL TEMPLATES
-- =========================================

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, text_content, variables, category, created_by) VALUES
('contact-acknowledgment', 'Thank you for contacting us - {{name}}', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #ea580c;">Thank you for your message!</h2>
    <p>Dear {{name}},</p>
    <p>We have received your message regarding "<strong>{{subject}}</strong>" and will respond within 24 hours.</p>
    <div style="background-color: #fff7ed; padding: 15px; border-left: 4px solid #ea580c; margin: 20px 0;">
        <p><strong>Reference ID:</strong> {{reference_id}}</p>
        <p><strong>Form Type:</strong> {{form_type}}</p>
    </div>
    <p>Best regards,<br>
    <strong>The Akibeks Team</strong><br>
    Construction Excellence Since 2020</p>
 </div>',
 'Thank you for your message! Dear {{name}}, We have received your message regarding "{{subject}}" and will respond within 24 hours. Reference ID: {{reference_id}} Form Type: {{form_type}} Best regards, The Akibeks Team - Construction Excellence Since 2020',
 ARRAY['name', 'subject', 'reference_id', 'form_type'], 'contact', 'system'),

('admin-contact-notification', 'New Contact Form Submission - {{name}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #ea580c;">New Contact Form Submission</h2>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>From:</strong> {{name}} ({{email}})</p>
        <p><strong>Phone:</strong> {{phone}}</p>
        <p><strong>Company:</strong> {{company}}</p>
        <p><strong>Subject:</strong> {{subject}}</p>
        <p><strong>Type:</strong> <span style="background-color: #ea580c; color: white; padding: 4px 8px; border-radius: 4px;">{{form_type}}</span></p>
        <p><strong>Priority:</strong> <span style="background-color: #dc2626; color: white; padding: 4px 8px; border-radius: 4px;">{{priority}}</span></p>
    </div>
    <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Message:</strong></p>
        <p>{{message}}</p>
    </div>
    <p><a href="{{admin_url}}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Admin Panel</a></p>
 </div>',
 'New Contact Form Submission From: {{name}} ({{email}}) Phone: {{phone}} Company: {{company}} Subject: {{subject}} Type: {{form_type}} Priority: {{priority}} Message: {{message}} View in Admin Panel: {{admin_url}}',
 ARRAY['name', 'email', 'phone', 'company', 'subject', 'form_type', 'priority', 'message', 'admin_url'], 'notification', 'system'),

('alert-notification', 'System Alert: {{alert_title}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc2626;">System Alert</h2>
    <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
        <p><strong>Type:</strong> {{alert_type}}</p>
        <p><strong>Severity:</strong> <span style="background-color: #dc2626; color: white; padding: 4px 8px; border-radius: 4px;">{{alert_severity}}</span></p>
        <p><strong>Message:</strong></p>
        <p>{{alert_message}}</p>
    </div>
    <p><a href="{{alert_url}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Alert Details</a></p>
 </div>',
 'System Alert Type: {{alert_type}} Severity: {{alert_severity}} Message: {{alert_message}} View Alert: {{alert_url}}',
 ARRAY['alert_title', 'alert_type', 'alert_severity', 'alert_message', 'alert_url'], 'system', 'system')
ON CONFLICT (name) DO NOTHING;