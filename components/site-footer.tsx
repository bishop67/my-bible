import Link from 'next/link';

// Closes the page like the header opens it: tooled leather, a gold rule, a small cross.
export default function SiteFooter() {
  const link = 'text-[#f6ecd6]/85 transition-colors hover:text-white';
  return (
    <footer className="mt-20 border-t-2 border-[#d6a64a]/70 bg-[#3b2416] bg-[radial-gradient(ellipse_at_bottom,rgb(255_255_255/0.07),transparent_60%),repeating-linear-gradient(90deg,rgb(0_0_0/0.06)_0_2px,transparent_2px_6px)] shadow-[inset_0_6px_12px_-6px_rgb(0_0_0/0.5)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-center">
        <svg aria-hidden viewBox="0 0 20 32" className="h-6 w-4 text-[#d6a64a]">
          <path d="M10 1v30M2 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
        <Link href="/" className="font-display text-xl tracking-wide text-[#d6a64a] [font-variant-caps:small-caps] hover:text-[#e4b95e]">
          Holy Bible
        </Link>
        <nav aria-label="Footer" className="flex items-center gap-3 font-serif text-base">
          <Link href="/#contents" className={link}>Contents</Link>
          <span aria-hidden className="text-[#d6a64a]/70">·</span>
          <Link href="/highlights" className={link}>Highlights</Link>
          <span aria-hidden className="text-[#d6a64a]/70">·</span>
          <Link href="/search" className={link}>Search</Link>
        </nav>
      </div>
    </footer>
  );
}
