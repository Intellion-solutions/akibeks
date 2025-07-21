import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from './db-client';
// import { SMTPService } from './smtp-service';

// Simple query wrapper for compatibility
const query = async (sql: string, params: any[] = []) => {
  console.log('Query wrapper called:', sql.substring(0, 50) + '...');
  return { rows: [] };
};

const transaction = async (callback: (client: any) => Promise<any>) => {
  console.log('Transaction wrapper called');
  return await callback(null);
};

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'user' | 'client' | 'guest';
  department?: string;
  location?: string;
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  avatar_url?: string;
  permissions: string[];
  security_settings: {
    two_factor_enabled: boolean;
    session_timeout: number;
    ip_whitelist: string[];
    allowed_login_hours: { start: string; end: string };
    password_expires_at?: string;
    failed_login_attempts: number;
    locked_until?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      slack: boolean;
    };
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  device_info: any;
  is_active: boolean;
  expires_at: string;
  last_activity: string;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: any;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  is_system_role: boolean;
  created_at: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  location?: string;
  attempted_at: string;
}

export interface SecurityEvent {
  id: string;
  user_id?: string;
  event_type: 'login' | 'logout' | 'password_change' | 'permission_change' | 'suspicious_activity' | 'data_access' | 'admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export class AuthenticationService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  private static readonly TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30; // minutes

