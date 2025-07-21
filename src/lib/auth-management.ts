import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbClient, Tables } from './db-client';
import { z } from 'zod';

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().regex(/^\+254[0-9]{9}$/, 'Invalid Kenyan phone number format').optional(),
  county: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'client' | 'employee';
  isActive: boolean;
  phoneNumber?: string;
  county?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthResult {
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  isActive: boolean;
}

export class AuthManagement {
  private static instance: AuthManagement;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  private readonly TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '7d';
  private readonly REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  public static getInstance(): AuthManagement {
    if (!AuthManagement.instance) {
      AuthManagement.instance = new AuthManagement();
    }
    return AuthManagement.instance;
  }

  // User registration
  async register(userData: z.infer<typeof registerSchema>): Promise<AuthResult> {
    try {
      // Validate input
      const validatedData = registerSchema.parse(userData);

      // Check if user already exists
      const existingUser = await dbClient.findOne(Tables.users, { 
        email: validatedData.email.toLowerCase() 
      });

      if (existingUser.data) {
        return { error: 'User with this email already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const newUser = {
        email: validatedData.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'client' as const,
        isActive: true,
        phoneNumber: validatedData.phoneNumber,
        county: validatedData.county,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userResult = await dbClient.insert(Tables.users, newUser);

      if (userResult.error || !userResult.data) {
        return { error: 'Failed to create user account' };
      }

      const user = userResult.data as User;

      // Generate tokens
      const tokens = await this.generateTokens(user.id);

      // Create session
      await this.createSession(user.id, tokens.token, tokens.refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          phoneNumber: user.phoneNumber,
          county: user.county,
          createdAt: user.createdAt,
        },
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return { error: error.errors.map(e => e.message).join(', ') };
      }
      return { error: 'Registration failed. Please try again.' };
    }
  }

  // User login
  async login(credentials: z.infer<typeof loginSchema>): Promise<AuthResult> {
    try {
      // Validate input
      const validatedData = loginSchema.parse(credentials);

      // Find user
      const userResult = await dbClient.findOne(Tables.users, {
        email: validatedData.email.toLowerCase(),
        isActive: true,
      });

      if (userResult.error || !userResult.data) {
        return { error: 'Invalid email or password' };
      }

      const user = userResult.data as any;

      // Verify password
      const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);

      if (!isPasswordValid) {
        return { error: 'Invalid email or password' };
      }

      // Update last login
      await dbClient.update(Tables.users, user.id, {
        lastLoginAt: new Date(),
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id);

      // Create session
      await this.createSession(user.id, tokens.token, tokens.refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          phoneNumber: user.phoneNumber,
          county: user.county,
          createdAt: user.createdAt,
          lastLoginAt: new Date().toISOString(),
        },
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return { error: error.errors.map(e => e.message).join(', ') };
      }
      return { error: 'Login failed. Please try again.' };
    }
  }

  // Token refresh
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;

      // Find session
      const sessionResult = await dbClient.findOne(Tables.sessions, {
        refreshToken,
        isActive: true,
      });

      if (sessionResult.error || !sessionResult.data) {
        return { error: 'Invalid refresh token' };
      }

      const session = sessionResult.data as any;

      // Check if session is expired
      if (new Date() > new Date(session.refreshExpiresAt)) {
        await this.revokeSession(session.id);
        return { error: 'Refresh token expired' };
      }

      // Generate new tokens
      const tokens = await this.generateTokens(payload.userId);

      // Update session
      await dbClient.update(Tables.sessions, session.id, {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + this.parseExpiry(this.TOKEN_EXPIRY)),
        refreshExpiresAt: new Date(Date.now() + this.parseExpiry(this.REFRESH_TOKEN_EXPIRY)),
        lastAccessedAt: new Date(),
      });

      return {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { error: 'Failed to refresh token' };
    }
  }

  // Logout
  async logout(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find and deactivate session
      const sessionResult = await dbClient.findOne(Tables.sessions, {
        token,
        isActive: true,
      });

      if (sessionResult.data) {
        await this.revokeSession((sessionResult.data as any).id);
      }

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }

  // Verify token
  async verifyToken(token: string): Promise<{ user?: User; error?: string }> {
    try {
      // Verify JWT
      const payload = jwt.verify(token, this.JWT_SECRET) as any;

      // Find session
      const sessionResult = await dbClient.findOne(Tables.sessions, {
        token,
        isActive: true,
      });

      if (sessionResult.error || !sessionResult.data) {
        return { error: 'Invalid session' };
      }

      const session = sessionResult.data as any;

      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        await this.revokeSession(session.id);
        return { error: 'Session expired' };
      }

      // Get user
      const userResult = await dbClient.findOne(Tables.users, {
        id: payload.userId,
        isActive: true,
      });

      if (userResult.error || !userResult.data) {
        return { error: 'User not found' };
      }

      const user = userResult.data as User;

      // Update last accessed time
      await dbClient.update(Tables.sessions, session.id, {
        lastAccessedAt: new Date(),
      });

      return { user };
    } catch (error) {
      console.error('Token verification error:', error);
      return { error: 'Invalid token' };
    }
  }

  // Generate JWT tokens
  private async generateTokens(userId: string): Promise<{ token: string; refreshToken: string }> {
    const tokenPayload = { userId, type: 'access' };
    const refreshPayload = { userId, type: 'refresh' };

    const token = jwt.sign(tokenPayload, this.JWT_SECRET, { expiresIn: this.TOKEN_EXPIRY });
    const refreshToken = jwt.sign(refreshPayload, this.JWT_REFRESH_SECRET, { 
      expiresIn: this.REFRESH_TOKEN_EXPIRY 
    });

    return { token, refreshToken };
  }

  // Create session
  private async createSession(userId: string, token: string, refreshToken: string): Promise<void> {
    const session = {
      userId,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + this.parseExpiry(this.TOKEN_EXPIRY)),
      refreshExpiresAt: new Date(Date.now() + this.parseExpiry(this.REFRESH_TOKEN_EXPIRY)),
      isActive: true,
      lastAccessedAt: new Date(),
      createdAt: new Date(),
    };

    await dbClient.insert(Tables.sessions, session);
  }

  // Revoke session
  private async revokeSession(sessionId: string): Promise<void> {
    await dbClient.update(Tables.sessions, sessionId, {
      isActive: false,
    });
  }

  // Parse expiry string to milliseconds
  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'm': return value * 60 * 1000;
      case 's': return value * 1000;
      default: return value;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<{ user?: User; error?: string }> {
    try {
      const result = await dbClient.findOne(Tables.users, { id: userId, isActive: true });
      
      if (result.error || !result.data) {
        return { error: 'User not found' };
      }

      return { user: result.data as User };
    } catch (error) {
      console.error('Get user error:', error);
      return { error: 'Failed to get user' };
    }
  }

  // Change password
  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user
      const userResult = await dbClient.findOne(Tables.users, { id: userId });

      if (userResult.error || !userResult.data) {
        return { success: false, error: 'User not found' };
      }

      const user = userResult.data as any;

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isCurrentPasswordValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Validate new password
      if (newPassword.length < 8) {
        return { success: false, error: 'New password must be at least 8 characters' };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await dbClient.update(Tables.users, userId, {
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }
}

// Export singleton instance
export const authManager = AuthManagement.getInstance();
export default authManager;