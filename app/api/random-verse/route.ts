import { randomVerse } from '@/lib/bible';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('book') ?? '';
  const verse = randomVerse(slug);
  if (!verse) return Response.json({ error: 'Unknown book' }, { status: 404 });
  return Response.json(verse, { headers: { 'Cache-Control': 'no-store' } });
}
