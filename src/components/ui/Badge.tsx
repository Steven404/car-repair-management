import type { ReactNode } from 'react';

const TONES = {
  solid: 'bg-diesel text-on-accent',
  soft: 'bg-accent-soft text-accent-hover',
};

interface BadgeProps {
  tone?: keyof typeof TONES;
  children: ReactNode;
}

/** A small pill label, like the fuel type on a vehicle card. */
export function Badge({ tone = 'soft', children }: BadgeProps) {
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  );
}
