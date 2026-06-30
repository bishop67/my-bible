'use client';

import { useSyncExternalStore } from 'react';

// Personal highlights and notes, kept in this browser only (localStorage). Nothing is
// sent anywhere and the Bible text itself is never changed.

export const HIGHLIGHTS = [
  { id: 'yellow', label: 'Honey', swatch: '#e9c46a', wash: 'rgb(233 196 106 / 0.42)' },
  { id: 'green', label: 'Sage', swatch: '#a3c49a', wash: 'rgb(163 196 154 / 0.45)' },
  { id: 'blue', label: 'Sky', swatch: '#9dc3dc', wash: 'rgb(157 195 220 / 0.45)' },
  { id: 'orange', label: 'Apricot', swatch: '#eba47a', wash: 'rgb(235 164 122 / 0.4)' },
  { id: 'pink', label: 'Rose', swatch: '#e3a3b5', wash: 'rgb(227 163 181 / 0.42)' },
] as const;

export type HighlightColor = (typeof HIGHLIGHTS)[number]['id'];

export interface Annotation {
  slug: string;
  book: string; // display title, e.g. "2 Samuel"
  chapter: number;
  verse: number;
  text: string; // the verse, so the highlights page works without loading the book
  color?: HighlightColor;
  note?: string;
  updated: number;
}

type Store = Record<string, Annotation>;

const KEY = 'holy-bible:annotations:v1';
const EMPTY: Store = {};
const listeners = new Set<() => void>();
let cache: Store | null = null;

export const keyOf = (slug: string, chapter: number, verse: number) => `${slug}:${chapter}:${verse}`;

function read(): Store {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store;
  } catch {
    cache = {};
  }
  return cache;
}

function write(next: Store) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or disabled: keep working for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs in step.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useAnnotations(): Store {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

type Target = Omit<Annotation, 'color' | 'note' | 'updated'>;

// Merge a change into each verse; an annotation with neither colour nor note is removed.
function update(targets: Target[], change: Partial<Pick<Annotation, 'color' | 'note'>>) {
  const next = { ...read() };
  for (const t of targets) {
    const k = keyOf(t.slug, t.chapter, t.verse);
    const merged: Annotation = { ...next[k], ...t, ...change, updated: Date.now() };
    if (!merged.color) delete merged.color;
    if (!merged.note?.trim()) delete merged.note;
    if (merged.color || merged.note) next[k] = merged;
    else delete next[k];
  }
  write(next);
}

export const setHighlight = (targets: Target[], color: HighlightColor | undefined) => update(targets, { color });
export const setNote = (targets: Target[], note: string) => update(targets, { note });
export const removeAnnotation = (slug: string, chapter: number, verse: number) => {
  const next = { ...read() };
  delete next[keyOf(slug, chapter, verse)];
  write(next);
};
