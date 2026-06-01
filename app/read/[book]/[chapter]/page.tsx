import { SquareChevronRight, SquareChevronLeft, ArrowLeft, ChevronDown } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadBook, type Verse } from '@/lib/bible';
import { chapterArt } from '@/lib/art';
import { InlinePlate, MarginPlates } from '@/components/chapter-art';

export default async function BiblePage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book, chapter } = await params;

  const bookData = loadBook(book);
  if (!bookData) notFound();

  const chapterNum = parseInt(chapter);
  const totalChapter = bookData.chapters.length;
  const chapterData = bookData.chapters.find((c) => c.chapter === chapterNum);
  if (!chapterData) notFound();

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter = chapterNum < totalChapter ? chapterNum + 1 : null;

  // Group verses into the paragraphs marked in the source text.
  const paragraphs = chapterData.verses.reduce<Verse[][]>((acc, verse) => {
    if (verse.new_paragraph || acc.length === 0) acc.push([]);
    acc[acc.length - 1].push(verse);
    return acc;
  }, []);

  const arts = chapterArt(book, chapterNum);

  // Translators' notes are lettered through the chapter and listed at the foot of the page.
  const notes = chapterData.verses.flatMap((v) => v.notes.map((text) => ({ verse: v.verse, text })));
  const letter = (i: number) => String.fromCharCode(97 + (i % 26));
  let noteIndex = 0;

  return (
    <main className="paper-ruled relative min-h-screen overflow-x-clip [--rule-offset:-0.4rem]">
      <MarginPlates arts={arts} book={bookData.book} chapter={chapterNum} />
      <div className="mx-auto max-w-2xl px-5 pt-[var(--line)] pb-[calc(var(--line)*3)] pl-10 text-stone-800 sm:pl-5">
        <nav className="flex h-[var(--line)] items-center justify-between text-base text-stone-500">
          <Link href="/#contents" className="flex items-center gap-2 hover:text-stone-800">
            <ArrowLeft size={18} /> Contents
          </Link>
          <details className="relative">
            <summary className="cursor-pointer list-none hover:text-stone-800">
              <span className="flex items-center gap-1">
                Chapter {chapterNum} of {totalChapter} <ChevronDown size={14} />
              </span>
            </summary>
            <div className="absolute right-0 z-10 mt-2 grid max-h-72 w-72 grid-cols-6 gap-1 overflow-y-auto rounded-md border border-stone-300 bg-[var(--paper)] p-2 shadow-lg">
              {bookData.chapters.map((c) => (
                <Link
                  key={c.chapter}
                  href={`/read/${book}/${c.chapter}`}
                  className={`rounded py-1 text-center tabular-nums hover:bg-stone-200 ${c.chapter === chapterNum ? 'bg-stone-800 text-white hover:bg-stone-700' : ''}`}
                >
                  {c.chapter}
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <header className="mt-[var(--line)]">
          <h1 className="font-display text-5xl leading-[calc(var(--line)*2)] font-semibold text-balance">
            {bookData.book}
          </h1>
          <p className="font-serif text-xl leading-[var(--line)] text-stone-500 italic">
            Chapter {chapterData.chapter}
          </p>
        </header>

        <div className="mt-[var(--line)] font-serif text-xl leading-[var(--line)]">
          {paragraphs.map((verses) => (
            <div key={verses[0].verse}>
            {arts
              .filter((a) => a.from >= verses[0].verse && a.from <= verses[verses.length - 1].verse)
              .map((a) => (
                <InlinePlate key={a.src} art={a} book={bookData.book} chapter={chapterNum} />
              ))}
            <p className="mb-[var(--line)] indent-6">
              {verses.map((verse) => (
                <span
                  key={verse.verse}
                  id={`v${verse.verse}`}
                  data-verse={verse.verse}
                  className="scroll-mt-24 rounded-sm box-decoration-clone transition-colors target:bg-amber-200/60"
                >
                  <sup className="mr-1 font-sans text-[0.6em] leading-none font-semibold text-rose-700/80">{verse.verse}</sup>
                  {verse.text}
                  {verse.notes.map(() => (
                    <sup key={noteIndex} className="ml-0.5 font-sans text-[0.6em] leading-none text-sky-700/80 italic">
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
          <aside className="font-serif text-base leading-[var(--line)] text-stone-600">
            <h2 className="font-display text-lg leading-[var(--line)] font-semibold text-stone-700">Notes</h2>
            <ol>
              {notes.map((n, i) => (
                <li key={i}>
                  <span className="mr-2 font-sans text-xs text-sky-700/80 italic">{letter(i)}</span>
                  <a href={`#v${n.verse}`} className="mr-1 tabular-nums text-stone-500 hover:text-stone-800">
                    v{n.verse}
                  </a>{' '}
                  {n.text}
                </li>
              ))}
            </ol>
          </aside>
        )}

        <div className="grid h-[calc(var(--line)*2)] grid-cols-3 items-center text-base">
          {prevChapter ? (
            <Link href={`/read/${book}/${prevChapter}`} className="flex items-center gap-2 justify-self-start rounded px-3 py-1 hover:bg-stone-800/5">
              <SquareChevronLeft size={20} /> Chapter {prevChapter}
            </Link>
          ) : <div />}

          <span className="text-center text-stone-400 tabular-nums">
            {chapterNum} / {totalChapter}
          </span>

          {nextChapter ? (
            <Link href={`/read/${book}/${nextChapter}`} className="flex items-center gap-2 justify-self-end rounded px-3 py-1 hover:bg-stone-800/5">
              Chapter {nextChapter} <SquareChevronRight size={20} />
            </Link>
          ) : <div />}
        </div>
      </div>
    </main>
  );
}
