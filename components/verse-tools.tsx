'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Ban, Bookmark, Check, Copy, NotebookPen, Share2, X } from 'lucide-react';
import { COLORS, annotate, keyOf, useAnnotations } from '@/lib/annotations';

type Props = { slug: string; book: string; chapter: number; verses: { verse: number; text: string }[] };

const tool =
  'flex size-9 shrink-0 items-center justify-center rounded-full text-[#f6ecd6] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#d6a64a]';

function reference(book: string, chapter: number, nums: number[]) {
  const parts = [];
  for (let i = 0; i < nums.length; i++) {
    let j = i;
    while (nums[j + 1] === nums[j] + 1) j++;
    parts.push(j > i ? `${nums[i]}–${nums[j]}` : `${nums[i]}`);
    i = j;
  }
  return `${book} ${chapter}:${parts.join(', ')}`;
}

export default function VerseTools({ slug, book, chapter, verses }: Props) {
  const store = useAnnotations();
  const [selected, setSelected] = useState<number[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    for (const el of document.querySelectorAll<HTMLElement>('[data-verse]')) {
      const v = Number(el.dataset.verse);
      const a = store[keyOf(slug, chapter, v)];
      el.toggleAttribute('data-selected', selected.includes(v));
      el.toggleAttribute('data-note', !!a?.note);
      if (a?.color) el.dataset.hl = a.color;
      else delete el.dataset.hl;
    }
    document.body.toggleAttribute('data-verse-tools', selected.length > 0);
  }, [store, selected, slug, chapter]);

  useEffect(() => {
    const onMouseUp = () => {
      const sel = getSelection();
      if (!sel || !sel.toString().trim()) return;
      const picked = [...document.querySelectorAll<HTMLElement>('[data-verse]')]
        .filter((el) => sel.containsNode(el, true))
        .map((el) => Number(el.dataset.verse));
      if (picked.length) {
        sel.removeAllRanges();
        setSelected(picked);
        setEditing(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element && e.target.closest<HTMLElement>('[data-verse]');
      if (!el || getSelection()?.toString().trim()) return;
      const v = Number(el.dataset.verse);
      setEditing(false);
      setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v].sort((a, b) => a - b)));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setSelected([]);
      setEditing(false);
    };
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      document.body.removeAttribute('data-verse-tools');
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  if (selected.length === 0) return null;

  const targets = selected.map((verse) => ({ slug, book, chapter, verse, text: verses.find((v) => v.verse === verse)!.text }));
  const saved = selected.map((v) => store[keyOf(slug, chapter, v)]);
  const color = saved.every((a) => a?.color === saved[0]?.color) ? saved[0]?.color : undefined;
  const ref = reference(book, chapter, selected);
  const quoted = targets.length === 1 ? `“${targets[0].text}”` : targets.map((t) => `${t.verse} ${t.text}`).join(' ');
  const citation = `${quoted}\n— ${ref} (KJV)`;
  const url = `${location.origin}/read/${slug}/${chapter}#v${selected[0]}`;

  const copy = (text: string, message: string) =>
    navigator.clipboard.writeText(text).then(
      () => setToast(message),
      () => setToast('Could not copy — your browser blocked the clipboard')
    );

  const share = () => {
    if (navigator.share) navigator.share({ title: ref, text: citation, url }).catch(() => {});
    else copy(`${citation}\n${url}`, 'Verse and link copied');
  };

  const close = () => {
    setSelected([]);
    setEditing(false);
  };

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
            annotate(targets, { note: draft });
            setEditing(false);
            setToast(draft.trim() ? 'Note saved' : 'Note removed');
          }}
        >
          <label htmlFor="verse-note" className="font-serif text-sm text-stone-500">Note on {ref}</label>
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

        <div className="flex items-center gap-1.5 border-[#f6ecd6]/15 pr-2 sm:border-l sm:pl-3">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => annotate(targets, { color: color === c.id ? undefined : c.id })}
              aria-label={`${color === c.id ? 'Remove' : 'Highlight'} ${c.label.toLowerCase()}`}
              aria-pressed={color === c.id}
              className="flex size-6 items-center justify-center rounded-full ring-offset-2 ring-offset-[#3b2416] transition-transform hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-[#f6ecd6]"
              style={{ backgroundColor: c.swatch }}
            >
              {color === c.id && <Check className="size-3.5 text-[#3b2416]" />}
            </button>
          ))}
          {saved.some((a) => a?.color) && (
            <button onClick={() => annotate(targets, { color: undefined })} aria-label="Remove highlight" className={`${tool} size-7`}>
              <Ban className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center border-l border-[#f6ecd6]/15 pl-1">
          <button
            onClick={() => {
              setDraft(saved.find((a) => a?.note)?.note ?? '');
              setEditing(true);
            }}
            aria-label="Note"
            title="Note"
            className={tool}
          >
            <NotebookPen className="size-[18px]" />
          </button>
          <button onClick={() => copy(citation, targets.length > 1 ? 'Verses copied' : 'Verse copied')} aria-label="Copy" title="Copy" className={tool}>
            <Copy className="size-[18px]" />
          </button>
          <button onClick={share} aria-label="Share" title="Share" className={tool}>
            <Share2 className="size-[18px]" />
          </button>
          <Link href="/highlights" aria-label="My highlights" title="My highlights" className={tool}>
            <Bookmark className="size-[18px]" />
          </Link>
          <button onClick={close} aria-label="Close" title="Close" className={`${tool} bg-white/10`}>
            <X className="size-[18px]" />
          </button>
        </div>

        <p
          role="status"
          className={`pointer-events-none absolute -top-10 left-1/2 w-max -translate-x-1/2 rounded-full bg-[#3b2416] px-3 py-1 font-serif text-sm text-[#f6ecd6] shadow transition-opacity ${toast ? 'opacity-100' : 'opacity-0'}`}
        >
          {toast}
        </p>
      </div>
    </div>
  );
}
