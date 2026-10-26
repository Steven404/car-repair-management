'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/layout/ErrorState';
import { PageContainer } from '@/components/layout/PageContainer';

/** A page inside the app that failed to load; the header stays, so the mechanic isn't stranded. */
export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer className="sm:pt-10">
      <ErrorState onRetry={retry} />
    </PageContainer>
  );
}
