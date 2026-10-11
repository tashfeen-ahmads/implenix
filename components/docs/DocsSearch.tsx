'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, FileText, ChevronRight } from 'lucide-react';

export type DocSearchEntry = {
  title: string;
  description: string;
  section: string;
  url: string;
  // Plain-text excerpt of the article, so body words are searchable.
  body?: string;
};

type Props = {
  entries: DocSearchEntry[];
};

export function DocsSearch({ entries }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlight(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice(0, 8);
    // Every word must appear somewhere; title hits rank first.
    const words = q.split(/\s+/).filter(Boolean);
    return entries
      .map((entry) => {
        const title = entry.title.toLowerCase();
        const haystack = `${title} ${entry.description} ${entry.section} ${entry.body ?? ''}`.toLowerCase();
        if (!words.every((w) => haystack.includes(w))) return { entry, score: 0 };
        const score = 1 + words.filter((w) => title.includes(w)).length;
        return { entry, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((r) => r.entry);
  }, [entries, query]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && results[highlight]) {
      e.preventDefault();
      window.location.href = results[highlight].url;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search documentation"
        className="w-full flex items-center justify-between gap-3 border border-brand-purple/20 hover:border-brand-purple bg-black px-3 py-2 text-sm font-body text-white/65 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Search size={14} className="text-brand-cyan" aria-hidden />
          Search docs
        </span>
        <kbd className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest border border-brand-purple/30 px-1.5 py-0.5">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/70"
            aria-hidden="true"
          />
          <div
            className="relative w-full max-w-xl border border-brand-purple/40 bg-brand-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-brand-purple/20 px-4 py-3">
              <Search size={16} className="text-brand-cyan shrink-0" aria-hidden />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search documentation…"
                className="flex-1 bg-transparent text-white placeholder:text-white/55 focus:outline-none font-body text-sm"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="text-white/55 hover:text-white"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="px-4 py-6 text-sm text-white/55 font-body">
                  No results for “{query}”.
                </p>
              ) : (
                <ul className="py-1">
                  {results.map((entry, i) => {
                    const active = i === highlight;
                    return (
                      <li key={entry.url}>
                        <Link
                          href={entry.url}
                          onClick={() => setOpen(false)}
                          onMouseEnter={() => setHighlight(i)}
                          className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                            active
                              ? 'bg-black border-l-[3px] border-brand-purple'
                              : 'border-l-[3px] border-transparent'
                          }`}
                        >
                          <FileText
                            size={14}
                            className="text-brand-cyan mt-0.5 shrink-0" aria-hidden />
                          <span className="flex-1 min-w-0">
                            <span className="block font-heading text-sm text-white truncate">
                              {entry.title}
                            </span>
                            <span className="block font-body text-xs text-white/55 truncate">
                              {entry.section} · {entry.description}
                            </span>
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-white/55 mt-1" aria-hidden />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="border-t border-brand-purple/20 px-4 py-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/55">
              <span>↑↓ navigate · ↵ open</span>
              <span>esc close</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
