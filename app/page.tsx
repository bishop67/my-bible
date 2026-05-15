import BookShowcase from '@/components/book-showcase/book-showcase';
import { verseOfTheDay } from '@/lib/bible';

// Rendered per request so the verse turns over at midnight without a rebuild.
export const dynamic = 'force-dynamic';

export default function Home() {
  return <BookShowcase verse={verseOfTheDay()} />;
}
