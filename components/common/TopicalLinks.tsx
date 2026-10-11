import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import { publishedBlogPosts } from '@/lib/blog';
import {
  getTopicsForPost,
  getRelatedPosts,
} from '@/lib/blogTopics';

type Props = { postSlug: string };

// Auto-generated topical link block rendered at the bottom of every
// blog post. Shows:
//   1. Which topic hubs the post belongs to (linked)
//   2. Up to 4 related posts from the same hub (linked)
// This drives the internal-linking density that Google 2026 uses to
// identify topical authority. Server component, no client JS.
export function TopicalLinks({ postSlug }: Props) {
  const topics = getTopicsForPost(postSlug);
  const related = getRelatedPosts(postSlug, 4);
  const relatedPosts = related
    .map((r) => publishedBlogPosts.find((p) => p.slug === r.slug))
    .filter(Boolean) as (typeof publishedBlogPosts)[number][];

  if (topics.length === 0 && relatedPosts.length === 0) return null;

  return (
    <aside className="mt-16 border border-brand-purple/25 bg-black p-6 md:p-8 flex flex-col gap-6">
      {topics.length > 0 ? (
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan flex items-center gap-1.5">
            <Layers size={11} /> Part of this topic hub
          </span>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <Link
                key={t.slug}
                href={`/blog/topics/${t.slug}`}
                data-cta-location="topical-links-hub"
                className="inline-flex items-center gap-1.5 border border-brand-purple text-white bg-brand-purple/10 hover:bg-brand-purple/20 px-3 py-1.5 text-xs font-mono uppercase tracking-widest transition-colors"
              >
                {t.name}
                <ArrowRight size={11} className="text-brand-cyan" />
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {relatedPosts.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-brand-purple/15 pt-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
            ▸ Related reading
          </span>
          <ul className="flex flex-col gap-2.5">
            {relatedPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={p.url}
                  data-cta-location="topical-links-post"
                  className="group inline-flex items-start gap-2 text-white/90 hover:text-brand-cyan transition-colors font-body text-sm md:text-base leading-snug"
                >
                  <ArrowRight
                    size={14}
                    className="text-brand-cyan mt-0.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                  />
                  <span>{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
