import type { ReactNode } from 'react';
import { labelClasses } from './fieldStyles';

interface FieldLabelProps {
  htmlFor?: string;
  id?: string;
  /** A `<legend>` inside a fieldset, otherwise a `<label>` (or a `<span>` with no `htmlFor`) */
  as?: 'label' | 'legend' | 'span';
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * A field's label with the design's red required mark. The mark is hidden from
 * screen readers: the field's own `required` attribute already announces it.
 */
export function FieldLabel({
  htmlFor,
  id,
  as = 'label',
  required,
  optional,
  className = '',
  children,
}: FieldLabelProps) {
  const content = (
    <>
      {children}
      {required && (
        <span aria-hidden="true" className="text-danger">
          {' *'}
        </span>
      )}
      {optional && <span className="font-normal text-muted"> (προαιρετικό)</span>}
    </>
  );

  if (as === 'legend') {
    return (
      <legend id={id} className={`${labelClasses} p-0 ${className}`}>
        {content}
      </legend>
    );
  }
  if (as === 'span') {
    return (
      <span id={id} className={`${labelClasses} ${className}`}>
        {content}
      </span>
    );
  }
  return (
    <label id={id} htmlFor={htmlFor} className={`${labelClasses} ${className}`}>
      {content}
    </label>
  );
}
