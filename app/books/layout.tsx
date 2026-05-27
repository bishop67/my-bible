import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// The table of contents (page.tsx) is left exactly as written. This layout sets it like
// the contents page of an old Bible: a Doré frontispiece on one side, the list on paper
// on the other, in the same type and ink as the rest of the site. The [&_…] rules below
// only restyle the page's own elements into the site's fonts and colours.
export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-stone-900 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="p-4 lg:sticky lg:top-0 lg:h-screen lg:p-8">
        <figure className="flex h-64 flex-col border border-stone-400/70 bg-[#f4efe4] p-2 shadow-[0_12px_30px_-18px_rgb(28_25_23/0.6)] sm:h-80 lg:h-full lg:p-3">
          <div className="min-h-0 flex-1 border border-stone-400/70">
            {/* eslint-disable-next-line @next/next/no-img-element -- a single local, pre-sized engraving */}
            <img
              src="/toc/creation-of-light.jpg"
              alt="The Creation of Light, an engraving by Gustave Doré"
              className="h-full w-full object-cover object-[50%_30%] [filter:sepia(0.35)_contrast(0.95)]"
            />
          </div>
          <figcaption className="pt-2 text-center font-serif text-sm text-stone-600 italic lg:pt-3 lg:text-base">
            &ldquo;Let there be light: and there was light.&rdquo; · Gustave Doré, 1866
          </figcaption>
        </figure>
      </aside>

      <div className="pb-16">
        <header className="px-8 pt-10 lg:pt-16">
          <Link href="/" className="inline-flex items-center gap-2 font-serif text-lg text-stone-600 hover:text-stone-900">
            <ArrowLeft className="size-4" /> Home
          </Link>
          <h1 className="mt-4 font-display text-5xl leading-tight font-semibold sm:text-6xl">Contents</h1>
        </header>

        <div
          className={[
            "font-serif",
            "[&_h2]:font-display [&_h2]:border-stone-300 [&_h2]:text-stone-900",
            "[&_h3]:font-serif [&_h3]:text-rose-900/70",
            "[&_a]:border-stone-300 [&_a]:bg-white/50 [&_a]:text-base [&_a]:font-normal [&_a]:text-stone-800",
            "[&_a:hover]:border-stone-400 [&_a:hover]:bg-amber-100/60",
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
