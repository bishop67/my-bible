'use client';

import { useEffect, useState } from 'react';
import type { Artwork } from '@/lib/art';

// A print taped beside the page, with its caption.
function Plate({ art, reference }: { art: Artwork; reference: string }) {
  return (
    <figure className="relative -rotate-[0.6deg] bg-white p-3 pb-4 shadow-[0_10px_24px_-12px_rgb(28_25_23/0.45)]">
      {/* Two strips of tape holding the print down. */}
      <span aria-hidden className="absolute -top-2.5 left-6 h-5 w-16 -rotate-6 bg-amber-100/70 shadow-sm" />
      <span aria-hidden className="absolute -top-2.5 right-6 h-5 w-16 rotate-6 bg-amber-100/70 shadow-sm" />
      {/* eslint-disable-next-line @next/next/no-img-element -- remote Commons thumbnails, already sized */}
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
          <a href={`#v${art.from}`} className="underline decoration-stone-300 underline-offset-2 hover:text-stone-800">
            {reference}
          </a>{' '}
          ·{' '}
          <a
            href={art.page}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-stone-300 underline-offset-2 hover:text-stone-800"
          >
            source
          </a>
        </span>
      </figcaption>
    </figure>
  );
}

const refFor = (art: Artwork, book: string, chapter: number) =>
  `${book} ${chapter}:${art.from}${art.to > art.from ? `–${art.to}` : ''}`;

/** Inline plate, shown before the paragraph where its passage begins (narrower screens). */
export function InlinePlate({ art, book, chapter }: { art: Artwork; book: string; chapter: number }) {
  return (
    <div className="mx-auto my-8 max-w-md xl:hidden">
      <Plate art={art} reference={refFor(art, book, chapter)} />
    </div>
  );
}

/**
 * Column of pictures beside the page (wide screens). It follows the reader: whichever
 * passage is at the top of the viewport decides which picture is shown.
 */
export function MarginPlates({ arts, book, chapter }: { arts: Artwork[]; book: string; chapter: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (arts.length < 2) return;
    const verses = [...document.querySelectorAll<HTMLElement>('[data-verse]')];
    const update = () => {
      // The last verse whose top has scrolled past a third of the viewport is "being read".
      const line = window.innerHeight / 3;
      let current = 1;
      for (const el of verses) {
        if (el.getBoundingClientRect().top <= line) current = Number(el.dataset.verse);
        else break;
      }
      let pick = 0;
      arts.forEach((a, i) => {
        if (a.from <= current) pick = i;
      });
      setActive(pick);
    };
    const frame = requestAnimationFrame(update);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
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
            className="col-start-1 row-start-1 transition-[opacity,filter] duration-500 ease-out"
            style={{ opacity: i === active ? 1 : 0, filter: i === active ? 'none' : 'blur(4px)' }}
          >
            <Plate art={art} reference={refFor(art, book, chapter)} />
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
