'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { NotebookPen, Trash2 } from 'lucide-react';
import { HIGHLIGHTS, removeAnnotation, useAnnotations, type HighlightColor } from '@/lib/annotations';

type Filter = 'all' | 'notes' | HighlightColor;

/** Everything the reader has highlighted or noted, in Bible order. */
export default function HighlightsList({ order }: { order: string[] }) {
  const store = useAnnotations();
  const [filter, setFilter] = useState<Filter>('all');

  const rank = useMemo(() => new Map(order.map((slug, i) => [slug, i])), [order]);
  const all = useMemo(
    () =>
      Object.values(store).sort(
        (a, b) =>
          (rank.get(a.slug) ?? 999) - (rank.get(b.slug) ?? 999) || a.chapter - b.chapter || a.verse - b.verse
      ),
    [store, rank]
  );
  const shown = all.filter((a) => (filter === 'all' ? true : filter === 'notes' ? a.note : a.color === filter));
  const books = shown.reduce<{ book: string; items: typeof shown }[]>((acc, a) => {
    const last = acc[acc.length - 1];
    if (last?.book === a.book) last.items.push(a);
    else acc.push({ book: a.book, items: [a] });
    return acc;
  }, []);

  if (all.length === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed border-stone-300 p-10 text-center font-serif">
        <p className="text-2xl text-stone-800">Nothing highlighted yet.</p>
        <p className="mt-2 text-lg text-stone-600">
          Open a chapter and tap a verse, or select a few words, to highlight it or write a note. It will be kept here.
        </p>
        <Link href="/#contents" className="mt-6 inline-block rounded-md bg-stone-900 px-5 py-2.5 text-lg text-white hover:bg-stone-700">
          Choose a book
        </Link>
      </div>
    );
  }

  const chip = (active: boolean) =>
    `flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-serif text-base transition-colors ${
      active ? 'border-stone-800 bg-stone-900 text-white' : 'border-stone-300 bg-white/60 text-stone-700 hover:border-stone-500'
    }`;

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter">
        <button className={chip(filter === 'all')} onClick={() => setFilter('all')} aria-pressed={filter === 'all'}>
          All <span className="tabular-nums opacity-70">{all.length}</span>
        </button>
        {HIGHLIGHTS.map((h) => {
          const n = all.filter((a) => a.color === h.id).length;
          if (n === 0) return null;
          return (
            <button key={h.id} className={chip(filter === h.id)} onClick={() => setFilter(h.id)} aria-pressed={filter === h.id}>
              <span className="size-3.5 rounded-full" style={{ backgroundColor: h.swatch }} />
              {h.label} <span className="tabular-nums opacity-70">{n}</span>
            </button>
          );
        })}
        {all.some((a) => a.note) && (
          <button className={chip(filter === 'notes')} onClick={() => setFilter('notes')} aria-pressed={filter === 'notes'}>
            <NotebookPen className="size-4" /> Notes <span className="tabular-nums opacity-70">{all.filter((a) => a.note).length}</span>
          </button>
        )}
      </div>

      {books.map(({ book, items }) => (
        <section key={book} className="mt-10">
          <h2 className="border-b border-stone-300 pb-1 font-display text-2xl text-stone-900 [font-variant-caps:small-caps]">{book}</h2>
          <ol className="mt-4 space-y-5">
            {items.map((a) => {
              const colour = HIGHLIGHTS.find((h) => h.id === a.color);
              return (
                <li key={`${a.slug}:${a.chapter}:${a.verse}`} className="group">
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`/read/${a.slug}/${a.chapter}#v${a.verse}`}
                        className="font-display text-lg text-stone-700 [font-variant-caps:small-caps] hover:text-stone-900 hover:underline hover:underline-offset-4"
                      >
                        {a.book} {a.chapter}:{a.verse}
                      </Link>
                      <button
                        onClick={() => removeAnnotation(a.slug, a.chapter, a.verse)}
                        aria-label={`Remove ${a.book} ${a.chapter}:${a.verse}`}
                        className="rounded p-1 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-stone-800 focus-visible:opacity-100"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p
                      className="mt-1 rounded-sm font-serif text-xl leading-relaxed text-stone-800 [box-decoration-break:clone]"
                    >
                      <span style={{ backgroundColor: colour?.wash }}>{a.text}</span>
                    </p>
                    {a.note && (
                      <p className="mt-2 rounded-md border border-stone-200 bg-white/60 px-3 py-2 font-serif text-lg text-stone-700 italic whitespace-pre-line">
                        {a.note}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </>
  );
}
