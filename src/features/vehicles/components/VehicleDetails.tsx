import { useId, type ReactNode } from 'react';
import { cardClasses } from '@/components/ui/Card';
import type { Vehicle } from '@/lib/db/schema';
import { FUEL_LABELS, engineLabel } from '../labels';

function Detail({ label, mono, children }: { label: string; mono?: boolean; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className={`text-[15px] font-medium break-words ${mono ? 'font-mono tracking-[0.03em] break-all' : ''}`}>
        {children}
      </dd>
    </div>
  );
}

const row = 'flex gap-4 border-b border-line-soft py-3 last:border-b-0';

/** The "Στοιχεία οχήματος" panel: everything stored about the car, the VIN included. The owner sits in the summary. */
export function VehicleDetails({ vehicle, className = '' }: { vehicle: Vehicle; className?: string }) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={`${cardClasses} flex flex-col ${className}`}>
      <h2 id={titleId} className="border-b border-line-soft px-6 py-5 text-[17px] font-bold">
        Στοιχεία οχήματος
      </h2>
      <dl className="flex flex-col px-6 pt-2 pb-4">
        <div className={row}>
          <Detail label="Αριθμός πλαισίου" mono>
            {vehicle.vin}
          </Detail>
        </div>
        <div className={row}>
          <Detail label="Πινακίδα" mono>
            {vehicle.plate}
          </Detail>
        </div>
        <div className={row}>
          <Detail label="Μάρκα">{vehicle.brand}</Detail>
          <Detail label="Μοντέλο">{vehicle.model}</Detail>
        </div>
        <div className={row}>
          <Detail label="Μηχανή">{engineLabel(vehicle)}</Detail>
          <Detail label="Καύσιμο">{FUEL_LABELS[vehicle.fuel]}</Detail>
        </div>
      </dl>
    </section>
  );
}
