import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Wrench } from 'lucide-react';
import { BackLink } from '@/components/layout/BackLink';
import { PageContainer } from '@/components/layout/PageContainer';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { VehicleDetails } from '@/features/vehicles/components/VehicleDetails';
import { VehiclePageFallback } from '@/features/vehicles/components/VehicleFallbacks';
import { VehicleSummary } from '@/features/vehicles/components/VehicleSummary';
import { vehicleTitle } from '@/features/vehicles/labels';
import { getVehicle, type VehicleWithCount } from '@/features/vehicles/queries';

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
        <RepairHistory vehicle={vehicle} />
      </div>
    </>
  );
}

// The repair cards themselves arrive with the repairs feature (milestone 5)
function RepairHistory({ vehicle }: { vehicle: VehicleWithCount }) {
  const count = vehicle.repairCount;
  return (
    <section aria-labelledby="history-title" className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="history-title" className="text-[22px] font-bold">
          Ιστορικό επισκευών
        </h2>
        {count > 0 && (
          <span className="text-sm text-muted">
            {count === 1 ? '1 επισκευή' : `${count} επισκευές`} · νεότερες πρώτα
          </span>
        )}
      </div>
      {count === 0 && (
        <EmptyState
          icon={<Wrench size={24} />}
          title="Καμία επισκευή ακόμα"
          description="Καταγράψτε την πρώτη επισκευή αυτού του οχήματος."
          action={<ButtonLink href={`/vehicles/${vehicle.id}/repairs/new`}>Νέα επισκευή</ButtonLink>}
        />
      )}
    </section>
  );
}
