import fs from 'fs';
import path from 'path';
import manifest from '@/data/manifest.json';
import dailyVerses from '@/data/daily-verses.json';

export type Verse = { verse: number; text: string; new_paragraph: boolean; notes: string[] };
export type Book = { slug: string; title: string; testament: string; chapters: { chapter: number; verses: Verse[] }[] };

const testaments = Object.entries(manifest).flatMap(([testament, sections]) =>
  Object.values(sections).flat().map((slug) => [slug, testament])
);
export const slugs = testaments.map(([slug]) => slug);
const testamentOf = Object.fromEntries(testaments);
const cache = new Map<string, Book>();

export function getBook(slug?: string): Book | null {
  if (!slug || !testamentOf[slug]) return null;
  if (!cache.has(slug)) {
    const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'bible', `${slug}.json`), 'utf8'));
    cache.set(slug, {
      slug,
      title: raw.book,
      testament: testamentOf[slug],
      chapters: raw.chapters.map((c: { chapter: number; verses: Verse[] }) => ({
        chapter: c.chapter,
        verses: c.verses.map((v) => {
          const [text, ...notes] = v.text.split(/\s\+\s(?=\d+\.\d+\s)/);
          return { ...v, text: text.trim(), notes: notes.map((n) => n.replace(/^\d+\.\d+\s+/, '').trim()) };
        }),
      })),
    });
  }
  return cache.get(slug)!;
}

export const allBooks = () => slugs.map((slug) => getBook(slug)!);

export function verseOfTheDay() {
  const now = new Date();
  const timeZone = 'Asia/Bangkok';
  let h = 0x811c9dc5;
  for (const ch of now.toLocaleDateString('en-CA', { timeZone })) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  const [slug, ref] = dailyVerses[h % dailyVerses.length].split(' ');
  const [chapter, verse] = ref.split(':').map(Number);
  const book = getBook(slug)!;
  const text = book.chapters.find((c) => c.chapter === chapter)!.verses.find((v) => v.verse === verse)!.text;
  const date = now.toLocaleDateString('en-GB', { timeZone, day: 'numeric', month: 'long' });
  return { slug, title: book.title, chapter, verse, text, date };
}

type Hit = { slug: string; title: string; chapter: number; verse: number; text: string };

export const wordsOf = (query: string) => query.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];

export const wordRegex = (words: string[], flags: string) =>
  new RegExp(
    String.raw`(?<![\p{L}\p{N}])(` + words.map((w) => w.replace(/'/g, "['’]")).join('|') + String.raw`)(?![\p{L}\p{N}])`,
    flags
  );

export function search(query: string, limit = 200) {
  const words = wordsOf(query);
  const patterns = words.map((w) => wordRegex([w], 'iu'));
  const phrase = new RegExp(words.map((w) => w.replace(/'/g, "['’]")).join(String.raw`[^\p{L}\p{N}]+`), 'iu');
  const exact: Hit[] = [];
  const loose: Hit[] = [];
  if (words.length > 0) {
    for (const book of allBooks()) {
      for (const c of book.chapters) {
        for (const v of c.verses) {
          if (!patterns.every((p) => p.test(v.text))) continue;
          const hit = { slug: book.slug, title: book.title, chapter: c.chapter, verse: v.verse, text: v.text };
          (phrase.test(v.text) ? exact : loose).push(hit);
        }
      }
    }
  }
  return { hits: [...exact, ...loose].slice(0, limit), total: exact.length + loose.length };
}
