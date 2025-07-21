import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from '../database/schema';

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

// Database configuration with enhanced security
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : process.env.DB_SSL === 'require' 
      ? { rejectUnauthorized: false } 
      : false,
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
  query_timeout: 20000,
  statement_timeout: 20000,
  application_name: 'akibeks_app',
};

// Create connection pool
const pool = new Pool(dbConfig);

// Pool event handlers for monitoring
pool.on('connect', (client: PoolClient) => {
  console.log('Database client connected');
});

pool.on('error', (err: Error) => {
  console.error('Database connection error:', err);
});

pool.on('remove', () => {
  console.log('Database client removed from pool');
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Database client class for advanced operations
export class DatabaseClient {
  private static instance: DatabaseClient;
  private pool: Pool;
  public db: typeof db;

  private constructor() {
    this.pool = pool;
    this.db = db;
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  // Health check function
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const client = await this.pool.connect();
      try {
        const result = await client.query('SELECT NOW() as timestamp, version() as version');
        const poolStats = {
          totalCount: this.pool.totalCount,
          idleCount: this.pool.idleCount,
          waitingCount: this.pool.waitingCount,
        };
        
        return {
          status: 'healthy',
          details: {
            timestamp: result.rows[0].timestamp,
            version: result.rows[0].version,
            pool: poolStats
          }
        };
      } finally {
        client.release();
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Transaction wrapper
  async transaction<T>(
    callback: (tx: typeof db) => Promise<T>
  ): Promise<T> {
    return await this.db.transaction(callback);
  }

  // Get connection pool stats
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    try {
      await this.pool.end();
      console.log('Database pool shut down gracefully');
    } catch (error) {
      console.error('Error during database shutdown:', error);
      throw error;
    }
  }

  // Raw query execution (use sparingly)
  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Batch operations
  async batchInsert<T>(
    table: any,
    data: T[],
    batchSize: number = 100
  ): Promise<void> {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await this.db.insert(table).values(batch);
    }
  }
}

// Export singleton instance
export const dbClient = DatabaseClient.getInstance();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await dbClient.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await dbClient.shutdown();
  process.exit(0);
});

// Export for backwards compatibility and ease of use
export { db as database };
export default dbClient;