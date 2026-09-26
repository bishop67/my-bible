'use client';

import { useSyncExternalStore } from 'react';

export const COLORS = [
  { id: 'yellow', label: 'Honey', swatch: '#e9c46a' },
  { id: 'green', label: 'Sage', swatch: '#a3c49a' },
  { id: 'blue', label: 'Sky', swatch: '#9dc3dc' },
  { id: 'orange', label: 'Apricot', swatch: '#eba47a' },
  { id: 'pink', label: 'Rose', swatch: '#e3a3b5' },
];

export type Annotation = {
  slug: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  color?: string;
  note?: string;
};

type Store = Record<string, Annotation>;

const KEY = 'holy-bible:annotations:v1';
const EMPTY: Store = {};
const listeners = new Set<() => void>();
let cache: Store | null = null;

export const keyOf = (slug: string, chapter: number, verse: number) => `${slug}:${chapter}:${verse}`;

function read(): Store {
  if (!cache) {
    try {
      cache = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    } catch {
      cache = {};
    }
  }
  return cache!;
}

function subscribe(listener: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    listener();
  };
  listeners.add(listener);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export const useAnnotations = () => useSyncExternalStore(subscribe, read, () => EMPTY);

export function annotate(targets: Annotation[], change: { color?: string; note?: string }) {
  const next = { ...read() };
  for (const t of targets) {
    const key = keyOf(t.slug, t.chapter, t.verse);
    const a = { ...next[key], ...t, ...change };
    if (!a.color) delete a.color;
    if (!a.note?.trim()) delete a.note;
    if (a.color || a.note) next[key] = a;
    else delete next[key];
  }
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}
