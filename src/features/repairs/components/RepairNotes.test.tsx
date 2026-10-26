import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { RichTextDoc } from '@/lib/db/schema';
import { RepairNotes } from './RepairNotes';

describe('RepairNotes', () => {
  it('renders the stored notes as plain HTML elements, with text escaped', () => {
    const notes: RichTextDoc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Σέρβις', marks: [{ type: 'bold' }] }] },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '<b>5W-30</b>' }] }] },
          ],
        },
      ],
    };
    const html = renderToStaticMarkup(<RepairNotes notes={notes} />);

    expect(html).toContain('<strong>Σέρβις</strong>');
    expect(html).toMatch(/<ul[^>]*><li[^>]*><p>&lt;b&gt;5W-30&lt;\/b&gt;<\/p><\/li><\/ul>/);
  });
});
