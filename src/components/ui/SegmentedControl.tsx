import { FieldLabel } from './FieldLabel';
import { errorClasses } from './fieldStyles';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  name: string;
  options: readonly SegmentedOption<T>[];
  /** Controlled, `''` for nothing chosen yet; leave out and use `defaultValue` for an uncontrolled group */
  value?: T | '';
  defaultValue?: T;
  onChange?: (value: T) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

/**
 * Radio buttons drawn as side-by-side segments (the fuel picker). They stay real
 * radios, so arrow keys, required and form submission work as usual.
 */
export function SegmentedControl<T extends string>({
  label,
  name,
  options,
  value,
  defaultValue,
  onChange,
  required,
  error,
  className = '',
}: SegmentedControlProps<T>) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <fieldset aria-describedby={errorId} className={`flex min-w-0 flex-col ${className}`}>
      <FieldLabel as="legend" required={required} className="mb-1.5">
        {label}
      </FieldLabel>
      <div className="flex gap-2">
        {options.map((option) => (
          <label key={option.value} className="relative flex-1 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              required={required}
              checked={value === undefined ? undefined : value === option.value}
              defaultChecked={value === undefined ? defaultValue === option.value : undefined}
              onChange={() => onChange?.(option.value)}
              className="peer sr-only"
            />
            <span
              className={`flex h-12 items-center justify-center rounded-control border bg-surface text-[15px] font-semibold text-fg transition-colors peer-checked:border-fg peer-checked:bg-fg peer-checked:text-on-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${error ? 'border-danger' : 'border-field'}`}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <span id={errorId} className={`mt-1.5 ${errorClasses}`}>
          {error}
        </span>
      )}
    </fieldset>
  );
}
