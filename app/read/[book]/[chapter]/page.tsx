// app/read/[book]/[chapter]/page.tsx
import { notFound } from 'next/navigation';

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

  const chapterData = bookData!.chapters.find(
    (c) => c.chapter === parseInt(chapter)
  );

  if (!chapterData) {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
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
    </main>
  );
}
