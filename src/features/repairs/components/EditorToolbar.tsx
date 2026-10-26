'use client';

import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import { List, ListOrdered, Redo2, Undo2 } from 'lucide-react';
import { Fragment, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

type Chain = ReturnType<Editor['chain']>;

interface ToolbarItem {
  label: string;
  /** For toggles; left out for undo and redo, which aren't on or off */
  pressed?: boolean;
  disabled: boolean;
  command: (chain: Chain) => Chain;
  className?: string;
  content: ReactNode;
  /** Draw a divider before this button */
  groupStart?: boolean;
}

/**
 * The design's formatting bar. Ctrl/⌘+B, I and U work in the editor too.
 * Keyboard: one Tab stop for the whole bar, then the arrow keys (and Home,
 * End) move between buttons, as the ARIA toolbar pattern expects.
 */
export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor && {
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList'),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      },
  });

  // The state above only arrives with the editor's first change; the buttons work before that
  const off = !editor;
  const items: ToolbarItem[] = [
    {
      label: 'Έντονα',
      pressed: state?.bold ?? false,
      disabled: off,
      command: (c) => c.toggleBold(),
      className: 'text-[17px] font-extrabold',
      content: 'B',
    },
    {
      label: 'Πλάγια',
      pressed: state?.italic ?? false,
      disabled: off,
      command: (c) => c.toggleItalic(),
      className: 'font-[Georgia,serif] text-lg italic',
      content: 'I',
    },
    {
      label: 'Υπογράμμιση',
      pressed: state?.underline ?? false,
      disabled: off,
      command: (c) => c.toggleUnderline(),
      className: 'text-[17px] font-semibold underline',
      content: 'U',
    },
    {
      label: 'Λίστα με κουκκίδες',
      pressed: state?.bulletList ?? false,
      disabled: off,
      command: (c) => c.toggleBulletList(),
      content: <List size={20} aria-hidden="true" />,
      groupStart: true,
    },
    {
      label: 'Αριθμημένη λίστα',
      pressed: state?.orderedList ?? false,
      disabled: off,
      command: (c) => c.toggleOrderedList(),
      content: <ListOrdered size={20} aria-hidden="true" />,
    },
    {
      label: 'Αναίρεση',
      disabled: off || !state?.canUndo,
      command: (c) => c.undo(),
      content: <Undo2 size={20} aria-hidden="true" />,
      groupStart: true,
    },
    {
      label: 'Επανάληψη',
      disabled: off || !state?.canRedo,
      command: (c) => c.redo(),
      content: <Redo2 size={20} aria-hidden="true" />,
    },
  ];

  // If the remembered button has become disabled (nothing left to undo), Tab lands on the first one
  const tabStop = items[current]?.disabled ? 0 : current;

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = [...(toolbarRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const target = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: buttons.length - 1 }[event.key];
    if (at === -1 || target === undefined) return;
    event.preventDefault();
    buttons[(target + buttons.length) % buttons.length].focus();
  };

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Μορφοποίηση κειμένου"
      onKeyDown={moveFocus}
      className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface-2 px-2 py-1.5"
    >
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {item.groupStart && <span aria-hidden="true" className="mx-1.5 h-6 w-px bg-field" />}
          <button
            type="button"
            aria-label={item.label}
            aria-pressed={item.pressed}
            disabled={item.disabled}
            tabIndex={index === tabStop ? 0 : -1}
            onFocus={() => setCurrent(index)}
            // Keep the text selection in the editor: a press shouldn't move focus to the button
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (editor) item.command(editor.chain().focus()).run();
            }}
            className={`flex size-11 cursor-pointer items-center justify-center rounded-small text-fg transition-colors hover:bg-ground disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent ${item.pressed ? 'bg-line hover:bg-line' : ''} ${item.className ?? ''}`}
          >
            {item.content}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
