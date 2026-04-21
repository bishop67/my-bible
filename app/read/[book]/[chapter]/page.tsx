import { SquareChevronRight, SquareChevronLeft, SquareChevronDown } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

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
    const filePath = path.join(process.cwd(), 'data', 'bible', `${book}.json`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    bookData = JSON.parse(fileContents);
  } catch (e) {
    console.error('File error:', e);
    notFound();
  }
  const chapterNum = parseInt(chapter);
  const totalChapter = bookData!.chapters.length;

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
      <Link href="/" className="flex flex-row items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-6">
        <SquareChevronDown size={24} /> All Books
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
          <Link href={`/read/${book}/${prevChapter}`} className="flex flex-row items-center gap-2 text-sm px-4 py-2 border rounded hover:bg-gray-100 transition-colors">
            <SquareChevronLeft size={24} /> Chapter {prevChapter}
          </Link>
        ) : <div />}

        <span className="text-sm text-gray-400 self-center">
          {chapterNum} / {totalChapter}
        </span>

        {nextChapter ? (
          <Link href={`/read/${book}/${nextChapter}`} className="flex flex-row items-center gap-2 text-sm px-4 py-2 border rounded hover:bg-gray-100 transition-colors">
            Chapter {nextChapter} <SquareChevronRight size={24} />
          </Link>
        ) : <div />}
      </div>
    </main>
  );
}
