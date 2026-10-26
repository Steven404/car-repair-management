import { NotFoundState } from '@/components/layout/NotFoundState';
import { PageContainer } from '@/components/layout/PageContainer';

/** A car that doesn't exist or isn't this mechanic's: shown inside the app, header and all. */
export default function VehicleNotFound() {
  return (
    <PageContainer className="sm:pt-10">
      <NotFoundState title="Το όχημα δεν βρέθηκε" />
    </PageContainer>
  );
}
