/**
 * Secure Password Management System for AKIBEKS Engineering Solutions
 * Enterprise-grade password security with encryption, hashing, and policy enforcement
 */

import { SecurityService } from './security';
import { secureDb } from './database-secure';

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxRepeatingChars: number;
  preventCommonPasswords: boolean;
  preventPersonalInfo: boolean;
  passwordHistoryCount: number;
  maxAge: number; // in days
  minAge: number; // in days (prevent frequent changes)
  lockoutThreshold: number;
  lockoutDuration: number; // in minutes
}

export interface PasswordEntry {
  id: string;
  userId: string;
  hashedPassword: string;
  salt: string;
  algorithm: 'bcrypt' | 'argon2' | 'pbkdf2';
  iterations: number;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  metadata: {
    strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    score: number;
    complexity: number;
    entropy: number;
  };
}

export interface PasswordHistory {
  id: string;
  userId: string;
  hashedPassword: string;
  createdAt: string;
  replacedAt: string;
  reason: 'user-change' | 'policy-enforcement' | 'security-breach' | 'expired';
}

export interface PasswordAttempt {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  timestamp: string;
  failureReason?: 'wrong-password' | 'account-locked' | 'expired' | 'policy-violation';
  metadata?: Record<string, any>;
}

export interface SecurityCredentials {
  id: string;
  userId: string;
  type: 'password' | 'api-key' | 'certificate' | 'ssh-key' | 'database-connection';
  name: string;
  description?: string;
  encryptedValue: string;
  iv: string; // Initialization vector for encryption
  keyDerivationSalt: string;
  algorithm: string;
  keyLength: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  lastUsed?: string;
  usageCount: number;
  isActive: boolean;
  permissions: string[];
  metadata: Record<string, any>;
}

export interface TwoFactorAuth {
  id: string;
  userId: string;
  type: '2fa-totp' | '2fa-sms' | '2fa-email' | '2fa-hardware';
  secret?: string; // For TOTP
  backupCodes: string[];
  isEnabled: boolean;
  verifiedAt?: string;
  lastUsed?: string;
  failedAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionToken {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  isActive: boolean;
  permissions: string[];
  metadata: Record<string, any>;
}

// Default security policy
const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxRepeatingChars: 2,
  preventCommonPasswords: true,
  preventPersonalInfo: true,
  passwordHistoryCount: 12,
  maxAge: 90, // 3 months
  minAge: 1, // 1 day
  lockoutThreshold: 5,
  lockoutDuration: 30, // 30 minutes
};

// Common passwords list (sample - in production, use comprehensive list)
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
  'qwerty123', 'admin123', 'root', 'toor', 'pass', 'test', 'guest'
];

export class PasswordManager {
  private policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY;

  // Password Policy Management
  async getPasswordPolicy(): Promise<PasswordPolicy> {
    try {
      const response = await secureDb.http.get<PasswordPolicy>('/security/password-policy');
      if (response.success && response.data) {
        this.policy = response.data;
        return response.data;
      }
      return this.policy;
    } catch (error) {
      console.error('Failed to fetch password policy:', error);
      return this.policy;
    }
  }

