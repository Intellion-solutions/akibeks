import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_CONFIG } from '../../config.js';
import * as schema from './schema';

// Create connection pool with configuration from config.js
const connectionString = `postgresql://${DATABASE_CONFIG.user}:${DATABASE_CONFIG.password}@${DATABASE_CONFIG.host}:${DATABASE_CONFIG.port}/${DATABASE_CONFIG.database}`;

const sql = postgres(connectionString, {
  max: DATABASE_CONFIG.pool.max,
  idle_timeout: DATABASE_CONFIG.pool.idleTimeoutMillis,
  connect_timeout: DATABASE_CONFIG.pool.connectionTimeoutMillis,
  ssl: DATABASE_CONFIG.ssl.require ? {
    rejectUnauthorized: DATABASE_CONFIG.ssl.rejectUnauthorized,
    ca: DATABASE_CONFIG.ssl.ca,
    cert: DATABASE_CONFIG.ssl.cert,
    key: DATABASE_CONFIG.ssl.key,
  } : false,
});

// Initialize Drizzle with the connection and schema
export const db: PostgresJsDatabase<typeof schema> = drizzle(sql, { schema });

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown function
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await sql.end();
    console.log('Database connection closed gracefully');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Export the raw SQL connection for advanced usage
export { sql };

export default db;