import { describe, expect, it } from 'vitest';
import { hashPassword, MAX_PASSWORD_BYTES, newPasswordProblem, verifyPassword } from './password';

describe('newPasswordProblem', () => {
  it('needs at least 10 characters', () => {
    expect(newPasswordProblem('123456789')).toMatch(/at least 10/);
    expect(newPasswordProblem('1234567890')).toBeUndefined();
  });

  it('counts the 72-byte limit in bytes: a Greek letter takes two', () => {
    expect(newPasswordProblem('α'.repeat(36))).toBeUndefined(); // 72 bytes
    expect(newPasswordProblem('α'.repeat(37))).toMatch(/at most 72 bytes/); // 74 bytes
    expect(newPasswordProblem('a'.repeat(MAX_PASSWORD_BYTES))).toBeUndefined();
    expect(newPasswordProblem('a'.repeat(MAX_PASSWORD_BYTES + 1))).toMatch(/at most 72 bytes/);
  });
});

describe('hashPassword and verifyPassword', () => {
  it('accepts the right password only', async () => {
    const hash = await hashPassword('σωστός-κωδικός');
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
    expect(await verifyPassword('σωστός-κωδικός', hash)).toBe(true);
    expect(await verifyPassword('σωστός-κωδικόσ', hash)).toBe(false);
  });

  it('treats a composed and a decomposed accented letter as the same', async () => {
    const hash = await hashPassword('καφές-δυνατός'.normalize('NFC'));
    expect(await verifyPassword('καφές-δυνατός'.normalize('NFD'), hash)).toBe(true);
  });

  it('refuses to hash a password that breaks the rules', async () => {
    await expect(hashPassword('short')).rejects.toThrow(/at least 10/);
  });

  it('never matches a password longer than bcrypt reads', async () => {
    const hash = await hashPassword('a'.repeat(MAX_PASSWORD_BYTES));
    // bcrypt alone would ignore the extra character and say yes
    expect(await verifyPassword(`${'a'.repeat(MAX_PASSWORD_BYTES)}b`, hash)).toBe(false);
  });
});
