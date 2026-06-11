import Link from 'next/link';
import { getLibrary, verseCounts } from '@/lib/bible';
import PassagePicker from './passage-picker';

// Laid out after kingjamesbibleonline.org: a tooled-leather band, a glowing hero with the
// title, and a deep red bar to search or jump to a passage. The glow is Doré's
// "Creation of Light" (1866), warmed to parchment tones.
export default function SiteHeader({ query, compact = false }: { query?: string; compact?: boolean }) {
  const books = getLibrary().map((b) => ({
    slug: b.slug,
    title: b.title,
    testament: b.testament,
    verses: verseCounts(b.slug),
  }));

  return (
    <header>
      <nav className="relative border-b border-[#b08d57]/60 bg-[#6b4f36] bg-[radial-gradient(ellipse_at_top,rgb(255_255_255/0.08),transparent_60%),repeating-linear-gradient(90deg,rgb(0_0_0/0.06)_0_2px,transparent_2px_6px)] shadow-[inset_0_-6px_12px_-6px_rgb(0_0_0/0.5)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-center px-6 sm:justify-between">
          <Link href="/" className="hidden font-display text-lg tracking-wide text-[#f6ecd6] [font-variant-caps:small-caps] hover:text-white sm:block">
            KJV + Apocrypha
          </Link>
          <ul className="flex gap-6 font-display text-sm tracking-[0.12em] text-[#f6ecd6] uppercase">
            <li>
              <Link href="/#verse-of-the-day" className="hover:text-white">
                Verse of the day
              </Link>
            </li>
            <li>
              <Link href="/#contents" className="hover:text-white">
                Contents
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {!compact && (
        <div className="relative isolate overflow-hidden border-b border-[#b08d57]/50">
          {/* eslint-disable-next-line @next/next/no-img-element -- a single local, pre-sized engraving */}
          <img
            src="/toc/creation-of-light.jpg"
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_28%] [filter:sepia(0.7)_saturate(1.15)_brightness(1.06)_contrast(0.9)]"
          />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_55%,rgb(251_243_224/0.92),rgb(251_243_224/0.55)_55%,rgb(107_79_54/0.22))]" />
          <div className="mx-auto max-w-6xl px-6 py-14 text-center md:py-20">
            <h1 className="font-display text-5xl leading-none font-semibold text-[#4a3726] [font-variant-caps:small-caps] sm:text-7xl">
              KJV + Apocrypha
            </h1>
            <p className="mt-4 font-serif text-lg tracking-[0.2em] text-[#7a5c40] [font-variant-caps:small-caps] sm:text-2xl">
              The King James Version, with the Apocrypha
            </p>
          </div>
        </div>
      )}

      <div className="border-b-4 border-[#8a6a48] bg-[#cbb48c] bg-[linear-gradient(180deg,rgb(255_255_255/0.06),transparent)] shadow-[0_6px_16px_-8px_rgb(0_0_0/0.5)]">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <PassagePicker books={books} query={query} />
        </div>
      </div>
    </header>
  );
}
