import Link from 'next/link';
import { UserRound, Wrench } from 'lucide-react';
import { cardClasses } from '@/components/ui/Card';
import { Highlight } from '@/components/ui/Highlight';
import type { Fuel } from '@/lib/db/schema';
import { repairCountLabel } from '../labels';
import type { Highlights } from '../utils/search';
import { FuelBadge } from './FuelBadge';
import { PlateBadge } from './PlateBadge';

interface VehicleCardProps {
  brand: string;
  model: string;
  /** "1.6 TDI" */
  engine: string;
  fuel?: Fuel;
  plate: string;
  ownerName: string;
  repairCount: number;
  highlights?: Highlights;
  /** A link to the vehicle page; leave out for the form's preview */
  href?: string;
}

/** A car in the list, and the preview beside the vehicle form. */
export function VehicleCard({
  brand,
  model,
  engine,
  fuel,
  plate,
  ownerName,
  repairCount,
  highlights = {},
  href,
}: VehicleCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            <Highlight text={brand} ranges={highlights.brand} />
          </span>
          <span className="text-[22px] leading-tight font-bold break-words">
            <Highlight text={model} ranges={highlights.model} />
          </span>
          <span className="text-[15px] font-medium text-fg-2">{engine}</span>
        </div>
        {fuel && <FuelBadge fuel={fuel} />}
      </div>

      <PlateBadge plate={<Highlight text={plate} ranges={highlights.plate} />} className="self-start" />

      <div className="flex flex-col gap-2 border-t border-line-soft pt-3.5 text-sm">
        <span className="flex items-center gap-2">
          <UserRound size={16} aria-hidden="true" className="shrink-0 text-muted" />
          {/* One flex item: highlighted parts must stay in the line of text, not become items of their own */}
          <span>
            <Highlight text={ownerName} ranges={highlights.ownerName} />
          </span>
        </span>
        <span className="flex items-center gap-2 text-muted">
          <Wrench size={16} aria-hidden="true" className="shrink-0" />
          {repairCountLabel(repairCount)}
        </span>
      </div>
    </>
  );

  const classes = `${cardClasses} flex flex-col gap-[18px] p-5 text-fg no-underline`;
  if (!href) return <div className={classes}>{content}</div>;
  return (
    <Link
      href={href}
      className={`${classes} transition-[border-color,box-shadow] hover:border-accent hover:shadow-card-hover`}
    >
      {content}
    </Link>
  );
}
