import { Pool, QueryResult } from 'pg';

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'project_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database connection test
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Generic query executor
export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Database service class
export class DatabaseService {
  // Users
  static async createUser(userData: any) {
    const { email, name, role = 'user', password_hash } = userData;
    const result = await query(
      'INSERT INTO users (email, name, role, password_hash, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [email, name, role, password_hash]
    );
    return result.rows[0];
  }

  static async getUserByEmail(email: string) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async getUserById(id: string) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async getAllUsers() {
    const result = await query('SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  static async updateUser(id: string, updates: any) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async deleteUser(id: string) {
    await query('DELETE FROM users WHERE id = $1', [id]);
  }

  // Projects
  static async createProject(projectData: any) {
    const { name, description, status = 'active', client_id, manager_id, budget, start_date, end_date } = projectData;
    const result = await query(
      'INSERT INTO projects (name, description, status, client_id, manager_id, budget, start_date, end_date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
      [name, description, status, client_id, manager_id, budget, start_date, end_date]
    );
    return result.rows[0];
  }

  static async getAllProjects() {
    const result = await query(`
      SELECT p.*, u.name as manager_name, c.name as client_name 
      FROM projects p 
      LEFT JOIN users u ON p.manager_id = u.id 
      LEFT JOIN clients c ON p.client_id = c.id 
      ORDER BY p.created_at DESC
    `);
    return result.rows;
  }

  static async getProjectById(id: string) {
    const result = await query(`
      SELECT p.*, u.name as manager_name, c.name as client_name 
      FROM projects p 
      LEFT JOIN users u ON p.manager_id = u.id 
      LEFT JOIN clients c ON p.client_id = c.id 
      WHERE p.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async updateProject(id: string, updates: any) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    const result = await query(
      `UPDATE projects SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async deleteProject(id: string) {
    await query('DELETE FROM projects WHERE id = $1', [id]);
  }

  // Clients
  static async createClient(clientData: any) {
    const { name, email, phone, company, address } = clientData;
    const result = await query(
      'INSERT INTO clients (name, email, phone, company, address, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [name, email, phone, company, address]
    );
    return result.rows[0];
  }

  static async getAllClients() {
    const result = await query('SELECT * FROM clients ORDER BY created_at DESC');
    return result.rows;
  }

  static async getClientById(id: string) {
    const result = await query('SELECT * FROM clients WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateClient(id: string, updates: any) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    const result = await query(
      `UPDATE clients SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async deleteClient(id: string) {
    await query('DELETE FROM clients WHERE id = $1', [id]);
  }

  // Tasks
  static async createTask(taskData: any) {
    const { title, description, status = 'pending', priority = 'medium', project_id, assigned_to, due_date } = taskData;
    const result = await query(
      'INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, due_date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [title, description, status, priority, project_id, assigned_to, due_date]
    );
    return result.rows[0];
  }

  static async getTasksByProject(projectId: string) {
    const result = await query(`
      SELECT t.*, u.name as assigned_name 
      FROM tasks t 
      LEFT JOIN users u ON t.assigned_to = u.id 
      WHERE t.project_id = $1 
      ORDER BY t.created_at DESC
    `, [projectId]);
    return result.rows;
  }

  static async getAllTasks() {
    const result = await query(`
      SELECT t.*, u.name as assigned_name, p.name as project_name 
      FROM tasks t 
      LEFT JOIN users u ON t.assigned_to = u.id 
      LEFT JOIN projects p ON t.project_id = p.id 
      ORDER BY t.created_at DESC
    `);
    return result.rows;
  }

  static async updateTask(id: string, updates: any) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    const result = await query(
      `UPDATE tasks SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async deleteTask(id: string) {
    await query('DELETE FROM tasks WHERE id = $1', [id]);
  }

  // Invoices
  static async createInvoice(invoiceData: any) {
    const { invoice_number, client_id, project_id, amount, tax_amount, total_amount, due_date, status = 'draft', items } = invoiceData;
    const result = await query(
      'INSERT INTO invoices (invoice_number, client_id, project_id, amount, tax_amount, total_amount, due_date, status, items, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *',
      [invoice_number, client_id, project_id, amount, tax_amount, total_amount, due_date, status, JSON.stringify(items)]
    );
    return result.rows[0];
  }

  static async getAllInvoices() {
    const result = await query(`
      SELECT i.*, c.name as client_name, p.name as project_name 
      FROM invoices i 
      LEFT JOIN clients c ON i.client_id = c.id 
      LEFT JOIN projects p ON i.project_id = p.id 
      ORDER BY i.created_at DESC
    `);
    return result.rows;
  }

  static async getInvoiceById(id: string) {
    const result = await query(`
      SELECT i.*, c.name as client_name, p.name as project_name 
      FROM invoices i 
      LEFT JOIN clients c ON i.client_id = c.id 
      LEFT JOIN projects p ON i.project_id = p.id 
      WHERE i.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async updateInvoice(id: string, updates: any) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    const result = await query(
      `UPDATE invoices SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async deleteInvoice(id: string) {
    await query('DELETE FROM invoices WHERE id = $1', [id]);
  }

  // Quotations
  static async createQuotation(quotationData: any) {
    const { quote_number, client_id, project_id, amount, tax_amount, total_amount, valid_until, status = 'draft', items } = quotationData;
    const result = await query(
      'INSERT INTO quotations (quote_number, client_id, project_id, amount, tax_amount, total_amount, valid_until, status, items, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *',
      [quote_number, client_id, project_id, amount, tax_amount, total_amount, valid_until, status, JSON.stringify(items)]
    );
    return result.rows[0];
  }

  static async getAllQuotations() {
    const result = await query(`
      SELECT q.*, c.name as client_name, p.name as project_name 
      FROM quotations q 
      LEFT JOIN clients c ON q.client_id = c.id 
      LEFT JOIN projects p ON q.project_id = p.id 
      ORDER BY q.created_at DESC
    `);
    return result.rows;
  }

  static async getQuotationById(id: string) {
    const result = await query(`
      SELECT q.*, c.name as client_name, p.name as project_name 
      FROM quotations q 
      LEFT JOIN clients c ON q.client_id = c.id 
      LEFT JOIN projects p ON q.project_id = p.id 
      WHERE q.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async updateQuotation(id: string, updates: any) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    const result = await query(
      `UPDATE quotations SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async deleteQuotation(id: string) {
    await query('DELETE FROM quotations WHERE id = $1', [id]);
  }

  // Time Entries
  static async createTimeEntry(timeData: any) {
    const { task_id, user_id, hours, description, date } = timeData;
    const result = await query(
      'INSERT INTO time_entries (task_id, user_id, hours, description, date, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [task_id, user_id, hours, description, date]
    );
    return result.rows[0];
  }

  static async getTimeEntriesByProject(projectId: string) {
    const result = await query(`
      SELECT te.*, u.name as user_name, t.title as task_title 
      FROM time_entries te 
      LEFT JOIN users u ON te.user_id = u.id 
      LEFT JOIN tasks t ON te.task_id = t.id 
      WHERE t.project_id = $1 
      ORDER BY te.date DESC
    `, [projectId]);
    return result.rows;
  }

  static async getAllTimeEntries() {
    const result = await query(`
      SELECT te.*, u.name as user_name, t.title as task_title, p.name as project_name 
      FROM time_entries te 
      LEFT JOIN users u ON te.user_id = u.id 
      LEFT JOIN tasks t ON te.task_id = t.id 
      LEFT JOIN projects p ON t.project_id = p.id 
      ORDER BY te.date DESC
    `);
    return result.rows;
  }

  static async updateTimeEntry(id: string, updates: any) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    const result = await query(
      `UPDATE time_entries SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async deleteTimeEntry(id: string) {
    await query('DELETE FROM time_entries WHERE id = $1', [id]);
  }

  // Analytics
  static async getProjectAnalytics() {
    const [totalProjects, activeProjects, completedProjects, revenue] = await Promise.all([
      query('SELECT COUNT(*) as count FROM projects'),
      query('SELECT COUNT(*) as count FROM projects WHERE status = $1', ['active']),
      query('SELECT COUNT(*) as count FROM projects WHERE status = $1', ['completed']),
      query('SELECT SUM(total_amount) as total FROM invoices WHERE status = $1', ['paid'])
    ]);

    return {
      totalProjects: parseInt(totalProjects.rows[0].count),
      activeProjects: parseInt(activeProjects.rows[0].count),
      completedProjects: parseInt(completedProjects.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total || '0')
    };
  }

  static async getMonthlyRevenue() {
    const result = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(total_amount) as revenue
      FROM invoices 
      WHERE status = 'paid' 
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month 
      ORDER BY month
    `);
    return result.rows;
  }

  // Templates
  static async createTemplate(templateData: any) {
    const { name, type, content, is_default = false } = templateData;
    const result = await query(
      'INSERT INTO templates (name, type, content, is_default, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [name, type, JSON.stringify(content), is_default]
    );
    return result.rows[0];
  }

  static async getAllTemplates() {
    const result = await query('SELECT * FROM templates ORDER BY created_at DESC');
    return result.rows;
  }

  static async getTemplatesByType(type: string) {
    const result = await query('SELECT * FROM templates WHERE type = $1 ORDER BY created_at DESC', [type]);
    return result.rows;
  }

  static async updateTemplate(id: string, updates: any) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    const result = await query(
      `UPDATE templates SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async deleteTemplate(id: string) {
    await query('DELETE FROM templates WHERE id = $1', [id]);
  }
}

// Mock data for development/testing
export const mockData = {
  users: [
    { id: '1', email: 'admin@company.com', name: 'Admin User', role: 'admin' },
    { id: '2', email: 'manager@company.com', name: 'Project Manager', role: 'manager' },
    { id: '3', email: 'developer@company.com', name: 'Developer', role: 'user' }
  ],
  projects: [
    { id: '1', name: 'Website Redesign', status: 'active', budget: 50000, client_name: 'Tech Corp' },
    { id: '2', name: 'Mobile App', status: 'planning', budget: 75000, client_name: 'Startup Inc' },
    { id: '3', name: 'E-commerce Platform', status: 'completed', budget: 100000, client_name: 'Retail Co' }
  ],
  clients: [
    { id: '1', name: 'Tech Corp', email: 'contact@techcorp.com', company: 'Tech Corp', phone: '+1234567890' },
    { id: '2', name: 'Startup Inc', email: 'info@startup.com', company: 'Startup Inc', phone: '+0987654321' },
    { id: '3', name: 'Retail Co', email: 'hello@retail.com', company: 'Retail Co', phone: '+1122334455' }
  ]
};

export default pool;