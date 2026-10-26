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

// When a Server Action can't be reached at all (no signal in the garage,
// say), the form or dialog says so and keeps what was typed, rather than the
// page giving way to the error screen.
export const SAVE_FAILED_MESSAGE = 'Δεν αποθηκεύτηκε. Ελέγξτε τη σύνδεση στο ίντερνετ και δοκιμάστε ξανά.';
export const DELETE_FAILED_MESSAGE = 'Δεν διαγράφηκε. Ελέγξτε τη σύνδεση στο ίντερνετ και δοκιμάστε ξανά.';
