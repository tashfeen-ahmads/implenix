import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { allDocs } from 'contentlayer/generated';
import { LogoLockup } from '@/components/common/LogoLockup';
import { DocsSidebar } from './DocsSidebar';
import { DocsSearch, type DocSearchEntry } from './DocsSearch';

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const entries: DocSearchEntry[] = allDocs.map((d) => ({
    title: d.title,
    description: d.description,
    section: d.section,
    url: d.url,
  }));

  return (
    <div className="min-h-screen bg-brand-dark">
      <header className="border-b border-brand-purple/20 bg-brand-dark sticky top-0 z-30">
        <div className="max-w-content mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <LogoLockup size="sm" href="/docs/getting-started/quick-start" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45 border border-brand-purple/30 px-2 py-0.5">
              Docs
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-brand-cyan font-body shrink-0"
          >
            <ArrowLeft size={14} /> Back to site
          </Link>
        </div>
      </header>
      <div className="max-w-content mx-auto px-6 grid lg:grid-cols-[260px_1fr] gap-10 py-10">
        <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pb-10 flex flex-col gap-5">
          <DocsSearch entries={entries} />
          <DocsSidebar />
        </aside>
        <main id="main" className="min-w-0 max-w-3xl">
          <article>{children}</article>
        </main>
      </div>
    </div>
  );
}
