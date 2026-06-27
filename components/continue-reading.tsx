'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

// How far past the end (or start) of the chapter the reader has to keep scrolling, in
// wheel pixels, before the neighbouring chapter opens. Deliberate, but not a chore.
const THRESHOLD = 450;

interface Target {
  href: string;
  label: string;
}

const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
const atTop = () => window.scrollY <= 0;

/**
 * Keep scrolling past the end of a chapter and the next one opens by itself; keep
 * scrolling up past the start and the previous one does. No UI: reversing direction or
 * pausing simply lets the pull drain away.
 */
export default function ContinueReading({ next, prev }: { next: Target | null; prev: Target | null }) {
  const router = useRouter();
  const moved = useRef(false);

  useEffect(() => {
    if (next) router.prefetch(next.href);
    if (prev) router.prefetch(prev.href);
    // Scroll momentum carries over from the previous chapter; don't let it turn this page too.
    const readyAt = performance.now() + 1500;
    let pull = 0; // positive: towards next, negative: towards previous
    let idle: ReturnType<typeof setTimeout>;
    let touchY: number | null = null;
    let touchEdge: 'next' | 'prev' | null = null;

    const set = (value: number) => {
      pull = value;
      const d = pull > 0 && next ? 'next' : pull < 0 && prev ? 'prev' : null;
      if (!d) pull = 0;
      clearTimeout(idle);
      // Stopping for a moment drains the pull, so a stray flick never turns the page.
      idle = setTimeout(() => {
        pull = 0;
      }, 1100);
      if (Math.abs(pull) >= THRESHOLD && !moved.current) {
        moved.current = true;
        router.push((d === 'next' ? next : prev)!.href);
      }
    };

    // Ignore gestures just after arriving, and while the verse toolbar is open.
    const busy = () => performance.now() < readyAt || document.body.hasAttribute('data-verse-tools');

    const onWheel = (e: WheelEvent) => {
      if (busy()) return;
      const step = Math.max(-120, Math.min(e.deltaY, 120));
      if (step > 0 && atBottom()) set(Math.max(pull, 0) + step);
      else if (step < 0 && atTop()) set(Math.min(pull, 0) + step);
      else if (pull !== 0) set(0);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      touchEdge = atBottom() ? 'next' : atTop() ? 'prev' : null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null || !touchEdge || busy()) return;
      const dy = (touchY - e.touches[0].clientY) * 2; // finger up = scroll down
      if (touchEdge === 'next' && dy > 0 && atBottom()) set(dy);
      else if (touchEdge === 'prev' && dy < 0 && atTop()) set(dy);
    };
    const onTouchEnd = () => {
      touchY = null;
      touchEdge = null;
    };
    const onKey = (e: KeyboardEvent) => {
      if (busy() || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      const down = e.key === 'PageDown' || e.key === 'ArrowDown' || (e.key === ' ' && !e.shiftKey);
      const up = e.key === 'PageUp' || e.key === 'ArrowUp' || (e.key === ' ' && e.shiftKey);
      if (down && atBottom()) set(Math.max(pull, 0) + 150);
      else if (up && atTop()) set(Math.min(pull, 0) - 150);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(idle);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
  }, [next, prev, router]);

  return null;
}
