import type { FormHTMLAttributes, ReactNode } from 'react';

interface FormCardProps extends FormHTMLAttributes<HTMLFormElement> {
  /** A grey strip above the fields, e.g. the vehicle a repair is for */
  header?: ReactNode;
  /** The grey action bar at the bottom: Ακύρωση + the save button */
  footer: ReactNode;
  children: ReactNode;
}

/** A form drawn as one white card, its sections divided by thin lines. */
export function FormCard({ header, footer, children, className = '', ...props }: FormCardProps) {
  return (
    <form className={`flex min-w-0 flex-col rounded-card border border-line bg-surface ${className}`} {...props}>
      {header && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-t-card border-b border-line-soft bg-surface-2 px-5 py-4 sm:px-7">
          {header}
        </div>
      )}
      <div className="flex flex-col divide-y divide-line-soft">{children}</div>
      <div className="flex flex-wrap justify-end gap-3 rounded-b-card border-t border-line-soft bg-surface-2 px-5 py-5 sm:px-7">
        {footer}
      </div>
    </form>
  );
}

interface FormSectionProps {
  /** The small uppercase heading; leave out for a form with a single section */
  title?: string;
  className?: string;
  children: ReactNode;
}

/** One group of fields inside a FormCard; FormCard draws the lines between them. */
export function FormSection({ title, className = '', children }: FormSectionProps) {
  const classes = `flex flex-col gap-[18px] px-5 py-6 sm:px-7 sm:py-7 ${className}`;

  if (!title) return <div className={classes}>{children}</div>;

  return (
    <fieldset className={classes}>
      {/* Floated so the legend takes part in the flex gap like the fields do */}
      <legend className="float-left w-full p-0 text-[13px] font-bold tracking-[0.08em] text-muted uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
