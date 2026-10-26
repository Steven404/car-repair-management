'use client';

import { useEffect } from 'react';
import './globals.css';

/**
 * Only when the root layout itself fails, so it brings its own document and
 * styles. Kept to plain markup: whatever broke may be something the usual
 * components rely on.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="el">
      <body className="flex min-h-dvh items-center justify-center p-6 font-[system-ui,sans-serif]">
        <title>Κάτι πήγε στραβά · Διαχείριση επισκευών</title>
        <main className="flex max-w-md flex-col items-center gap-3 text-center">
          <h1 className="text-xl font-bold">Κάτι πήγε στραβά</h1>
          <p className="text-[15px] text-muted">
            Η εφαρμογή δεν φόρτωσε. Ελέγξτε τη σύνδεση στο ίντερνετ και δοκιμάστε ξανά.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-2 h-[46px] cursor-pointer rounded-control bg-accent px-5 text-[15px] font-semibold text-on-accent hover:bg-accent-hover"
          >
            Δοκιμάστε ξανά
          </button>
        </main>
      </body>
    </html>
  );
}
