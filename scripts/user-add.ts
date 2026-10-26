import './lib/load-env';
import { createUser } from '@/features/auth/users';
import { ask, askNewPassword } from './lib/prompt';
import { runScript } from './lib/run';

// pnpm user:add — adds a mechanic who can sign in. There is no sign-up page.

runScript('Add a mechanic', async () => {
  const email = await ask('Email: ');
  const firstName = await ask('First name: ');
  const lastName = await ask('Last name: ');
  const password = await askNewPassword();

  const user = await createUser({ email, firstName, lastName, password });
  console.log(`\n✓ Added ${user.firstName} ${user.lastName} <${user.email}>`);
});
