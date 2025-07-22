import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import databaseConfigModule, { validateDatabaseConfig } from '../config/database.config.js';

// Validate configuration before creating connection
if (!validateDatabaseConfig()) {
  throw new Error('Invalid database configuration');
}

// Create connection with secure configuration
const sql = postgres(databaseConfigModule.database.url, {
  max: databaseConfigModule.database.pool.max,
  idle_timeout: databaseConfigModule.database.pool.idle,
  connect_timeout: databaseConfigModule.database.pool.acquire,
  ssl: databaseConfigModule.database.ssl,
});

// Initialize Drizzle with the connection and schema
export const db: PostgresJsDatabase<typeof schema> = drizzle(sql, { schema });

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
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

// Export default database instance
export default db;