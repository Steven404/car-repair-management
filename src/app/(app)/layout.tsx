import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Placeholder until sign-in lands (milestone 3): then the signed-in
          mechanic's name, read inside <Suspense>, plus the logout button */}
      <AppHeader userName="Στέφανος Μιχελάκης" />
      {children}
    </div>
  );
}
