import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/components/site-header';
import { searchVerses } from '@/lib/bible';

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `“${q}” — KJV + Apocrypha` : 'Search — KJV + Apocrypha' };
}

// Mark every query word inside a verse, whole words only.
function highlight(text: string, query: string) {
  const words = query.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
  if (words.length === 0) return text;
  const re = new RegExp(
    String.raw`(?<![\p{L}\p{N}])(` + words.map((w) => w.replace(/'/g, "['’]")).join('|') + String.raw`)(?![\p{L}\p{N}])`,
    'giu'
  );
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-sm bg-amber-200/70 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? '').trim();
  const { hits, total } = searchVerses(q);

  return (
    <div className="min-h-screen bg-[var(--paper)] text-stone-900">
      <SiteHeader compact query={q} />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="border-b border-stone-300 pb-2 font-display text-3xl text-[#3b2416] [font-variant-caps:small-caps]">
          {q ? <>Results for &ldquo;{q}&rdquo;</> : 'Search the Bible'}
        </h1>
        <p className="mt-3 font-serif text-lg text-stone-600 italic">
          {!q
            ? 'Type a word or phrase above.'
            : total === 0
              ? 'No verses contain all of those words. Try fewer or different words.'
              : total > hits.length
                ? `${total.toLocaleString()} verses found; showing the first ${hits.length}, exact phrases first.`
                : `${total.toLocaleString()} ${total === 1 ? 'verse' : 'verses'} found.`}
        </p>

        <ol className="mt-8 space-y-6">
          {hits.map((h) => (
            <li key={`${h.slug}-${h.chapter}-${h.verse}`}>
              <Link
                href={`/read/${h.slug}/${h.chapter}#v${h.verse}`}
                className="font-display text-lg text-[#8a5a2b] [font-variant-caps:small-caps] hover:text-[#3b2416] hover:underline hover:underline-offset-4"
              >
                {h.title} {h.chapter}:{h.verse}
              </Link>
              <p className="mt-1 font-serif text-xl leading-relaxed text-stone-800">{highlight(h.text, q)}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
