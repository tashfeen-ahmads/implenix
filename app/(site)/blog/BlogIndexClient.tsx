'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';


type Post = {
  url: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readTime: string;
  heroImage?: string;
  heroImageAlt?: string;
};

export function BlogIndexClient({ posts }: { posts: Post[] }) {
  const [category, setCategory] = useState('All');
  // Chips come from the posts themselves, so there is never an empty
  // category and every real one is filterable.
  const CATEGORIES = useMemo(
    () => ['All', ...Array.from(new Set(posts.map((p) => p.category))).sort()],
    [posts],
  );
  const filtered = useMemo(() => {
    if (category === 'All') return posts;
    return posts.filter((p) => p.category === category);
  }, [posts, category]);

  return (
    <>
      <div className="max-w-content mx-auto px-6 pt-10">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 text-sm font-body rounded-sm transition-colors ${
                category === c
                  ? 'bg-brand-purple text-white'
                  : 'border border-brand-purple/30 text-white/80 hover:border-brand-purple'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-content mx-auto px-6 py-12">
        {/* CONTENT VIA MDX FILES IN /content/blog/, ASSIGN TO CONTENT TEAM */}
        <h2 className="sr-only">Posts</h2>
        {filtered.length === 0 ? (
          <div className="border border-brand-purple/20 p-10 text-center text-white/70 font-body">
            No posts in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <Link
                key={p.url}
                href={p.url}
                data-cta-location="blog-card"
                className="group flex flex-col bg-black border border-brand-purple/20 hover:border-brand-purple transition-colors overflow-hidden"
              >
                <div className="relative aspect-[16/9] bg-brand-dark border-b border-brand-purple/20 overflow-hidden">
                  {p.heroImage ? (
                    <Image
                      src={p.heroImage}
                      alt={p.heroImageAlt ?? p.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <span className="self-start bg-brand-purple text-white text-[10px] uppercase tracking-widest font-medium px-2 py-1">
                    {p.category}
                  </span>
                  <h3 className="font-heading text-xl text-white leading-snug">
                    {p.title}
                  </h3>
                  <p className="font-body text-sm text-white/70 line-clamp-3">
                    {p.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-white/50 font-mono">
                      {p.readTime}
                    </span>
                    <span className="inline-flex items-center gap-1 text-brand-cyan text-sm">
                      Read{' '}
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
