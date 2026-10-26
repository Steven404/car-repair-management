import { Plus, Wrench } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { cardClasses } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { listRepairs } from '../queries';
import { FocusAfterDelete } from './FocusAfterDelete';
import { historyTitleId } from './historyTitle';
import { RepairCard } from './RepairCard';

function HistoryHeading({ id, children }: { id: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3">
      <h2 id={id} tabIndex={-1} className="text-[22px] font-bold">
        Ιστορικό επισκευών
      </h2>
      {children}
    </div>
  );
}

/** The vehicle page's "Ιστορικό επισκευών": every repair, newest first. Render inside <Suspense>. */
export async function RepairHistory({ vehicleId }: { vehicleId: string }) {
  const repairs = await listRepairs(vehicleId);
  const count = repairs.length === 1 ? '1 επισκευή' : `${repairs.length} επισκευές`;
  const titleId = historyTitleId(vehicleId);

  return (
    <section aria-labelledby={titleId} className="flex min-w-0 flex-col gap-4">
      <FocusAfterDelete count={repairs.length} targetId={titleId} />
      <HistoryHeading id={titleId}>
        {repairs.length > 0 && <span className="text-sm text-muted">{count} · νεότερες πρώτα</span>}
      </HistoryHeading>

      {repairs.length === 0 ? (
        <EmptyState
          icon={<Wrench size={24} />}
          title="Καμία επισκευή ακόμα"
          description="Καταγράψτε την πρώτη επισκευή αυτού του οχήματος."
          action={
            <ButtonLink href={`/vehicles/${vehicleId}/repairs/new`}>
              <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
              Νέα επισκευή
            </ButtonLink>
          }
        />
      ) : (
        <ol className="flex list-none flex-col gap-4 p-0">
          {repairs.map((repair, index) => (
            <li key={repair.id}>
              <RepairCard vehicleId={vehicleId} repair={repair} latest={index === 0} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function RepairHistoryFallback({ vehicleId }: { vehicleId: string }) {
  const titleId = historyTitleId(vehicleId);
  return (
    <section aria-labelledby={titleId} className="flex min-w-0 flex-col gap-4">
      <HistoryHeading id={titleId} />
      <div aria-hidden="true" className={`${cardClasses} h-40`} />
    </section>
  );
}

/** While the repair form's car loads */
export function RepairFormFallback() {
  return <div aria-hidden="true" className={`${cardClasses} h-[520px]`} />;
}
