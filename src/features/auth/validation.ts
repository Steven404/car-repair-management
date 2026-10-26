import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Συμπληρώστε το email σας.').pipe(z.email('Το email δεν φαίνεται σωστό.')),
  password: z.string().min(1, 'Συμπληρώστε τον κωδικό σας.'),
});
