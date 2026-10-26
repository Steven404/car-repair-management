import type { ButtonHTMLAttributes } from 'react';

const TONES = {
  default: 'hover:bg-ground hover:text-fg',
  danger: 'hover:bg-danger-soft hover:text-danger',
};

export type IconButtonTone = keyof typeof TONES;

/** Shared with IconLink */
export function iconButtonClasses(tone: IconButtonTone = 'default', className = '') {
  return `inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-small bg-transparent text-muted transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${TONES[tone]} ${className}`;
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** What the button does, read out by screen readers in place of the icon */
  label: string;
  tone?: IconButtonTone;
}

/** A 44px square button holding only an icon. */
export function IconButton({ label, tone, type = 'button', className, ...props }: IconButtonProps) {
  return <button type={type} aria-label={label} className={iconButtonClasses(tone, className)} {...props} />;
}
