import { describe, expect, it } from 'vitest';
import { loginSchema } from './validation';

describe('loginSchema', () => {
  it('rejects an email longer than 254 characters', () => {
    const email = `${'a'.repeat(250)}@example.test`;
    const result = loginSchema.safeParse({ email, password: 'x' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Το email είναι πολύ μεγάλο.');
  });

  it('accepts a normal email', () => {
    expect(loginSchema.safeParse({ email: 'mechanic@example.test', password: 'x' }).success).toBe(true);
  });
});
