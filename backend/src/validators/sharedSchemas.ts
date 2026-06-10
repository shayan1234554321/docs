import { z } from 'zod';

// Authentication validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(100, 'Password is too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Document validation schemas
export const createDocSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255, 'Document name is too long'),
  visibility: z.enum(['public', 'private']).default('private'),
  access: z.array(
    z.object({
      email: z.string().email('Invalid access email address'),
      access: z.enum(['view', 'edit']),
    })
  ).optional(),
  doc: z.string().optional(),
});

export const updateDocSchema = z.object({
  doc: z.string().optional(),
  name: z.string().min(1, 'Document name cannot be empty').max(255).optional(),
  visibility: z.enum(['public', 'private']).optional(),
});

export const updateAccessSchema = z.object({
  email: z.string().email('Invalid email address'),
  access: z.enum(['view', 'edit', 'remove']),
});

// TypeScript inference helpers
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateDocInput = z.infer<typeof createDocSchema>;
export type UpdateDocInput = z.infer<typeof updateDocSchema>;
export type UpdateAccessInput = z.infer<typeof updateAccessSchema>;
