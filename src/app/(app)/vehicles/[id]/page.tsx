import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BackLink } from '@/components/layout/BackLink';
import { PageContainer } from '@/components/layout/PageContainer';
import { RepairHistory, RepairHistoryFallback } from '@/features/repairs/components/RepairHistory';
import { VehicleDetails } from '@/features/vehicles/components/VehicleDetails';
import { VehiclePageFallback } from '@/features/vehicles/components/VehicleFallbacks';
import { VehicleSummary } from '@/features/vehicles/components/VehicleSummary';
import { vehicleTitle } from '@/features/vehicles/labels';
import { getVehicle } from '@/features/vehicles/queries';

export async function generateMetadata({ params }: PageProps<'/vehicles/[id]'>): Promise<Metadata> {
  const vehicle = await getVehicle((await params).id);
  return { title: vehicle ? vehicleTitle(vehicle) : 'Το όχημα δεν βρέθηκε' };
}

export default function VehiclePage({ params }: PageProps<'/vehicles/[id]'>) {
  return (
    <PageContainer>
      <BackLink href="/vehicles">Οχήματα</BackLink>
      <Suspense fallback={<VehiclePageFallback />}>
        <VehicleContent params={params} />
      </Suspense>
    </PageContainer>
  );
}

async function VehicleContent({ params }: Pick<PageProps<'/vehicles/[id]'>, 'params'>) {
  const vehicle = await getVehicle((await params).id);
  if (!vehicle) notFound();

  return (
    <>
      <VehicleSummary vehicle={vehicle} />
      {/* On a phone the history comes first: it's what the mechanic is checking */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
        <VehicleDetails vehicle={vehicle} className="order-last lg:order-none" />
        <Suspense fallback={<RepairHistoryFallback vehicleId={vehicle.id} />}>
          <RepairHistory vehicleId={vehicle.id} />
        </Suspense>
      </div>
    </>
  );
}
