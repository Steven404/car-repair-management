import type { Fuel } from '@/lib/db/schema';
import { engineLabel } from '../labels';
import type { VehicleField } from '../validation';
import { VehicleCard } from './VehicleCard';

/** Beside the vehicle form: the card as it will look in the list, filled in as the mechanic types. */
export function CardPreview({ values, repairCount }: { values: Record<VehicleField, string>; repairCount: number }) {
  return (
    <aside aria-label="Προεπισκόπηση κάρτας" className="hidden max-w-[380px] flex-[1_1_300px] flex-col gap-3 md:flex">
      <span className="text-[13px] font-bold tracking-[0.08em] text-muted uppercase">Προεπισκόπηση κάρτας</span>
      <VehicleCard
        brand={values.brand || 'Μάρκα'}
        model={values.model || 'Μοντέλο'}
        engine={engineLabel(values) || 'Μηχανή'}
        fuel={(values.fuel || undefined) as Fuel | undefined}
        plate={values.plate || 'ΑΑΑ 0000'}
        ownerName={values.ownerName || 'Ιδιοκτήτης'}
        repairCount={repairCount}
      />
      <p className="text-[13px] leading-normal text-muted">
        Ο αριθμός πλαισίου δεν εμφανίζεται στην κάρτα — φαίνεται στην καρτέλα του οχήματος.
      </p>
    </aside>
  );
}
