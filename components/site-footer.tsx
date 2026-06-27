import Link from 'next/link';

// Closes the page the way the header opens it: the same tobacco-leather band, with a
// verse, the ways back into the book, and credit for the text and the engravings.
export default function SiteFooter() {
  const link = 'text-[#f6ecd6]/80 hover:text-white';
  const heading = 'font-display text-xs tracking-[0.18em] text-[#d6a64a] uppercase';

  return (
    <footer className="mt-24 border-t-4 border-[#7a4a24] bg-[#3b2416] text-[#f6ecd6]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <figure className="mx-auto max-w-2xl text-center">
          <svg aria-hidden viewBox="0 0 20 32" className="mx-auto mb-4 h-7 w-4 text-[#d6a64a]">
            <path d="M10 1v30M2 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
          <blockquote className="font-serif text-2xl leading-snug text-balance italic">
            &ldquo;Thy word is a lamp unto my feet, and a light unto my path.&rdquo;
          </blockquote>
          <figcaption className="mt-2 font-display text-sm tracking-wide text-[#d6a64a] [font-variant-caps:small-caps]">
            Psalms 119:105
          </figcaption>
        </figure>

        <div className="mt-12 grid gap-10 border-t border-[#f6ecd6]/15 pt-10 font-serif text-base sm:grid-cols-3">
          <div>
            <p className="font-display text-2xl text-[#f6ecd6] [font-variant-caps:small-caps]">Holy Bible</p>
            <p className="mt-2 leading-relaxed text-[#f6ecd6]/70">
              The King James Version of 1611, with the Apocrypha. Read, highlight and keep notes; everything you mark
              stays in your own browser.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className={heading}>Read</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/#contents" className={link}>Contents</Link></li>
              <li><Link href="/#verse-of-the-day" className={link}>Verse of the day</Link></li>
              <li><Link href="/read/genesis/1" className={link}>Begin at Genesis</Link></li>
              <li><Link href="/highlights" className={link}>My highlights &amp; notes</Link></li>
              <li><Link href="/search" className={link}>Search the Bible</Link></li>
            </ul>
          </nav>

          <div>
            <p className={heading}>About the pictures</p>
            <p className="mt-3 leading-relaxed text-[#f6ecd6]/70">
              Engravings by Gustave Doré (1866) and woodcuts by Julius Schnorr von Carolsfeld (1860), with other works
              for the Apocrypha, all from{' '}
              <a href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer" className={`${link} underline decoration-[#d6a64a]/50 underline-offset-2`}>
                Wikimedia Commons
              </a>
              . Each picture credits its source.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
