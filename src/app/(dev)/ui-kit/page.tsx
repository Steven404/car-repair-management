import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UiKit } from './UiKit';

export const metadata: Metadata = { title: 'UI kit' };

/** Every shared component on one page, for checking them while building. Development only. */
export default function UiKitPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <UiKit />;
}
