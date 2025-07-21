// Compatibility layer for Supabase-to-PostgreSQL migration
// This file provides a Supabase-like API while using the new PostgreSQL client

import { DatabaseClient, Tables, type QueryOptions, type FilterOption } from '../core/database-client';
import { dbClient } from '../core/database-client';

// Re-export the database client for direct access
export const db = dbClient;

// Supabase-compatible client for easy migration
export const supabase = {
  from: (tableName: string) => {
    return {
      select: (columns: string = '*') => {
        return {
          eq: (column: string, value: any) => {
            return {
              single: async () => {
                try {
                  const result = await db.findOne(tableName, { [column]: value });
                  return { data: result.data, error: result.error };
                } catch (error) {
                  return { data: null, error };
                }
              },
              limit: async (limit: number) => {
                try {
                  const result = await db.select(tableName, {
                    filters: [{ column, operator: 'eq', value }],
                    limit
                  });
                  return { data: result.data, error: result.error };
                } catch (error) {
                  return { data: [], error };
                }
              }
            };
          },
          neq: (column: string, value: any) => {
            return {
              limit: async (limit: number) => {
                try {
                  const result = await db.select(tableName, {
                    filters: [{ column, operator: 'ne', value }],
                    limit
                  });
                  return { data: result.data, error: result.error };
                } catch (error) {
                  return { data: [], error };
                }
              }
            };
          },
          ilike: (column: string, value: any) => {
            return {
              limit: async (limit: number) => {
                try {
                  const result = await db.select(tableName, {
                    filters: [{ column, operator: 'like', value }],
                    limit
                  });
                  return { data: result.data, error: result.error };
                } catch (error) {
                  return { data: [], error };
                }
              }
            };
          },
          in: (column: string, values: any[]) => {
            return {
              limit: async (limit: number) => {
                try {
                  const result = await db.select(tableName, {
                    filters: [{ column, operator: 'in', value: values }],
                    limit
                  });
                  return { data: result.data, error: result.error };
                } catch (error) {
                  return { data: [], error };
                }
              }
            };
          },
          limit: async (limit: number) => {
            try {
              const result = await db.select(tableName, { limit });
              return { data: result.data, error: result.error };
            } catch (error) {
              return { data: [], error };
            }
          },
          order: (column: string, options?: { ascending?: boolean }) => {
            const orderDirection = options?.ascending !== false ? 'asc' : 'desc';
            return {
              limit: async (limit: number) => {
                try {
                  const result = await db.select(tableName, {
                    orderBy: column,
                    orderDirection,
                    limit
                  });
                  return { data: result.data, error: result.error };
                } catch (error) {
                  return { data: [], error };
                }
              }
            };
          },
          range: async (from: number, to: number) => {
            try {
              const limit = to - from + 1;
              const result = await db.select(tableName, {
                offset: from,
                limit
              });
              return { data: result.data, error: result.error };
            } catch (error) {
              return { data: [], error };
            }
          }
        };
      },
      insert: async (data: any) => {
        try {
          const result = await db.insert(tableName, data);
          return { data: result.data, error: result.error };
        } catch (error) {
          return { data: null, error };
        }
      },
      update: (data: any) => {
        return {
          eq: async (column: string, value: any) => {
            try {
              // For updates, we need to find the record first to get its ID
              const findResult = await db.findOne(tableName, { [column]: value });
              if (!findResult.data) {
                return { data: null, error: new Error('Record not found') };
              }
              
              const result = await db.update(tableName, (findResult.data as any).id, data);
              return { data: result.data, error: result.error };
            } catch (error) {
              return { data: null, error };
            }
          }
        };
      },
      delete: () => {
        return {
          eq: async (column: string, value: any) => {
            try {
              // For deletes, we need to find the record first to get its ID
              const findResult = await db.findOne(tableName, { [column]: value });
              if (!findResult.data) {
                return { data: null, error: new Error('Record not found') };
              }
              
              const result = await db.delete(tableName, (findResult.data as any).id);
              return { data: result.data, error: result.error };
            } catch (error) {
              return { data: null, error };
            }
          }
        };
      },
      upsert: async (data: any) => {
        try {
          // Try to find existing record
          let existingRecord = null;
          if (data.id) {
            const findResult = await db.findOne(tableName, { id: data.id });
            existingRecord = findResult.data;
          }

          if (existingRecord) {
            // Update existing record
            const result = await db.update(tableName, data.id, data);
            return { data: result.data, error: result.error };
          } else {
            // Insert new record
            const result = await db.insert(tableName, data);
            return { data: result.data, error: result.error };
          }
        } catch (error) {
          return { data: null, error };
        }
      }
    };
  }
};

// Export compatibility types
export type SupabaseClient = typeof supabase;
export type Database = any;

// Re-export useful types and enums
export { Tables, type QueryOptions, type FilterOption } from '../core/database-client';

// Export the database client instance 
export const dbClient = db;
export default db;