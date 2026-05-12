'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Copy, Library, X } from 'lucide-react';
import type { Verse } from '@/lib/bible';

// Motion values from the v0 newsletter template.
const DURATION = 0.3;
const DELAY = DURATION;
const EASE_OUT = 'easeOut';
const EASE_OUT_OPACITY = [0.25, 0.46, 0.45, 0.94] as const;
const SPRING = { type: 'spring' as const, stiffness: 60, damping: 10, mass: 0.8 };

function sizeFor(text: string) {
  if (text.length < 90) return 'text-5xl sm:text-7xl lg:text-8xl';
  if (text.length < 200) return 'text-4xl sm:text-5xl lg:text-6xl';
  if (text.length < 320) return 'text-3xl sm:text-4xl lg:text-5xl';
  return 'text-2xl sm:text-3xl lg:text-4xl';
}

function Background() {
  const [loaded, setLoaded] = useState(false);
  const cls = 'absolute inset-0 h-full w-full object-cover rounded-[42px] md:rounded-[72px]';
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/verse/alt-placeholder.png" alt="" className={`${cls} ${loaded ? 'invisible' : ''}`} />
      <video
        src="/verse/alt.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setLoaded(true)}
        className={`${cls} ${loaded ? '' : 'invisible'}`}
      />
      <div className="absolute inset-0 rounded-[42px] bg-gradient-to-b from-black/30 via-black/15 to-black/45 md:rounded-[72px]" />
    </>
  );
}

export default function VerseView({
  title,
  chapter,
  verse,
  chapterHref,
  prevHref,
  nextHref,
  context,
}: {
  title: string;
  chapter: number;
  verse: Verse;
  chapterHref: string;
  prevHref: string | null;
  nextHref: string | null;
  context: Verse[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const reference = `${title} ${chapter}:${verse.verse}`;
  const backHref = `${chapterHref}#v${verse.verse}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isOpen) setIsOpen(false);
        else router.push(backHref);
      } else if (e.key === 'ArrowLeft' && prevHref) router.push(prevHref);
      else if (e.key === 'ArrowRight' && nextHref) router.push(nextHref);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, prevHref, nextHref, backHref, router]);

  const copy = async () => {
    await navigator.clipboard.writeText(`"${verse.text}" — ${reference} (KJV)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="h-[100dvh] w-full bg-[var(--paper)] p-[var(--inset)]">
      <div className="relative h-full w-full text-neutral-50">
        <Background />

        <div className="relative flex h-full w-full flex-col items-center justify-center gap-6 overflow-hidden px-6 pb-24 pt-10 lg:gap-8">
          <div className="flex min-h-0 shrink flex-col items-center">
            <AnimatePresence mode="popLayout" propagate>
              {!isOpen && (
                <motion.figure
                  key={`verse-${verse.verse}`}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    visible: { opacity: 1, scale: 1, y: 0, transition: { delay: DELAY, duration: DURATION * 2, ease: EASE_OUT } },
                    hidden: { opacity: 0, scale: 0.9, transition: { duration: DURATION, ease: EASE_OUT } },
                    exit: { opacity: 0, y: -150, scale: 0.9, transition: { duration: DURATION, ease: EASE_OUT } },
                  }}
                  className="max-w-5xl text-center"
                >
                  <blockquote
                    className={`font-serif leading-[1.12] italic text-balance [text-shadow:0_2px_24px_rgb(0_0_0/0.35)] ${sizeFor(verse.text)}`}
                  >
                    &ldquo;{verse.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 [text-shadow:0_1px_12px_rgb(0_0_0/0.45)]">
                    <h1 className="font-display text-xl font-semibold tracking-wide">{reference}</h1>
                    {verse.notes.length > 0 && (
                      <p className="mx-auto mt-3 max-w-xl text-base text-neutral-50/85 italic">{verse.notes.join(' · ')}</p>
                    )}
                  </figcaption>
                </motion.figure>
              )}

              <motion.div
                layout="position"
                transition={SPRING}
                key="actions"
                className={`flex flex-wrap items-center justify-center gap-2 ${isOpen ? 'my-6' : 'mt-8'}`}
              >
                {prevHref ? (
                  <Link href={prevHref} aria-label="Previous verse" className="glass-btn w-11 px-0">
                    <ArrowLeft className="size-4" />
                  </Link>
                ) : (
                  <button disabled aria-label="Previous verse" className="glass-btn w-11 px-0">
                    <ArrowLeft className="size-4" />
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="glass-btn relative overflow-hidden px-5 sm:px-8"
                  aria-expanded={isOpen}
                >
                  {!isOpen && (
                    <span className="pointer-events-none absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  )}
                  {isOpen ? <X className="size-4" /> : null}
                  {isOpen ? (
                    'Close'
                  ) : (
                    <>
                      <span className="sm:hidden">Context</span>
                      <span className="hidden sm:inline">Read in context</span>
                    </>
                  )}
                </button>

                <button onClick={copy} className="glass-btn" aria-label="Copy verse">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {nextHref ? (
                  <Link href={nextHref} aria-label="Next verse" className="glass-btn w-11 px-0">
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <button disabled aria-label="Next verse" className="glass-btn w-11 px-0">
                    <ArrowRight className="size-4" />
                  </button>
                )}
              </motion.div>

              {isOpen && (
                <motion.div
                  key="context"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    visible: { opacity: 1, scale: 1, transition: { delay: DELAY, duration: DURATION, ease: EASE_OUT } },
                    hidden: { opacity: 0, scale: 0.9, transition: { duration: DURATION, ease: EASE_OUT } },
                    exit: { opacity: 0, scale: 0.9, transition: { duration: DURATION, ease: EASE_OUT_OPACITY } },
                  }}
                  className="glass-panel relative flex max-h-[60dvh] min-h-0 max-w-3xl shrink flex-col overflow-hidden"
                >
                  <article className="overflow-y-auto p-6 font-serif text-lg leading-relaxed md:text-xl">
                    {context.map((v) => (
                      <p
                        key={v.verse}
                        className={`my-3 transition-opacity ${v.verse === verse.verse ? '' : 'opacity-70'}`}
                      >
                        <sup className="mr-1 font-sans text-xs font-semibold">{v.verse}</sup>
                        {v.verse === verse.verse ? <mark className="rounded bg-white/25 px-1 text-inherit">{v.text}</mark> : v.text}
                      </p>
                    ))}
                    <Link href={backHref} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4">
                      Open {title} {chapter} <ArrowRight className="size-3.5" />
                    </Link>
                  </article>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <footer className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 text-sm md:px-12 md:pb-8">
          <Link href={backHref} className="glass-btn h-9">
            <ArrowLeft className="size-4" /> {title} {chapter}
          </Link>
          <Link href="/" className="glass-btn h-9">
            <Library className="size-4" /> <span className="hidden sm:inline">Library</span>
          </Link>
        </footer>
      </div>
    </main>
  );
}
