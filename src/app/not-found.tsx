import type { Metadata } from 'next';
import { SearchX } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'Η σελίδα δεν βρέθηκε' };

export default function NotFound() {
  return (
    <PageContainer className="justify-center sm:pt-16">
      <EmptyState
        icon={<SearchX size={24} />}
        title="Η σελίδα δεν βρέθηκε"
        description="Ο σύνδεσμος μπορεί να είναι λάθος ή το όχημα να έχει διαγραφεί."
        action={
          <ButtonLink href="/vehicles" variant="secondary">
            Πίσω στα οχήματα
          </ButtonLink>
        }
      />
    </PageContainer>
  );
}
