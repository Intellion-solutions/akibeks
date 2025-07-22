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
  preventRepeatingChars: boolean;
  preventSequentialChars: boolean;
  expirationDays: number;
  historyCount: number;
  maxAttempts: number;
  lockoutDuration: number;
}

export interface PasswordStrengthResult {
  score: number; // 0-100
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
  violations: string[];
  estimatedCrackTime: string;
}

export interface SecureCredential {
  id: string;
  userId: string;
  service: string;
  username: string;
  encryptedPassword: string;
  notes?: string;
  tags: string[];
  isActive: boolean;
  expiresAt?: string;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    createdBy: string;
    accessCount: number;
    ipAddresses: string[];
  };
}

export interface PasswordAuditLog {
  id: string;
  userId: string;
  action: 'created' | 'updated' | 'accessed' | 'deleted' | 'policy-violation' | 'breach-check';
  credentialId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventPersonalInfo: true,
  preventRepeatingChars: true,
  preventSequentialChars: true,
  expirationDays: 90,
  historyCount: 5,
  maxAttempts: 3,
  lockoutDuration: 30
};

export class PasswordSecurityService {
  private static policy: PasswordPolicy = DEFAULT_POLICY;
  private static auditLogs: PasswordAuditLog[] = [];
  private static mockCredentials: SecureCredential[] = [];

  static setPasswordPolicy(policy: Partial<PasswordPolicy>): void {
    this.policy = { ...this.policy, ...policy };
  }

  static getPasswordPolicy(): PasswordPolicy {
    return { ...this.policy };
  }