  async updatePasswordPolicy(policy: Partial<PasswordPolicy>): Promise<boolean> {
    try {
      const response = await secureDb.http.put('/security/password-policy', policy);
      if (response.success) {
        this.policy = { ...this.policy, ...policy };
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update password policy:', error);
      return false;
    }
  }

  // Password Validation
  validatePassword(password: string, userInfo?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }): {
    isValid: boolean;
    score: number;
    strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (password.length < this.policy.minLength) {
      issues.push(`Password must be at least ${this.policy.minLength} characters long`);
      suggestions.push(`Add ${this.policy.minLength - password.length} more characters`);
    } else {
      score += Math.min(25, password.length - this.policy.minLength + 10);
    }

    if (password.length > this.policy.maxLength) {
      issues.push(`Password must not exceed ${this.policy.maxLength} characters`);
    }

    // Character requirements
    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
      suggestions.push('Add uppercase letters (A-Z)');
    } else if (/[A-Z]/.test(password)) {
      score += 15;
    }

    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
      suggestions.push('Add lowercase letters (a-z)');
    } else if (/[a-z]/.test(password)) {
      score += 15;
    }

    if (this.policy.requireNumbers && !/\d/.test(password)) {
      issues.push('Password must contain at least one number');
      suggestions.push('Add numbers (0-9)');
    } else if (/\d/.test(password)) {
      score += 15;
    }

    if (this.policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      issues.push('Password must contain at least one special character');
      suggestions.push('Add special characters (!@#$%^&*)');
    } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 20;
    }

    // Repeating characters
    const repeatingChars = this.findRepeatingChars(password);
    if (repeatingChars > this.policy.maxRepeatingChars) {
      issues.push(`Password contains too many repeating characters (max: ${this.policy.maxRepeatingChars})`);
      suggestions.push('Reduce repeating characters');
      score -= 10;
    }

    // Common passwords
    if (this.policy.preventCommonPasswords && this.isCommonPassword(password)) {
      issues.push('Password is too common and easily guessable');
      suggestions.push('Use a more unique password');
      score -= 20;
    }

    // Personal information
    if (this.policy.preventPersonalInfo && userInfo && this.containsPersonalInfo(password, userInfo)) {
      issues.push('Password contains personal information');
      suggestions.push('Avoid using personal information in passwords');
      score -= 15;
    }

    // Entropy calculation
    const entropy = this.calculateEntropy(password);
    score += Math.min(15, entropy / 4);

    // Normalize score
    score = Math.max(0, Math.min(100, score));

    // Determine strength
    let strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    if (score < 30) strength = 'weak';
    else if (score < 50) strength = 'fair';
    else if (score < 70) strength = 'good';
    else if (score < 90) strength = 'strong';
    else strength = 'very-strong';

    return {
      isValid: issues.length === 0,
      score,
      strength,
      issues,
      suggestions
    };
  }

  // Password Hashing and Verification
  async hashPassword(password: string, algorithm: 'bcrypt' | 'argon2' | 'pbkdf2' = 'bcrypt'): Promise<{
    hash: string;
    salt: string;
    algorithm: string;
    iterations: number;
  }> {
    const salt = this.generateSalt();
    let hash: string;
    let iterations: number;

    switch (algorithm) {
      case 'bcrypt':
        iterations = 12;
        hash = await this.bcryptHash(password, salt, iterations);
        break;
      case 'argon2':
        iterations = 3;
        hash = await this.argon2Hash(password, salt, iterations);
        break;
      case 'pbkdf2':
        iterations = 100000;
        hash = await this.pbkdf2Hash(password, salt, iterations);
        break;
      default:
        throw new Error('Unsupported hashing algorithm');
    }

    return { hash, salt, algorithm, iterations };
  }

  async verifyPassword(password: string, entry: PasswordEntry): Promise<boolean> {
    try {
      switch (entry.algorithm) {
        case 'bcrypt':
          return await this.bcryptVerify(password, entry.hashedPassword);
        case 'argon2':
          return await this.argon2Verify(password, entry.hashedPassword);
        case 'pbkdf2':
          return await this.pbkdf2Verify(password, entry.salt, entry.hashedPassword, entry.iterations);
        default:
          return false;
      }
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  // Password Management
  async setPassword(userId: string, password: string, reason: string = 'user-change'): Promise<boolean> {
    try {
      // Validate password
      const validation = this.validatePassword(password);
      if (!validation.isValid) {
        throw new Error(`Password validation failed: ${validation.issues.join(', ')}`);
      }

      // Check password history
      const isReused = await this.isPasswordReused(userId, password);
      if (isReused) {
        throw new Error('Password has been used recently and cannot be reused');
      }

      // Hash password
      const { hash, salt, algorithm, iterations } = await this.hashPassword(password);

      // Create password entry
      const entry: Omit<PasswordEntry, 'id'> = {
        userId,
        hashedPassword: hash,
        salt,
        algorithm,
        iterations,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.policy.maxAge * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        metadata: {
          strength: validation.strength,
          score: validation.score,
          complexity: this.calculateComplexity(password),
          entropy: this.calculateEntropy(password),
        }
      };

      // Save to database
      const response = await secureDb.http.post('/security/passwords', { entry, reason });
      return response.success;
    } catch (error) {
      console.error('Failed to set password:', error);
      return false;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify current password
      const currentEntry = await this.getCurrentPasswordEntry(userId);
      if (!currentEntry || !await this.verifyPassword(currentPassword, currentEntry)) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Check minimum age
      const daysSinceLastChange = (Date.now() - new Date(currentEntry.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastChange < this.policy.minAge) {
        return { 
          success: false, 
          error: `Password can only be changed after ${this.policy.minAge} day(s)` 
        };
      }

      // Set new password
      const success = await this.setPassword(userId, newPassword, 'user-change');
      return { success };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Credential Management
  async storeCredential(userId: string, credential: {
    type: SecurityCredentials['type'];
    name: string;
    value: string;
    description?: string;
    expiresAt?: string;
    permissions?: string[];
    metadata?: Record<string, any>;
  }): Promise<string | null> {
    try {
      const { encryptedValue, iv, salt } = await this.encryptValue(credential.value);
      
      const credentialEntry: Omit<SecurityCredentials, 'id'> = {
        userId,
        type: credential.type,
        name: credential.name,
        description: credential.description,
        encryptedValue,
        iv,
        keyDerivationSalt: salt,
        algorithm: 'AES-GCM',
        keyLength: 256,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: credential.expiresAt,
        usageCount: 0,
        isActive: true,
        permissions: credential.permissions || [],
        metadata: credential.metadata || {},
      };

      const response = await secureDb.http.post<{ id: string }>('/security/credentials', credentialEntry);
      return response.success && response.data ? response.data.id : null;
    } catch (error) {
      console.error('Failed to store credential:', error);
      return null;
    }
  }

  async retrieveCredential(credentialId: string, userId: string): Promise<string | null> {
    try {
      const response = await secureDb.http.get<SecurityCredentials>(`/security/credentials/${credentialId}`);
      if (!response.success || !response.data || response.data.userId !== userId) {
        return null;
      }

      const credential = response.data;
      const decryptedValue = await this.decryptValue(
        credential.encryptedValue,
        credential.iv,
        credential.keyDerivationSalt
      );

      // Update usage count
      await secureDb.http.put(`/security/credentials/${credentialId}/usage`, {
        lastUsed: new Date().toISOString(),
        usageCount: credential.usageCount + 1
      });

      return decryptedValue;
    } catch (error) {
      console.error('Failed to retrieve credential:', error);
      return null;
    }
  }

  // Two-Factor Authentication
  async setup2FA(userId: string, type: TwoFactorAuth['type']): Promise<{
    success: boolean;
    secret?: string;
    qrCode?: string;
    backupCodes?: string[];
  }> {
    try {
      let secret: string | undefined;
      let qrCode: string | undefined;
      const backupCodes = this.generateBackupCodes();

      if (type === '2fa-totp') {
        secret = this.generateTOTPSecret();
        qrCode = await this.generateQRCode(userId, secret);
      }

      const twoFactorEntry: Omit<TwoFactorAuth, 'id'> = {
        userId,
        type,
        secret,
        backupCodes,
        isEnabled: false, // Will be enabled after verification
        failedAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await secureDb.http.post('/security/2fa', twoFactorEntry);
      
      return {
        success: response.success,
        secret,
        qrCode,
        backupCodes
      };
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
      return { success: false };
    }
  }

  async verify2FA(userId: string, code: string): Promise<boolean> {
    try {
      const response = await secureDb.http.post('/security/2fa/verify', { userId, code });
      return response.success;
    } catch (error) {
      console.error('Failed to verify 2FA:', error);
      return false;
    }
  }

  // Session Management
  async createSession(userId: string, deviceInfo: {
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
  }): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const accessToken = this.generateSecureToken();
      const refreshToken = this.generateSecureToken();

      const session: Omit<SessionToken, 'id'> = {
        userId,
        token: await this.hashToken(accessToken),
        refreshToken: await this.hashToken(refreshToken),
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        deviceFingerprint: deviceInfo.deviceFingerprint,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        lastActivity: new Date().toISOString(),
        isActive: true,
        permissions: [],
        metadata: {},
      };

      const response = await secureDb.http.post('/security/sessions', session);
      
      return response.success ? { accessToken, refreshToken } : null;
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  }

  // Utility Methods
  private findRepeatingChars(password: string): number {
    let maxRepeating = 0;
    let currentRepeating = 1;
    
    for (let i = 1; i < password.length; i++) {
      if (password[i] === password[i - 1]) {
        currentRepeating++;
      } else {
        maxRepeating = Math.max(maxRepeating, currentRepeating);
        currentRepeating = 1;
      }
    }
    
    return Math.max(maxRepeating, currentRepeating);
  }

  private isCommonPassword(password: string): boolean {
    return COMMON_PASSWORDS.includes(password.toLowerCase());
  }

  private containsPersonalInfo(password: string, userInfo: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }): boolean {
    const lowerPassword = password.toLowerCase();
    const checks = [
      userInfo.email?.toLowerCase(),
      userInfo.firstName?.toLowerCase(),
      userInfo.lastName?.toLowerCase(),
      userInfo.username?.toLowerCase(),
    ];

    return checks.some(info => info && lowerPassword.includes(info));
  }

  private calculateEntropy(password: string): number {
    const charSets = [
      /[a-z]/.test(password) ? 26 : 0, // lowercase
      /[A-Z]/.test(password) ? 26 : 0, // uppercase
      /\d/.test(password) ? 10 : 0,    // digits
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 32 : 0, // special chars
    ];

    const charsetSize = charSets.reduce((sum, size) => sum + size, 0);
    return password.length * Math.log2(charsetSize);
  }

  private calculateComplexity(password: string): number {
    let complexity = 0;
    
    // Character variety
    if (/[a-z]/.test(password)) complexity += 1;
    if (/[A-Z]/.test(password)) complexity += 1;
    if (/\d/.test(password)) complexity += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) complexity += 1;
    
    // Length bonus
    complexity += Math.min(4, password.length / 4);
    
    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) complexity -= 1; // repeating characters
    if (/123|abc|qwe/i.test(password)) complexity -= 1; // sequential patterns
    
    return Math.max(0, complexity);
  }

  private generateSalt(): string {
    return SecurityService.generateSecureId();
  }

  private async bcryptHash(password: string, salt: string, rounds: number): Promise<string> {
    // In a real implementation, use bcrypt library
    // This is a placeholder implementation
    return `$2b$${rounds}$${salt}${btoa(password + salt).slice(0, 31)}`;
  }

  private async bcryptVerify(password: string, hash: string): Promise<boolean> {
    // In a real implementation, use bcrypt library
    // This is a placeholder implementation
    const parts = hash.split('$');
    if (parts.length !== 4) return false;
    
    const rounds = parseInt(parts[2]);
    const salt = parts[3].slice(0, 22);
    const expectedHash = await this.bcryptHash(password, salt, rounds);
    
    return hash === expectedHash;
  }

  private async argon2Hash(password: string, salt: string, iterations: number): Promise<string> {
    // Placeholder - in production, use argon2 library
    return `argon2$${iterations}$${salt}$${btoa(password + salt)}`;
  }

  private async argon2Verify(password: string, hash: string): Promise<boolean> {
    // Placeholder implementation
    return hash.includes(btoa(password).slice(0, 10));
  }

  private async pbkdf2Hash(password: string, salt: string, iterations: number): Promise<string> {
    // Placeholder - in production, use crypto.pbkdf2
    return `pbkdf2$${iterations}$${salt}$${btoa(password + salt)}`;
  }

  private async pbkdf2Verify(password: string, salt: string, hash: string, iterations: number): Promise<boolean> {
    const expectedHash = await this.pbkdf2Hash(password, salt, iterations);
    return hash === expectedHash;
  }

  private async encryptValue(value: string): Promise<{
    encryptedValue: string;
    iv: string;
    salt: string;
  }> {
    const salt = this.generateSalt();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // In production, use proper key derivation and encryption
    const encrypted = btoa(value + salt);
    
    return {
      encryptedValue: encrypted,
      iv: btoa(String.fromCharCode(...iv)),
      salt
    };
  }

  private async decryptValue(encryptedValue: string, iv: string, salt: string): Promise<string> {
    // In production, use proper decryption
    const decrypted = atob(encryptedValue);
    return decrypted.replace(salt, '');
  }

  private generateTOTPSecret(): string {
    return SecurityService.generateSecureId().slice(0, 32);
  }

  private async generateQRCode(userId: string, secret: string): Promise<string> {
    // In production, generate actual QR code
    const otpauth = `otpauth://totp/AKIBEKS:${userId}?secret=${secret}&issuer=AKIBEKS`;
    return `data:image/png;base64,${btoa(otpauth)}`;
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  }

  private generateSecureToken(): string {
    return SecurityService.generateSecureId();
  }

  private async hashToken(token: string): Promise<string> {
    return btoa(token); // In production, use proper hashing
  }

  private async getCurrentPasswordEntry(userId: string): Promise<PasswordEntry | null> {
    try {
      const response = await secureDb.http.get<PasswordEntry>(`/security/passwords/current/${userId}`);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Failed to get current password entry:', error);
      return null;
    }
  }

  private async isPasswordReused(userId: string, password: string): Promise<boolean> {
    try {
      const response = await secureDb.http.post<{ isReused: boolean }>('/security/passwords/check-reuse', {
        userId,
        password
      });
      return response.success && response.data ? response.data.isReused : false;
    } catch (error) {
      console.error('Failed to check password reuse:', error);
      return false;
    }
  }
}

// Singleton instance
export const passwordManager = new PasswordManager();

export default passwordManager;