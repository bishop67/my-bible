'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ContinueReading({ next, prev }: { next: string | null; prev: string | null }) {
  const router = useRouter();

  useEffect(() => {
    if (next) router.prefetch(next);
    if (prev) router.prefetch(prev);

    const start = Date.now();
    let pull = 0;
    let touchY = 0;
    let done = false;
    let timer: ReturnType<typeof setTimeout>;

    const atBottom = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    const atTop = () => scrollY <= 0;

    const move = (dy: number) => {
      if (done || Date.now() - start < 1500 || document.body.hasAttribute('data-verse-tools')) return;
      if (dy > 0 && atBottom()) pull = Math.max(pull, 0) + dy;
      else if (dy < 0 && atTop()) pull = Math.min(pull, 0) + dy;
      else pull = 0;
      clearTimeout(timer);
      timer = setTimeout(() => (pull = 0), 1100);
      const href = pull >= 450 ? next : pull <= -450 ? prev : null;
      if (href) {
        done = true;
        router.push(href);
      }
    };

    const onWheel = (e: WheelEvent) => move(Math.max(-120, Math.min(e.deltaY, 120)));
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      move((touchY - y) * 2);
      touchY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (['PageDown', 'ArrowDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey)) move(150);
      if (['PageUp', 'ArrowUp'].includes(e.key) || (e.key === ' ' && e.shiftKey)) move(-150);
    };

    addEventListener('wheel', onWheel, { passive: true });
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchmove', onTouchMove, { passive: true });
    addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      removeEventListener('wheel', onWheel);
      removeEventListener('touchstart', onTouchStart);
      removeEventListener('touchmove', onTouchMove);
      removeEventListener('keydown', onKey);
    };
  }, [next, prev, router]);

  return null;
}
