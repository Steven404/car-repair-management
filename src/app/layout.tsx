import type { Metadata } from 'next';
import { Commissioner, Roboto_Mono } from 'next/font/google';
import './globals.css';

const commissioner = Commissioner({
  subsets: ['latin', 'greek'],
  variable: '--font-commissioner',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin', 'greek'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s · Διαχείριση επισκευών',
    default: 'Διαχείριση επισκευών',
  },
  // A private tool: nothing here belongs in search results
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="el" className={`${commissioner.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
