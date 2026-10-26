import { Suspense, type ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { MechanicName, MechanicNameFallback } from '@/features/auth/components/MechanicName';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <AppHeader
        // The header's frame is static and shows at once; the name streams in once the session is checked
        userName={
          <Suspense fallback={<MechanicNameFallback />}>
            <MechanicName />
          </Suspense>
        }
        actions={<LogoutButton />}
      />
      {children}
    </div>
  );
}
