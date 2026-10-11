import Link from 'next/link';
import type { MDXComponents } from 'mdx/types';
import { CodeWindow } from '@/components/common/CodeWindow';
import { DividedStats } from '@/components/common/DividedStats';
import { ComparisonTable } from '@/components/common/ComparisonTable';
import { Badge } from '@/components/common/Badge';

export const mdxComponents: MDXComponents = {
  CodeWindow: CodeWindow as unknown as React.ComponentType<unknown>,
  DividedStats: DividedStats as unknown as React.ComponentType<unknown>,
  ComparisonTable: ComparisonTable as unknown as React.ComponentType<unknown>,
  Badge: Badge as unknown as React.ComponentType<unknown>,
  // A <div>, not a <p>: multi-line <Pull> content arrives already wrapped
  // in MDX paragraphs, and <p> inside <p> breaks hydration (React #418).
  Pull: ({ children }: { children: React.ReactNode }) => (
    <aside className="my-8 border-l-[3px] border-brand-cyan bg-black px-6 py-5">
      <div className="font-heading text-xl text-white leading-snug [&>p]:m-0 [&>p]:font-heading [&>p]:text-xl [&>p]:text-white [&>p]:leading-snug [&>p+p]:mt-3">
        {children}
      </div>
    </aside>
  ),
  Stat: ({ number, label }: { number: string; label: string }) => (
    <span className="inline-flex flex-col items-start border border-brand-cyan/30 bg-black px-4 py-3 my-3">
      <span className="font-heading text-3xl text-brand-cyan leading-none">
        {number}
      </span>
      <span className="text-white/70 text-xs mt-1.5 font-body">{label}</span>
    </span>
  ),
  // TL;DR / answer block optimized for AI search extraction. Google AI
  // Overviews, Perplexity, ChatGPT search, and Bing Copilot preferentially
  // quote from concise structured answer blocks at the top of content.
  // The `data-answer` attribute is also picked up by the Speakable schema
  // selector for voice-assistant surfaces.
  Answer: ({
    q,
    children,
  }: {
    q: string;
    children: React.ReactNode;
  }) => (
    <aside
      data-answer
      data-speakable
      className="my-8 border-l-[3px] border-brand-cyan bg-brand-dark rounded-r-sm p-6 flex flex-col gap-3"
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
        ▸ Quick answer
      </span>
      <p className="font-heading text-white text-xl leading-snug">{q}</p>
      <div className="font-body text-white/85 leading-relaxed">{children}</div>
    </aside>
  ),
  Key: ({ children }: { children: React.ReactNode }) => (
    <span className="bg-brand-purple/25 text-white px-1.5 py-0.5 rounded-sm">
      {children}
    </span>
  ),
  h1: (props) => (
    <h1 className="font-heading text-4xl text-white mt-8 mb-4" {...props} />
  ),
  h2: (props) => (
    <h2 className="font-heading text-2xl text-white mt-10 mb-3" {...props} />
  ),
  h3: (props) => (
    <h3 className="font-heading text-xl text-white mt-8 mb-2" {...props} />
  ),
  p: (props) => (
    <p className="font-body text-white/80 leading-relaxed my-4" {...props} />
  ),
  a: ({ href = '#', ...props }) => (
    <Link
      href={href}
      className="text-brand-cyan underline-offset-4 hover:underline"
      {...props}
    />
  ),
  ul: (props) => (
    <ul className="list-disc list-outside pl-6 space-y-2 my-4 marker:text-brand-purple" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal list-outside pl-6 space-y-2 my-4 marker:text-brand-purple" {...props} />
  ),
  code: (props) => (
    <code
      className="font-mono text-brand-cyan bg-black px-1.5 py-0.5 rounded-sm text-sm"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="font-mono bg-black border border-brand-cyan/20 p-4 my-6 overflow-x-auto text-sm"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="border-l-[3px] border-brand-purple pl-4 italic text-white/80 my-6"
      {...props}
    />
  ),
};
