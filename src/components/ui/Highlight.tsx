import type { ReactNode } from 'react';

/** `[start, end)` character offsets into the text, as `String.prototype.slice` takes them. */
export type HighlightRange = readonly [start: number, end: number];

interface HighlightProps {
  text: string;
  ranges?: readonly HighlightRange[];
}

/** Sorted, clamped to the text, with overlapping or touching ranges joined. */
function mergeRanges(ranges: readonly HighlightRange[], length: number): HighlightRange[] {
  const sorted = ranges
    .map(([start, end]): HighlightRange => [Math.max(0, start), Math.min(length, end)])
    .filter(([start, end]) => start < end)
    .sort((a, b) => a[0] - b[0]);

  const merged: [number, number][] = [];
  for (const [start, end] of sorted) {
    const last = merged.at(-1);
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}

/**
 * Renders the text with the given ranges wrapped in <mark>. The ranges come
 * from the search code, which finds them in folded text and maps them back to
 * the original (see the plan's Search section).
 */
export function Highlight({ text, ranges = [] }: HighlightProps) {
  const merged = mergeRanges(ranges, text.length);
  if (merged.length === 0) return text;

  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={start} className="rounded-[3px] bg-highlight box-decoration-clone">
        {text.slice(start, end)}
      </mark>
    );
    cursor = end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}
