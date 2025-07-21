import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Authentication utilities
export const authUtils = {
  hashPassword: async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12);
  },

  comparePassword: async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  },

  generateToken: (payload: any): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verifyToken: (token: string): any => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  createSession: async (userId: string, userAgent?: string, ipAddress?: string) => {
    const sessionToken = authUtils.generateToken({ userId, type: 'session' });
    
    await query(
      'INSERT INTO user_sessions (user_id, session_token, user_agent, ip_address, expires_at, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [userId, sessionToken, userAgent, ipAddress, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    return sessionToken;
  },

  validateSession: async (sessionToken: string): Promise<any> => {
    const result = await query(
      'SELECT s.*, u.* FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = $1 AND s.expires_at > NOW() AND s.is_active = true',
      [sessionToken]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired session');
    }

    // Update last activity
    await query(
      'UPDATE user_sessions SET last_activity = NOW() WHERE session_token = $1',
      [sessionToken]
    );

    return result.rows[0];
  },

  revokeSession: async (sessionToken: string) => {
    await query(
      'UPDATE user_sessions SET is_active = false WHERE session_token = $1',
      [sessionToken]
    );
  }
};

// Database connection utilities
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export const query = async (text: string, params?: any[]): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

export const transaction = async (queries: Array<{ text: string; params?: any[] }>): Promise<any[]> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    for (const q of queries) {
      const result = await client.query(q.text, q.params);
      results.push(result);
    }
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Enhanced database service with authentication and security
export class DatabaseClient {
  // Authentication methods
  static async signUp(email: string, password: string, userData: any = {}) {
    const hashedPassword = await authUtils.hashPassword(password);
    
    const result = await query(
      'INSERT INTO users (email, password_hash, name, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, name, role, created_at',
      [email, hashedPassword, userData.name || 'User', userData.role || 'user']
    );

    const user = result.rows[0];
    const token = authUtils.generateToken({ userId: user.id, email: user.email, role: user.role });

    return { user, token };
  }

  static async signIn(email: string, password: string, userAgent?: string, ipAddress?: string) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const isValidPassword = await authUtils.comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Create session
    const sessionToken = await authUtils.createSession(user.id, userAgent, ipAddress);

    // Log activity
    await this.logActivity(user.id, 'LOGIN', 'user', user.id, null, ipAddress, userAgent);

