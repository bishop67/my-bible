'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen, LayoutList, Shuffle, X } from 'lucide-react';
import type * as THREE from 'three';
import type { BookSummary, RandomVerse } from '@/lib/bible';
import { drawCoverTexture, themeFor } from './covers';
import type { SceneParams } from './book-scene';

const BookScene = dynamic(() => import('./book-scene').then((m) => m.BookScene), { ssr: false });

const REST: [number, number, number] = [1.2, 0, 0];
const INTRO: [number, number, number] = [1.6, 0, 0.3];

// Same breakpoints as the template: a wider lens on squarer or very large screens.
function responsiveFov(width: number, height: number) {
  const aspect = width / height;
  if (width < 1024) return aspect < 1 ? 26 : 28;
  if (width <= 1200) return aspect < 1.3 ? 48 : 30;
  if (width * height > 2500000) return aspect > 2 ? 42 : 38;
  return aspect < 1.3 ? 44 : 30;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

function animate(duration: number, step: (t: number) => void, done?: () => void) {
  const start = performance.now();
  const frame = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    step(t);
    if (t < 1) requestAnimationFrame(frame);
    else done?.();
  };
  requestAnimationFrame(frame);
}

export default function BookShowcase({
  library,
  initial,
  initialVerse,
}: {
  library: BookSummary[];
  initial: number;
  initialVerse: RandomVerse | null;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(initial);
  const [params, setParams] = useState<SceneParams>({ rotation: INTRO, scale: 5, cameraFov: 30 });
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [ready, setReady] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [contents, setContents] = useState(false);
  const [opening, setOpening] = useState(false);
  const [verse, setVerse] = useState(initialVerse);
  const [verseVisible, setVerseVisible] = useState(true);
  const busy = useRef(false);
  const textures = useRef(new Map<string, THREE.Texture>());

  const book = library[index];
  const theme = themeFor(book.section);

  const fetchVerse = useCallback(async (slug: string): Promise<RandomVerse | null> => {
    try {
      const res = await fetch(`/api/random-verse?book=${slug}`, { cache: 'no-store' });
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  }, []);

  const shuffle = useCallback(async () => {
    setVerseVisible(false);
    const [v] = await Promise.all([fetchVerse(book.slug), new Promise((r) => setTimeout(r, 250))]);
    if (v) setVerse(v);
    setVerseVisible(true);
  }, [book.slug, fetchVerse]);

  const coverFor = useCallback(
    (b: BookSummary) => {
      let t = textures.current.get(b.slug);
      if (!t) {
        t = drawCoverTexture(b);
        textures.current.set(b.slug, t);
      }
      return t;
    },
    []
  );

  // Covers are drawn with the page fonts, so wait for them before the first paint.
  useEffect(() => {
    let cancelled = false;
    const styles = getComputedStyle(document.documentElement);
    const display = styles.getPropertyValue('--font-playfair');
    const body = styles.getPropertyValue('--font-garamond');
    Promise.all([
      document.fonts.load(`700 100px ${display}`),
      document.fonts.load(`italic 400 40px ${body}`),
      document.fonts.load(`500 40px ${body}`),
      document.fonts.ready,
    ])
      .catch(() => {})
      .then(() => {
        if (!cancelled) setTexture(coverFor(library[initial]));
      });
    return () => {
      cancelled = true;
    };
  }, [coverFor, library, initial]);

  useEffect(() => {
    const resize = () =>
      setParams((p) => ({ ...p, cameraFov: responsiveFov(window.innerWidth, window.innerHeight) }));
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const onReady = useCallback(() => {
    setReady(true);
    requestAnimationFrame(() => setTextVisible(true));
    animate(
      1000,
      (t) => {
        const e = easeInOutCubic(t);
        setParams((p) => ({
          ...p,
          rotation: [
            INTRO[0] + (REST[0] - INTRO[0]) * e,
            INTRO[1] + (REST[1] - INTRO[1]) * e,
            INTRO[2] + (REST[2] - INTRO[2]) * e,
          ],
        }));
      },
    );
  }, []);

  const go = useCallback(
    (target: number, direction: 1 | -1) => {
      if (busy.current || target === index) return;
      busy.current = true;
      setTextVisible(false);
      const startZ = params.rotation[2];
      let swapped = false;
      const nextVerse = fetchVerse(library[target].slug);
      animate(
        800,
        (t) => {
          const spin = easeOutCubic(t) * Math.PI * 2 * direction;
          setParams((p) => ({ ...p, rotation: [p.rotation[0], p.rotation[1], startZ + spin] }));
          if (t >= 0.3 && !swapped) {
            swapped = true;
            setIndex(target);
            setTexture(coverFor(library[target]));
            nextVerse.then((v) => {
              setVerse(v);
              setTextVisible(true);
            });
          }
        },
        () => {
          setParams((p) => ({ ...p, rotation: [p.rotation[0], p.rotation[1], startZ] }));
          busy.current = false;
        }
      );
    },
    [index, params.rotation, coverFor, library, fetchVerse]
  );

  const next = useCallback(() => go((index + 1) % library.length, 1), [go, index, library.length]);
  const prev = useCallback(
    () => go((index - 1 + library.length) % library.length, -1),
    [go, index, library.length]
  );

  // "Open" the book: tip it towards the camera while the notebook page wipes in.
  const open = useCallback(
    (chapter = 1) => {
      if (busy.current) return;
      busy.current = true;
      setContents(false);
      const href = `/read/${book.slug}/${chapter}`;
      router.prefetch(href);
      setOpening(true);
      setTextVisible(false);
      const start = params.rotation;
      animate(
        700,
        (t) => {
          const e = easeInOutCubic(t);
          setParams((p) => ({
            ...p,
            scale: 5 + e * 1.5,
            rotation: [start[0] + (Math.PI / 2 - start[0]) * e, start[1], start[2]],
          }));
        },
        () => router.push(href)
      );
    },
    [book.slug, params.rotation, router]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (contents) {
        if (e.key === 'Escape') setContents(false);
        return;
      }
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Enter') open();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, open, contents]);

  useEffect(() => {
    history.replaceState(null, '', index === 0 ? '/' : `/?book=${book.slug}`);
  }, [index, book.slug]);

  const sections = library.reduce<Record<string, Record<string, { b: BookSummary; i: number }[]>>>(
    (acc, b, i) => {
      ((acc[b.testament] ??= {})[b.section] ??= []).push({ b, i });
      return acc;
    },
    {}
  );

  return (
    <div
      className="relative min-h-screen overflow-hidden text-stone-900 transition-colors duration-700 ease-out"
      style={{ backgroundColor: theme.page }}
    >
      <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between p-4">
        <button onClick={prev} aria-label="Previous book" className="showcase-btn">
          <ChevronLeft className="size-4" />
        </button>
        <button onClick={() => setContents(true)} className="showcase-btn gap-2 px-4 font-serif text-base">
          <LayoutList className="size-4" /> Contents
        </button>
        <button onClick={next} aria-label="Next book" className="showcase-btn">
          <ChevronRight className="size-4" />
        </button>
      </nav>

      <div className="mx-auto max-w-[1500px]">
        <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2">
          <div
            className="h-[50vh] w-full shrink-0 transition-opacity duration-500 lg:h-screen"
            style={{ opacity: ready ? 1 : 0 }}
          >
            <BookScene params={params} texture={texture} onReady={onReady} />
          </div>

          <div className="flex-1 lg:flex lg:h-screen lg:items-center">
            <div
              className="mx-auto max-w-2xl space-y-6 p-8 transition-opacity duration-700 ease-out lg:px-0 lg:py-12 lg:pr-9"
              style={{ opacity: textVisible ? 1 : 0 }}
            >
              <div className="space-y-2">
                <h1 className="font-display text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl" style={{ color: theme.leather }}>
                  {book.title}
                </h1>
                <p className="font-serif text-lg text-black/60 italic">
                  {book.section}, {book.testament}
                </p>
              </div>

              <figure
                className="max-w-xl transition-[opacity,filter] duration-300 ease-out"
                style={{ opacity: verseVisible ? 1 : 0, filter: verseVisible ? 'none' : 'blur(4px)' }}
              >
                {verse && (
                  <>
                    <blockquote className="font-serif text-2xl leading-relaxed text-pretty text-black/80 italic">
                      &ldquo;{verse.text}&rdquo;
                    </blockquote>
                    <figcaption className="mt-3 flex items-center gap-3 text-sm">
                      <Link
                        href={`/read/${book.slug}/${verse.chapter}/${verse.verse}`}
                        className="font-medium text-black/60 underline decoration-black/20 underline-offset-4 hover:text-black hover:decoration-black/60"
                      >
                        {book.title} {verse.chapter}:{verse.verse}
                      </Link>
                      <button
                        onClick={shuffle}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-black/50 transition-colors hover:bg-black/5 hover:text-black"
                      >
                        <Shuffle className="size-3.5" /> Another verse
                      </button>
                    </figcaption>
                  </>
                )}
              </figure>

              <button
                onClick={() => open()}
                className="flex w-full max-w-sm items-center justify-center gap-2 rounded-md px-8 py-3 font-medium text-white shadow-[0_6px_16px_-6px_rgb(0_0_0/0.45)] transition-[filter,transform] hover:brightness-125 active:translate-y-px"
                style={{ backgroundColor: theme.leather }}
              >
                <BookOpen className="size-5" /> Open {book.title}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="fixed inset-x-0 bottom-4 hidden justify-center gap-4 text-sm text-black/50 lg:flex">
        <span><kbd className="font-sans text-xs">←</kbd> <kbd className="font-sans text-xs">→</kbd> browse</span>
        <span><kbd className="font-sans text-xs">Enter</kbd> open</span>
        <span>drag to turn the book</span>
      </p>

      {contents && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f7f3ea]/95 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl p-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-3xl font-semibold">Contents</h2>
              <button onClick={() => setContents(false)} aria-label="Close" className="showcase-btn">
                <X className="size-4" />
              </button>
            </div>
            {Object.entries(sections).map(([testament, groups]) => (
              <section key={testament} className="mb-10">
                <h3 className="mb-4 border-b border-black/15 pb-2 font-display text-2xl">{testament}</h3>
                {Object.entries(groups).map(([section, books]) => (
                  <div key={section} className="mb-5">
                    <h4 className="mb-2 text-xs font-semibold tracking-widest text-black/40 uppercase">{section}</h4>
                    <div className="flex flex-wrap gap-2">
                      {books.map(({ b, i }) => (
                        <button
                          key={b.slug}
                          onClick={() => {
                            setContents(false);
                            go(i, i > index ? 1 : -1);
                          }}
                          className="rounded border px-3 py-1.5 font-serif text-base transition-colors hover:bg-black/5"
                          style={{
                            borderColor: themeFor(b.section).leather + '55',
                            background: i === index ? themeFor(b.section).leather + '1a' : undefined,
                          }}
                        >
                          {b.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
      )}

      {/* Notebook paper that wipes in from the book as it opens. */}
      <div
        aria-hidden
        className="paper-ruled pointer-events-none fixed inset-0 z-50 [--rule-offset:0.4rem]"
        style={{
          clipPath: opening ? 'circle(150% at 25% 50%)' : 'circle(0% at 25% 50%)',
          transition: 'clip-path 700ms cubic-bezier(0.65, 0, 0.35, 1) 150ms',
        }}
      />
    </div>
  );
}
