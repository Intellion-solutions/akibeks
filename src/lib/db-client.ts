// Simple database client compatibility layer
// This provides a clean API for database operations

import { clientDb, Tables, type QueryOptions, type FilterOption, type DatabaseResult } from './client-db';

// Re-export the main database client
export const db = clientDb;

// Simplified Supabase-compatible API for easy migration
export const supabase = {
  from: (tableName: string) => ({
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          const result = await db.findOne(tableName, { [column]: value });
          return { data: result.data, error: result.error };
        },
        limit: async (limit: number) => {
          const result = await db.select(tableName, {
            filters: [{ column, operator: 'eq', value }],
            limit
          });
          return { data: result.data || [], error: result.error };
        }
      }),
      
      limit: async (limit: number) => {
        const result = await db.select(tableName, { limit });
        return { data: result.data || [], error: result.error };
      },
      
      order: (column: string, options?: { ascending?: boolean }) => ({
        limit: async (limit: number) => {
          const orderDirection = options?.ascending !== false ? 'asc' : 'desc';
          const result = await db.select(tableName, {
            orderBy: column,
            orderDirection,
            limit
          });
          return { data: result.data || [], error: result.error };
        }
      })
    }),
    
    insert: async (data: any) => {
      const result = await db.insert(tableName, data);
      return { data: result.data, error: result.error };
    },
    
    update: (data: any) => ({
      eq: async (column: string, value: any) => {
        // Find the record first
        const findResult = await db.findOne(tableName, { [column]: value });
        if (!findResult.data) {
          return { data: null, error: 'Record not found' };
        }
        
        const result = await db.update(tableName, findResult.data.id, data);
        return { data: result.data, error: result.error };
      }
    }),
    
    delete: () => ({
      eq: async (column: string, value: any) => {
        // Find the record first
        const findResult = await db.findOne(tableName, { [column]: value });
        if (!findResult.data) {
          return { data: null, error: 'Record not found' };
        }
        
        const result = await db.delete(tableName, findResult.data.id);
        return { data: result.data, error: result.error };
      }
    }),
    
    upsert: async (data: any) => {
      let existingRecord = null;
      if (data.id) {
        const findResult = await db.findOne(tableName, { id: data.id });
        existingRecord = findResult.data;
      }

      if (existingRecord) {
        const result = await db.update(tableName, data.id, data);
        return { data: result.data, error: result.error };
      } else {
        const result = await db.insert(tableName, data);
        return { data: result.data, error: result.error };
      }
    }
  })
};

// Export types for external use
export type SupabaseClient = typeof supabase;
export type Database = any;

// Re-export useful types and constants
export { Tables, type QueryOptions, type FilterOption, type DatabaseResult };

// Export the main client as default
export default db;