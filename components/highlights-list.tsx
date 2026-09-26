'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NotebookPen, Trash2 } from 'lucide-react';
import { COLORS, annotate, useAnnotations, type Annotation } from '@/lib/annotations';

const chip = (active: boolean) =>
  `flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-serif text-base transition-colors ${
    active ? 'border-stone-800 bg-stone-900 text-white' : 'border-stone-300 bg-white/60 text-stone-700 hover:border-stone-500'
  }`;

export default function HighlightsList({ order }: { order: string[] }) {
  const store = useAnnotations();
  const [filter, setFilter] = useState('all');

  const all = Object.values(store).sort(
    (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug) || a.chapter - b.chapter || a.verse - b.verse
  );
  const notes = all.filter((a) => a.note);
  const shown = filter === 'all' ? all : filter === 'notes' ? notes : all.filter((a) => a.color === filter);

  const books: { book: string; items: Annotation[] }[] = [];
  for (const a of shown) {
    if (books.at(-1)?.book === a.book) books.at(-1)!.items.push(a);
    else books.push({ book: a.book, items: [a] });
  }

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

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        <button className={chip(filter === 'all')} onClick={() => setFilter('all')}>
          All <span className="tabular-nums opacity-70">{all.length}</span>
        </button>
        {COLORS.map((c) => {
          const n = all.filter((a) => a.color === c.id).length;
          return n > 0 && (
            <button key={c.id} className={chip(filter === c.id)} onClick={() => setFilter(c.id)}>
              <span className="size-3.5 rounded-full" style={{ backgroundColor: c.swatch }} />
              {c.label} <span className="tabular-nums opacity-70">{n}</span>
            </button>
          );
        })}
        {notes.length > 0 && (
          <button className={chip(filter === 'notes')} onClick={() => setFilter('notes')}>
            <NotebookPen className="size-4" /> Notes <span className="tabular-nums opacity-70">{notes.length}</span>
          </button>
        )}
      </div>

      {books.map(({ book, items }) => (
        <section key={book} className="mt-10">
          <h2 className="border-b border-stone-300 pb-1 font-display text-2xl text-stone-900 [font-variant-caps:small-caps]">{book}</h2>
          <ol className="mt-4 space-y-5">
            {items.map((a) => (
              <li key={`${a.slug}:${a.chapter}:${a.verse}`} className="group">
                <div className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/read/${a.slug}/${a.chapter}#v${a.verse}`}
                    className="font-display text-lg text-stone-700 [font-variant-caps:small-caps] hover:text-stone-900 hover:underline hover:underline-offset-4"
                  >
                    {a.book} {a.chapter}:{a.verse}
                  </Link>
                  <button
                    onClick={() => annotate([a], { color: undefined, note: '' })}
                    aria-label={`Remove ${a.book} ${a.chapter}:${a.verse}`}
                    className="rounded p-1 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-stone-800 focus-visible:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="mt-1 font-serif text-xl leading-relaxed text-stone-800">
                  <span data-hl={a.color}>{a.text}</span>
                </p>
                {a.note && (
                  <p className="mt-2 rounded-md border border-stone-200 bg-white/60 px-3 py-2 font-serif text-lg text-stone-700 italic whitespace-pre-line">
                    {a.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
