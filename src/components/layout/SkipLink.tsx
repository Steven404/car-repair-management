'use client';

import { MAIN_ID } from './PageContainer';

/**
 * The first thing Tab reaches: jumps past the header to the page itself.
 * Hidden until focused. Next can keep pages you've left in the document,
 * hidden, each with its own <main id="main">, so the plain #main jump could
 * land on one of those; on click this finds the <main> that is on screen.
 */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_ID}`}
      onClick={(event) => {
        const visible = [...document.querySelectorAll('main')].find((main) => main.getClientRects().length > 0);
        if (!visible) return;
        event.preventDefault();
        visible.focus();
        visible.scrollIntoView();
      }}
      className="sr-only rounded-control bg-surface px-4 py-3 text-[15px] font-semibold text-accent shadow-card-hover focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
    >
      Μετάβαση στο περιεχόμενο
    </a>
  );
}
