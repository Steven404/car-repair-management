import type { Metadata } from 'next';
import { NotFoundState } from '@/components/layout/NotFoundState';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata: Metadata = { title: 'Η σελίδα δεν βρέθηκε' };

export default function NotFound() {
  return (
    <PageContainer className="justify-center sm:pt-16">
      <NotFoundState />
    </PageContainer>
  );
}
