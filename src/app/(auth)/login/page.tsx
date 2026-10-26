import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BrandMark } from '@/components/layout/BrandMark';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RedirectIfSignedIn } from '@/features/auth/components/RedirectIfSignedIn';

export const metadata: Metadata = { title: 'Σύνδεση' };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <main className="flex w-full max-w-[400px] flex-col gap-6">
        <div className="flex items-center justify-center gap-3">
          <BrandMark size="lg" />
          <span className="text-[17px] font-bold">Λογισμικό διαχείρισης επισκευών</span>
        </div>
        <LoginForm />
      </main>
    </div>
  );
}
