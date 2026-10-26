import type { InputHTMLAttributes, ReactNode } from 'react';
import { FieldLabel } from './FieldLabel';
import { errorClasses, hintClasses, inputClasses } from './fieldStyles';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  name: string;
  hint?: ReactNode;
  error?: string;
  /** Adds "(προαιρετικό)" after the label */
  optional?: boolean;
  /** Monospaced, for VINs and plates */
  mono?: boolean;
  /** Classes for the wrapper, which is what a form layout sizes */
  className?: string;
}

/** A labelled input with an optional hint and error message under it. */
export function TextField({
  label,
  name,
  id = name,
  hint,
  error,
  optional,
  mono,
  required,
  className = '',
  ...props
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <FieldLabel htmlFor={id} required={required} optional={optional}>
        {label}
      </FieldLabel>
      <input
        id={id}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${inputClasses} ${mono ? 'font-mono tracking-[0.04em]' : ''}`}
        {...props}
      />
      {error && (
        <span id={errorId} className={errorClasses}>
          {error}
        </span>
      )}
      {hint && (
        <span id={hintId} className={hintClasses}>
          {hint}
        </span>
      )}
    </div>
  );
}
