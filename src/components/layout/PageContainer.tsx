import type { ReactNode } from 'react';

const WIDTHS = {
  wide: 'max-w-[1280px]',
  /** The repair form's single column */
  narrow: 'max-w-[920px]',
};

/** The skip link's target (SkipLink) */
export const MAIN_ID = 'main';

interface PageContainerProps {
  width?: keyof typeof WIDTHS;
  className?: string;
  children: ReactNode;
}

/** The page's <main>: centred, with the design's side and bottom padding. */
export function PageContainer({ width = 'wide', className = '', children }: PageContainerProps) {
  return (
    <main
      id={MAIN_ID}
      // Focusable from the skip link, without drawing a ring round the whole page
      tabIndex={-1}
      className={`mx-auto flex w-full flex-col gap-6 px-4 pt-6 pb-16 outline-none sm:px-8 sm:pt-8 ${WIDTHS[width]} ${className}`}
    >
      {children}
    </main>
  );
}
