import { compare, hash } from 'bcryptjs';

const COST = 12;

/** bcrypt reads only this many bytes and silently ignores the rest */
export const MAX_PASSWORD_BYTES = 72;
export const MIN_PASSWORD_LENGTH = 10;

// The same accented letter can arrive composed or decomposed depending on the
// keyboard; normalising means it always hashes the same way
const normalize = (password: string) => password.normalize('NFC');

const byteLength = (password: string) => new TextEncoder().encode(normalize(password)).length;

/** Why a new password can't be used, or undefined when it can. Shown by the user scripts. */
export function newPasswordProblem(password: string): string | undefined {
  if ([...normalize(password)].length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (byteLength(password) > MAX_PASSWORD_BYTES) {
    return `Use at most ${MAX_PASSWORD_BYTES} bytes: about 72 Latin or 36 Greek characters.`;
  }
  return undefined;
}

export async function hashPassword(password: string): Promise<string> {
  const problem = newPasswordProblem(password);
  if (problem) throw new Error(problem);
  return hash(normalize(password), COST);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  // Longer than bcrypt reads: it could only "match" by ignoring the end
  if (byteLength(password) > MAX_PASSWORD_BYTES) return false;
  return compare(normalize(password), passwordHash);
}
