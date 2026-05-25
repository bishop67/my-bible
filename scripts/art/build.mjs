// Merge the collected Commons sets into my-bible/data/art.json: { [slug]: { [chapter]: Art[] } }.
import fs from 'fs';

const read = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : []);
const BIBLE = '../../data/bible';
const size = {};
for (const f of fs.readdirSync(BIBLE)) {
  const d = JSON.parse(fs.readFileSync(`${BIBLE}/${f}`, 'utf8'));
  size[f.replace('.json', '')] = Object.fromEntries(d.chapters.map((c) => [c.chapter, c.verses.length]));
}
const valid = (r) => size[r.slug]?.[r.chapter] && (!r.from || r.from <= size[r.slug][r.chapter]);

// Wikimedia serves resized copies at /thumb/<hash>/<name>/<width>px-<name>; ask for a
// reading-sized one rather than the multi-megabyte original.
function resized(it, width) {
  const w = Math.min(width, it.width);
  const original = it.thumb.split('?')[0].replace(/\/thumb(\/.+?)\/[^/]+$/, '$1');
  const name = original.split('/').pop();
  const src = w < it.width ? original.replace('/commons/', '/commons/thumb/') + `/${w}px-${name}` : original;
  return { src, width: w, height: Math.round((it.height * w) / it.width) };
}

const art = [];
const add = (it, ref, title, artist, year) => {
  if (!valid(ref) || !it.thumb) return;
  const last = size[ref.slug][ref.chapter];
  art.push({
    slug: ref.slug,
    chapter: ref.chapter,
    from: ref.from ?? 1,
    to: Math.min(ref.to ?? ref.from ?? last, last),
    title: title.replace(/\s+/g, ' ').trim(),
    artist,
    year,
    ...resized(it, artist.includes('Doré') ? 1280 : 960),
    page: it.page.split("?")[0],
  });
};

// Doré: the numbered plates of the 1866 English Bible; title comes from the file name.
for (const it of read('cache/dore.refs.json')) {
  if (!it.category.includes("Doré's English Bible") || !it.refs.length) continue;
  const m = it.title.match(/^File:\d+[A-Z]?\.\s*(.+)\.\w+$/);
  if (!m) continue;
  add(it, it.refs[0], m[1], 'Gustave Doré', 1866);
}

// Schnorr: 240 woodcuts of Die Bibel in Bildern; references from Commons, else the hand map.
const gallery = Object.values(read('cache/gallery.json').query.pages)[0].revisions[0].slots.main['*'];
const titles = Object.fromEntries(
  [...gallery.matchAll(/Bibel in Bildern 1860 (\d+)\.png\|(.+)/g)].map((m) => [m[1], m[2].trim()])
);
const manual = read('schnorr-manual.json');
for (const it of read('cache/schnorr.refs.json')) {
  const n = it.title.match(/Bibel in Bildern 1860 (\d+)\.png$/)?.[1];
  if (!n) continue;
  let ref = it.refs[0];
  if (!ref && manual[n]) {
    const [slug, cv] = manual[n].split(' ');
    const [chapter, range] = cv.split(':');
    const [from, to] = range.split('-').map(Number);
    ref = { slug, chapter: +chapter, from, to };
  }
  if (ref) add(it, ref, titles[n] ?? `Plate ${+n}`, 'Julius Schnorr von Carolsfeld', 1860);
}

// Group by chapter, in reading order, dropping the same picture listed twice.
const out = {};
const seen = new Set();
for (const a of art.sort((x, y) => x.from - y.from)) {
  if (seen.has(a.src)) continue;
  seen.add(a.src);
  const { slug, chapter, ...rest } = a;
  ((out[slug] ??= {})[chapter] ??= []).push(rest);
}
fs.writeFileSync('../../data/art.json', JSON.stringify(out));
const count = Object.values(out).flatMap((c) => Object.values(c)).flat().length;
const chapters = Object.values(out).reduce((n, c) => n + Object.keys(c).length, 0);
const by = art.reduce((m, a) => ((m[a.artist] = (m[a.artist] || 0) + 1), m), {});
console.log('artworks', count, 'chapters with art', chapters, 'books', Object.keys(out).length, by);
