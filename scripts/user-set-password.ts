import './lib/load-env';
import { setUserPassword } from '@/features/auth/users';
import { ask, askNewPassword } from './lib/prompt';
import { runScript } from './lib/run';

// pnpm user:set-password — sets a new password and signs the mechanic out on every device.

runScript('Set a new password', async () => {
  const email = await ask('Email: ');
  const password = await askNewPassword();

  const { user, sessionsEnded } = await setUserPassword(email, password);
  const signedOut = sessionsEnded === 1 ? '1 session' : `${sessionsEnded} sessions`;
  console.log(`\n✓ New password set for ${user.email}; signed out of ${signedOut}.`);
});
