import BookShowcase from '@/components/book-showcase/book-showcase';
import { getLibrary, randomVerse } from '@/lib/bible';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ book?: string }>;
}) {
  const { book } = await searchParams;
  const library = getLibrary();
  const initial = Math.max(0, library.findIndex((b) => b.slug === book));

  return (
    <BookShowcase library={library} initial={initial} initialVerse={randomVerse(library[initial].slug)} />
  );
}
