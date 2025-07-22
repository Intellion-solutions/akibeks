/**
 * Security Service for AKIBEKS Engineering Solutions
 * Provides authentication, encryption, rate limiting, and security features
 */

import { db } from './database';

// Security configuration
const SECURITY_CONFIG = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  passwordMinLength: 8,
  requireMFA: false,
  ipWhitelist: [], // Empty means all IPs allowed
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 100,
};

// Types
interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'suspicious_activity' | 'rate_limit_exceeded';
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
}

interface LoginAttempt {
  email: string;
  ip: string;
  timestamp: Date;
  success: boolean;
}

interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: Date;
  lastActivity: Date;
  ip: string;
  userAgent: string;
}

// In-memory stores (in production, use Redis or database)
const loginAttempts = new Map<string, LoginAttempt[]>();
const activeSessions = new Map<string, SessionData>();
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Utility functions
const getClientIP = (): string => {
  // In a real app, this would get the actual client IP
  return 'unknown';
};

const getUserAgent = (): string => {
  return navigator?.userAgent || 'unknown';
};

const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

// Security Service Class
export class SecurityService {
  // Authentication
  static async authenticate(email: string, password: string): Promise<{
    success: boolean;
    token?: string;
    user?: any;
    error?: string;
  }> {
    const ip = getClientIP();
    const userAgent = getUserAgent();

    try {
      // Check rate limiting
      if (!this.checkRateLimit(ip)) {
        this.logSecurityEvent({
          type: 'rate_limit_exceeded',
          ip,
          userAgent,
          details: { email }
        });
        return { success: false, error: 'Too many requests. Please try again later.' };
      }

      // Check for account lockout
      if (this.isAccountLocked(email, ip)) {
        this.logSecurityEvent({
          type: 'login_attempt',
          ip,
          userAgent,
          details: { email, reason: 'account_locked' }
        });
        return { success: false, error: 'Account temporarily locked due to multiple failed attempts.' };
      }

      // Validate password strength
      if (!this.isPasswordStrong(password)) {
        return { success: false, error: 'Password does not meet security requirements.' };
      }

      // Attempt authentication with database
      const authResult = await db.authenticate(email, password);

      if (authResult.success && authResult.data) {
        const { user, token } = authResult.data;

        // Clear failed attempts
        this.clearFailedAttempts(email, ip);

        // Create session
        const sessionToken = this.createSession(user, ip, userAgent);

        // Log successful login
        this.logSecurityEvent({
          type: 'login_success',
          userId: user.id,
          ip,
          userAgent,
          details: { email }
        });

        return {
          success: true,
          token: sessionToken,
          user
        };
      } else {
        // Record failed attempt
        this.recordFailedAttempt(email, ip);

        // Log failed login
        this.logSecurityEvent({
          type: 'login_failure',
          ip,
          userAgent,
          details: { email }
        });

        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication service unavailable' };
    }
  }

  // Session management
  static createSession(user: any, ip: string, userAgent: string): string {
    const token = generateSecureToken();
    const session: SessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      createdAt: new Date(),
      lastActivity: new Date(),
      ip,
      userAgent
    };

    activeSessions.set(token, session);

    // Auto-cleanup expired sessions
    setTimeout(() => {
      this.cleanupExpiredSessions();
    }, SECURITY_CONFIG.sessionTimeout);

    return token;
  }

