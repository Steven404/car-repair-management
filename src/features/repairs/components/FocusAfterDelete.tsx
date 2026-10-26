'use client';

import { useEffect, useRef } from 'react';

/**
 * When a repair is deleted its card goes, delete button and all, and focus
 * falls back to the top of the page. Once that has happened (an effect runs
 * after the card is gone and its dialog closed), this puts focus on the
 * element with `targetId`, the history heading. Focus that is somewhere else
 * is left alone.
 */
export function FocusAfterDelete({ count, targetId }: { count: number; targetId: string }) {
  const previous = useRef(count);

  useEffect(() => {
    const lost = !document.activeElement || document.activeElement === document.body;
    if (count < previous.current && lost) document.getElementById(targetId)?.focus();
    previous.current = count;
  }, [count, targetId]);

  return null;
}
