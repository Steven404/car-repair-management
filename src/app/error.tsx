'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/layout/ErrorState';
import { PageContainer } from '@/components/layout/PageContainer';

/** Outside the app: the login page failing, for instance, when signing in can't reach the server. */
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer className="justify-center sm:pt-16">
      <ErrorState onRetry={retry} homeLink={false} />
    </PageContainer>
  );
}
