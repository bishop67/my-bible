import type { Metadata } from 'next';
import SiteHeader from '@/components/site-header';
import HighlightsList from '@/components/highlights-list';
import SiteFooter from '@/components/site-footer';
import { allSlugs } from '@/lib/bible';

export const metadata: Metadata = { title: 'Highlights' };

export default function HighlightsPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-stone-900">
      <SiteHeader compact />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="border-b border-stone-300 pb-2 font-display text-3xl text-stone-900 [font-variant-caps:small-caps]">
          My highlights &amp; notes
        </h1>
        <p className="mt-3 font-serif text-lg text-stone-600 italic">Kept in this browser, on this device.</p>
        <HighlightsList order={allSlugs()} />
      </main>
      <SiteFooter />
    </div>
  );
}
