import type { ReactNode } from 'react';

const SIZES = {
  md: { box: 'h-[30px] rounded-plate border-[1.5px]', strip: 'w-[18px] pb-1 text-[9px]', text: 'px-2.5 text-base' },
  lg: { box: 'h-11 rounded-[6px] border-2', strip: 'w-6 pb-1.5 text-[11px]', text: 'px-3.5 text-2xl' },
};

/** A plate drawn like a Greek number plate, with the blue GR strip. `plate` may hold search highlights. */
interface PlateBadgeProps {
  plate: ReactNode;
  size?: keyof typeof SIZES;
  className?: string;
}

export function PlateBadge({ plate, size = 'md', className = '' }: PlateBadgeProps) {
  const { box, strip, text } = SIZES[size];
  return (
    <span className={`inline-flex shrink-0 items-stretch overflow-hidden border-fg bg-surface ${box} ${className}`}>
      <span aria-hidden="true" className={`flex items-end justify-center bg-accent font-bold text-on-accent ${strip}`}>
        GR
      </span>
      <span className={`flex items-center font-mono font-semibold tracking-[0.06em] whitespace-nowrap ${text}`}>
        {/* Wrapped, so highlighted parts stay one line of text and the space isn't dropped */}
        <span>{plate}</span>
      </span>
    </span>
  );
}
