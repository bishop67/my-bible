'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';

export interface PickerBook {
  slug: string;
  title: string;
  testament: string;
  verses: number[]; // verse count for each chapter
}

const label = 'font-display text-sm tracking-[0.12em] text-[#4a3726] uppercase';
const field =
  'h-11 rounded-md border border-[#e8d9b5]/40 bg-[#fbf5e6] px-3 font-serif text-lg text-stone-900 shadow-inner focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4f36]';
const go =
  'flex h-11 shrink-0 items-center justify-center rounded-md bg-[#6b4f36] px-4 text-[#fbf5e6] shadow-[0_4px_10px_-4px_rgb(0_0_0/0.6)] transition-colors hover:bg-[#553e2a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4f36]';

/** The bar under the header: search the text, or jump to a book, chapter and verse. */
export default function PassagePicker({ books, query = '' }: { books: PickerBook[]; query?: string }) {
  const router = useRouter();
  const [slug, setSlug] = useState(books[0].slug);
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const book = books.find((b) => b.slug === slug)!;
  const testaments = [...new Set(books.map((b) => b.testament))];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
      <form action="/search" role="search" className="flex flex-col gap-1.5">
        <label htmlFor="q" className={label}>
          Search the Bible
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-stone-500" />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              required
              placeholder="Search words or verses…"
              className={`${field} w-full pl-10 placeholder:text-stone-500 placeholder:italic`}
            />
          </div>
          <button type="submit" aria-label="Search" className={go}>
            <ChevronRight className="size-5" />
          </button>
        </div>
      </form>

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/read/${slug}/${chapter}${verse > 1 ? `#v${verse}` : ''}`);
        }}
      >
        <label className="flex basis-full flex-col gap-1.5 sm:min-w-48 sm:flex-1 sm:basis-auto">
          <span className={label}>Select a book</span>
          <select
            className={field}
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setChapter(1);
              setVerse(1);
            }}
          >
            {testaments.map((t) => (
              <optgroup key={t} label={t}>
                {books
                  .filter((b) => b.testament === t)
                  .map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-1 flex-col gap-1.5 sm:w-24 sm:flex-none">
          <span className={label}>Chapter</span>
          <select
            className={field}
            value={chapter}
            onChange={(e) => {
              setChapter(Number(e.target.value));
              setVerse(1);
            }}
          >
            {book.verses.map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-1 flex-col gap-1.5 sm:w-24 sm:flex-none">
          <span className={label}>Verse</span>
          <select className={field} value={verse} onChange={(e) => setVerse(Number(e.target.value))}>
            {Array.from({ length: book.verses[chapter - 1] ?? 1 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" aria-label={`Read ${book.title} ${chapter}:${verse}`} className={go}>
          <ChevronRight className="size-5" />
        </button>
      </form>
    </div>
  );
}
