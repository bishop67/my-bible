import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadBook } from '@/lib/bible';
import VerseView from '@/components/verse-view';

type Params = Promise<{ book: string; chapter: string; verse: string }>;

function find(book: string, chapter: string, verse: string) {
  const data = loadBook(book);
  const ch = data?.chapters.find((c) => c.chapter === parseInt(chapter));
  const i = ch?.verses.findIndex((v) => v.verse === parseInt(verse)) ?? -1;
  if (!data || !ch || i < 0) return null;
  return { data, ch, i };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { book, chapter, verse } = await params;
  const found = find(book, chapter, verse);
  if (!found) return {};
  const v = found.ch.verses[found.i];
  return {
    title: `${found.data.book} ${found.ch.chapter}:${v.verse} — KJV Bible`,
    description: v.text,
  };
}

export default async function VersePage({ params }: { params: Params }) {
  const { book, chapter, verse } = await params;
  const found = find(book, chapter, verse);
  if (!found) notFound();

  const { data, ch, i } = found;
  const base = `/read/${book}/${ch.chapter}`;

  return (
    <VerseView
      // Fresh component per verse so the context panel and "Copied" state reset.
      key={`${book}-${ch.chapter}-${ch.verses[i].verse}`}
      title={data.book}
      chapter={ch.chapter}
      verse={ch.verses[i]}
      chapterHref={base}
      prevHref={i > 0 ? `${base}/${ch.verses[i - 1].verse}` : null}
      nextHref={i < ch.verses.length - 1 ? `${base}/${ch.verses[i + 1].verse}` : null}
      context={ch.verses.slice(Math.max(0, i - 3), i + 4)}
    />
  );
}
