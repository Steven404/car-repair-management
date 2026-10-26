import { Wrench } from 'lucide-react';

const SIZES = {
  md: { box: 'size-9 rounded-[9px]', icon: 20 },
  lg: { box: 'size-10 rounded-control', icon: 22 },
};

/** The dark wrench tile: in the app header, and larger on the login page. */
export function BrandMark({ size = 'md' }: { size?: keyof typeof SIZES }) {
  return (
    <span className={`flex shrink-0 items-center justify-center bg-fg text-on-accent ${SIZES[size].box}`}>
      <Wrench size={SIZES[size].icon} aria-hidden="true" />
    </span>
  );
}
