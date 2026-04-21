// app/read/[book]/[chapter]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Verse {
  verse: number;
  text: string;
  new_paragraph: boolean;
}

interface Chapter {
  chapter: number;
  verses: Verse[];
}

interface BookData {
  book: string;
  chapters: Chapter[];
}

export default async function BiblePage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book, chapter } = await params;

  let bookData: BookData;
  try {
    bookData = (await import(`@/data/${book}.json`)).default;
  } catch {
    notFound();
  }

  const chapterNum = parseInt(chapter);
  const totalChapter = bookData.chapters.length;

  const chapterData = bookData!.chapters.find(
    (c) => c.chapter === chapterNum
  );

  if (!chapterData) {
    notFound();
  }

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter = chapterNum < totalChapter ? chapterNum + 1 : null;

  return (
    <main className="max-w-2xl mx-auto p-8">

      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
      ← All Books
      </Link>

      <h1 className="text-3xl font-bold mb-6">
        {bookData!.book} — Chapter {chapterData.chapter}
      </h1>

      <div>
        {chapterData.verses.map((verse) => (
          <p
            key={verse.verse}
            className={`text-lg leading-relaxed ${verse.new_paragraph ? 'mt-6' : 'mt-2'}`}
          >
            <span className="font-bold text-gray-400 mr-2">{verse.verse}</span>
            {verse.text}
          </p>
        ))}
      </div>

      <div className="flex justify-between mt-12 pt-6 border-t">
        {prevChapter ? (
          <Link href={`/read/${book}/${prevChapter}`} className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors">
            ← Chapter {prevChapter}
          </Link>
        ) : <div />}

        <span className="text-sm text-gray-400 self-center">
          {chapterNum} / {totalChapter}
        </span>

        {nextChapter ? (
          <Link href={`/read/${book}/${nextChapter}`} className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors">
            Chapter {nextChapter} →
          </Link>
        ) : <div />}
      </div>
    </main>
  );
}
