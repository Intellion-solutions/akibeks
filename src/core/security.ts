import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

// Security configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const ENCRYPTION_ALGORITHM = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
const HMAC_SECRET = process.env.HMAC_SECRET || '';
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
const SALT_ROUNDS = parseInt(process.env.PASSWORD_SALT_ROUNDS || '12');

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
}

if (!HMAC_SECRET || HMAC_SECRET.length < 64) {
  throw new Error('HMAC_SECRET must be at least 64 characters long');
}

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

// Password hashing utilities
export class PasswordManager {
  static async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Password verification failed');
    }
  }

  static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Password must be at least 8 characters long');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Password must contain lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Password must contain uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Password must contain numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Password must contain special characters');

    if (password.length >= 12) score += 1;

    return {
      isValid: score >= 4,
      score,
      feedback
    };
  }
}

// Encryption utilities
export class EncryptionManager {
  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    try {
      // Check if we're in a Node.js environment
      if (typeof window === 'undefined' && typeof global !== 'undefined') {
        const crypto = require('crypto');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipherGCM(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag().toString('hex');
        
        return {
          encrypted,
          iv: iv.toString('hex'),
          tag
        };
      } else {
        // Browser environment - use Web Crypto API or simple encoding
        const encoded = btoa(text); // Simple base64 encoding for browser
        return {
          encrypted: encoded,
          iv: 'browser-iv',
          tag: 'browser-tag'
        };
      }
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    try {
      // Check if we're in a Node.js environment
      if (typeof window === 'undefined' && typeof global !== 'undefined') {
        const crypto = require('crypto');
        const decipher = crypto.createDecipherGCM(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, Buffer.from(encryptedData.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
      } else {
        // Browser environment - simple base64 decoding
        if (encryptedData.iv === 'browser-iv' && encryptedData.tag === 'browser-tag') {
          return atob(encryptedData.encrypted);
        } else {
          throw new Error('Invalid browser encryption format');
        }
      }
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  static generateSecureToken(length: number = 32): string {
    if (typeof window === 'undefined' && typeof global !== 'undefined') {
      const crypto = require('crypto');
      return crypto.randomBytes(length).toString('hex');
    } else {
      // Browser environment - use crypto.getRandomValues
      const array = new Uint8Array(length);
      if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array);
      } else {
        // Fallback for environments without crypto
        for (let i = 0; i < length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
      }
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  }

  static hash(data: string, algorithm: string = 'sha256'): string {
    if (typeof window === 'undefined' && typeof global !== 'undefined') {
      const crypto = require('crypto');
      return crypto.createHash(algorithm).update(data).digest('hex');
    } else {
      // Browser environment - simple hash fallback
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16);
    }
  }
}

// HMAC utilities for data integrity
export class HMACManager {
  static sign(data: string | object): string {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    
    if (typeof window === 'undefined' && typeof global !== 'undefined') {
      const crypto = require('crypto');
      return crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
    } else {
      // Browser environment - simple signature using hash
      const combined = HMAC_SECRET + payload;
      return EncryptionManager.hash(combined);
    }
  }

  static verify(data: string | object, signature: string): boolean {
    const expectedSignature = this.sign(data);
    
    if (typeof window === 'undefined' && typeof global !== 'undefined') {
      const crypto = require('crypto');
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );
    } else {
      // Browser environment - simple string comparison
      return expectedSignature === signature;
    }
  }

  static signedData(data: object): { data: object; signature: string; timestamp: number } {
    const timestamp = Date.now();
    const payload = { ...data, timestamp };
    const signature = this.sign(payload);
    
    return {
      data: payload,
      signature,
      timestamp
    };
  }

  static verifySignedData(
    signedData: { data: object; signature: string; timestamp: number },
    maxAge: number = 3600000 // 1 hour default
  ): { isValid: boolean; data?: object; error?: string } {
    const now = Date.now();
    
    if (now - signedData.timestamp > maxAge) {
      return { isValid: false, error: 'Data has expired' };
    }

    const isValid = this.verify(signedData.data, signedData.signature);
    
    if (!isValid) {
      return { isValid: false, error: 'Invalid signature' };
    }

    return { isValid: true, data: signedData.data };
  }
}

// JWT utilities
export class JWTManager {
  static generateTokens(payload: object): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'akibeks',
      audience: 'akibeks-users'
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'akibeks',
      audience: 'akibeks-users'
    });

    const decoded = jwt.decode(accessToken) as any;
    const expiresIn = decoded.exp * 1000; // Convert to milliseconds

    return { accessToken, refreshToken, expiresIn };
  }

  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'akibeks',
        audience: 'akibeks-users'
      });
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'akibeks',
        audience: 'akibeks-users'
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static refreshAccessToken(refreshToken: string): string {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      const { iat, exp, ...payload } = decoded;
      
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'akibeks',
        audience: 'akibeks-users'
      });
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }
}

// Data sanitization utilities
export class SanitizationManager {
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static sanitizePhoneNumber(phone: string): string {
    // Kenya phone number format: +254XXXXXXXXX
    let sanitized = phone.replace(/\D/g, '');
    
    if (sanitized.startsWith('254')) {
      sanitized = '+' + sanitized;
    } else if (sanitized.startsWith('0')) {
      sanitized = '+254' + sanitized.substring(1);
    } else if (sanitized.length === 9) {
      sanitized = '+254' + sanitized;
    }
    
    return sanitized;
  }

  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static validateKRAPin(pin: string): boolean {
    // KRA PIN format: AXXXXXXXXXA (Letter + 9 digits + Letter)
    const kraRegex = /^[A-Z][0-9]{9}[A-Z]$/;
    return kraRegex.test(pin.toUpperCase());
  }

  static validateKenyanID(id: string): boolean {
    // Kenyan ID: 7-8 digits
    const idRegex = /^[0-9]{7,8}$/;
    return idRegex.test(id);
  }

  static validateKenyanPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+254[0-9]{9}$/;
    return phoneRegex.test(phone);
  }
}

// Rate limiting utilities
export class RateLimitManager {
  private static attempts: Map<string, { count: number; resetTime: number }> = new Map();

  static checkRateLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 900000 // 15 minutes
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry || now > entry.resetTime) {
      // First attempt or window expired
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs };
    }

    if (entry.count >= maxAttempts) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    this.attempts.set(identifier, entry);
    
    return {
      allowed: true,
      remaining: maxAttempts - entry.count,
      resetTime: entry.resetTime
    };
  }

  static resetRateLimit(identifier: string): void {
    this.attempts.delete(identifier);
  }

  static clearExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

// Security headers utility
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.akibeks.co.ke;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim()
});

export default {
  PasswordManager,
  EncryptionManager,
  HMACManager,
  JWTManager,
  SanitizationManager,
  RateLimitManager,
  getSecurityHeaders
};