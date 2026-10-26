'use client';

import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import { List, ListOrdered, Redo2, Undo2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface ToolbarButtonProps {
  label: string;
  /** For toggles; leave out for undo and redo, which aren't on or off */
  pressed?: boolean;
  disabled: boolean;
  onPress: () => void;
  className?: string;
  children: ReactNode;
}

function ToolbarButton({ label, pressed, disabled, onPress, className = '', children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      // Keep the text selection in the editor: a press shouldn't move focus to the button
      onMouseDown={(event) => event.preventDefault()}
      onClick={onPress}
      className={`flex size-11 cursor-pointer items-center justify-center rounded-small text-fg transition-colors hover:bg-ground disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent ${pressed ? 'bg-line hover:bg-line' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span aria-hidden="true" className="mx-1.5 h-6 w-px bg-field" />;
}

/** The design's formatting bar. Ctrl/⌘+B, I and U work in the editor too. */
export function EditorToolbar({ editor }: { editor: Editor | null }) {
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

  const run = (command: (chain: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) => () => {
    if (editor) command(editor.chain().focus()).run();
  };
  // The state above only arrives with the editor's first change; the buttons work before that
  const off = !editor;

  return (
    <div
      role="toolbar"
      aria-label="Μορφοποίηση κειμένου"
      className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface-2 px-2 py-1.5"
    >
      <ToolbarButton
        label="Έντονα"
        pressed={state?.bold ?? false}
        disabled={off}
        onPress={run((c) => c.toggleBold())}
        className="text-[17px] font-extrabold"
      >
        B
      </ToolbarButton>
      <ToolbarButton
        label="Πλάγια"
        pressed={state?.italic ?? false}
        disabled={off}
        onPress={run((c) => c.toggleItalic())}
        className="font-[Georgia,serif] text-lg italic"
      >
        I
      </ToolbarButton>
      <ToolbarButton
        label="Υπογράμμιση"
        pressed={state?.underline ?? false}
        disabled={off}
        onPress={run((c) => c.toggleUnderline())}
        className="text-[17px] font-semibold underline"
      >
        U
      </ToolbarButton>
      <Separator />
      <ToolbarButton
        label="Λίστα με κουκκίδες"
        pressed={state?.bulletList ?? false}
        disabled={off}
        onPress={run((c) => c.toggleBulletList())}
      >
        <List size={20} aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Αριθμημένη λίστα"
        pressed={state?.orderedList ?? false}
        disabled={off}
        onPress={run((c) => c.toggleOrderedList())}
      >
        <ListOrdered size={20} aria-hidden="true" />
      </ToolbarButton>
      <Separator />
      <ToolbarButton label="Αναίρεση" disabled={off || !state?.canUndo} onPress={run((c) => c.undo())}>
        <Undo2 size={20} aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Επανάληψη" disabled={off || !state?.canRedo} onPress={run((c) => c.redo())}>
        <Redo2 size={20} aria-hidden="true" />
      </ToolbarButton>
    </div>
  );
}
