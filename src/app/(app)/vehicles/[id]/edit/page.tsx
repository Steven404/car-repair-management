import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { DeleteVehicleSection } from '@/features/vehicles/components/DeleteVehicleSection';
import { VehicleFormFallback } from '@/features/vehicles/components/VehicleFallbacks';
import { VehicleForm } from '@/features/vehicles/components/VehicleForm';
import { vehicleTitle } from '@/features/vehicles/labels';
import { getVehicle } from '@/features/vehicles/queries';

export const metadata: Metadata = { title: 'Επεξεργασία οχήματος' };

export default function EditVehiclePage({ params }: PageProps<'/vehicles/[id]/edit'>) {
  return (
    <PageContainer>
      <Suspense
        fallback={
          <>
            <PageHeader title="Επεξεργασία οχήματος" breadcrumbs={[{ href: '/vehicles', label: 'Οχήματα' }]} />
            <VehicleFormFallback />
          </>
        }
      >
        <EditVehicle params={params} />
      </Suspense>
    </PageContainer>
  );
}

async function EditVehicle({ params }: Pick<PageProps<'/vehicles/[id]/edit'>, 'params'>) {
  const vehicle = await getVehicle((await params).id);
  if (!vehicle) notFound();
  const vehicleHref = `/vehicles/${vehicle.id}`;

  return (
    <>
      <PageHeader
        title="Επεξεργασία οχήματος"
        breadcrumbs={[
          { href: '/vehicles', label: 'Οχήματα' },
          { href: vehicleHref, label: vehicleTitle(vehicle) },
        ]}
      />
      {/* Keyed by the last save, so the form starts from the saved values after one */}
      <VehicleForm key={vehicle.updatedAt.getTime()} vehicle={vehicle} cancelHref={vehicleHref}>
        <DeleteVehicleSection vehicleId={vehicle.id} title={vehicleTitle(vehicle)} repairCount={vehicle.repairCount} />
      </VehicleForm>
    </>
  );
}
