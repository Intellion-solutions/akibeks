import { Pool, PoolClient, QueryResult } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Database configuration
const pool = new Pool({
  host: process.env.VITE_DB_HOST || 'localhost',
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  database: process.env.VITE_DB_NAME || 'project_management',
  user: process.env.VITE_DB_USER || 'postgres',
  password: process.env.VITE_DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// JWT configuration
const JWT_SECRET = process.env.VITE_JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.VITE_JWT_EXPIRES_IN || '7d';

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

    await query('UPDATE user_sessions SET last_activity = NOW() WHERE session_token = $1', [sessionToken]);
    return result.rows[0];
  },

  revokeSession: async (sessionToken: string) => {
    await query('UPDATE user_sessions SET is_active = false WHERE session_token = $1', [sessionToken]);
  }
};

// Core database functions
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
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

// Unified Database Client (replaces Supabase)
export class DatabaseClient {
  // Generic database operations
  static async from(table: string) {
    return new TableQuery(table);
  }

  // Authentication
  static async signUp(email: string, password: string, userData: any = {}) {
    const hashedPassword = await authUtils.hashPassword(password);
    
    const result = await query(
      'INSERT INTO users (email, password_hash, name, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, name, role, created_at',
      [email, hashedPassword, userData.name || 'User', userData.role || 'user']
    );

    const user = result.rows[0];
    const token = authUtils.generateToken({ userId: user.id, email: user.email, role: user.role });

    return { user, session: { access_token: token } };
  }

  static async signInWithPassword({ email, password }: { email: string; password: string }) {
    const result = await query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);

    if (result.rows.length === 0) {
      return { error: { message: 'Invalid credentials' } };
    }

