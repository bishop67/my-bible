// The user's table of contents (app/books/page.tsx) is never edited. Wherever it is shown,
// it is wrapped in these descendant rules, which only restyle its own elements into the
// site's fonts and colours.
export const tocStyle = [
  'font-serif',
  '[&_h2]:font-display [&_h2]:border-stone-300 [&_h2]:text-[#4a3726]',
  '[&_h3]:font-serif [&_h3]:text-[#8a6a48]',
  '[&_a]:border-stone-300 [&_a]:bg-white/50 [&_a]:text-base [&_a]:font-normal [&_a]:text-stone-800',
  '[&_a:hover]:border-stone-400 [&_a:hover]:bg-amber-100/60',
].join(' ');
