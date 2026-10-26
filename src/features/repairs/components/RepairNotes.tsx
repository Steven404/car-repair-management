import { renderToReactElement } from '@tiptap/static-renderer/pm/react';
import type { RichTextDoc } from '@/lib/db/schema';
import { repairNotesExtensions } from '../editor/extensions';

/**
 * A repair's notes on the vehicle page, rendered on the server from the stored
 * JSON. Straight to React elements, never HTML: only the editor's own nodes
 * and marks can come out, so there is nothing to sanitise.
 */
export function RepairNotes({ notes }: { notes: RichTextDoc }) {
  return (
    <div className="rich-text text-[15px] leading-[1.6] break-words text-prose">
      {renderToReactElement({ content: notes, extensions: repairNotesExtensions })}
    </div>
  );
}
