import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { VehicleForm } from '@/features/vehicles/components/VehicleForm';

export const metadata: Metadata = { title: 'Νέο όχημα' };

export default function NewVehiclePage() {
  return (
    <PageContainer>
      <PageHeader
        back={{ href: '/vehicles', label: 'Οχήματα' }}
        title="Νέο όχημα"
        description="Όλα τα πεδία είναι υποχρεωτικά."
      />
      <VehicleForm cancelHref="/vehicles" />
    </PageContainer>
  );
}
