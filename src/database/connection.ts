import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Database configuration with security settings
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : process.env.DB_SSL === 'require' 
      ? { rejectUnauthorized: false } 
      : false,
  max: parseInt(process.env.DB_POOL_MAX || '10'), // Maximum pool size
  min: parseInt(process.env.DB_POOL_MIN || '2'), // Minimum pool size
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'), // 5 seconds
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'), // 30 seconds
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'), // 30 seconds
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  application_name: 'akibeks_engineering_app',
};

// Create connection pool with error handling
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  pool = new Pool(dbConfig);
  
  // Connection pool event handlers
  pool.on('connect', (client: PoolClient) => {
    console.log('New database client connected');
    // Set session configuration for security
    client.query(`
      SET statement_timeout = '30s';
      SET idle_in_transaction_session_timeout = '5min';
      SET lock_timeout = '10s';
      SET timezone = 'Africa/Nairobi';
    `).catch(err => console.warn('Failed to set session config:', err));
  });

  pool.on('error', (err: Error, client: PoolClient) => {
    console.error('Database pool error:', err);
    // Log error to monitoring system here
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
    }
  });

  pool.on('remove', (client: PoolClient) => {
    console.log('Database client removed from pool');
  });

  // Initialize Drizzle with the pool
  db = drizzle(pool, { 
    schema,
    logger: process.env.NODE_ENV === 'development',
  });

  console.log('Database connection established successfully');
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  process.exit(1);
}

// Connection health check
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  details: {
    connectionTime: number;
    poolStats: any;
    timestamp: string;
  };
}> {
  const startTime = Date.now();
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as health_check, NOW() as server_time');
    client.release();
    
    const connectionTime = Date.now() - startTime;
    return {
      isHealthy: result.rows[0]?.health_check === 1,
      details: {
        connectionTime,
        poolStats: getDatabaseStats(),
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      isHealthy: false,
      details: {
        connectionTime: Date.now() - startTime,
        poolStats: getDatabaseStats(),
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Connection stats
export function getDatabaseStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    config: {
      max: pool.options.max,
      min: pool.options.min,
      idleTimeoutMillis: pool.options.idleTimeoutMillis,
      connectionTimeoutMillis: pool.options.connectionTimeoutMillis
    }
  };
}

// Connection retry utility
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Transaction wrapper
export async function withTransaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const txDb = drizzle(client, { schema });
    const result = await callback(txDb);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Export the database instance and pool
export { db, pool };
export default db;