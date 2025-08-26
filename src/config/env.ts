import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().optional(),

  MINTSOFT_API_URL: z.string().url(),
  MINTSOFT_API_KEY: z.string().min(1),

  IOM_LOGIN_URL: z.string().url(),
  IOM_BUSINESS_URL: z.string().url(),
  IOM_MANIFEST_URL: z.string().url(),
  IOM_EMAIL: z.string().email(),
  IOM_PASSWORD: z.string().min(1),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  port: Number(parsed.data.PORT ?? 4000),
};
