import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { RepairForm } from '@/features/repairs/components/RepairForm';
import { RepairFormFallback } from '@/features/repairs/components/RepairHistory';
import { RepairVehicleStrip } from '@/features/repairs/components/RepairVehicleStrip';
import { vehicleTitle } from '@/features/vehicles/labels';
import { getVehicle } from '@/features/vehicles/queries';
import { todayInAthens } from '@/lib/date';

export const metadata: Metadata = { title: 'Νέα επισκευή' };

export default function NewRepairPage({ params }: PageProps<'/vehicles/[id]/repairs/new'>) {
  return (
    <PageContainer width="narrow">
      <Suspense
        fallback={
          <>
            <PageHeader title="Νέα επισκευή" breadcrumbs={[{ href: '/vehicles', label: 'Οχήματα' }]} />
            <RepairFormFallback />
          </>
        }
      >
        <NewRepair params={params} />
      </Suspense>
    </PageContainer>
  );
}

async function NewRepair({ params }: Pick<PageProps<'/vehicles/[id]/repairs/new'>, 'params'>) {
  const vehicle = await getVehicle((await params).id);
  if (!vehicle) notFound();

  return (
    <>
      <PageHeader
        title="Νέα επισκευή"
        breadcrumbs={[
          { href: '/vehicles', label: 'Οχήματα' },
          { href: `/vehicles/${vehicle.id}`, label: vehicleTitle(vehicle) },
        ]}
      />
      <RepairForm
        vehicleId={vehicle.id}
        vehicleStrip={<RepairVehicleStrip vehicle={vehicle} />}
        defaultDate={todayInAthens()}
      />
    </>
  );
}
