import { useId } from 'react';
import { Pencil, Plus, UserRound } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { cardClasses } from '@/components/ui/Card';
import type { Vehicle } from '@/lib/db/schema';
import { engineLabel } from '../labels';
import { FuelBadge } from './FuelBadge';
import { PlateBadge } from './PlateBadge';

/** The top of the vehicle page: the car, its owner, its plate, and what can be done next. */
export function VehicleSummary({ vehicle }: { vehicle: Vehicle }) {
  const titleId = useId();
  return (
    <section
      className={`${cardClasses} flex flex-wrap items-center justify-between gap-5 p-5 sm:p-7`}
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-1">
          <p className="mb-2 flex items-center gap-2 text-[15px] font-medium text-fg-2">
            <UserRound size={16} className="shrink-0 text-muted" aria-hidden="true" />
            <span className="sr-only">Ιδιοκτήτης: </span>
            <span className="break-words">{vehicle.ownerName}</span>
          </p>
          <span className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{vehicle.brand}</span>
          <h1 id={titleId} className="text-[28px] leading-[1.1] font-bold tracking-[-0.01em] sm:text-[34px]">
            {vehicle.model}
          </h1>
          <div className="mt-1 flex items-center gap-2.5">
            <span className="text-base font-medium text-fg-2">{engineLabel(vehicle)}</span>
            <FuelBadge fuel={vehicle.fuel} />
          </div>
        </div>
        <PlateBadge plate={vehicle.plate} size="lg" />
      </div>
      {/* On a phone: full width, the main action on top */}
      <div className="flex flex-wrap gap-3 max-sm:w-full max-sm:flex-col-reverse">
        <ButtonLink href={`/vehicles/${vehicle.id}/edit`} variant="secondary" className="max-sm:w-full">
          <Pencil size={16} aria-hidden="true" />
          Επεξεργασία
        </ButtonLink>
        <ButtonLink href={`/vehicles/${vehicle.id}/repairs/new`} className="max-sm:w-full">
          <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
          Νέα επισκευή
        </ButtonLink>
      </div>
    </section>
  );
}
