'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import type * as THREE from 'three';
import type { DailyVerse } from '@/lib/bible';
import { drawBibleCover } from './covers';
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

export default function BookShowcase({ verse }: { verse: DailyVerse | null }) {
  const router = useRouter();
  const [params, setParams] = useState<SceneParams>({ rotation: INTRO, scale: 5, cameraFov: 30 });
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const busy = useRef(false);

  // The cover is lettered with the page font, so wait for it before drawing.
  useEffect(() => {
    let cancelled = false;
    const display = getComputedStyle(document.documentElement).getPropertyValue('--font-playfair');
    Promise.all([document.fonts.load(`600 64px ${display}`), document.fonts.ready])
      .catch(() => {})
      .then(() => {
        if (!cancelled) setTexture(drawBibleCover());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const resize = () =>
      setParams((p) => ({ ...p, cameraFov: responsiveFov(window.innerWidth, window.innerHeight) }));
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const onReady = useCallback(() => {
    setReady(true);
    animate(1000, (t) => {
      const e = easeInOutCubic(t);
      setParams((p) => ({
        ...p,
        rotation: [
          INTRO[0] + (REST[0] - INTRO[0]) * e,
          INTRO[1] + (REST[1] - INTRO[1]) * e,
          INTRO[2] + (REST[2] - INTRO[2]) * e,
        ],
      }));
    });
  }, []);

  // "Open" the Bible: tip it towards the camera while the notebook page wipes in.
  const open = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    router.prefetch('/books');
    setOpening(true);
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
      () => router.push('/books')
    );
  }, [params.rotation, router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#ece6da] text-stone-900">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2">
          <div
            className="h-[50vh] w-full shrink-0 transition-opacity duration-500 lg:h-screen"
            style={{ opacity: ready ? 1 : 0 }}
          >
            <BookScene params={params} texture={texture} onReady={onReady} />
          </div>

          <div className="flex-1 lg:flex lg:h-screen lg:items-center">
            <div className="mx-auto max-w-2xl space-y-10 p-8 lg:px-0 lg:py-12 lg:pr-9">
              <div className="space-y-3">
                <h1 className="font-display text-5xl leading-[1.05] font-semibold text-balance sm:text-7xl">
                  KJV + Apocrypha
                </h1>
                <p className="font-serif text-xl text-stone-600 italic">
                  The King James Bible, with the books between the Testaments.
                </p>
              </div>

              {verse && (
                <figure className="max-w-xl border-l border-stone-400/60 pl-6">
                  <blockquote className="font-serif text-2xl leading-relaxed text-pretty text-stone-800 italic">
                    &ldquo;{verse.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-3 font-serif text-base text-stone-600">
                    <Link
                      href={`/read/${verse.slug}/${verse.chapter}#v${verse.verse}`}
                      className="underline decoration-stone-400 underline-offset-4 hover:text-stone-900 hover:decoration-stone-700"
                    >
                      {verse.title} {verse.chapter}:{verse.verse}
                    </Link>
                    <span className="text-stone-500"> · verse for {verse.dateLabel}</span>
                  </figcaption>
                </figure>
              )}

              <button
                onClick={open}
                className="flex w-full max-w-sm items-center justify-center gap-2 rounded-md bg-stone-900 px-8 py-3.5 font-serif text-lg text-stone-50 shadow-[0_6px_16px_-6px_rgb(0_0_0/0.45)] transition-[background-color,transform] hover:bg-stone-800 active:translate-y-px"
              >
                <BookOpen className="size-5" /> Open the Bible
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Paper that wipes in from the book as it opens, leading into the contents page. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 bg-[var(--paper)]"
        style={{
          clipPath: opening ? 'circle(150% at 25% 50%)' : 'circle(0% at 25% 50%)',
          transition: 'clip-path 700ms cubic-bezier(0.65, 0, 0.35, 1) 150ms',
        }}
      />
    </div>
  );
}
