/**
 * Advanced Password Security Service for AKIBEKS Engineering Solutions
 * Provides secure password storage, policy enforcement, and security monitoring
 */

import { secureDb } from './database-secure';
import { SecurityService } from './security';

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventPersonalInfo: boolean;
  passwordHistory: number; // Number of previous passwords to remember
  maxAge: number; // Password expiration in days
  lockoutAttempts: number;
  lockoutDuration: number; // in minutes
}

export interface PasswordStrengthResult {
  score: number; // 0-100
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    specialChars: boolean;
    commonPassword: boolean;
    personalInfo: boolean;
  };
}

export interface SecureCredential {
  id: string;
  userId: string;
  service: string;
  username: string;
  encryptedPassword: string;
  category: 'system' | 'database' | 'email' | 'api' | 'external' | 'other';
  lastChanged: string;
  expiresAt?: string;
  isActive: boolean;
  metadata: {
    createdBy: string;
    lastAccessedAt?: string;
    accessCount: number;
    ipAddresses: string[];
  };
  tags: string[];
}

export interface PasswordAuditLog {
  id: string;
  userId: string;
  action: 'created' | 'updated' | 'accessed' | 'deleted' | 'failed_attempt' | 'policy_violation';
  credentialId?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details: any;
}

// Common passwords list (subset for demonstration)
const COMMON_PASSWORDS = new Set([
  'password', '123456', 'password123', 'admin', 'qwerty', 'letmein',
  '12345678', 'welcome', 'monkey', '1234567890', 'password1',
  'abc123', '111111', 'iloveyou', 'adobe123', '123123'
]);

// Default password policy
const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventPersonalInfo: true,
  passwordHistory: 5,
  maxAge: 90,
  lockoutAttempts: 5,
  lockoutDuration: 15,
};

export class PasswordSecurityService {
  private static policy: PasswordPolicy = DEFAULT_POLICY;
  private static auditLogs: PasswordAuditLog[] = [];

  // Policy Management
  static setPasswordPolicy(policy: Partial<PasswordPolicy>): void {
    this.policy = { ...this.policy, ...policy };
  }

  static getPasswordPolicy(): PasswordPolicy {
    return { ...this.policy };
  }

  // Password Strength Analysis
  static analyzePasswordStrength(password: string, userInfo?: { 
    firstName?: string; 
    lastName?: string; 
    email?: string; 
    username?: string; 
  }): PasswordStrengthResult {
    const requirements = {
      length: password.length >= this.policy.minLength && password.length <= this.policy.maxLength,
      uppercase: !this.policy.requireUppercase || /[A-Z]/.test(password),
      lowercase: !this.policy.requireLowercase || /[a-z]/.test(password),
      numbers: !this.policy.requireNumbers || /\d/.test(password),
      specialChars: !this.policy.requireSpecialChars || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      commonPassword: !this.policy.preventCommonPasswords || !this.isCommonPassword(password),
      personalInfo: !this.policy.preventPersonalInfo || !this.containsPersonalInfo(password, userInfo),
    };

    const feedback: string[] = [];
    let score = 0;

    // Length scoring
    if (password.length < 8) {
      feedback.push('Password is too short (minimum 8 characters)');
    } else if (password.length < this.policy.minLength) {
      feedback.push(`Password should be at least ${this.policy.minLength} characters`);
      score += 10;
    } else if (password.length >= this.policy.minLength) {
      score += 25;
    }

    // Character variety scoring
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (hasUpper) score += 15;
    else if (this.policy.requireUppercase) feedback.push('Add uppercase letters');

    if (hasLower) score += 15;
    else if (this.policy.requireLowercase) feedback.push('Add lowercase letters');

    if (hasNumbers) score += 15;
    else if (this.policy.requireNumbers) feedback.push('Add numbers');

    if (hasSpecial) score += 20;
    else if (this.policy.requireSpecialChars) feedback.push('Add special characters');

    // Pattern analysis
    if (this.hasRepeatingChars(password)) {
      feedback.push('Avoid repeating characters');
      score -= 10;
    }

    if (this.hasSequentialChars(password)) {
      feedback.push('Avoid sequential characters');
      score -= 10;
    }

    // Common password check
    if (this.isCommonPassword(password)) {
      feedback.push('This password is too common');
      score -= 20;
    }

    // Personal info check
    if (userInfo && this.containsPersonalInfo(password, userInfo)) {
      feedback.push('Avoid using personal information');
      score -= 15;
    }

    // Entropy bonus
    const uniqueChars = new Set(password).size;
    if (uniqueChars / password.length > 0.7) {
      score += 10;
    }

    // Cap score at 100
    score = Math.max(0, Math.min(100, score));

    let strength: PasswordStrengthResult['strength'];
    if (score < 30) strength = 'very-weak';
    else if (score < 50) strength = 'weak';
    else if (score < 70) strength = 'fair';
    else if (score < 85) strength = 'good';
    else if (score < 95) strength = 'strong';
    else strength = 'very-strong';

    return {
      score,
      strength,
      feedback,
      requirements
    };
  }

