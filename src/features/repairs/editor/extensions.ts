import StarterKit from '@tiptap/starter-kit';

/**
 * What repair notes can contain: what the design's toolbar offers (bold,
 * italic, underline, both kinds of list, undo/redo), nothing more. Shared by
 * the editor, the server's check of what it submits, and the static render on
 * the vehicle page, so all three agree on one schema.
 */
export const repairNotesExtensions = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    link: false,
  }),
];
