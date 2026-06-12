import { ChevronRight, ChevronLeft, ArrowLeft, ChevronDown } from 'lucide-react';
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

  // Old Bibles open each chapter with a drop capital in place of the first verse number.
  const [firstVerse] = chapterData.verses;

  // The page and its pictures sit side by side as one centred group.
  return (
    <main className="flex min-h-screen items-start justify-center gap-10 overflow-x-clip bg-[var(--paper)] px-3 py-6 sm:px-6 sm:py-14">
      <article className="w-full max-w-[52rem] min-w-0 border-[3px] border-double border-stone-800 bg-[#fdfbf6] px-6 pt-8 pb-10 text-stone-900 sm:px-12 sm:pt-10 sm:pb-14">

        <nav className="relative flex items-center justify-between font-serif text-base text-stone-600">
          <Link href="/#contents" className="flex items-center gap-2 hover:text-stone-900">
            <ArrowLeft size={18} /> Contents
          </Link>
          <details className="relative">
            <summary className="cursor-pointer list-none hover:text-stone-900">
              <span className="flex items-center gap-1">
                Chapter {chapterNum} of {totalChapter} <ChevronDown size={14} />
              </span>
            </summary>
            <div className="absolute right-0 z-10 mt-2 grid max-h-72 w-72 grid-cols-6 gap-1 overflow-y-auto rounded-md border border-stone-300 bg-[var(--paper)] p-2 shadow-lg">
              {bookData.chapters.map((c) => (
                <Link
                  key={c.chapter}
                  href={`/read/${book}/${c.chapter}`}
                  className={`rounded py-1 text-center tabular-nums hover:bg-stone-200 ${c.chapter === chapterNum ? 'bg-stone-800 text-white hover:bg-stone-800' : ''}`}
                >
                  {c.chapter}
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <header className="mt-10 text-center">
          <h1 className="font-display text-5xl font-semibold text-stone-900 [font-variant-caps:small-caps] sm:text-6xl">
            {bookData.book}
          </h1>
          <p className="mt-3 font-display text-lg tracking-[0.25em] text-stone-700 uppercase">
            Chapter {chapterData.chapter}
          </p>
        </header>

        <div className="mt-10 font-serif text-xl leading-9 text-stone-900">
          {paragraphs.map((verses, pi) => (
            <div key={verses[0].verse}>
              {arts
                .filter((a) => a.from >= verses[0].verse && a.from <= verses[verses.length - 1].verse)
                .map((a) => (
                  <InlinePlate key={a.src} art={a} book={bookData.book} chapter={chapterNum} />
                ))}
              <p
                className={
                  pi === 0
                    ? 'mb-5 first-letter:float-left first-letter:mt-1 first-letter:mr-2 first-letter:font-display first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-stone-900'
                    : 'mb-5 indent-6'
                }
              >
                {verses.map((verse) => (
                  <span
                    key={verse.verse}
                    id={`v${verse.verse}`}
                    data-verse={verse.verse}
                    className="scroll-mt-24 rounded-sm box-decoration-clone transition-colors target:bg-amber-200/60"
                  >
                    {verse !== firstVerse && (
                      <sup className="mr-1 font-sans text-[0.6em] leading-none font-semibold text-stone-800">{verse.verse}</sup>
                    )}
                    {verse.text}
                    {verse.notes.map(() => (
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
              {notes.map((n, i) => (
                <li key={i}>
                  <span className="mr-2 font-sans text-xs text-stone-500 italic">{letter(i)}</span>
                  <a href={`#v${n.verse}`} className="mr-1 tabular-nums text-stone-500 hover:text-stone-900">
                    v{n.verse}
                  </a>{' '}
                  {n.text}
                </li>
              ))}
            </ol>
          </aside>
        )}

        <div className="mt-8 grid grid-cols-3 items-center border-t border-stone-300 pt-5 font-serif text-base text-stone-600">
          {prevChapter ? (
            <Link href={`/read/${book}/${prevChapter}`} className="flex items-center gap-2 justify-self-start rounded px-3 py-1 hover:bg-stone-800/5 hover:text-stone-900">
              <ChevronLeft size={18} /> Chapter {prevChapter}
            </Link>
          ) : <div />}

          <span className="text-center tabular-nums text-stone-400">
            {chapterNum} / {totalChapter}
          </span>

          {nextChapter ? (
            <Link href={`/read/${book}/${nextChapter}`} className="flex items-center gap-2 justify-self-end rounded px-3 py-1 hover:bg-stone-800/5 hover:text-stone-900">
              Chapter {nextChapter} <ChevronRight size={18} />
            </Link>
          ) : <div />}
        </div>
      </article>

      <MarginPlates arts={arts} book={bookData.book} chapter={chapterNum} />
    </main>
  );
}
