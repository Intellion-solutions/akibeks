import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  pool: {
    max: number;
    min: number;
    idle: number;
    acquire: number;
  };
}

export const databaseConfig: DatabaseConfig = {
  url: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASS || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'akibeks_db'}`,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'akibeks_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    idle: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    acquire: parseInt(process.env.DB_CONNECT_TIMEOUT || '60000')
  }
};

// Validation
export const validateDatabaseConfig = (): boolean => {
  const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required database environment variables:', missing.join(', '));
    return false;
  }
  
  return true;
};

export default {
  database: databaseConfig,
  validate: validateDatabaseConfig
};