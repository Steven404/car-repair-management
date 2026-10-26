import type { HighlightRange } from '@/components/ui/Highlight';
import { fold, originalRange, type FoldedText } from '@/lib/text';

// Vehicle search runs in the browser over all of a mechanic's cars (see the
// plan's Search section). Pure functions, so they're easy to test.

export const SEARCH_FIELDS = ['brand', 'model', 'plate', 'ownerName'] as const;
export type SearchField = (typeof SEARCH_FIELDS)[number];

export type SearchFieldValues = Record<SearchField, string>;
export type Highlights = Partial<Record<SearchField, HighlightRange[]>>;

/** Plates are searched without their space or dashes, so "iky4521" finds "ΙΚΥ 4521" */
const SKIP: Partial<Record<SearchField, RegExp>> = { plate: /[\s-]/ };

/** A vehicle with its fields folded once, up front, rather than on every keystroke. */
export interface Searchable<T> {
  item: T;
  fields: Record<SearchField, FoldedText>;
}

export function makeSearchable<T extends SearchFieldValues>(item: T): Searchable<T> {
  const fields = {} as Record<SearchField, FoldedText>;
  for (const field of SEARCH_FIELDS) fields[field] = fold(item[field], SKIP[field]);
  return { item, fields };
}

/** The query's words, folded the same way as the fields. */
export function queryWords(query: string): string[] {
  return fold(query).text.split(/\s+/).filter(Boolean);
}

function findAll(haystack: string, needle: string): [number, number][] {
  const found: [number, number][] = [];
  for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, at + 1)) {
    found.push([at, at + needle.length]);
  }
  return found;
}

/**
 * Null unless every word is found in at least one field. Otherwise where each
 * word was found, as ranges in the original (unfolded) field values.
 */
export function matchSearchable<T>(searchable: Searchable<T>, words: readonly string[]): Highlights | null {
  const highlights: Highlights = {};

  for (const word of words) {
    let found = false;
    for (const field of SEARCH_FIELDS) {
      const skip = SKIP[field];
      const needle = skip ? [...word].filter((char) => !skip.test(char)).join('') : word;
      if (!needle) continue;

      const folded = searchable.fields[field];
      for (const [start, end] of findAll(folded.text, needle)) {
        (highlights[field] ??= []).push(originalRange(folded, start, end));
        found = true;
      }
    }
    if (!found) return null;
  }
  return highlights;
}

export interface SearchResult<T> {
  item: T;
  highlights: Highlights;
}

/** Everything when the query is empty; otherwise the matches, in their original order. */
export function search<T>(searchables: readonly Searchable<T>[], query: string): SearchResult<T>[] {
  const words = queryWords(query);
  const results: SearchResult<T>[] = [];
  for (const searchable of searchables) {
    const highlights = words.length ? matchSearchable(searchable, words) : {};
    if (highlights) results.push({ item: searchable.item, highlights });
  }
  return results;
}
