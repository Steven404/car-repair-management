import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { NavLink, navLinkClasses } from './NavLink';

interface AppHeaderProps {
  /** The signed-in mechanic's name. It reads the session, so pass it wrapped in <Suspense>. */
  userName: ReactNode;
  /** Shown after the nav links, e.g. the logout button */
  actions?: ReactNode;
}

export function AppHeader({ userName, actions }: AppHeaderProps) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex min-h-[68px] max-w-[1280px] flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-8 sm:py-0">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-base font-bold">{userName}</span>
            <span className="text-[13px] text-muted">Διαχείριση επισκευών</span>
          </div>
        </div>
        <nav aria-label="Κύριο μενού" className="flex items-center gap-1">
          <Suspense
            fallback={
              <Link href="/vehicles" className={navLinkClasses}>
                Οχήματα
              </Link>
            }
          >
            <NavLink href="/vehicles">Οχήματα</NavLink>
          </Suspense>
          {actions}
        </nav>
      </div>
    </header>
  );
}
