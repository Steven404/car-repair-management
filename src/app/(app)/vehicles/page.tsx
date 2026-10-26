import type { Metadata } from 'next';
import { CarFront, Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'Οχήματα' };

// The list and search arrive with the vehicles feature (milestone 4)
export default function VehiclesPage() {
  return (
    <PageContainer className="gap-7 sm:pt-10">
      <PageHeader
        title="Οχήματα"
        description="0 οχήματα"
        actions={
          <ButtonLink href="/vehicles/new">
            <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
            Νέο όχημα
          </ButtonLink>
        }
      />
      <EmptyState
        icon={<CarFront size={24} />}
        title="Δεν υπάρχουν οχήματα ακόμα"
        description="Προσθέστε το πρώτο όχημα για να κρατάτε το ιστορικό επισκευών του."
      />
    </PageContainer>
  );
}
