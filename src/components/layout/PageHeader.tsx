import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { BackLink, pageLinkClasses } from './BackLink';

interface Crumb {
  href: string;
  label: string;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** A single "‹ label" link above the title */
  back?: Crumb;
  /** A trail of links above the title, for pages two levels down */
  breadcrumbs?: Crumb[];
  /** Buttons on the right, under the title on a phone */
  actions?: ReactNode;
}

export function PageHeader({ title, description, back, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {back && <BackLink href={back.href}>{back.label}</BackLink>}
      {breadcrumbs && (
        <nav aria-label="Διαδρομή" className="flex flex-wrap items-center gap-1">
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={crumb.href}>
              {index > 0 && (
                <span aria-hidden="true" className="px-1 text-placeholder">
                  /
                </span>
              )}
              <Link href={crumb.href} className={pageLinkClasses}>
                {crumb.label}
              </Link>
            </Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-[28px] leading-tight font-bold tracking-[-0.01em] sm:text-[34px]">{title}</h1>
          {description && <p className="text-[15px] text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
}
