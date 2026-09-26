import Link from 'next/link';
import { allBooks } from '@/lib/bible';
import PassagePicker from './passage-picker';

const leather =
  'bg-[#3b2416] bg-[radial-gradient(ellipse_at_top,rgb(255_255_255/0.08),transparent_60%),repeating-linear-gradient(90deg,rgb(0_0_0/0.06)_0_2px,transparent_2px_6px)]';

export default function SiteHeader({ query, compact = false }: { query?: string; compact?: boolean }) {
  const books = allBooks().map((b) => ({
    slug: b.slug,
    title: b.title,
    testament: b.testament,
    verses: b.chapters.map((c) => c.verses.length),
  }));

  return (
    <header>
      <nav className={`border-b border-[#c8a45c]/60 shadow-[inset_0_-6px_12px_-6px_rgb(0_0_0/0.5)] ${leather}`}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-center px-6 sm:justify-between">
          <Link href="/" className="hidden font-display text-lg tracking-wide text-[#e6c77f] [font-variant-caps:small-caps] hover:text-white sm:block">
            Holy Bible
          </Link>
          <div className="flex gap-6 font-display text-sm tracking-[0.12em] text-[#e6c77f] uppercase">
            <Link href="/#verse-of-the-day" className="hover:text-white">Verse of the day</Link>
            <Link href="/highlights" className="hover:text-white">My highlights</Link>
            <Link href="/#contents" className="hover:text-white">Contents</Link>
          </div>
        </div>
      </nav>

      {!compact && (
        <div className="relative isolate overflow-hidden border-b border-[#c8a45c]/50">
          <img
            src="/toc/creation-of-light.jpg"
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_28%] [filter:sepia(0.45)_saturate(1.2)_brightness(1.06)_contrast(0.92)]"
          />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_55%,rgb(251_243_224/0.92),rgb(251_243_224/0.55)_55%,rgb(90_50_20/0.25))]" />
          <div className="mx-auto max-w-6xl px-6 py-14 text-center md:py-20">
            <h1 className="font-display text-5xl leading-none font-semibold text-[#3b2416] [font-variant-caps:small-caps] sm:text-7xl">
              Holy Bible
            </h1>
            <p className="mt-4 font-serif text-lg tracking-[0.2em] text-[#6b4a2e] [font-variant-caps:small-caps] sm:text-2xl">
              King James Version · with the Apocrypha
            </p>
          </div>
        </div>
      )}

      <div className="border-b-4 border-[#3b2416] bg-[#7a4a24] bg-[linear-gradient(180deg,rgb(255_255_255/0.06),transparent)] shadow-[0_6px_16px_-8px_rgb(0_0_0/0.5)]">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <PassagePicker books={books} query={query} />
        </div>
      </div>
    </header>
  );
}
