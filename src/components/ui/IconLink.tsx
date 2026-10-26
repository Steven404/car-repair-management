import Link from 'next/link';
import type { ComponentProps } from 'react';
import { iconButtonClasses, type IconButtonTone } from './IconButton';

interface IconLinkProps extends ComponentProps<typeof Link> {
  /** Where it goes, read out by screen readers in place of the icon */
  label: string;
  tone?: IconButtonTone;
}

/** A link that looks like an IconButton, e.g. the pencil that opens a repair for editing. */
export function IconLink({ label, tone, className, ...props }: IconLinkProps) {
  return <Link aria-label={label} className={iconButtonClasses(tone, className)} {...props} />;
}
