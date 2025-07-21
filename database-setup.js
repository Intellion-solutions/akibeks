/**
 * Simple Database Setup for AKIBEKS Engineering Solutions
 * This script helps set up your PostgreSQL database with the required tables
 * 
 * INSTRUCTIONS:
 * 1. Update the database configuration below with your cPanel PostgreSQL details
 * 2. Run: node database-setup.js
 * 3. This will create all required tables and sample data
 */

const { Pool } = require('pg');
const { DATABASE_CONFIG } = require('./config.js');

// ===============================
// DATABASE CONFIGURATION
// ===============================
// Edit these values to match your cPanel PostgreSQL database
const dbConfig = {
  user: DATABASE_CONFIG.username,     // Your PostgreSQL username from cPanel
  password: DATABASE_CONFIG.password, // Your PostgreSQL password from cPanel
  host: DATABASE_CONFIG.host,         // Usually 'localhost' for cPanel
  port: DATABASE_CONFIG.port,         // Usually 5432 for PostgreSQL
  database: DATABASE_CONFIG.database, // Your database name from cPanel
  ssl: DATABASE_CONFIG.ssl            // SSL configuration
};

console.log('🔧 AKIBEKS Database Setup');
console.log('========================');
console.log(`Database: ${dbConfig.database}`);
console.log(`Host: ${dbConfig.host}`);
console.log(`User: ${dbConfig.user}`);
console.log('');

// Create database connection
const pool = new Pool(dbConfig);

// SQL to create all required tables
const createTablesSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  phone_number VARCHAR(20),
  kra_pin VARCHAR(20),
  id_number VARCHAR(20),
  county VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'planning',
  budget_kes DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  completion_percentage INTEGER DEFAULT 0,
  client_id UUID REFERENCES users(id),
  location VARCHAR(255),
  county VARCHAR(50),
  project_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price_range_min_kes DECIMAL(12,2),
  price_range_max_kes DECIMAL(12,2),
  duration_estimate VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name VARCHAR(255) NOT NULL,
  client_company VARCHAR(255),
  client_position VARCHAR(255),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  project_id UUID REFERENCES projects(id),
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO configurations table
CREATE TABLE IF NOT EXISTS seo_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_type VARCHAR(100) NOT NULL,
  page_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  keywords JSONB DEFAULT '[]',
  canonical_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_seo_page_type ON seo_configurations(page_type);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_updated_at ON seo_configurations;
CREATE TRIGGER update_seo_updated_at BEFORE UPDATE ON seo_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Sample data to insert
const sampleDataSQL = `
-- Insert sample admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role, is_active, is_email_verified, phone_number, county)
VALUES ('admin@akibeks.co.ke', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8G', 'Admin', 'User', 'admin', true, true, '+254700000000', 'Nairobi')
ON CONFLICT (email) DO NOTHING;

-- Insert sample services
INSERT INTO services (name, description, category, price_range_min_kes, price_range_max_kes, duration_estimate, is_active)
VALUES 
  ('Residential Construction', 'Complete home building services from foundation to finishing', 'Residential', 500000, 5000000, '3-12 months', true),
  ('Commercial Building', 'Office buildings, retail spaces, and commercial complexes', 'Commercial', 2000000, 50000000, '6-24 months', true),
  ('Renovation & Repair', 'Home and office renovation services', 'Renovation', 100000, 2000000, '1-6 months', true),
  ('Infrastructure Development', 'Roads, bridges, and public infrastructure projects', 'Infrastructure', 5000000, 100000000, '12-36 months', true),
  ('Green Building Solutions', 'Sustainable and eco-friendly construction services', 'Sustainable', 800000, 8000000, '4-18 months', true)
ON CONFLICT DO NOTHING;

-- Insert sample projects
INSERT INTO projects (title, description, status, budget_kes, start_date, end_date, completion_percentage, location, county, project_type)
VALUES 
  ('Nairobi Modern Offices', 'Modern office complex in Westlands', 'completed', 12000000, '2023-01-15', '2024-03-15', 100, 'Westlands, Nairobi', 'Nairobi', 'Commercial'),
  ('Mombasa Residential Estate', 'Affordable housing project in Kisauni', 'in_progress', 8000000, '2024-01-01', '2024-12-31', 65, 'Kisauni, Mombasa', 'Mombasa', 'Residential'),
  ('Kisumu Water Plant', 'Water treatment facility upgrade', 'completed', 20000000, '2022-06-01', '2023-09-30', 100, 'Kisumu City', 'Kisumu', 'Infrastructure')
ON CONFLICT DO NOTHING;

-- Insert sample testimonials
INSERT INTO testimonials (client_name, client_company, client_position, content, rating, is_featured, is_approved)
VALUES 
  ('John Kamau', 'Kamau Holdings Ltd', 'Managing Director', 'AKIBEKS delivered our office complex on time and within budget. Exceptional quality and professionalism.', 5, true, true),
  ('Mary Wanjiku', 'Wanjiku Enterprises', 'CEO', 'The residential project exceeded our expectations. The team was professional and the quality was outstanding.', 5, true, true),
  ('David Ochieng', 'Ochieng Construction', 'Project Manager', 'Great collaboration on the infrastructure project. AKIBEKS brought innovation and efficiency to our project.', 4, false, true)
ON CONFLICT DO NOTHING;

-- Insert sample SEO configurations
INSERT INTO seo_configurations (page_type, title, description, keywords)
VALUES 
  ('home', 'AKIBEKS Engineering Solutions - Leading Construction Company in Kenya', 'Professional construction and engineering services across Kenya. Quality building, renovation, and infrastructure development.', '["construction Kenya", "engineering services", "building contractors", "renovation Kenya"]'),
  ('services', 'Construction Services - AKIBEKS Engineering Solutions', 'Comprehensive construction services including residential, commercial, and infrastructure development across Kenya.', '["construction services", "building services Kenya", "residential construction", "commercial construction"]'),
  ('about', 'About Us - AKIBEKS Engineering Solutions', 'Learn about AKIBEKS Engineering Solutions, Kenya\'s leading construction and engineering company with over 10 years of experience.', '["about AKIBEKS", "construction company Kenya", "engineering company", "building contractors"]')
ON CONFLICT DO NOTHING;
`;

// Main setup function
async function setupDatabase() {
  console.log('🔄 Connecting to database...');
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    client.release();
    
    console.log('🔄 Creating tables...');
    await pool.query(createTablesSQL);
    console.log('✅ Tables created successfully!');
    
    console.log('🔄 Inserting sample data...');
    await pool.query(sampleDataSQL);
    console.log('✅ Sample data inserted successfully!');
    
    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Update your .env file with the database credentials');
    console.log('2. Start your application: npm run dev');
    console.log('3. Access admin panel with: admin@akibeks.co.ke / admin123');
    console.log('');
    console.log('🔗 Test your setup:');
    console.log('- Website: http://localhost:8080');
    console.log('- Admin: http://localhost:8080/admin');
    console.log('- API Health: http://localhost:3000/api/health');
    
  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error('Error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your database credentials in config.js');
    console.log('2. Ensure PostgreSQL is running');
    console.log('3. Verify the database exists in cPanel');
    console.log('4. Check if the user has proper permissions');
  } finally {
    await pool.end();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, dbConfig };