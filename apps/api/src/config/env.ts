import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().default('seait-stay-super-secret-jwt-key-2024'),
  DATABASE_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default('*')
});

export const env = envSchema.parse(process.env);
