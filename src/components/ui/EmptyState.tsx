import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

/** The dashed panel shown in place of a list with nothing in it. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-field bg-surface px-6 py-16 text-center">
      <span
        className="flex size-[52px] items-center justify-center rounded-full bg-ground text-muted"
        aria-hidden="true"
      >
        {icon}
      </span>
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="max-w-md text-[15px] text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
