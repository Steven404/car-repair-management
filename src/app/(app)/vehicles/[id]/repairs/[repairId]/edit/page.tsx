import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { RepairForm } from '@/features/repairs/components/RepairForm';
import { RepairFormFallback } from '@/features/repairs/components/RepairHistory';
import { RepairVehicleStrip } from '@/features/repairs/components/RepairVehicleStrip';
import { getRepair } from '@/features/repairs/queries';
import { vehicleTitle } from '@/features/vehicles/labels';
import { getVehicle } from '@/features/vehicles/queries';
import { todayInAthens } from '@/lib/date';

export const metadata: Metadata = { title: 'Επεξεργασία επισκευής' };

type Props = PageProps<'/vehicles/[id]/repairs/[repairId]/edit'>;

export default function EditRepairPage({ params }: Props) {
  return (
    <PageContainer width="narrow">
      <Suspense
        fallback={
          <>
            <PageHeader title="Επεξεργασία επισκευής" breadcrumbs={[{ href: '/vehicles', label: 'Οχήματα' }]} />
            <RepairFormFallback />
          </>
        }
      >
        <EditRepair params={params} />
      </Suspense>
    </PageContainer>
  );
}

async function EditRepair({ params }: Pick<Props, 'params'>) {
  const { id, repairId } = await params;
  const [vehicle, repair] = await Promise.all([getVehicle(id), getRepair(id, repairId)]);
  if (!vehicle || !repair) notFound();

  return (
    <>
      <PageHeader
        title="Επεξεργασία επισκευής"
        breadcrumbs={[
          { href: '/vehicles', label: 'Οχήματα' },
          { href: `/vehicles/${vehicle.id}`, label: vehicleTitle(vehicle) },
        ]}
      />
      {/* Keyed by the last save, so the form starts from the saved values after one */}
      <RepairForm
        key={repair.updatedAt.getTime()}
        vehicleId={vehicle.id}
        vehicleStrip={<RepairVehicleStrip vehicle={vehicle} />}
        repair={repair}
        defaultDate={todayInAthens()}
      />
    </>
  );
}
