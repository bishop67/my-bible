import Link from 'next/link';

export default function SiteFooter() {
  const link = 'hover:text-white';
  return (
    <footer className="mt-20 bg-[#3b2416] text-[#f6ecd6]/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 font-serif text-base">
        <span className="font-display text-[#f6ecd6] [font-variant-caps:small-caps]">Holy Bible</span>
        <nav aria-label="Footer" className="flex gap-5">
          <Link href="/#contents" className={link}>Contents</Link>
          <Link href="/highlights" className={link}>Highlights</Link>
          <Link href="/search" className={link}>Search</Link>
        </nav>
      </div>
    </footer>
  );
}
