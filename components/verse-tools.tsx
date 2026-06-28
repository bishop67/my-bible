'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, Bookmark, Check, Copy, NotebookPen, Share2, X } from 'lucide-react';
import {
  HIGHLIGHTS,
  keyOf,
  setHighlight,
  setNote,
  useAnnotations,
  type HighlightColor,
} from '@/lib/annotations';

interface Props {
  slug: string;
  book: string;
  chapter: number;
  verses: { verse: number; text: string }[];
}

// "1:3–5, 7" from [3, 4, 5, 7].
function reference(book: string, chapter: number, nums: number[]) {
  const parts: string[] = [];
  for (let i = 0; i < nums.length; i++) {
    let j = i;
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
    parts.push(j > i ? `${nums[i]}–${nums[j]}` : `${nums[i]}`);
    i = j;
  }
  return `${book} ${chapter}:${parts.join(', ')}`;
}

/**
 * Tap a verse (or select words across verses) to highlight it, write a note, copy or
 * share it. Works on the server-rendered chapter by marking verse spans with data
 * attributes, so the text itself is never re-rendered or changed.
 */
export default function VerseTools({ slug, book, chapter, verses }: Props) {
  const store = useAnnotations();
  const [selected, setSelected] = useState<number[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const byVerse = useMemo(() => new Map(verses.map((v) => [v.verse, v.text])), [verses]);
  const targets = selected.map((verse) => ({ slug, book, chapter, verse, text: byVerse.get(verse) ?? '' }));
  const ref = reference(book, chapter, selected);
  const current = selected.map((v) => store[keyOf(slug, chapter, v)]);
  const sharedColor = current.every((a) => a?.color && a.color === current[0]?.color) ? current[0]?.color : undefined;
  const anyColor = current.some((a) => a?.color);

  // Paint saved highlights, notes and the current selection onto the verse spans.
  useEffect(() => {
    for (const el of document.querySelectorAll<HTMLElement>('[data-verse]')) {
      const v = Number(el.dataset.verse);
      const a = store[keyOf(slug, chapter, v)];
      if (a?.color) el.dataset.hl = a.color;
      else delete el.dataset.hl;
      if (a?.note) el.dataset.note = '';
      else delete el.dataset.note;
      if (selected.includes(v)) el.dataset.selected = '';
      else delete el.dataset.selected;
    }
  }, [store, selected, slug, chapter]);

  // Let other bottom-of-screen UI (the continue-reading card) step aside while this is open.
  useEffect(() => {
    document.body.toggleAttribute('data-verse-tools', selected.length > 0);
    return () => document.body.removeAttribute('data-verse-tools');
  }, [selected.length]);

  const close = useCallback(() => {
    setSelected([]);
    setEditing(false);
  }, []);

  useEffect(() => {
    const verseOf = (node: EventTarget | null) =>
      node instanceof Element ? node.closest<HTMLElement>('[data-verse]') : null;

    // Selecting words picks every verse the selection touches.
    const onMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
      const picked = [...document.querySelectorAll<HTMLElement>('[data-verse]')]
        .filter((el) => sel.containsNode(el, true))
        .map((el) => Number(el.dataset.verse));
      if (picked.length) {
        // Hand over from the browser's text selection to our verse selection.
        sel.removeAllRanges();
        setSelected(picked);
        setEditing(false);
      }
    };

    // A plain tap toggles one verse in or out of the selection.
    const onClick = (e: MouseEvent) => {
      const el = verseOf(e.target);
      if (!el || window.getSelection()?.toString().trim()) return;
      const v = Number(el.dataset.verse);
      setEditing(false);
      setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v].sort((a, b) => a - b)));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [close]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  if (selected.length === 0) return null;

  const quoted =
    selected.length === 1
      ? `“${targets[0].text}”`
      : targets.map((t) => `${t.verse} ${t.text}`).join(' ');
  const citation = `${quoted}\n— ${ref} (KJV)`;
  const url = `${location.origin}/read/${slug}/${chapter}#v${selected[0]}`;

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast(message);
    } catch {
      setToast('Could not copy — your browser blocked the clipboard');
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: ref, text: citation, url });
      } catch {
        // Closing the share sheet is not an error worth showing.
      }
    } else {
      copy(`${citation}\n${url}`, 'Verse and link copied');
    }
  };

  const openNote = () => {
    const existing = current.find((a) => a?.note)?.note ?? '';
    setDraft(existing);
    setEditing(true);
  };

  // Icon buttons on the dark toolbar.
  const tool =
    'flex size-9 shrink-0 items-center justify-center rounded-full text-[#f6ecd6] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#d6a64a]';

  return (
    <div
      role="dialog"
      aria-label={`Tools for ${ref}`}
      className="fixed inset-x-2 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto w-fit max-w-[calc(100%-1rem)]"
    >
      {editing && (
        <form
          className="mb-2 w-[min(26rem,calc(100vw-1rem))] rounded-2xl border border-[#d6a64a]/30 bg-[#fbf6ea] p-3 shadow-[0_14px_36px_-12px_rgb(28_20_12/0.5)]"
          onSubmit={(e) => {
            e.preventDefault();
            setNote(targets, draft);
            setEditing(false);
            setToast(draft.trim() ? 'Note saved' : 'Note removed');
          }}
        >
          <label htmlFor="verse-note" className="font-serif text-sm text-stone-500">
            Note on {ref}
          </label>
          <textarea
            id="verse-note"
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What stood out to you…"
            className="mt-1 w-full resize-y rounded-lg border border-stone-300 bg-white p-2.5 font-serif text-lg text-stone-900 placeholder:text-stone-400 placeholder:italic focus-visible:border-[#8a5a2b] focus-visible:outline-none"
          />
          <div className="mt-2 flex justify-end gap-2 font-serif text-base">
            <button type="button" onClick={() => setEditing(false)} className="rounded-md px-3 py-1.5 text-stone-600 hover:bg-stone-200/60">
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-[#3b2416] px-3 py-1.5 text-[#f6ecd6] hover:bg-[#553421]">
              Save
            </button>
          </div>
        </form>
      )}

      <div className="relative mx-auto flex w-fit max-w-full items-center gap-1 rounded-full bg-[#3b2416] py-1.5 pr-1.5 pl-4 shadow-[0_14px_36px_-12px_rgb(28_20_12/0.6)]">
        <span className="mr-2 hidden max-w-40 truncate font-display text-sm font-semibold text-[#f6ecd6] sm:block">{ref}</span>

        <div className="flex items-center gap-1.5 border-[#f6ecd6]/15 pr-2 sm:border-l sm:pl-3" role="group" aria-label="Highlight colour">
          {HIGHLIGHTS.map((h) => (
            <button
              key={h.id}
              // Tapping the colour a verse already has takes the highlight off again.
              onClick={() => setHighlight(targets, sharedColor === h.id ? undefined : (h.id as HighlightColor))}
              aria-label={sharedColor === h.id ? `Remove ${h.label.toLowerCase()} highlight` : `Highlight ${h.label.toLowerCase()}`}
              aria-pressed={sharedColor === h.id}
              className="flex size-6 items-center justify-center rounded-full ring-offset-2 ring-offset-[#3b2416] transition-transform hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-[#f6ecd6]"
              style={{ backgroundColor: h.swatch }}
            >
              {sharedColor === h.id && <Check className="size-3.5 text-[#3b2416]" />}
            </button>
          ))}
          {anyColor && (
            <button onClick={() => setHighlight(targets, undefined)} aria-label="Remove highlight" className={`${tool} size-7`}>
              <Ban className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center border-l border-[#f6ecd6]/15 pl-1">
          <button onClick={openNote} aria-label={current.some((a) => a?.note) ? 'Edit note' : 'Add a note'} title="Note" className={tool}>
            <NotebookPen className="size-[18px]" />
          </button>
          <button
            onClick={() => copy(citation, selected.length > 1 ? 'Verses copied' : 'Verse copied')}
            aria-label="Copy"
            title="Copy"
            className={tool}
          >
            <Copy className="size-[18px]" />
          </button>
          <button onClick={share} aria-label="Share" title="Share" className={tool}>
            <Share2 className="size-[18px]" />
          </button>
          <Link href="/highlights" aria-label="My highlights and notes" title="My highlights" className={tool}>
            <Bookmark className="size-[18px]" />
          </Link>
          <button onClick={close} aria-label="Close" title="Close" className={`${tool} bg-white/10`}>
            <X className="size-[18px]" />
          </button>
        </div>

        <p
          role="status"
          className={`pointer-events-none absolute -top-10 left-1/2 w-max -translate-x-1/2 rounded-full bg-[#3b2416] px-3 py-1 font-serif text-sm text-[#f6ecd6] shadow transition-opacity ${
            toast ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {toast}
        </p>
      </div>
    </div>
  );
}
