import { vi } from 'vitest';
import { requireUser } from '@/features/auth/current-user';
import type { User } from '@/lib/db/schema';

/**
 * Makes requireUser() return this mechanic. The test file must replace the
 * module first:
 *   vi.mock('@/features/auth/current-user', () => ({ requireUser: vi.fn(), getCurrentUser: vi.fn() }));
 */
export function signInAs(user: User) {
  vi.mocked(requireUser).mockResolvedValue({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });
}
