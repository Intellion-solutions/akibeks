import { pgTable, text, timestamp, boolean, uuid, varchar, integer } from 'drizzle-orm/pg-core';
// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  isActive: boolean('is_active').notNull().default(true),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  phoneNumber: varchar('phone_number', { length: 20 }),
  kraPin: varchar('kra_pin', { length: 20 }),
  idNumber: varchar('id_number', { length: 20 }),
  county: varchar('county', { length: 50 }),
  profileImage: text('profile_image'),
  lastLoginAt: timestamp('last_login_at'),
  passwordResetToken: text('password_reset_token'),
  passwordResetTokenExpiry: timestamp('password_reset_token_expiry'),
  emailVerificationToken: text('email_verification_token'),
  emailVerificationTokenExpiry: timestamp('email_verification_token_expiry'),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  loginAttempts: integer('login_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until'),
  refreshToken: text('refresh_token'),
  refreshTokenExpiry: timestamp('refresh_token_expiry'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Temporarily commented out drizzle-zod schemas due to version conflicts
// export const insertUserSchema = createInsertSchema(users, {
//   firstName: z.string().min(1).max(100),
//   lastName: z.string().min(1).max(100),
//   email: z.string().email(),
//   phone: z.string().optional(),
// });

// export const selectUserSchema = createSelectSchema(users);
// export const updateUserSchema = insertUserSchema.partial().omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
// export type UpdateUser = z.infer<typeof updateUserSchema>;