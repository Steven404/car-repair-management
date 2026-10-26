'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { navItemActiveClasses, navItemClasses } from './navStyles';

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

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
      className={`${navItemClasses} ${isSection ? navItemActiveClasses : ''}`}
    >
      {children}
    </Link>
  );
}
