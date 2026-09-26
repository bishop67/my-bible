'use client';

import { useEffect, useState } from 'react';

export type Artwork = {
  from: number;
  to: number;
  title: string;
  artist: string;
  year: number;
  src: string;
  width: number;
  height: number;
  page: string;
  credit?: string;
};

type Props = { book: string; chapter: number };

const link = 'underline decoration-stone-300 underline-offset-2 hover:text-stone-800';

function Plate({ art, book, chapter }: Props & { art: Artwork }) {
  return (
    <figure className="relative -rotate-[0.6deg] bg-white p-3 pb-4 shadow-[0_10px_24px_-12px_rgb(28_25_23/0.45)]">
      <span className="absolute -top-2.5 left-6 h-5 w-16 -rotate-6 bg-amber-100/70 shadow-sm" />
      <span className="absolute -top-2.5 right-6 h-5 w-16 rotate-6 bg-amber-100/70 shadow-sm" />
      <img
        src={art.src}
        width={art.width}
        height={art.height}
        alt={`${art.title}, by ${art.artist}`}
        loading="lazy"
        decoding="async"
        className="block max-h-[65vh] w-full object-contain"
      />
      <figcaption className="mt-3 font-serif leading-snug text-stone-700">
        <span className="block text-lg italic">{art.title}</span>
        <span className="block text-sm text-stone-500">
          {art.artist}, {art.year} ·{' '}
          <a href={`#v${art.from}`} className={link}>
            {book} {chapter}:{art.from}{art.to > art.from && `–${art.to}`}
          </a>{' '}
          ·{' '}
          <a href={art.page} target="_blank" rel="noopener noreferrer" className={link}>source</a>
        </span>
        {art.credit && <span className="mt-0.5 block text-xs text-stone-500">{art.credit}</span>}
      </figcaption>
    </figure>
  );
}

export function InlinePlate(props: Props & { art: Artwork }) {
  return (
    <div className="mx-auto my-8 max-w-md xl:hidden">
      <Plate {...props} />
    </div>
  );
}

export function MarginPlates({ arts, book, chapter }: Props & { arts: Artwork[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (arts.length < 2) return;
    const verses = [...document.querySelectorAll<HTMLElement>('[data-verse]')];
    const update = () => {
      const reading = verses.findLast((el) => el.getBoundingClientRect().top <= innerHeight / 3);
      const verse = reading ? Number(reading.dataset.verse) : 1;
      setActive(Math.max(0, arts.findLastIndex((a) => a.from <= verse)));
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
    };
  }, [arts]);

  if (arts.length === 0) return null;

  return (
    <aside className="hidden w-80 shrink-0 self-stretch xl:block 2xl:w-96">
      <div className="sticky top-10 grid">
        {arts.map((art, i) => (
          <div
            key={art.src}
            inert={i !== active}
            className={`col-start-1 row-start-1 transition-[opacity,filter] duration-500 ease-out ${i === active ? '' : 'opacity-0 blur-[4px]'}`}
          >
            <Plate art={art} book={book} chapter={chapter} />
          </div>
        ))}
        {arts.length > 1 && (
          <p className="mt-3 text-center font-serif text-sm text-stone-500 italic">
            Picture {active + 1} of {arts.length} in this chapter
          </p>
        )}
      </div>
    </aside>
  );
}
