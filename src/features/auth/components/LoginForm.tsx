'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { cardClasses } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { login, type LoginState } from '../actions';

const initialState: LoginState = { email: '' };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(async (previous: LoginState, formData: FormData) => {
    try {
      // Nothing comes back on success: the action redirects to the app
      return (await login(previous, formData)) ?? previous;
    } catch {
      return {
        email: String(formData.get('email') ?? ''),
        error: 'Δεν ήταν δυνατή η σύνδεση. Ελέγξτε το ίντερνετ και δοκιμάστε ξανά.',
      };
    }
  }, initialState);

  return (
    <form action={formAction} className={`${cardClasses} flex flex-col gap-5 p-6 sm:p-8`}>
      <h1 className="text-[26px] font-bold">Σύνδεση</h1>

      {state.error && (
        <p role="alert" className="rounded-control bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}

      <TextField
        label="Email"
        name="email"
        type="email"
        required
        markRequired={false}
        // "username" is what password managers look for on a login form, even when it's an email
        autoComplete="username"
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <TextField
        label="Κωδικός"
        name="password"
        type="password"
        required
        markRequired={false}
        autoComplete="current-password"
        error={state.fieldErrors?.password}
      />

      <Button type="submit" size="lg" pending={pending} className="mt-1 w-full">
        Σύνδεση
      </Button>
    </form>
  );
}
