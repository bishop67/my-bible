import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import Contents from '@/app/books/page';
import { verseOfTheDay } from '@/lib/bible';
import { tocStyle } from '@/lib/toc-style';

// Rendered per request so the verse turns over at midnight without a rebuild.
export const dynamic = 'force-dynamic';

export default function Home() {
  const verse = verseOfTheDay();

  return (
    <div className="min-h-screen bg-[var(--paper)] text-stone-900">
      <SiteHeader />

      {verse && (
        <section id="verse-of-the-day" className="mx-auto max-w-4xl scroll-mt-4 px-8 pt-14 md:pt-16">
          <h2 className="flex items-baseline gap-3 border-b border-stone-300 pb-2 font-display text-2xl text-[#2b2621] [font-variant-caps:small-caps]">
            Verse of the Day
            <span className="font-serif text-base text-stone-500 italic [font-variant-caps:normal]">
              for {verse.dateLabel}
            </span>
          </h2>
          <figure className="mx-auto max-w-3xl py-10 text-center">
            <svg aria-hidden viewBox="0 0 20 32" className="mx-auto mb-5 h-8 w-5 text-[#c8a45c]">
              <path d="M10 1v30M2 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
            <blockquote className="font-serif text-3xl leading-snug text-balance text-[#2b2621] md:text-4xl">
              &ldquo;{verse.text}&rdquo;
            </blockquote>
            <figcaption className="mt-5">
              <Link
                href={`/read/${verse.slug}/${verse.chapter}#v${verse.verse}`}
                className="font-display text-lg tracking-wide text-[#6b6259] [font-variant-caps:small-caps] hover:text-[#2b2621] hover:underline hover:underline-offset-4"
              >
                {verse.title} {verse.chapter}:{verse.verse}
              </Link>
            </figcaption>
          </figure>
        </section>
      )}

      <section id="contents" className={`scroll-mt-4 ${tocStyle}`}>
        <Contents />
      </section>
    </div>
  );
}