  static validateSession(token: string): { valid: boolean; user?: any } {
    const session = activeSessions.get(token);
    
    if (!session) {
      return { valid: false };
    }

    const now = new Date();
    const sessionAge = now.getTime() - session.lastActivity.getTime();

    if (sessionAge > SECURITY_CONFIG.sessionTimeout) {
      activeSessions.delete(token);
      return { valid: false };
    }

    // Update last activity
    session.lastActivity = now;
    activeSessions.set(token, session);

    return {
      valid: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role
      }
    };
  }

  static logout(token: string): void {
    const session = activeSessions.get(token);
    if (session) {
      this.logSecurityEvent({
        type: 'logout',
        userId: session.userId,
        ip: session.ip,
        userAgent: session.userAgent,
        details: { email: session.email }
      });
      activeSessions.delete(token);
    }
  }

  static cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [token, session] of activeSessions.entries()) {
      const sessionAge = now.getTime() - session.lastActivity.getTime();
      if (sessionAge > SECURITY_CONFIG.sessionTimeout) {
        activeSessions.delete(token);
      }
    }
  }

  // Rate limiting
  static checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const limit = rateLimitStore.get(identifier);

    if (!limit) {
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + SECURITY_CONFIG.rateLimitWindow
      });
      return true;
    }

    if (now > limit.resetTime) {
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + SECURITY_CONFIG.rateLimitWindow
      });
      return true;
    }

    if (limit.count >= SECURITY_CONFIG.rateLimitMaxRequests) {
      return false;
    }

    limit.count++;
    rateLimitStore.set(identifier, limit);
    return true;
  }

  // Failed login attempts
  static recordFailedAttempt(email: string, ip: string): void {
    const key = `${email}:${ip}`;
    const attempts = loginAttempts.get(key) || [];
    
    attempts.push({
      email,
      ip,
      timestamp: new Date(),
      success: false
    });

    // Keep only recent attempts
    const cutoff = new Date(Date.now() - SECURITY_CONFIG.lockoutDuration);
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > cutoff);
    
    loginAttempts.set(key, recentAttempts);
  }

  static clearFailedAttempts(email: string, ip: string): void {
    const key = `${email}:${ip}`;
    loginAttempts.delete(key);
  }

  static isAccountLocked(email: string, ip: string): boolean {
    const key = `${email}:${ip}`;
    const attempts = loginAttempts.get(key) || [];
    
    const cutoff = new Date(Date.now() - SECURITY_CONFIG.lockoutDuration);
    const recentFailedAttempts = attempts.filter(
      attempt => !attempt.success && attempt.timestamp > cutoff
    );

    return recentFailedAttempts.length >= SECURITY_CONFIG.maxLoginAttempts;
  }

  // Password validation
  static isPasswordStrong(password: string): boolean {
    if (password.length < SECURITY_CONFIG.passwordMinLength) {
      return false;
    }

    // Check for at least one uppercase, lowercase, number, and special character
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return hasUpper && hasLower && hasNumber && hasSpecial;
  }

  static generatePasswordRequirements(): string[] {
    return [
      `At least ${SECURITY_CONFIG.passwordMinLength} characters long`,
      'Contains uppercase letters (A-Z)',
      'Contains lowercase letters (a-z)',
      'Contains numbers (0-9)',
      'Contains special characters (!@#$%^&*)',
    ];
  }

  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .trim();
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Security logging
  static logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: generateSecureToken(),
      timestamp: new Date(),
      ...event
    };

    // In production, this would log to a security monitoring system
    console.log('Security Event:', securityEvent);

    // Store critical events
    if (['login_failure', 'rate_limit_exceeded', 'suspicious_activity'].includes(event.type)) {
      this.storeCriticalEvent(securityEvent);
    }
  }

  static storeCriticalEvent(event: SecurityEvent): void {
    // In production, store in database or send to security monitoring
    const criticalEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
    criticalEvents.push(event);
    
    // Keep only last 100 events
    if (criticalEvents.length > 100) {
      criticalEvents.splice(0, criticalEvents.length - 100);
    }
    
    localStorage.setItem('security_events', JSON.stringify(criticalEvents));
  }

  // Content Security Policy
  static setupCSP(): void {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.akibeks.co.ke",
      "frame-ancestors 'none'"
    ].join('; ');
    
    document.head.appendChild(meta);
  }

  // XSS Protection
  static escapeHTML(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Secure random generation
  static generateSecureId(): string {
    return generateSecureToken();
  }

  // Get security status
  static getSecurityStatus(): {
    activeSessions: number;
    failedAttempts: number;
    rateLimitedIPs: number;
  } {
    return {
      activeSessions: activeSessions.size,
      failedAttempts: Array.from(loginAttempts.values()).reduce((sum, attempts) => sum + attempts.length, 0),
      rateLimitedIPs: rateLimitStore.size
    };
  }
}

// Initialize security features
if (typeof window !== 'undefined') {
  // Setup CSP
  SecurityService.setupCSP();

  // Cleanup expired sessions periodically
  setInterval(() => {
    SecurityService.cleanupExpiredSessions();
  }, 5 * 60 * 1000); // Every 5 minutes
}

export default SecurityService;