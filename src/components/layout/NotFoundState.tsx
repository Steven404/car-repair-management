import { SearchX } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';

/** The 404 message, for the root not-found page and the ones inside the app. */
export function NotFoundState({ title = 'Η σελίδα δεν βρέθηκε' }: { title?: string }) {
  return (
    <EmptyState
      icon={<SearchX size={24} />}
      title={title}
      description="Ο σύνδεσμος μπορεί να είναι λάθος ή το όχημα να έχει διαγραφεί."
      action={
        <ButtonLink href="/vehicles" variant="secondary">
          Πίσω στα οχήματα
        </ButtonLink>
      }
    />
  );
}
