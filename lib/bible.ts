import fs from 'fs';
import path from 'path';
import manifest from '@/data/manifest.json';
import dailyVerses from '@/data/daily-verses.json';

export interface Verse {
  verse: number;
  text: string;
  new_paragraph: boolean;
  notes: string[];
}

export interface Chapter {
  chapter: number;
  verses: Verse[];
}

export interface BookData {
  book: string;
  chapters: Chapter[];
}

export interface BookSummary {
  slug: string;
  title: string;
  testament: string;
  section: string;
  chapters: number;
}

export interface DailyVerse {
  slug: string;
  title: string;
  chapter: number;
  verse: number;
  text: string;
  dateLabel: string;
}

// The source text appends translators' marginal notes to the verse itself:
// "…and the darkness. + 1.4 the light from…: Heb. between the light…"
const NOTE_SPLIT = /\s\+\s(?=\d+\.\d+\s)/;

// Parsed once per server process; the text never changes at runtime.
const books = new Map<string, BookData | null>();

export function loadBook(slug: string): BookData | null {
  if (!books.has(slug)) books.set(slug, readBook(slug));
  return books.get(slug)!;
}

function readBook(slug: string): BookData | null {
  // Slugs come from the URL, so only allow the ones listed in the manifest.
  if (!allSlugs().includes(slug)) return null;
  try {
    const filePath = path.join(process.cwd(), 'data', 'bible', `${slug}.json`);
    const raw: { book: string; chapters: { chapter: number; verses: Omit<Verse, 'notes'>[] }[] } =
      JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return {
      book: raw.book,
      chapters: raw.chapters.map((c) => ({
        chapter: c.chapter,
        verses: c.verses.map((v) => {
          const [text, ...notes] = v.text.split(NOTE_SPLIT);
          return { ...v, text: text.trim(), notes: notes.map((n) => n.replace(/^\d+\.\d+\s+/, '').trim()) };
        }),
      })),
    };
  } catch (e) {
    console.error('File error:', e);
    return null;
  }
}

export function allSlugs(): string[] {
  return Object.values(manifest).flatMap((sections) => Object.values(sections).flat());
}

let library: BookSummary[] | null = null;

export const getLibrary = (): BookSummary[] =>
  (library ??=
  Object.entries(manifest).flatMap(([testament, sections]) =>
    Object.entries(sections).flatMap(([section, slugs]) =>
      slugs.map((slug) => ({
        slug,
        title: loadBook(slug)!.book,
        testament,
        section,
        chapters: loadBook(slug)!.chapters.length,
      }))
    )
  ));

// The day turns over at midnight in the site's home timezone, not the server's.
const TIME_ZONE = 'Asia/Bangkok';

// A hand-picked list of well-known verses that stand on their own.
let pool: Omit<DailyVerse, 'dateLabel'>[] | null = null;

const versePool = () =>
  (pool ??= dailyVerses.flatMap((ref) => {
    const [slug, cv] = ref.split(' ');
    const [chapter, verse] = cv.split(':').map(Number);
    const v = loadBook(slug)?.chapters.find((c) => c.chapter === chapter)?.verses.find((x) => x.verse === verse);
    const title = getLibrary().find((b) => b.slug === slug)?.title;
    return v && title ? [{ slug, title, chapter, verse, text: v.text }] : [];
  }));

export function verseOfTheDay(now = new Date()): DailyVerse | null {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now); // YYYY-MM-DD
  const pool = versePool();
  if (pool.length === 0) return null;
  // FNV-1a over the date string, so each day lands somewhere different in the pool.
  let h = 0x811c9dc5;
  for (const ch of day) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  const dateLabel = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, day: 'numeric', month: 'long' }).format(now);
  return { ...pool[h % pool.length], dateLabel };
}

export interface SearchHit {
  slug: string;
  title: string;
  chapter: number;
  verse: number;
  text: string;
}

// Whole-word, case-insensitive search across every verse. The text is already in memory,
// so a linear scan of ~37k verses is quick enough without an index.
export function searchVerses(query: string, limit = 200): { hits: SearchHit[]; total: number } {
  const words = query.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
  if (words.length === 0) return { hits: [], total: 0 };
  const patterns = words.map(
    (w) => new RegExp(String.raw`(?<![\p{L}\p{N}])` + w.replace(/'/g, "['’]") + String.raw`(?![\p{L}\p{N}])`, 'iu')
  );
  // Verses containing the exact phrase come first, then those that merely contain every word.
  const phrase = words.length > 1 ? new RegExp(words.join(String.raw`[^\p{L}\p{N}]+`), 'iu') : null;
  const exact: SearchHit[] = [];
  const loose: SearchHit[] = [];
  for (const b of getLibrary()) {
    for (const c of loadBook(b.slug)!.chapters) {
      for (const v of c.verses) {
        if (!patterns.every((p) => p.test(v.text))) continue;
        const hit = { slug: b.slug, title: b.title, chapter: c.chapter, verse: v.verse, text: v.text };
        (phrase && !phrase.test(v.text) ? loose : exact).push(hit);
      }
    }
  }
  return { hits: [...exact, ...loose].slice(0, limit), total: exact.length + loose.length };
}

// Verse counts per chapter, for the book/chapter/verse picker.
export function verseCounts(slug: string): number[] {
  return loadBook(slug)?.chapters.map((c) => c.verses.length) ?? [];
}
