import type { ButtonHTMLAttributes } from 'react';
import { LoaderCircle } from 'lucide-react';

const VARIANTS = {
  primary: 'px-5 bg-accent text-on-accent hover:bg-accent-hover',
  secondary: 'px-[18px] border border-field bg-surface text-fg hover:bg-surface-2',
  danger: 'px-5 bg-danger text-on-accent hover:bg-danger-hover',
  'danger-outline': 'px-[18px] border border-field bg-surface text-danger hover:border-danger hover:bg-danger-soft',
};

const SIZES = {
  md: 'h-[46px] text-[15px]',
  lg: 'h-12 text-base',
};

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

/** Shared by Button and ButtonLink, so a link and a button side by side look the same. */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className = '') {
  // A pending button is disabled too, but keeps its colour: the spinner says why it can't be pressed
  return `inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control font-semibold no-underline transition-colors disabled:not-aria-busy:cursor-not-allowed disabled:not-aria-busy:opacity-60 aria-busy:cursor-progress ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Saving: shows a spinner and blocks a second press */
  pending?: boolean;
}

export function Button({
  variant,
  size,
  pending = false,
  type = 'button',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {pending && <LoaderCircle size={18} aria-hidden="true" className="motion-safe:animate-spin" />}
      {children}
    </button>
  );
}