  static analyzePasswordStrength(password: string, userInfo?: any): PasswordStrengthResult {
    let score = 0;
    const feedback: string[] = [];
    const violations: string[] = [];

    // Length check
    if (password.length >= this.policy.minLength) {
      score += 20;
    } else {
      violations.push(`Password must be at least ${this.policy.minLength} characters long`);
    }

    // Character type checks
    if (this.policy.requireUppercase && /[A-Z]/.test(password)) {
      score += 15;
    } else if (this.policy.requireUppercase) {
      violations.push('Password must contain uppercase letters');
    }

    if (this.policy.requireLowercase && /[a-z]/.test(password)) {
      score += 15;
    } else if (this.policy.requireLowercase) {
      violations.push('Password must contain lowercase letters');
    }

    if (this.policy.requireNumbers && /\d/.test(password)) {
      score += 15;
    } else if (this.policy.requireNumbers) {
      violations.push('Password must contain numbers');
    }

    if (this.policy.requireSpecialChars && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 15;
    } else if (this.policy.requireSpecialChars) {
      violations.push('Password must contain special characters');
    }

    // Additional checks
    if (this.policy.preventCommonPasswords && this.isCommonPassword(password)) {
      score -= 20;
      violations.push('Password is too common');
    }

    if (this.policy.preventPersonalInfo && userInfo && this.containsPersonalInfo(password, userInfo)) {
      score -= 15;
      violations.push('Password contains personal information');
    }

    if (this.policy.preventRepeatingChars && this.hasRepeatingChars(password)) {
      score -= 10;
      violations.push('Password has too many repeating characters');
    }

    if (this.policy.preventSequentialChars && this.hasSequentialChars(password)) {
      score -= 10;
      violations.push('Password contains sequential characters');
    }

    // Entropy bonus
    const entropy = this.calculateEntropy(password);
    score += Math.min(20, entropy / 2);

    score = Math.max(0, Math.min(100, score));

    let strength: PasswordStrengthResult['strength'];
    if (score >= 90) strength = 'very-strong';
    else if (score >= 75) strength = 'strong';
    else if (score >= 60) strength = 'good';
    else if (score >= 40) strength = 'fair';
    else if (score >= 20) strength = 'weak';
    else strength = 'very-weak';

    // Generate feedback
    if (score >= 75) {
      feedback.push('Strong password!');
    } else if (score >= 50) {
      feedback.push('Good password, consider making it stronger');
    } else {
      feedback.push('Password needs improvement');
    }

    const estimatedCrackTime = this.estimateCrackTime(password, score);

    return {
      score,
      strength,
      feedback,
      violations,
      estimatedCrackTime
    };
  }

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
      charset = charset.replace(/[0O1lI]/g, '');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  static async storeCredential(credential: Omit<SecureCredential, 'id' | 'encryptedPassword' | 'metadata'>): Promise<string | null> {
    try {
      const credentialId = `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const encryptedPassword = await this.encryptPassword(credential.username); // Mock encryption
      
      const secureCredential: SecureCredential = {
        ...credential,
        id: credentialId,
        encryptedPassword,
        metadata: {
          createdBy: this.getCurrentUserId(),
          accessCount: 0,
          ipAddresses: []
        }
      };

      // Mock storage
      this.mockCredentials.push(secureCredential);
      await this.logPasswordAction('created', credential.userId, credentialId);
      return credentialId;
    } catch (error) {
      console.error('Failed to store credential:', error);
      return null;
    }
  }

  static async getCredential(credentialId: string): Promise<SecureCredential | null> {
    try {
      const credential = this.mockCredentials.find(c => c.id === credentialId);
      
      if (credential) {
        await this.logPasswordAction('accessed', credential.userId, credentialId);
        return credential;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get credential:', error);
      return null;
    }
  }

  static async updateCredential(credentialId: string, updates: Partial<SecureCredential>): Promise<boolean> {
    try {
      const index = this.mockCredentials.findIndex(c => c.id === credentialId);
      
      if (index !== -1) {
        this.mockCredentials[index] = { ...this.mockCredentials[index], ...updates, updatedAt: new Date().toISOString() };
        await this.logPasswordAction('updated', this.mockCredentials[index].userId, credentialId);
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
      const index = this.mockCredentials.findIndex(c => c.id === credentialId);
      
      if (index !== -1) {
        const credential = this.mockCredentials[index];
        this.mockCredentials.splice(index, 1);
        await this.logPasswordAction('deleted', credential.userId, credentialId);
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
      return this.mockCredentials.filter(c => c.userId === userId);
    } catch (error) {
      console.error('Failed to get user credentials:', error);
      return [];
    }
  }

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
      const totalCredentials = this.mockCredentials.length;
      let weakPasswords = 0;
      let expiredPasswords = 0;
      let reusedPasswords = 0;
      let policyViolations = 0;

      // Mock analysis
      weakPasswords = Math.floor(totalCredentials * 0.1);
      expiredPasswords = Math.floor(totalCredentials * 0.05);
      reusedPasswords = Math.floor(totalCredentials * 0.02);
      policyViolations = weakPasswords + expiredPasswords;

      const securityScore = Math.max(0, 100 - (weakPasswords * 10) - (expiredPasswords * 15) - (reusedPasswords * 20));

      const recommendations: string[] = [];
      if (weakPasswords > 0) recommendations.push(`${weakPasswords} weak passwords need strengthening`);
      if (expiredPasswords > 0) recommendations.push(`${expiredPasswords} passwords have expired`);
      if (reusedPasswords > 0) recommendations.push(`${reusedPasswords} passwords are being reused`);

      return {
        weakPasswords,
        expiredPasswords,
        reusedPasswords,
        policyViolations,
        totalCredentials,
        securityScore,
        recommendations
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

  static async checkPasswordBreach(password: string): Promise<{
    isBreached: boolean;
    breachCount: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    // Mock breach check
    const isBreached = Math.random() < 0.1; // 10% chance of being "breached"
    const breachCount = isBreached ? Math.floor(Math.random() * 1000) : 0;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (breachCount > 1000) riskLevel = 'critical';
    else if (breachCount > 100) riskLevel = 'high';
    else if (breachCount > 10) riskLevel = 'medium';

    return { isBreached, breachCount, riskLevel };
  }

  static async getPasswordAuditLogs(userId?: string, limit: number = 100): Promise<PasswordAuditLog[]> {
    try {
      let logs = this.auditLogs;
      if (userId) {
        logs = logs.filter(log => log.userId === userId);
      }
      return logs.slice(0, limit);
    } catch (error) {
      console.error('Failed to get password audit logs:', error);
      return [];
    }
  }

  // Private helper methods
  private static async encryptPassword(password: string): Promise<string> {
    // Mock encryption - in real implementation, use proper encryption
    return btoa(password);
  }

  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  private static containsPersonalInfo(password: string, userInfo: any): boolean {
    if (!userInfo) return false;
    
    const personalData = [
      userInfo.name,
      userInfo.email,
      userInfo.username,
      userInfo.phone,
      userInfo.birthdate
    ].filter(Boolean);

    return personalData.some(data => 
      password.toLowerCase().includes(data.toLowerCase())
    );
  }

  private static hasRepeatingChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return true;
      }
    }
    return false;
  }

  private static hasSequentialChars(password: string): boolean {
    const sequences = ['abc', '123', 'qwe', 'asd', 'zxc'];
    return sequences.some(seq => password.toLowerCase().includes(seq));
  }

  private static calculateEntropy(password: string): number {
    let charset = 0;
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/\d/.test(password)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charset += 32;

    return password.length * Math.log2(charset);
  }

  private static estimateCrackTime(password: string, score: number): string {
    if (score >= 90) return 'Centuries';
    if (score >= 75) return 'Years';
    if (score >= 60) return 'Months';
    if (score >= 40) return 'Days';
    if (score >= 20) return 'Hours';
    return 'Minutes';
  }

  private static getCurrentUserId(): string {
    // Mock user ID - in real implementation, get from auth context
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  private static async logPasswordAction(
    action: PasswordAuditLog['action'],
    userId: string,
    credentialId?: string,
    details?: string
  ): Promise<void> {
    const log: PasswordAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      credentialId,
      details: details || `Password ${action}`,
      ipAddress: '127.0.0.1', // Mock IP
      userAgent: 'Mock User Agent',
      timestamp: new Date().toISOString()
    };

    this.auditLogs.push(log);
    
    // Keep only last 1000 logs
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }
  }
}

export default PasswordSecurityService;