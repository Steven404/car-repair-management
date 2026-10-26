import { Gauge, Pencil } from 'lucide-react';
import { cardClasses } from '@/components/ui/Card';
import { IconLink } from '@/components/ui/IconLink';
import { formatDate } from '@/lib/date';
import type { Repair } from '@/lib/db/schema';
import { formatMileage } from '../utils/mileage';
import { DateBlock } from './DateBlock';
import { DeleteRepairButton } from './DeleteRepairButton';
import { RepairNotes } from './RepairNotes';

interface RepairCardProps {
  vehicleId: string;
  repair: Repair;
  /** The newest repair gets the blue date */
  latest: boolean;
}

/** One repair in the vehicle's history. On a phone, edit and delete drop below the notes. */
export function RepairCard({ vehicleId, repair, latest }: RepairCardProps) {
  const dateLabel = formatDate(repair.performedOn);

  return (
    <article
      aria-label={`Επισκευή ${dateLabel}`}
      className={`${cardClasses} flex flex-wrap gap-5 p-5 sm:p-[22px] sm:pl-6`}
    >
      <DateBlock date={repair.performedOn} latest={latest} />
      <div className="flex min-w-0 flex-[1_1_0] flex-col gap-2">
        {repair.mileageKm !== null && (
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-muted">
            <Gauge size={15} aria-hidden="true" />
            {formatMileage(repair.mileageKm)}
          </span>
        )}
        <RepairNotes notes={repair.notes} />
      </div>
      <div className="-my-1 flex shrink-0 gap-1 self-start max-sm:basis-full max-sm:justify-end">
        <IconLink
          href={`/vehicles/${vehicleId}/repairs/${repair.id}/edit`}
          label={`Επεξεργασία επισκευής ${dateLabel}`}
        >
          <Pencil size={18} aria-hidden="true" />
        </IconLink>
        <DeleteRepairButton vehicleId={vehicleId} repairId={repair.id} dateLabel={dateLabel} />
      </div>
    </article>
  );
}
