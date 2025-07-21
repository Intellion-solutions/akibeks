// Compatibility layer for Supabase-to-PostgreSQL migration
// This file provides a Supabase-like API while using the new PostgreSQL client

import { dbClient, database } from '../core/database';
import { eq, desc, asc, and, or, sql } from 'drizzle-orm';
import * as schema from '../database/schema';

// Re-export the database instance for direct access
export const db = database;

// Supabase-compatible client for easy migration
export const supabase = {
  from: (tableName: string) => {
    // Get the actual table schema
    const table = (schema as any)[tableName];
    
    if (!table) {
      console.warn(`Table '${tableName}' not found in schema`);
      return createEmptyQueryBuilder();
    }

    return {
      select: (columns: string = '*') => {
        let query = db.select();
        
        if (columns !== '*') {
          // Handle specific column selection
          const columnList = columns.split(',').map(col => col.trim());
          // Note: In a real implementation, you'd need to map columns to actual table fields
          query = db.select().from(table);
        } else {
          query = db.select().from(table);
        }

        return {
          eq: (column: string, value: any) => {
            const whereClause = eq((table as any)[column], value);
            return {
              single: async () => {
                try {
                  const result = await query.where(whereClause).limit(1);
                  return { data: result[0] || null, error: null };
                } catch (error) {
                  return { data: null, error };
                }
              },
              limit: async (limit: number) => {
                try {
                  const result = await query.where(whereClause).limit(limit);
                  return { data: result, error: null };
                } catch (error) {
                  return { data: [], error };
                }
              }
            };
          },
          limit: async (limit: number) => {
            try {
              const result = await query.limit(limit);
              return { data: result, error: null };
            } catch (error) {
              return { data: [], error };
            }
          },
          order: (column: string, options?: { ascending?: boolean }) => {
            const orderClause = options?.ascending !== false ? asc((table as any)[column]) : desc((table as any)[column]);
            query = query.orderBy(orderClause);
            return {
              limit: async (limit: number) => {
                try {
                  const result = await query.limit(limit);
                  return { data: result, error: null };
                } catch (error) {
                  return { data: [], error };
                }
              },
              then: async (callback?: Function) => {
                try {
                  const result = await query;
                  const response = { data: result, error: null };
                  return callback ? callback(response) : response;
                } catch (error) {
                  const response = { data: [], error };
                  return callback ? callback(response) : response;
                }
              }
            };
          },
          range: async (from: number, to: number) => {
            try {
              const limit = to - from + 1;
              const result = await query.offset(from).limit(limit);
              return { data: result, error: null };
            } catch (error) {
              return { data: [], error };
            }
          },
          then: async (callback?: Function) => {
            try {
              const result = await query;
              const response = { data: result, error: null };
              return callback ? callback(response) : response;
            } catch (error) {
              const response = { data: [], error };
              return callback ? callback(response) : response;
            }
          }
        };
      },

      insert: (data: any) => ({
        select: (columns?: string) => ({
          single: async () => {
            try {
              const result = await db.insert(table).values(data).returning();
              return { data: result[0] || null, error: null };
            } catch (error) {
              return { data: null, error };
            }
          }
        }),
        then: async (callback?: Function) => {
          try {
            const result = await db.insert(table).values(data).returning();
            const response = { data: result[0] || null, error: null };
            return callback ? callback(response) : response;
          } catch (error) {
            const response = { data: null, error };
            return callback ? callback(response) : response;
          }
        }
      }),

      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: (columns?: string) => ({
            single: async () => {
              try {
                const result = await db.update(table).set(data).where(eq((table as any)[column], value)).returning();
                return { data: result[0] || null, error: null };
              } catch (error) {
                return { data: null, error };
              }
            }
          }),
          then: async (callback?: Function) => {
            try {
              const result = await db.update(table).set(data).where(eq((table as any)[column], value)).returning();
              const response = { data: result[0] || null, error: null };
              return callback ? callback(response) : response;
            } catch (error) {
              const response = { data: null, error };
              return callback ? callback(response) : response;
            }
          }
        })
      }),

      delete: () => ({
        eq: async (column: string, value: any) => {
          try {
            await db.delete(table).where(eq((table as any)[column], value));
            return { error: null };
          } catch (error) {
            return { error };
          }
        }
      })
    };
  },
  
  auth: {
    getSession: () => Promise.resolve({ 
      data: { session: null }, 
      error: new Error('Authentication not implemented - use new auth system') 
    }),
    signInWithPassword: (credentials: any) => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: new Error('Authentication not implemented - use new auth system') 
    }),
    signUp: (credentials: any) => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: new Error('Authentication not implemented - use new auth system') 
    }),
    signOut: () => Promise.resolve({ 
      error: new Error('Authentication not implemented - use new auth system') 
    }),
    onAuthStateChange: (callback: Function) => ({
      data: { 
        subscription: { 
          unsubscribe: () => console.warn('Auth state change listener removed') 
        } 
      }
    })
  },
  
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File | Blob) => Promise.resolve({ 
        data: null, 
        error: new Error('Storage not implemented - use new file storage system') 
      }),
      download: (path: string) => Promise.resolve({ 
        data: null, 
        error: new Error('Storage not implemented - use new file storage system') 
      }),
      remove: (paths: string[]) => Promise.resolve({ 
        data: null, 
        error: new Error('Storage not implemented - use new file storage system') 
      }),
      getPublicUrl: (path: string) => ({ 
        data: { publicUrl: `/uploads/${path}` } // Local file system path
      })
    })
  }
};

// Helper function for empty query builder (when table not found)
function createEmptyQueryBuilder() {
  const emptyResponse = { data: [], error: new Error('Table not found') };
  const emptyPromise = Promise.resolve(emptyResponse);
  
  return {
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Table not found') }),
        limit: () => emptyPromise
      }),
      limit: () => emptyPromise,
      order: () => ({
        limit: () => emptyPromise,
        then: () => emptyPromise
      }),
      range: () => emptyPromise,
      then: () => emptyPromise
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Table not found') })
      }),
      then: () => Promise.resolve({ data: null, error: new Error('Table not found') })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: new Error('Table not found') })
        }),
        then: () => Promise.resolve({ data: null, error: new Error('Table not found') })
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: new Error('Table not found') })
    })
  };
}

// Export for compatibility
export default supabase;