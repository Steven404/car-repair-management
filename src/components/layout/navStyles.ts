// In a plain module, not NavLink.tsx: a server component importing a value
// from a 'use client' file gets a client reference, not the string.

/** A header nav item: the "Οχήματα" link and the logout button. 40px as designed, 44px for touch on a phone. */
export const navItemClasses =
  'inline-flex h-11 sm:h-10 cursor-pointer items-center gap-2 rounded-small px-3.5 text-[15px] font-semibold text-fg-2 no-underline transition-colors hover:bg-ground hover:text-fg';

export const navItemActiveClasses = 'bg-ground text-fg';
