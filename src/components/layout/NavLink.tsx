'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

export const navLinkClasses =
  'inline-flex h-10 items-center rounded-small px-3.5 text-[15px] font-semibold text-fg-2 no-underline transition-colors hover:bg-ground hover:text-fg';

const activeClasses = 'bg-ground text-fg';

/**
 * A header link, shown as current on its own page and on every page below it.
 * It reads the URL, so AppHeader renders it inside <Suspense>.
 */
export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isPage = pathname === href;
  const isSection = isPage || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isPage ? 'page' : isSection ? 'true' : undefined}
      className={`${navLinkClasses} ${isSection ? activeClasses : ''}`}
    >
      {children}
    </Link>
  );
}
