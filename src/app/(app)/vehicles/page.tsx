import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Vehicles, VehiclesFallback } from '@/features/vehicles/components/Vehicles';

export const metadata: Metadata = { title: 'Οχήματα' };

export default function VehiclesPage() {
  return (
    <PageContainer className="gap-7 sm:pt-10">
      <Suspense fallback={<VehiclesFallback />}>
        <Vehicles />
      </Suspense>
    </PageContainer>
  );
}