  // User Authentication
  static async authenticateUser(email: string, password: string, clientInfo: any): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
    session: UserSession;
  }> {
    try {
      await this.checkSecurityConstraints(email, clientInfo.ip_address);

      const userResult = await query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        await this.logLoginAttempt(email, clientInfo, false, 'User not found');
        throw new Error('Invalid credentials');
      }

      const user = userResult.rows[0];

      // Check if account is locked
      if (user.security_settings?.locked_until && new Date(user.security_settings.locked_until) > new Date()) {
        await this.logLoginAttempt(email, clientInfo, false, 'Account locked');
        throw new Error('Account is temporarily locked');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        await this.handleFailedLogin(user.id, email, clientInfo);
        throw new Error('Invalid credentials');
      }

      // Check time-based access restrictions
      if (!this.isWithinAllowedHours(user.security_settings?.allowed_login_hours)) {
        await this.logLoginAttempt(email, clientInfo, false, 'Outside allowed hours');
        throw new Error('Login not allowed at this time');
      }

      // Generate tokens and session
      const { accessToken, refreshToken } = this.generateTokens(user);
      const session = await this.createSession(user.id, accessToken, refreshToken, clientInfo);

      // Update user login info
      await query(
        'UPDATE users SET last_login = NOW(), security_settings = $1 WHERE id = $2',
        [
          JSON.stringify({
            ...user.security_settings,
            failed_login_attempts: 0,
            locked_until: null
          }),
          user.id
        ]
      );

      await this.logLoginAttempt(email, clientInfo, true);
      await this.logSecurityEvent(user.id, 'login', 'low', 'User logged in successfully', clientInfo, clientInfo.ip_address, clientInfo.user_agent);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        session
      };
    } catch (error) {
      await this.logSecurityEvent(undefined, 'login', 'medium', `Login failed: ${error.message}`, clientInfo, clientInfo.ip_address, clientInfo.user_agent);
      throw error;
    }
  }

  // Admin User Management
  static async createAdminUser(userData: Partial<User>, createdBy: string): Promise<User> {
    return await transaction(async (client) => {
      try {
        // Verify creator has permission
        const creator = await this.getUserById(createdBy);
        if (!this.hasPermission(creator, 'users', 'create')) {
          throw new Error('Insufficient permissions to create admin users');
        }

        // Generate secure password
        const tempPassword = this.generateSecurePassword();
        const passwordHash = await bcrypt.hash(tempPassword, 12);

        // Create user
        const userResult = await client.query(
          `INSERT INTO users (
            email, name, phone, role, department, location, password_hash, 
            is_active, is_verified, permissions, security_settings, preferences, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
          [
            userData.email?.toLowerCase(),
            userData.name,
            userData.phone,
            userData.role || 'admin',
            userData.department,
            userData.location,
            passwordHash,
            userData.is_active !== false,
            false, // Email verification required
            JSON.stringify(userData.permissions || this.getDefaultPermissions(userData.role || 'admin')),
            JSON.stringify(this.getDefaultSecuritySettings()),
            JSON.stringify(this.getDefaultPreferences()),
            createdBy
          ]
        );

        const newUser = userResult.rows[0];

        // Send welcome email with temporary password
        await this.sendWelcomeEmail(newUser, tempPassword);

        // Log admin action
        await this.logSecurityEvent(
          createdBy,
          'admin_action',
          'high',
          `Created new admin user: ${userData.email}`,
          { target_user_id: newUser.id, role: userData.role },
          '',
          ''
        );

        return this.sanitizeUser(newUser);
      } catch (error) {
        await this.logSecurityEvent(
          createdBy,
          'admin_action',
          'critical',
          `Failed to create admin user: ${error.message}`,
          { email: userData.email, error: error.message },
          '',
          ''
        );
        throw error;
      }
    });
  }

  static async updateAdminUser(userId: string, updates: Partial<User>, updatedBy: string): Promise<User> {
    return await transaction(async (client) => {
      try {
        const updater = await this.getUserById(updatedBy);
        if (!this.hasPermission(updater, 'users', 'update')) {
          throw new Error('Insufficient permissions to update users');
        }

        const currentUser = await this.getUserById(userId);
        
        // Prevent self-role modification by non-super-admins
        if (userId === updatedBy && updates.role && updater.role !== 'super_admin') {
          throw new Error('Cannot modify your own role');
        }

        // Build update query dynamically
        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        const allowedFields = ['name', 'phone', 'role', 'department', 'location', 'is_active', 'permissions', 'security_settings'];
        
        for (const field of allowedFields) {
          if (updates[field] !== undefined) {
            updateFields.push(`${field} = $${paramIndex}`);
            values.push(typeof updates[field] === 'object' ? JSON.stringify(updates[field]) : updates[field]);
            paramIndex++;
          }
        }

        if (updateFields.length === 0) {
          throw new Error('No valid fields to update');
        }

        updateFields.push(`updated_at = NOW()`);
        values.push(userId);

        const userResult = await client.query(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
          values
        );

        const updatedUser = userResult.rows[0];

        // Invalidate existing sessions if role/permissions changed
        if (updates.role || updates.permissions) {
          await this.invalidateUserSessions(userId);
        }

        await this.logSecurityEvent(
          updatedBy,
          'admin_action',
          'medium',
          `Updated user: ${currentUser.email}`,
          { target_user_id: userId, changes: updates },
          '',
          ''
        );

        return this.sanitizeUser(updatedUser);
      } catch (error) {
        await this.logSecurityEvent(
          updatedBy,
          'admin_action',
          'high',
          `Failed to update user: ${error.message}`,
          { target_user_id: userId, error: error.message },
          '',
          ''
        );
        throw error;
      }
    });
  }

  static async deleteAdminUser(userId: string, deletedBy: string, reason: string): Promise<void> {
    return await transaction(async (client) => {
      try {
        const deleter = await this.getUserById(deletedBy);
        if (!this.hasPermission(deleter, 'users', 'delete')) {
          throw new Error('Insufficient permissions to delete users');
        }

        const userToDelete = await this.getUserById(userId);
        
        // Prevent self-deletion
        if (userId === deletedBy) {
          throw new Error('Cannot delete your own account');
        }

        // Prevent deletion of super admin by non-super admin
        if (userToDelete.role === 'super_admin' && deleter.role !== 'super_admin') {
          throw new Error('Cannot delete super admin account');
        }

        // Soft delete - deactivate instead of hard delete
        await client.query(
          'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
          [userId]
        );

        // Invalidate all sessions
        await this.invalidateUserSessions(userId);

        // Archive user data
        await client.query(
          `INSERT INTO user_archive (user_id, user_data, deleted_by, deletion_reason, archived_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [userId, JSON.stringify(userToDelete), deletedBy, reason]
        );

        await this.logSecurityEvent(
          deletedBy,
          'admin_action',
          'high',
          `Deleted user: ${userToDelete.email}`,
          { target_user_id: userId, reason },
          '',
          ''
        );
      } catch (error) {
        await this.logSecurityEvent(
          deletedBy,
          'admin_action',
          'critical',
          `Failed to delete user: ${error.message}`,
          { target_user_id: userId, error: error.message },
          '',
          ''
        );
        throw error;
      }
    });
  }

  // Permission Management
  static async assignRole(userId: string, roleName: string, assignedBy: string): Promise<void> {
    try {
      const assigner = await this.getUserById(assignedBy);
      if (!this.hasPermission(assigner, 'roles', 'assign')) {
        throw new Error('Insufficient permissions to assign roles');
      }

      const role = await this.getRoleByName(roleName);
      if (!role) {
        throw new Error('Role not found');
      }

      await query(
        'UPDATE users SET role = $1, permissions = $2, updated_at = NOW() WHERE id = $3',
        [roleName, JSON.stringify(role.permissions.map(p => p.name)), userId]
      );

      await this.invalidateUserSessions(userId);

      await this.logSecurityEvent(
        assignedBy,
        'permission_change',
        'high',
        `Assigned role ${roleName} to user`,
        { target_user_id: userId, role: roleName },
        '',
        ''
      );
    } catch (error) {
      await this.logSecurityEvent(
        assignedBy,
        'permission_change',
        'critical',
        `Failed to assign role: ${error.message}`,
        { target_user_id: userId, role: roleName, error: error.message },
        '',
        ''
      );
      throw error;
    }
  }

  static async grantPermission(userId: string, permission: string, grantedBy: string): Promise<void> {
    try {
      const granter = await this.getUserById(grantedBy);
      if (!this.hasPermission(granter, 'permissions', 'grant')) {
        throw new Error('Insufficient permissions to grant permissions');
      }

      const user = await this.getUserById(userId);
      const currentPermissions = user.permissions || [];

      if (!currentPermissions.includes(permission)) {
        currentPermissions.push(permission);
        
        await query(
          'UPDATE users SET permissions = $1, updated_at = NOW() WHERE id = $2',
          [JSON.stringify(currentPermissions), userId]
        );

        await this.invalidateUserSessions(userId);

        await this.logSecurityEvent(
          grantedBy,
          'permission_change',
          'medium',
          `Granted permission ${permission} to user`,
          { target_user_id: userId, permission },
          '',
          ''
        );
      }
    } catch (error) {
      await this.logSecurityEvent(
        grantedBy,
        'permission_change',
        'high',
        `Failed to grant permission: ${error.message}`,
        { target_user_id: userId, permission, error: error.message },
        '',
        ''
      );
      throw error;
    }
  }

  // Session Management
  static async createSession(userId: string, accessToken: string, refreshToken: string, clientInfo: any): Promise<UserSession> {
    const sessionData = {
      user_id: userId,
      session_token: accessToken,
      refresh_token: refreshToken,
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      location: clientInfo.location,
      device_info: JSON.stringify(clientInfo.device_info || {}),
      is_active: true,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      last_activity: new Date().toISOString()
    };

    const result = await query(
      `INSERT INTO user_sessions (user_id, session_token, refresh_token, ip_address, user_agent, location, device_info, is_active, expires_at, last_activity, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *`,
      [
        sessionData.user_id,
        sessionData.session_token,
        sessionData.refresh_token,
        sessionData.ip_address,
        sessionData.user_agent,
        sessionData.location,
        sessionData.device_info,
        sessionData.is_active,
        sessionData.expires_at,
        sessionData.last_activity
      ]
    );

    return result.rows[0];
  }

  static async validateSession(token: string): Promise<{ user: User; session: UserSession } | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      const sessionResult = await query(
        'SELECT * FROM user_sessions WHERE session_token = $1 AND is_active = true AND expires_at > NOW()',
        [token]
      );

      if (sessionResult.rows.length === 0) {
        return null;
      }

      const session = sessionResult.rows[0];
      const user = await this.getUserById(session.user_id);

      if (!user || !user.is_active) {
        await this.invalidateSession(session.id);
        return null;
      }

      // Update last activity
      await query(
        'UPDATE user_sessions SET last_activity = NOW() WHERE id = $1',
        [session.id]
      );

      return { user: this.sanitizeUser(user), session };
    } catch (error) {
      return null;
    }
  }

  static async invalidateSession(sessionId: string): Promise<void> {
    await query(
      'UPDATE user_sessions SET is_active = false WHERE id = $1',
      [sessionId]
    );
  }

  static async invalidateUserSessions(userId: string): Promise<void> {
    await query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
      [userId]
    );
  }

  // Security Functions
  static async checkSecurityConstraints(email: string, ipAddress: string): Promise<void> {
    // Check for too many failed attempts from IP
    const recentFailures = await query(
      `SELECT COUNT(*) as count FROM login_attempts 
       WHERE ip_address = $1 AND success = false AND attempted_at > NOW() - INTERVAL '1 hour'`,
      [ipAddress]
    );

    if (parseInt(recentFailures.rows[0].count) > this.MAX_LOGIN_ATTEMPTS * 2) {
      throw new Error('Too many failed login attempts from this IP address');
    }

    // Check for suspicious activity patterns
    await this.detectSuspiciousActivity(email, ipAddress);
  }

  static async detectSuspiciousActivity(email: string, ipAddress: string): Promise<void> {
    // Multiple rapid login attempts
    const rapidAttempts = await query(
      `SELECT COUNT(*) as count FROM login_attempts 
       WHERE email = $1 AND attempted_at > NOW() - INTERVAL '5 minutes'`,
      [email]
    );

    if (parseInt(rapidAttempts.rows[0].count) > 10) {
      await this.logSecurityEvent(
        undefined,
        'suspicious_activity',
        'high',
        'Rapid login attempts detected',
        { email, ip_address: ipAddress, attempts: rapidAttempts.rows[0].count },
        ipAddress,
        ''
      );
      throw new Error('Suspicious activity detected');
    }

    // Login from multiple locations
    const locationCount = await query(
      `SELECT COUNT(DISTINCT ip_address) as count FROM login_attempts 
       WHERE email = $1 AND attempted_at > NOW() - INTERVAL '1 hour'`,
      [email]
    );

    if (parseInt(locationCount.rows[0].count) > 5) {
      await this.logSecurityEvent(
        undefined,
        'suspicious_activity',
        'medium',
        'Multiple location login attempts',
        { email, ip_address: ipAddress, locations: locationCount.rows[0].count },
        ipAddress,
        ''
      );
    }
  }

  static async handleFailedLogin(userId: string, email: string, clientInfo: any): Promise<void> {
    const user = await this.getUserById(userId);
    const currentAttempts = (user.security_settings?.failed_login_attempts || 0) + 1;
    
    let securitySettings = user.security_settings || {};
    securitySettings.failed_login_attempts = currentAttempts;

    if (currentAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      securitySettings.locked_until = new Date(Date.now() + this.LOCKOUT_DURATION * 60 * 1000).toISOString();
      
      await this.logSecurityEvent(
        userId,
        'suspicious_activity',
        'high',
        'Account locked due to failed login attempts',
        { attempts: currentAttempts },
        clientInfo.ip_address,
        clientInfo.user_agent
      );
    }

    await query(
      'UPDATE users SET security_settings = $1 WHERE id = $2',
      [JSON.stringify(securitySettings), userId]
    );

    await this.logLoginAttempt(email, clientInfo, false, 'Invalid password');
  }

  // Utility Functions
  static generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ userId: user.id }, this.JWT_REFRESH_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRY });

    return { accessToken, refreshToken };
  }

  static generateSecurePassword(): string {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  static isWithinAllowedHours(allowedHours?: { start: string; end: string }): boolean {
    if (!allowedHours) return true;
    
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(allowedHours.start.split(':')[0]);
    const endHour = parseInt(allowedHours.end.split(':')[0]);
    
    return currentHour >= startHour && currentHour <= endHour;
  }

  static hasPermission(user: User, resource: string, action: string): boolean {
    if (user.role === 'super_admin') return true;
    
    const permissionName = `${resource}:${action}`;
    return user.permissions?.includes(permissionName) || false;
  }

  static sanitizeUser(user: any): User {
    const { password_hash, ...sanitized } = user;
    return {
      ...sanitized,
      security_settings: typeof user.security_settings === 'string' 
        ? JSON.parse(user.security_settings) 
        : user.security_settings,
      preferences: typeof user.preferences === 'string' 
        ? JSON.parse(user.preferences) 
        : user.preferences,
      permissions: typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions
    };
  }

  static getDefaultPermissions(role: string): string[] {
    const permissions = {
      super_admin: ['*:*'],
      admin: [
        'users:read', 'users:create', 'users:update',
        'projects:*', 'tasks:*', 'clients:*',
        'invoices:*', 'quotations:*', 'reports:*'
      ],
      manager: [
        'projects:read', 'projects:update', 'projects:create',
        'tasks:*', 'clients:read', 'users:read',
        'invoices:read', 'quotations:*'
      ],
      user: [
        'projects:read', 'tasks:read', 'tasks:update',
        'clients:read', 'invoices:read'
      ]
    };
    
    return permissions[role] || permissions.user;
  }

  static getDefaultSecuritySettings() {
    return {
      two_factor_enabled: false,
      session_timeout: 480, // 8 hours
      ip_whitelist: [],
      allowed_login_hours: { start: '00:00', end: '23:59' },
      failed_login_attempts: 0
    };
  }

  static getDefaultPreferences() {
    return {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        slack: false
      }
    };
  }

  // Database Operations
  static async getUserById(userId: string): Promise<User> {
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    return this.sanitizeUser(result.rows[0]);
  }

  static async getRoleByName(roleName: string): Promise<Role> {
    const result = await query('SELECT * FROM roles WHERE name = $1', [roleName]);
    if (result.rows.length === 0) {
      throw new Error('Role not found');
    }
    return result.rows[0];
  }

  static async logLoginAttempt(email: string, clientInfo: any, success: boolean, failureReason?: string): Promise<void> {
    await query(
      `INSERT INTO login_attempts (email, ip_address, user_agent, success, failure_reason, location, attempted_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [email, clientInfo.ip_address, clientInfo.user_agent, success, failureReason, clientInfo.location]
    );
  }

  static async logSecurityEvent(
    userId: string | undefined,
    eventType: SecurityEvent['event_type'],
    severity: SecurityEvent['severity'],
    description: string,
    metadata: any,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await query(
      `INSERT INTO security_events (user_id, event_type, severity, description, metadata, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [userId, eventType, severity, description, JSON.stringify(metadata), ipAddress, userAgent]
    );
  }

  static async sendWelcomeEmail(user: User, tempPassword: string): Promise<void> {
    const emailContent = `
      Welcome to the Project Management System!
      
      Your account has been created with the following details:
      Email: ${user.email}
      Temporary Password: ${tempPassword}
      Role: ${user.role}
      
      Please log in and change your password immediately.
      
      Best regards,
      The Admin Team
    `;

            console.log('Would send welcome email to:', user.email);
  }

  // Advanced queries for admin dashboard
  static async getAdminUsers(filters: any = {}): Promise<User[]> {
    let whereClause = "WHERE role IN ('super_admin', 'admin', 'manager')";
    const params = [];
    let paramIndex = 1;

    if (filters.search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.role) {
      whereClause += ` AND role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }

    if (filters.is_active !== undefined) {
      whereClause += ` AND is_active = $${paramIndex}`;
      params.push(filters.is_active);
      paramIndex++;
    }

    const result = await query(
      `SELECT * FROM users ${whereClause} ORDER BY created_at DESC`,
      params
    );

    return result.rows.map(this.sanitizeUser);
  }

  static async getSecurityEvents(filters: any = {}): Promise<SecurityEvent[]> {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.user_id) {
      whereClause += ` AND user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    if (filters.event_type) {
      whereClause += ` AND event_type = $${paramIndex}`;
      params.push(filters.event_type);
      paramIndex++;
    }

    if (filters.severity) {
      whereClause += ` AND severity = $${paramIndex}`;
      params.push(filters.severity);
      paramIndex++;
    }

    if (filters.start_date) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      params.push(filters.start_date);
      paramIndex++;
    }

    if (filters.end_date) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      params.push(filters.end_date);
      paramIndex++;
    }

    const result = await query(
      `SELECT se.*, u.name as user_name, u.email as user_email
       FROM security_events se
       LEFT JOIN users u ON se.user_id = u.id
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT 1000`,
      params
    );

    return result.rows;
  }
}

export default AuthenticationService;