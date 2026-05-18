'use client';

import { useState } from 'react';

// The newsletter template's framed video. It stays put while the contents scroll over it.
export default function Backdrop() {
  const [loaded, setLoaded] = useState(false);
  const frame = 'absolute inset-0 h-full w-full object-cover';

  return (
    <div
      aria-hidden
      className="fixed inset-[var(--inset)] overflow-hidden rounded-[42px] bg-stone-800 md:rounded-[72px]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/toc/alt-placeholder.png" alt="" className={`${frame} ${loaded ? 'invisible' : ''}`} />
      <video
        src="/toc/alt.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setLoaded(true)}
        className={`${frame} ${loaded ? '' : 'invisible'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/30" />
    </div>
  );
}
