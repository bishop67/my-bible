import Link from "next/link";
import Backdrop from "./backdrop";

// The table of contents is left exactly as written; this layout only frames it, after the
// v0 newsletter template: a looping landscape in a rounded frame, a big italic title, and
// the page itself on a frosted panel.
export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--paper)] p-[var(--inset)]">
      <Backdrop />

      <div className="relative">
        <header className="px-6 pt-16 pb-12 text-center text-neutral-50 [text-shadow:0_2px_24px_rgb(0_0_0/0.35)] md:pt-24 md:pb-16">
          <Link href="/" className="font-serif text-5xl italic sm:text-7xl lg:text-8xl">
            KJV + Apocrypha
          </Link>
        </header>

        <div className="mx-auto mb-[calc(var(--inset)*2)] max-w-5xl rounded-3xl border border-white/60 bg-white/90 font-sans text-gray-900 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.5)] backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
