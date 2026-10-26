import type { z } from 'zod';

/** The first message for each field that failed, keyed by field name, for showing under each input. */
export function fieldErrors<T>(error: z.ZodError<T>): Partial<Record<keyof T & string, string>> {
  const errors: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !errors[field]) errors[field] = issue.message;
  }
  return errors as Partial<Record<keyof T & string, string>>;
}
