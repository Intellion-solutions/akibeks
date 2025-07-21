const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration
const pool = new Pool({
  host: process.env.VITE_DB_HOST || 'localhost',
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  database: process.env.VITE_DB_NAME || 'project_management',
  user: process.env.VITE_DB_USER || 'postgres',
  password: process.env.VITE_DB_PASSWORD || 'password',
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Initializing database with sample data...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    await client.query(`
      INSERT INTO users (email, password_hash, name, role, is_active, is_verified, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
    `, [
      'admin@company.com',
      adminPassword,
      'System Administrator',
      'admin',
      true,
      true
    ]);

    // Create sample clients
    const clients = [
      {
        name: 'Tech Solutions Inc.',
        email: 'contact@techsolutions.com',
        phone: '+1 (555) 123-4567',
        company: 'Tech Solutions Inc.',
        address: '123 Technology Drive, San Francisco, CA 94105'
      },
      {
        name: 'Creative Agency Co.',
        email: 'hello@creativeagency.com',
        phone: '+1 (555) 987-6543',
        company: 'Creative Agency Co.',
        address: '456 Design Street, New York, NY 10001'
      },
      {
        name: 'Global Retail Corp.',
        email: 'info@globalretail.com',
        phone: '+1 (555) 456-7890',
        company: 'Global Retail Corp.',
        address: '789 Commerce Blvd, Chicago, IL 60601'
      }
    ];

    for (const client of clients) {
      await client.query(`
        INSERT INTO clients (name, email, phone, company, address, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (email) DO NOTHING
      `, [client.name, client.email, client.phone, client.company, client.address]);
    }

    // Create sample projects
    const projectsResult = await client.query('SELECT id FROM clients LIMIT 3');
    const clientIds = projectsResult.rows.map(row => row.id);

    const projects = [
      {
        title: 'E-commerce Website Redesign',
        description: 'Complete redesign of the company e-commerce platform with modern UI/UX',
        status: 'active',
        priority: 'high',
        budget: 50000.00,
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-06-15'),
        client_id: clientIds[0]
      },
      {
        title: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android platforms',
        status: 'planning',
        priority: 'medium',
        budget: 75000.00,
        start_date: new Date('2024-03-01'),
        end_date: new Date('2024-09-01'),
        client_id: clientIds[1]
      },
      {
        title: 'Brand Identity Package',
        description: 'Complete brand identity design including logo, guidelines, and marketing materials',
        status: 'completed',
        priority: 'medium',
        budget: 25000.00,
        start_date: new Date('2023-10-01'),
        end_date: new Date('2024-01-31'),
        client_id: clientIds[2]
      }
    ];

    for (const project of projects) {
      await client.query(`
        INSERT INTO projects (title, description, status, priority, budget, start_date, end_date, client_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT DO NOTHING
      `, [
        project.title,
        project.description,
        project.status,
        project.priority,
        project.budget,
        project.start_date,
        project.end_date,
        project.client_id
      ]);
    }

    // Create sample services
    const services = [
      {
        title: 'Web Development',
        description: 'Custom web application development using modern technologies',
        category: 'development',
        price: 5000.00,
        duration: '4-8 weeks',
        is_active: true,
        is_featured: true
      },
      {
        title: 'Mobile App Development',
        description: 'Native and cross-platform mobile application development',
        category: 'development',
        price: 8000.00,
        duration: '8-12 weeks',
        is_active: true,
        is_featured: true
      },
      {
        title: 'UI/UX Design',
        description: 'User interface and user experience design services',
        category: 'design',
        price: 3000.00,
        duration: '2-4 weeks',
        is_active: true,
        is_featured: false
      },
      {
        title: 'Digital Marketing',
        description: 'Comprehensive digital marketing strategy and implementation',
        category: 'marketing',
        price: 2000.00,
        duration: 'Ongoing',
        is_active: true,
        is_featured: false
      }
    ];

    for (const service of services) {
      await client.query(`
        INSERT INTO services_content (title, description, category, price, duration, is_active, is_featured, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT DO NOTHING
      `, [
        service.title,
        service.description,
        service.category,
        service.price,
        service.duration,
        service.is_active,
        service.is_featured
      ]);
    }

    // Create sample testimonials
    const testimonials = [
      {
        client_name: 'John Smith',
        company: 'Tech Solutions Inc.',
        content: 'Outstanding work! The team delivered exactly what we needed and exceeded our expectations.',
        rating: 5,
        is_approved: true,
        is_featured: true
      },
      {
        client_name: 'Sarah Johnson',
        company: 'Creative Agency Co.',
        content: 'Professional, responsive, and delivered on time. Highly recommend their services!',
        rating: 5,
        is_approved: true,
        is_featured: false
      },
      {
        client_name: 'Mike Davis',
        company: 'Global Retail Corp.',
        content: 'Great experience working with this team. They understood our requirements perfectly.',
        rating: 4,
        is_approved: true,
        is_featured: true
      }
    ];

    for (const testimonial of testimonials) {
      await client.query(`
        INSERT INTO testimonials (client_name, company, content, rating, is_approved, is_featured, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT DO NOTHING
      `, [
        testimonial.client_name,
        testimonial.company,
        testimonial.content,
        testimonial.rating,
        testimonial.is_approved,
        testimonial.is_featured
      ]);
    }

    // Create sample tasks for projects
    const projectsForTasks = await client.query('SELECT id FROM projects LIMIT 2');
    const projectIdsForTasks = projectsForTasks.rows.map(row => row.id);

    const tasks = [
      {
        title: 'Design System Setup',
        description: 'Create a comprehensive design system with components and guidelines',
        status: 'in_progress',
        priority: 'high',
        project_id: projectIdsForTasks[0],
        due_date: new Date('2024-02-15')
      },
      {
        title: 'Database Schema Design',
        description: 'Design and implement the database schema for the application',
        status: 'completed',
        priority: 'high',
        project_id: projectIdsForTasks[0],
        due_date: new Date('2024-01-30')
      },
      {
        title: 'User Authentication',
        description: 'Implement user registration, login, and authentication system',
        status: 'pending',
        priority: 'medium',
        project_id: projectIdsForTasks[1],
        due_date: new Date('2024-03-15')
      }
    ];

    for (const task of tasks) {
      await client.query(`
        INSERT INTO tasks (title, description, status, priority, project_id, due_date, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT DO NOTHING
      `, [
        task.title,
        task.description,
        task.status,
        task.priority,
        task.project_id,
        task.due_date
      ]);
    }

    // Create sample calendar events
    const calendarEvents = [
      {
        title: 'Project Kickoff Meeting',
        description: 'Initial meeting with client to discuss project requirements',
        start_time: new Date('2024-02-01T10:00:00'),
        end_time: new Date('2024-02-01T11:00:00'),
        event_type: 'meeting',
        location: 'Conference Room A',
        created_by: 'admin@company.com'
      },
      {
        title: 'Design Review Deadline',
        description: 'Final deadline for design review and approval',
        start_time: new Date('2024-02-15T17:00:00'),
        end_time: new Date('2024-02-15T17:00:00'),
        event_type: 'deadline',
        created_by: 'admin@company.com'
      },
      {
        title: 'Weekly Team Standup',
        description: 'Weekly team meeting to discuss progress and blockers',
        start_time: new Date('2024-02-05T09:00:00'),
        end_time: new Date('2024-02-05T09:30:00'),
        event_type: 'meeting',
        location: 'Virtual - Zoom',
        is_recurring: true,
        recurrence_pattern: 'weekly',
        created_by: 'admin@company.com'
      }
    ];

    for (const event of calendarEvents) {
      await client.query(`
        INSERT INTO calendar_events (title, description, start_time, end_time, event_type, location, is_recurring, recurrence_pattern, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT DO NOTHING
      `, [
        event.title,
        event.description,
        event.start_time,
        event.end_time,
        event.event_type,
        event.location,
        event.is_recurring || false,
        event.recurrence_pattern || null,
        event.created_by
      ]);
    }

    // Create sample email templates
    const emailTemplates = [
      {
        name: 'Welcome Email',
        subject: 'Welcome to Our Platform',
        body: 'Dear {{name}}, welcome to our platform! We are excited to have you on board.',
        template_type: 'notification',
        is_active: true
      },
      {
        name: 'Project Update',
        subject: 'Project Update: {{project_name}}',
        body: 'Hello {{client_name}}, here is an update on your project: {{project_name}}. {{update_content}}',
        template_type: 'project',
        is_active: true
      },
      {
        name: 'Invoice Reminder',
        subject: 'Invoice Reminder: {{invoice_number}}',
        body: 'Dear {{client_name}}, this is a friendly reminder that invoice {{invoice_number}} is due on {{due_date}}.',
        template_type: 'invoice',
        is_active: true
      }
    ];

    for (const template of emailTemplates) {
      await client.query(`
        INSERT INTO email_templates (name, subject, body, template_type, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (name) DO UPDATE SET
          subject = EXCLUDED.subject,
          body = EXCLUDED.body,
          template_type = EXCLUDED.template_type,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()
      `, [
        template.name,
        template.subject,
        template.body,
        template.template_type,
        template.is_active
      ]);
    }

    console.log('✅ Database initialized successfully!');
    console.log('📧 Admin Login:');
    console.log('   Email: admin@company.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🎉 Sample data created:');
    console.log('   - 3 Clients');
    console.log('   - 3 Projects');
    console.log('   - 4 Services');
    console.log('   - 3 Testimonials');
    console.log('   - 3 Tasks');
    console.log('   - 3 Calendar Events');
    console.log('   - 3 Email Templates');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };