import { getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import type { RichTextDoc } from '@/lib/db/schema';
import { repairNotesExtensions } from '../editor/extensions';

const schema = getSchema(repairNotesExtensions);

/** A generous limit: a long repair write-up is a few kilobytes */
const MAX_JSON_LENGTH = 50_000;

/**
 * The notes as the editor submitted them, checked against the editor's own
 * schema: only its nodes and marks, each where it may go, unknown attributes
 * dropped. Null for anything that isn't such a document.
 */
export function parseNotes(json: string): RichTextDoc | null {
  if (json.length > MAX_JSON_LENGTH) return null;
  try {
    const node = Node.fromJSON(schema, JSON.parse(json));
    if (node.type.name !== 'doc') return null;
    node.check();

    const doc = node.toJSON() as RichTextDoc;
    // The editor keeps an empty paragraph at the end to type into; it isn't part of the notes
    const content = doc.content ?? [];
    while (content.length > 1 && content.at(-1)?.type === 'paragraph' && !content.at(-1)?.content) content.pop();
    return doc;
  } catch {
    return null;
  }
}

/** The notes' text with the formatting stripped, e.g. to tell an empty editor from a filled one. */
export function notesText(doc: RichTextDoc): string {
  return Node.fromJSON(schema, doc).textContent;
}
