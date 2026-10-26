import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export const pageLinkClasses =
  'inline-flex min-h-11 items-center text-[15px] font-semibold text-accent no-underline hover:text-accent-hover';

/** "‹ Οχήματα" above a page title: back to the list the page belongs to. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={`${pageLinkClasses} gap-1.5 self-start`}>
      <ChevronLeft size={18} aria-hidden="true" />
      {children}
    </Link>
  );
}