    const token = authUtils.generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    return { 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      }, 
      token,
      sessionToken
    };
  }

  static async signOut(sessionToken: string) {
    await authUtils.revokeSession(sessionToken);
  }

  static async getCurrentUser(token: string) {
    try {
      const decoded = authUtils.verifyToken(token);
      const result = await query(
        'SELECT id, email, name, role, avatar_url, created_at, updated_at FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Activity logging
  static async logActivity(userId: string | null, action: string, resourceType: string, resourceId: string, changes?: any, ipAddress?: string, userAgent?: string) {
    await query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, changes, ip_address, user_agent, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
      [userId, action, resourceType, resourceId, changes ? JSON.stringify(changes) : null, ipAddress, userAgent]
    );
  }

  // Permission checking
  static async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const user = await query('SELECT role FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) return false;

    const role = user.rows[0].role;

    // Admin has all permissions
    if (role === 'admin') return true;

    // Define role-based permissions
    const permissions = {
      manager: {
        projects: ['read', 'create', 'update', 'delete'],
        clients: ['read', 'create', 'update'],
        tasks: ['read', 'create', 'update', 'delete'],
        invoices: ['read', 'create', 'update'],
        quotations: ['read', 'create', 'update'],
        time_entries: ['read', 'create', 'update'],
        users: ['read']
      },
      user: {
        projects: ['read'],
        clients: ['read'],
        tasks: ['read', 'update'],
        time_entries: ['read', 'create', 'update'],
        invoices: ['read'],
        quotations: ['read']
      }
    };

    return permissions[role]?.[resource]?.includes(action) || false;
  }

  // Enhanced CRUD operations with permissions and logging
  static async select(table: string, options: any = {}, userId?: string, userRole?: string) {
    const { 
      columns = '*', 
      where = '', 
      params = [], 
      joins = '', 
      orderBy = 'created_at DESC', 
      limit, 
      offset = 0 
    } = options;

    // Apply row-level security based on user role
    let whereClause = where;
    let queryParams = [...params];

    if (userRole !== 'admin' && userRole !== 'manager') {
      // Regular users can only see their own data or public data
      if (table === 'projects') {
        whereClause += (whereClause ? ' AND ' : '') + 'status != $' + (queryParams.length + 1);
        queryParams.push('draft');
      }
    }

    let queryText = `SELECT ${columns} FROM ${table} ${joins}`;
    if (whereClause) {
      queryText += ` WHERE ${whereClause}`;
    }
    if (orderBy) {
      queryText += ` ORDER BY ${orderBy}`;
    }
    if (limit) {
      queryText += ` LIMIT ${limit}`;
    }
    if (offset > 0) {
      queryText += ` OFFSET ${offset}`;
    }

    const result = await query(queryText, queryParams);
    return result.rows;
  }

  static async insert(table: string, data: any, userId?: string, userRole?: string) {
    // Check permissions
    if (userId && !(await this.checkPermission(userId, table, 'create'))) {
      throw new Error('Insufficient permissions');
    }

    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');
    const values = Object.values(data);

    const result = await query(
      `INSERT INTO ${table} (${columns}, created_at) VALUES (${placeholders}, NOW()) RETURNING *`,
      values
    );

    // Log activity
    if (userId) {
      await this.logActivity(userId, 'CREATE', table, result.rows[0].id, data);
    }

    return result.rows[0];
  }

  static async update(table: string, id: string, data: any, userId?: string, userRole?: string) {
    // Check permissions
    if (userId && !(await this.checkPermission(userId, table, 'update'))) {
      throw new Error('Insufficient permissions');
    }

    // Get old data for logging
    const oldData = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    
    const setClause = Object.keys(data).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(data);

    const result = await query(
      `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    // Log activity
    if (userId && oldData.rows.length > 0) {
      await this.logActivity(userId, 'UPDATE', table, id, {
        old: oldData.rows[0],
        new: result.rows[0]
      });
    }

    return result.rows[0];
  }

  static async delete(table: string, id: string, userId?: string, userRole?: string) {
    // Check permissions
    if (userId && !(await this.checkPermission(userId, table, 'delete'))) {
      throw new Error('Insufficient permissions');
    }

    // Get data for logging before deletion
    const oldData = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    
    await query(`DELETE FROM ${table} WHERE id = $1`, [id]);

    // Log activity
    if (userId && oldData.rows.length > 0) {
      await this.logActivity(userId, 'DELETE', table, id, oldData.rows[0]);
    }

    return true;
  }

  // Real-time functionality (replaces Supabase real-time)
  static async subscribe(table: string, callback: (data: any) => void) {
    // Implement polling-based real-time updates
    const pollInterval = 5000; // 5 seconds

    const poll = async () => {
      try {
        const data = await this.select(table);
        callback(data);
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    const intervalId = setInterval(poll, pollInterval);
    
    // Initial load
    poll();

    // Return unsubscribe function
    return () => clearInterval(intervalId);
  }

  // File upload handling (replaces Supabase storage)
  static async uploadFile(file: File, bucket: string, path: string, userId?: string) {
    // For now, return a mock file URL
    // In production, integrate with cloud storage or local file system
    const fileUrl = `/uploads/${bucket}/${path}/${file.name}`;
    
    // Log file upload
    if (userId) {
      await this.logActivity(userId, 'FILE_UPLOAD', 'document', fileUrl, {
        fileName: file.name,
        fileSize: file.size,
        bucket,
        path
      });
    }

    return { url: fileUrl, path: `${bucket}/${path}/${file.name}` };
  }

  // Settings management
  static async getSetting(key: string) {
    const result = await query('SELECT value FROM settings WHERE key = $1', [key]);
    return result.rows.length > 0 ? JSON.parse(result.rows[0].value) : null;
  }

  static async setSetting(key: string, value: any, userId?: string) {
    await query(
      'INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
      [key, JSON.stringify(value)]
    );

    if (userId) {
      await this.logActivity(userId, 'SETTING_UPDATE', 'settings', key, { key, value });
    }
  }

  // Notifications
  static async createNotification(userId: string, title: string, message: string, type: string = 'info') {
    const result = await query(
      'INSERT INTO notifications (user_id, title, message, type, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [userId, title, message, type]
    );

    return result.rows[0];
  }

  static async getNotifications(userId: string, unreadOnly: boolean = false) {
    let whereClause = 'user_id = $1';
    if (unreadOnly) {
      whereClause += ' AND read = false';
    }

    const result = await query(
      `SELECT * FROM notifications WHERE ${whereClause} ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  static async markNotificationRead(notificationId: string, userId: string) {
    await query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
  }
}

// Export default instance
export default DatabaseClient;