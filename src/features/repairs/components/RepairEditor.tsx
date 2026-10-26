'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect } from 'react';
import { errorClasses } from '@/components/ui/fieldStyles';
import type { RichTextDoc } from '@/lib/db/schema';
import { repairNotesExtensions } from '../editor/extensions';
import { EditorToolbar } from './EditorToolbar';

interface RepairEditorProps {
  /** The id of the visible label ("Τι έγινε") */
  labelId: string;
  initialContent?: RichTextDoc;
  onChange: (doc: RichTextDoc) => void;
  error?: string;
}

const contentClasses = 'rich-text rich-text-editor min-h-[260px] px-5 py-[18px] text-base leading-[1.6] text-prose';

/** The "Τι έγινε" field: Tiptap with the design's toolbar, framed like the other inputs. */
/**
 * ProseMirror's editable element takes the label, the required state and the
 * error the way an input would.
 */
function editableAttributes(labelId: string, error?: string): Record<string, string> {
  return {
    class: `${contentClasses} outline-none`,
    role: 'textbox',
    'aria-multiline': 'true',
    'aria-required': 'true',
    'aria-labelledby': labelId,
    ...(error && { 'aria-invalid': 'true', 'aria-describedby': `${labelId}-error` }),
  };
}

export function RepairEditor({ labelId, initialContent, onChange, error }: RepairEditorProps) {
  const editor = useEditor({
    extensions: repairNotesExtensions,
    content: initialContent,
    // Rendered on the server too: build the editor only once in the browser, or hydration won't match
    immediatelyRender: false,
    editorProps: { attributes: editableAttributes(labelId, error) },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as RichTextDoc),
  });

  // Kept up to date as an error comes and goes
  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: editableAttributes(labelId, error) } });
  }, [editor, error, labelId]);

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`flex flex-col overflow-hidden rounded-control border bg-surface focus-within:border-accent focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-accent ${error ? 'border-danger' : 'border-field'}`}
      >
        <EditorToolbar editor={editor} />
        {/* Holds the editor's height until it's ready in the browser */}
        {editor ? <EditorContent editor={editor} /> : <div className={contentClasses} />}
      </div>
      {error && (
        <span id={`${labelId}-error`} className={errorClasses}>
          {error}
        </span>
      )}
    </div>
  );
}
