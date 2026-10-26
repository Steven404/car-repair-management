import { PlateBadge } from '@/features/vehicles/components/PlateBadge';
import { engineLabel, FUEL_LABELS } from '@/features/vehicles/labels';
import type { Vehicle } from '@/lib/db/schema';

/** The grey strip at the top of the repair form: which car this repair is for. */
export function RepairVehicleStrip({ vehicle }: { vehicle: Vehicle }) {
  return (
    <>
      <PlateBadge plate={vehicle.plate} />
      <span className="text-[15px] font-semibold">
        {vehicle.brand} {vehicle.model}
      </span>
      <span className="text-[15px] text-muted">
        {[engineLabel(vehicle), FUEL_LABELS[vehicle.fuel], vehicle.ownerName].join(' · ')}
      </span>
    </>
  );
}
