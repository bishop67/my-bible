import { cache } from 'react';
import fs from 'fs';
import path from 'path';
import manifest from '@/data/manifest.json';

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

export interface RandomVerse {
  text: string;
  chapter: number;
  verse: number;
}

// The source text appends translators' marginal notes to the verse itself:
// "…and the darkness. + 1.4 the light from…: Heb. between the light…"
const NOTE_SPLIT = /\s\+\s(?=\d+\.\d+\s)/;

export const loadBook = cache((slug: string): BookData | null => {
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
});

export function allSlugs(): string[] {
  return Object.values(manifest).flatMap((sections) => Object.values(sections).flat());
}

export const getLibrary = cache((): BookSummary[] =>
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
  )
);

// A verse that reads well on its own: not too long, not a genealogy fragment.
export function randomVerse(slug: string): RandomVerse | null {
  const data = loadBook(slug);
  if (!data) return null;
  const all = data.chapters.flatMap((c) => c.verses.map((v) => ({ ...v, chapter: c.chapter })));
  if (all.length === 0) return null;
  const good = all.filter((v) => v.text.length >= 50 && v.text.length <= 220 && /[.!?]$/.test(v.text));
  const pool = good.length > 0 ? good : all;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { text: pick.text, chapter: pick.chapter, verse: pick.verse };
}
