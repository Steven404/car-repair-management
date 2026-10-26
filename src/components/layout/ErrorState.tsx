import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';

interface ErrorStateProps {
  /** Renders the page again from the server (error.tsx's retry) */
  onRetry: () => void;
  /** Offer the way back to the list too; not on the login page */
  homeLink?: boolean;
}

/** What error.tsx shows when a page fails to load: most often no connection, so trying again usually works. */
export function ErrorState({ onRetry, homeLink = true }: ErrorStateProps) {
  return (
    <EmptyState
      icon={<TriangleAlert size={24} />}
      title="Κάτι πήγε στραβά"
      description="Η σελίδα δεν φόρτωσε. Ελέγξτε τη σύνδεση στο ίντερνετ και δοκιμάστε ξανά."
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={onRetry}>Δοκιμάστε ξανά</Button>
          {homeLink && (
            <ButtonLink href="/vehicles" variant="secondary">
              Πίσω στα οχήματα
            </ButtonLink>
          )}
        </div>
      }
    />
  );
}
