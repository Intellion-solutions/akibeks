import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { generateSecureToken } from './encryption';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
  tokenType: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

/**
 * Generate access token
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'tokenType'>): string {
  try {
    return jwt.sign(
      { 
        ...payload, 
        tokenType: 'access',
        iat: Math.floor(Date.now() / 1000),
        jti: generateSecureToken(16) // JWT ID for tracking
      },
      JWT_SECRET,
      { 
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'akibeks-api',
        audience: 'akibeks-app',
        algorithm: 'HS256'
      }
    );
  } catch (error) {
    throw new Error('Access token generation failed: ' + error);
  }
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: Omit<TokenPayload, 'tokenType'>): string {
  try {
    return jwt.sign(
      { 
        ...payload, 
        tokenType: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        jti: generateSecureToken(16)
      },
      JWT_REFRESH_SECRET,
      { 
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'akibeks-api',
        audience: 'akibeks-app',
        algorithm: 'HS256'
      }
    );
  } catch (error) {
    throw new Error('Refresh token generation failed: ' + error);
  }
}

/**
 * Generate token pair (access + refresh)
 */
export function generateTokenPair(payload: Omit<TokenPayload, 'tokenType'>): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: getTokenExpiration(JWT_EXPIRES_IN),
    refreshExpiresIn: getTokenExpiration(JWT_REFRESH_EXPIRES_IN),
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'akibeks-api',
      audience: 'akibeks-app',
      algorithms: ['HS256']
    }) as TokenPayload;
    
    if (decoded.tokenType !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    } else {
      throw new Error('Access token verification failed: ' + error);
    }
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'akibeks-api',
      audience: 'akibeks-app',
      algorithms: ['HS256']
    }) as TokenPayload;
    
    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed: ' + error);
    }
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Token decode failed: ' + error);
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Get token expiration time in seconds
 */
function getTokenExpiration(expiresIn: string): number {
  const units: { [key: string]: number } = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800
  };
  
  const match = expiresIn.match(/^(\d+)([smhdw])$/);
  if (!match) throw new Error('Invalid expiration format');
  
  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * Generate secure session ID
 */
export function generateSessionId(): string {
  return generateSecureToken(32);
}