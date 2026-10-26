import { z } from 'zod';

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1, 'TURSO_DATABASE_URL is missing. Copy .env.example to .env.local.'),
  // An empty value in .env means "no token", as for a local file
  TURSO_AUTH_TOKEN: z
    .string()
    .optional()
    .transform((token) => token || undefined),
});

/** Server-side environment variables, checked once when first imported. */
export const env = envSchema.parse(process.env);