    const user = result.rows[0];
    const isValidPassword = await authUtils.comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return { error: { message: 'Invalid credentials' } };
    }

    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = authUtils.generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    return { 
      data: {
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role 
        }, 
        session: { access_token: token }
      }
    };
  }

  static async signOut() {
    // In a real implementation, this would invalidate the token
    return { error: null };
  }

  static async getUser(token?: string) {
    if (!token) return { data: { user: null } };
    
    try {
      const decoded = authUtils.verifyToken(token);
      const result = await query(
        'SELECT id, email, name, role, avatar_url, created_at, updated_at FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return { data: { user: null } };
      }

      return { data: { user: result.rows[0] } };
    } catch (error) {
      return { data: { user: null } };
    }
  }

  // Real-time subscriptions (polling-based)
  static channel(channelName: string) {
    return {
      on: (event: string, callback: Function) => {
        // Implement polling-based real-time updates
        const pollInterval = 5000;
        let lastCheck = Date.now();

        const poll = async () => {
          try {
            // This is a simplified implementation
            // In practice, you'd need to track changes in the database
            callback({ new: {}, old: {}, eventType: event });
          } catch (error) {
            console.error('Polling error:', error);
          }
        };

        const intervalId = setInterval(poll, pollInterval);
        return {
          unsubscribe: () => clearInterval(intervalId)
        };
      },
      subscribe: () => ({ error: null })
    };
  }

  // Storage functionality
  static storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        // Mock implementation for file upload
        const fileUrl = `/uploads/${bucket}/${path}`;
        return { data: { path: fileUrl }, error: null };
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `/uploads/${path}` }
      }),
      remove: async (paths: string[]) => {
        return { error: null };
      },
      list: async (prefix?: string) => {
        return { data: [], error: null };
      }
    })
  };

  // RPC functionality
  static async rpc(functionName: string, params: any = {}) {
    // Implement stored procedure calls
    try {
      const result = await query(`SELECT ${functionName}($1)`, [JSON.stringify(params)]);
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Table Query Builder (Supabase-like interface)
class TableQuery {
  private table: string;
  private selectColumns: string = '*';
  private whereConditions: Array<{ column: string; operator: string; value: any }> = [];
  private orderByClause: string = '';
  private limitValue: number | null = null;
  private offsetValue: number = 0;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*') {
    this.selectColumns = columns;
    return this;
  }

  eq(column: string, value: any) {
    this.whereConditions.push({ column, operator: '=', value });
    return this;
  }

  neq(column: string, value: any) {
    this.whereConditions.push({ column, operator: '!=', value });
    return this;
  }

  gt(column: string, value: any) {
    this.whereConditions.push({ column, operator: '>', value });
    return this;
  }

  gte(column: string, value: any) {
    this.whereConditions.push({ column, operator: '>=', value });
    return this;
  }

  lt(column: string, value: any) {
    this.whereConditions.push({ column, operator: '<', value });
    return this;
  }

  lte(column: string, value: any) {
    this.whereConditions.push({ column, operator: '<=', value });
    return this;
  }

  like(column: string, value: string) {
    this.whereConditions.push({ column, operator: 'LIKE', value });
    return this;
  }

  ilike(column: string, value: string) {
    this.whereConditions.push({ column, operator: 'ILIKE', value });
    return this;
  }

  in(column: string, values: any[]) {
    this.whereConditions.push({ column, operator: 'IN', value: values });
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    const direction = options.ascending === false ? 'DESC' : 'ASC';
    this.orderByClause = `ORDER BY ${column} ${direction}`;
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  range(from: number, to: number) {
    this.offsetValue = from;
    this.limitValue = to - from + 1;
    return this;
  }

  async execute() {
    let queryText = `SELECT ${this.selectColumns} FROM ${this.table}`;
    const params: any[] = [];

    if (this.whereConditions.length > 0) {
      const whereClause = this.whereConditions.map((condition, index) => {
        const paramIndex = params.length + 1;
        if (condition.operator === 'IN') {
          const placeholders = condition.value.map((_, i) => `$${paramIndex + i}`).join(', ');
          params.push(...condition.value);
          return `${condition.column} ${condition.operator} (${placeholders})`;
        } else {
          params.push(condition.value);
          return `${condition.column} ${condition.operator} $${paramIndex}`;
        }
      }).join(' AND ');
      queryText += ` WHERE ${whereClause}`;
    }

    if (this.orderByClause) {
      queryText += ` ${this.orderByClause}`;
    }

    if (this.limitValue) {
      queryText += ` LIMIT ${this.limitValue}`;
    }

    if (this.offsetValue > 0) {
      queryText += ` OFFSET ${this.offsetValue}`;
    }

    try {
      const result = await query(queryText, params);
      return { data: result.rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insert(data: any | any[]) {
    try {
      const records = Array.isArray(data) ? data : [data];
      const results = [];

      for (const record of records) {
        const columns = Object.keys(record).join(', ');
        const placeholders = Object.keys(record).map((_, index) => `$${index + 1}`).join(', ');
        const values = Object.values(record);

        const result = await query(
          `INSERT INTO ${this.table} (${columns}) VALUES (${placeholders}) RETURNING *`,
          values
        );
        results.push(result.rows[0]);
      }

      return { data: Array.isArray(data) ? results : results[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async update(data: any) {
    try {
      const setClause = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ');
      const values = Object.values(data);
      
      let queryText = `UPDATE ${this.table} SET ${setClause}`;
      let params = [...values];

      if (this.whereConditions.length > 0) {
        const whereClause = this.whereConditions.map((condition, index) => {
          const paramIndex = params.length + 1;
          params.push(condition.value);
          return `${condition.column} ${condition.operator} $${paramIndex}`;
        }).join(' AND ');
        queryText += ` WHERE ${whereClause}`;
      }

      queryText += ' RETURNING *';

      const result = await query(queryText, params);
      return { data: result.rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async delete() {
    try {
      let queryText = `DELETE FROM ${this.table}`;
      let params: any[] = [];

      if (this.whereConditions.length > 0) {
        const whereClause = this.whereConditions.map((condition, index) => {
          const paramIndex = params.length + 1;
          params.push(condition.value);
          return `${condition.column} ${condition.operator} $${paramIndex}`;
        }).join(' AND ');
        queryText += ` WHERE ${whereClause}`;
      }

      await query(queryText, params);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Single record operations
  async single() {
    const result = await this.limit(1).execute();
    if (result.error) return result;
    return { data: result.data?.[0] || null, error: null };
  }

  async maybeSingle() {
    return this.single();
  }
}

// Create a supabase-compatible export
export const supabase = DatabaseClient;

// Export the pool for direct access if needed
export { pool };

// Default export
export default DatabaseClient;