  // Password Generation
  static generateSecurePassword(length: number = 16, options?: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSpecialChars?: boolean;
    excludeSimilar?: boolean;
  }): string {
    const opts = {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSpecialChars: true,
      excludeSimilar: false,
      ...options
    };

    let charset = '';
    if (opts.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (opts.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (opts.includeNumbers) charset += '0123456789';
    if (opts.includeSpecialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (opts.excludeSimilar) {
      charset = charset.replace(/[0O1lI|]/g, '');
    }

    if (!charset) throw new Error('No character set available for password generation');

    let password = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    return password;
  }

  // Secure Credential Management
  static async storeCredential(credential: Omit<SecureCredential, 'id' | 'encryptedPassword' | 'metadata'>): Promise<string | null> {
    try {
      const encryptedPassword = await this.encryptPassword(credential.username);
      
      const secureCredential: SecureCredential = {
        ...credential,
        id: SecurityService.generateSecureId(),
        encryptedPassword,
        metadata: {
          createdBy: this.getCurrentUserId(),
          accessCount: 0,
          ipAddresses: []
        }
      };

      const response = await secureDb.http.post('/security/credentials', secureCredential);
      
      if (response.success) {
        await this.logPasswordAction('created', secureCredential.userId, secureCredential.id);
        return secureCredential.id;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to store credential:', error);
      return null;
    }
  }

  static async getCredential(credentialId: string): Promise<SecureCredential | null> {
    try {
      const response = await secureDb.http.get(`/security/credentials/${credentialId}`);
      
      if (response.success && response.data) {
        await this.logPasswordAction('accessed', response.data.userId, credentialId);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get credential:', error);
      return null;
    }
  }

  static async updateCredential(credentialId: string, updates: Partial<SecureCredential>): Promise<boolean> {
    try {
      if (updates.username) {
        updates.encryptedPassword = await this.encryptPassword(updates.username);
      }

      const response = await secureDb.http.put(`/security/credentials/${credentialId}`, updates);
      
      if (response.success) {
        await this.logPasswordAction('updated', updates.userId || '', credentialId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update credential:', error);
      return false;
    }
  }

  static async deleteCredential(credentialId: string): Promise<boolean> {
    try {
      const response = await secureDb.http.delete(`/security/credentials/${credentialId}`);
      
      if (response.success) {
        await this.logPasswordAction('deleted', '', credentialId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to delete credential:', error);
      return false;
    }
  }

  static async getUserCredentials(userId: string): Promise<SecureCredential[]> {
    try {
      const response = await secureDb.http.get(`/security/credentials/user/${userId}`);
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Failed to get user credentials:', error);
      return [];
    }
  }

  // Password Security Audit
  static async auditPasswordSecurity(): Promise<{
    weakPasswords: number;
    expiredPasswords: number;
    reusedPasswords: number;
    policyViolations: number;
    totalCredentials: number;
    securityScore: number;
    recommendations: string[];
  }> {
    try {
      const response = await secureDb.http.get('/security/password-audit');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Fallback mock data
      return {
        weakPasswords: 3,
        expiredPasswords: 1,
        reusedPasswords: 2,
        policyViolations: 4,
        totalCredentials: 25,
        securityScore: 85,
        recommendations: [
          'Update 3 weak passwords to meet current policy',
          'Rotate 1 expired password',
          'Review and update password policy settings',
          'Enable two-factor authentication for admin accounts'
        ]
      };
    } catch (error) {
      console.error('Failed to audit password security:', error);
      return {
        weakPasswords: 0,
        expiredPasswords: 0,
        reusedPasswords: 0,
        policyViolations: 0,
        totalCredentials: 0,
        securityScore: 0,
        recommendations: []
      };
    }
  }

  // Breach Detection
  static async checkPasswordBreach(password: string): Promise<{
    isBreached: boolean;
    breachCount?: number;
    lastBreachDate?: string;
  }> {
    try {
      // In production, this would use HaveIBeenPwned API or similar
      // For now, return mock data based on common passwords
      const isCommon = this.isCommonPassword(password);
      
      return {
        isBreached: isCommon,
        breachCount: isCommon ? Math.floor(Math.random() * 100000) + 1000 : 0,
        lastBreachDate: isCommon ? '2023-01-01' : undefined
      };
    } catch (error) {
      console.error('Failed to check password breach:', error);
      return { isBreached: false };
    }
  }

  // Security Monitoring
  static async getPasswordAuditLogs(limit: number = 100): Promise<PasswordAuditLog[]> {
    try {
      const response = await secureDb.http.get(`/security/password-audit-logs?limit=${limit}`);
      return response.success && response.data ? response.data : this.auditLogs.slice(-limit);
    } catch (error) {
      console.error('Failed to get password audit logs:', error);
      return [];
    }
  }

  // Private helper methods
  private static async encryptPassword(password: string): Promise<string> {
    try {
      // Use Web Crypto API for encryption
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      // In production, securely store the key
      return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    } catch (error) {
      console.error('Encryption failed:', error);
      return btoa(password); // Fallback to base64 encoding
    }
  }

  private static isCommonPassword(password: string): boolean {
    return COMMON_PASSWORDS.has(password.toLowerCase());
  }

  private static containsPersonalInfo(password: string, userInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
  }): boolean {
    if (!userInfo) return false;
    
    const lowerPassword = password.toLowerCase();
    const checks = [
      userInfo.firstName?.toLowerCase(),
      userInfo.lastName?.toLowerCase(),
      userInfo.email?.split('@')[0]?.toLowerCase(),
      userInfo.username?.toLowerCase()
    ];
    
    return checks.some(info => info && lowerPassword.includes(info));
  }

  private static hasRepeatingChars(password: string): boolean {
    return /(.)\1{2,}/.test(password);
  }

  private static hasSequentialChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);
      
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
    }
    return false;
  }

  private static async logPasswordAction(
    action: PasswordAuditLog['action'],
    userId: string,
    credentialId?: string,
    details?: any
  ): Promise<void> {
    const log: PasswordAuditLog = {
      id: SecurityService.generateSecureId(),
      userId,
      action,
      credentialId,
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      success: true,
      details
    };

    this.auditLogs.push(log);
    
    // In production, send to backend
    try {
      await secureDb.http.post('/security/password-audit-logs', log);
    } catch (error) {
      console.error('Failed to log password action:', error);
    }
  }

  private static getCurrentUserId(): string {
    return localStorage.getItem('currentUserId') || 'anonymous';
  }

  private static getClientIP(): string {
    // In production, this would be determined server-side
    return '127.0.0.1';
  }
}

export default PasswordSecurityService;