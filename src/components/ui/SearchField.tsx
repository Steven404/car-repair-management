'use client';

import { useId, useRef, type ReactNode, type RefObject } from 'react';
import { Search, X } from 'lucide-react';
import { FieldLabel } from './FieldLabel';
import { hintClasses } from './fieldStyles';

interface SearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  /** For a parent that needs to put the cursor back in the field */
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
}

/** A labelled search input with a magnifier, and a clear button once something is typed. */
export function SearchField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  inputRef: givenRef,
  className = '',
}: SearchFieldProps) {
  // Unique per instance: Next can keep a hidden copy of this page in the document
  const id = useId();
  const ownRef = useRef<HTMLInputElement>(null);
  const inputRef = givenRef ?? ownRef;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative flex items-center">
        <Search size={20} aria-hidden="true" className="pointer-events-none absolute left-3.5 text-muted" />
        <input
          ref={inputRef}
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={hintId}
          autoComplete="off"
          // The browser's own clear button would duplicate ours
          className="h-[50px] w-full rounded-control border border-field bg-surface pr-12 pl-[46px] text-base text-fg focus:outline-2 focus:outline-offset-2 focus:outline-accent [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value && (
          <button
            type="button"
            aria-label="Καθαρισμός αναζήτησης"
            onClick={() => {
              onChange('');
              // The button goes once the field is empty; carry on from the field, not the top of the page
              inputRef.current?.focus();
            }}
            className="absolute right-1 flex size-11 cursor-pointer items-center justify-center rounded-small text-muted hover:bg-ground hover:text-fg"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      {hint && (
        <span id={hintId} className={hintClasses}>
          {hint}
        </span>
      )}
    </div>
  );
}
