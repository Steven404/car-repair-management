import type { HTMLAttributes } from 'react';

/** The white bordered panel most content sits in; also for links styled as cards. */
export const cardClasses = 'rounded-card border border-line bg-surface';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${cardClasses} ${className}`} {...props} />;
}
