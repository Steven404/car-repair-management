import { Badge } from '@/components/ui/Badge';
import type { Fuel } from '@/lib/db/schema';
import { FUEL_LABELS } from '../labels';

export function FuelBadge({ fuel }: { fuel: Fuel }) {
  return <Badge tone={fuel === 'diesel' ? 'solid' : 'soft'}>{FUEL_LABELS[fuel]}</Badge>;
}
