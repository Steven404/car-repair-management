import { describe, expect, it } from 'vitest';
import type { RichTextNode } from '@/lib/db/schema';
import { notesText, parseNotes } from './notes';

const doc = (...content: RichTextNode[]) => JSON.stringify({ type: 'doc', content });
const text = (value: string, marks?: string[]): RichTextNode => ({
  type: 'text',
  text: value,
  ...(marks && { marks: marks.map((type) => ({ type })) }),
});
const p = (...content: RichTextNode[]): RichTextNode => ({ type: 'paragraph', content });
const list = (type: string, ...items: string[]): RichTextNode => ({
  type,
  content: items.map((item) => ({ type: 'listItem', content: [p(text(item))] })),
});

describe('parseNotes', () => {
  it('accepts everything the toolbar makes', () => {
    const notes = doc(
      p(text('Σέρβις', ['bold']), text(' και '), text('έλεγχος', ['italic', 'underline'])),
      list('bulletList', 'Λάδι', 'Φίλτρο'),
      list('orderedList', 'Δισκόπλακες', 'Τακάκια')
    );
    // The schema fills in defaults, like an ordered list's start: 1
    expect(parseNotes(notes)).toMatchObject(JSON.parse(notes));
  });

  it('refuses nodes and marks the toolbar can’t make', () => {
    expect(parseNotes(doc({ type: 'heading', attrs: { level: 1 }, content: [text('x')] }))).toBeNull();
    expect(parseNotes(doc({ type: 'image', attrs: { src: 'https://example.test/x.png' } }))).toBeNull();
    expect(
      parseNotes(doc(p({ type: 'text', text: 'x', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] })))
    ).toBeNull();
  });

  it('refuses a document that breaks the structure', () => {
    expect(parseNotes(doc(list('bulletList'), { type: 'listItem', content: [p(text('loose'))] }))).toBeNull();
    expect(parseNotes(JSON.stringify(p(text('not a doc'))))).toBeNull();
  });

  it('drops the empty paragraphs the editor leaves at the end', () => {
    const parsed = parseNotes(
      doc(p(text('Σέρβις')), list('bulletList', 'Λάδι'), { type: 'paragraph' }, { type: 'paragraph' })
    );
    expect(parsed?.content?.map((node) => node.type)).toEqual(['paragraph', 'bulletList']);
  });

  it('drops attributes the schema doesn’t know', () => {
    const parsed = parseNotes(doc({ type: 'paragraph', attrs: { onclick: 'alert(1)' }, content: [text('x')] }));
    expect(JSON.stringify(parsed)).not.toContain('onclick');
  });

  it('refuses what isn’t JSON, or is far too long', () => {
    expect(parseNotes('<p>x</p>')).toBeNull();
    expect(parseNotes(doc(p(text('x'.repeat(60_000)))))).toBeNull();
  });
});

describe('notesText', () => {
  it('is empty for an empty editor', () => {
    expect(notesText(JSON.parse(doc({ type: 'paragraph' })))).toBe('');
  });
});
