import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
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
};

// Create connection pool with error handling
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  pool = new Pool(dbConfig);
  
  // Connection pool event handlers
  pool.on('connect', (client) => {
    console.log('New database client connected');
    // Set session configuration for security
    client.query(`
      SET statement_timeout = '30s';
      SET idle_in_transaction_session_timeout = '5min';
      SET lock_timeout = '10s';
    `);
  });

  pool.on('error', (err, client) => {
    console.error('Database pool error:', err);
    // Log error to monitoring system here
  });

  pool.on('remove', (client) => {
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
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as health_check');
    client.release();
    return result.rows[0]?.health_check === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
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
  };
}

// Export the database instance and pool
export { db, pool };
export default db;