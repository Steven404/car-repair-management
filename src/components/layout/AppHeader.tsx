import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { NavLink } from './NavLink';
import { navItemActiveClasses, navItemClasses } from './navStyles';

interface AppHeaderProps {
  /** The signed-in mechanic's name. It reads the session, so pass it wrapped in <Suspense>. */
  userName: ReactNode;
  /** Shown after the nav links, e.g. the logout button */
  actions?: ReactNode;
}

/**
 * One row at every width. On a phone the "Οχήματα" link gives way so the name
 * has room; the brand links to the list instead, and every page below it has
 * its own back link.
 */
export function AppHeader({ userName, actions }: AppHeaderProps) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex min-h-[68px] max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-8">
        <Link href="/vehicles" className="flex min-w-0 items-center gap-3 rounded-small text-fg no-underline">
          <BrandMark />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-base font-bold">{userName}</span>
            <span className="text-[13px] text-muted">Διαχείριση επισκευών</span>
          </span>
        </Link>
        <nav aria-label="Κύριο μενού" className="flex shrink-0 items-center gap-1">
          {/* Every app page is under /vehicles, so the fallback can show it as current too */}
          <span className="hidden sm:contents">
            <Suspense
              fallback={
                <Link href="/vehicles" className={`${navItemClasses} ${navItemActiveClasses}`}>
                  Οχήματα
                </Link>
              }
            >
              <NavLink href="/vehicles">Οχήματα</NavLink>
            </Suspense>
          </span>
          {actions}
        </nav>
      </div>
    </header>
  );
}
