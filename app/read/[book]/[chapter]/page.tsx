import { SquareChevronRight, SquareChevronLeft, ChevronDown, Bookmark } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import art from '@/data/art.json';
import { getBook, slugs, type Verse } from '@/lib/bible';
import { InlinePlate, MarginPlates, type Artwork } from '@/components/chapter-art';
import VerseTools from '@/components/verse-tools';
import ContinueReading from '@/components/continue-reading';
import SiteFooter from '@/components/site-footer';

type Props = { params: Promise<{ book: string; chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book, chapter } = await params;
  const data = getBook(book);
  return { title: data ? `${data.title} ${parseInt(chapter)}` : 'Holy Bible' };
}

export default async function ChapterPage({ params }: Props) {
  const { book, chapter } = await params;
  const data = getBook(book);
  const n = parseInt(chapter);
  const current = data?.chapters.find((c) => c.chapter === n);
  if (!data || !current) notFound();

  const total = data.chapters.length;
  const i = slugs.indexOf(book);
  const prevBook = getBook(slugs[i - 1]);
  const nextBook = getBook(slugs[i + 1]);
  const prev = n > 1 ? { book: data, chapter: n - 1 } : prevBook && { book: prevBook, chapter: prevBook.chapters.length };
  const next = n < total ? { book: data, chapter: n + 1 } : nextBook && { book: nextBook, chapter: 1 };
  const prevHref = prev && `/read/${prev.book.slug}/${prev.chapter}`;
  const nextHref = next && `/read/${next.book.slug}/${next.chapter}`;

  const paragraphs: Verse[][] = [];
  for (const v of current.verses) {
    if (v.new_paragraph || paragraphs.length === 0) paragraphs.push([]);
    paragraphs.at(-1)!.push(v);
  }

  const arts: Artwork[] = (art as Record<string, Record<string, Artwork[]>>)[book]?.[n] ?? [];
  const notes = current.verses.flatMap((v) => v.notes.map((text) => ({ verse: v.verse, text })));
  const letter = (i: number) => String.fromCharCode(97 + (i % 26));
  let noteIndex = 0;

  return (
    <>
      <main className="flex min-h-screen items-start justify-center gap-10 overflow-x-clip bg-[var(--paper)] px-3 py-6 sm:px-6 sm:py-14">
        <article className="w-full max-w-[52rem] min-w-0 border-[3px] border-double border-stone-800 bg-[#fdfbf6] px-6 pt-8 pb-10 text-stone-900 sm:px-12 sm:pt-10 sm:pb-14">
          <nav className="flex items-center justify-between font-serif text-base text-stone-600">
            <div className="flex items-center gap-5">
              <Link href="/#contents" className="flex items-center gap-2 hover:text-stone-900">
                <SquareChevronLeft size={18} /> Contents
              </Link>
              <Link href="/highlights" className="flex items-center gap-1.5 hover:text-stone-900">
                <Bookmark size={16} /> Highlights
              </Link>
            </div>
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-stone-900">
                Chapter {n} of {total} <ChevronDown size={14} />
              </summary>
              <div className="absolute right-0 z-10 mt-2 grid max-h-72 w-72 grid-cols-6 gap-1 overflow-y-auto rounded-md border border-stone-300 bg-[var(--paper)] p-2 shadow-lg">
                {data.chapters.map((c) => (
                  <Link
                    key={c.chapter}
                    href={`/read/${book}/${c.chapter}`}
                    className={`rounded py-1 text-center tabular-nums ${c.chapter === n ? 'bg-stone-800 text-white' : 'hover:bg-stone-200'}`}
                  >
                    {c.chapter}
                  </Link>
                ))}
              </div>
            </details>
          </nav>

          <header className="mt-10 text-center">
            <h1 className="font-display text-5xl font-semibold text-stone-900 [font-variant-caps:small-caps] sm:text-6xl">
              {data.title}
            </h1>
            <p className="mt-3 font-display text-lg tracking-[0.25em] text-stone-700 uppercase">Chapter {n}</p>
          </header>

          <div className="mt-10 font-serif text-xl leading-9 text-stone-900">
            {paragraphs.map((verses, pi) => (
              <div key={verses[0].verse}>
                {arts
                  .filter((a) => a.from >= verses[0].verse && a.from <= verses.at(-1)!.verse)
                  .map((a) => <InlinePlate key={a.src} art={a} book={data.title} chapter={n} />)}
                <p
                  className={
                    pi === 0
                      ? 'mb-5 first-letter:float-left first-letter:mt-1 first-letter:mr-2 first-letter:font-display first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-stone-900'
                      : 'mb-5 indent-6'
                  }
                >
                  {verses.map((v) => (
                    <span key={v.verse} id={`v${v.verse}`} data-verse={v.verse} className="scroll-mt-24 target:bg-amber-200/60">
                      {v !== current.verses[0] && (
                        <sup className="mr-1 font-sans text-[0.6em] leading-none font-semibold text-stone-800">{v.verse}</sup>
                      )}
                      {v.text}
                      {v.notes.map(() => (
                        <sup key={noteIndex} className="ml-0.5 font-sans text-[0.6em] leading-none text-stone-500 italic">
                          {letter(noteIndex++)}
                        </sup>
                      ))}{' '}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>

          {notes.length > 0 && (
            <aside className="mt-8 border-t border-stone-300 pt-5 font-serif text-base leading-7 text-stone-600">
              <h2 className="font-display text-sm tracking-[0.2em] text-stone-700 uppercase">Notes</h2>
              <ol className="mt-2">
                {notes.map((note, i) => (
                  <li key={i}>
                    <span className="mr-2 font-sans text-xs text-stone-500 italic">{letter(i)}</span>
                    <a href={`#v${note.verse}`} className="mr-1 tabular-nums text-stone-500 hover:text-stone-900">
                      v{note.verse}
                    </a>{' '}
                    {note.text}
                  </li>
                ))}
              </ol>
            </aside>
          )}

          <div className="mt-8 grid grid-cols-3 items-center border-t border-stone-300 pt-5 font-serif text-base text-stone-600">
            {prev ? (
              <Link href={prevHref!} className="flex items-center gap-2 justify-self-start rounded border border-stone-300 px-4 py-2 text-sm transition-colors hover:bg-stone-100 hover:text-stone-900">
                <SquareChevronLeft size={24} /> {prev.book === data ? `Chapter ${prev.chapter}` : `${prev.book.title} ${prev.chapter}`}
              </Link>
            ) : <div />}
            <span className="text-center tabular-nums text-stone-400">{n} / {total}</span>
            {next ? (
              <Link href={nextHref!} className="flex items-center gap-2 justify-self-end rounded border border-stone-300 px-4 py-2 text-sm transition-colors hover:bg-stone-100 hover:text-stone-900">
                {next.book === data ? `Chapter ${next.chapter}` : `${next.book.title} ${next.chapter}`} <SquareChevronRight size={24} />
              </Link>
            ) : <div />}
          </div>
          <div id="chapter-end" />
        </article>

        <MarginPlates arts={arts} book={data.title} chapter={n} />
        <ContinueReading key={`${book}-${n}`} next={nextHref} prev={prevHref && `${prevHref}#chapter-end`} />
        <VerseTools slug={book} book={data.title} chapter={n} verses={current.verses.map(({ verse, text }) => ({ verse, text }))} />
      </main>
      <SiteFooter />
    </>
  );
}
