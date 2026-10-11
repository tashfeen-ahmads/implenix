import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { allDocs } from 'contentlayer/generated';
import { DOCS_NAV } from '@/lib/docsNav';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Implenix Docs | Setup, Integrations and Phone Guides',
  description:
    'Implenix documentation: get your AI receptionist live, configure call scripts and transfer rules, connect your CRM, and set up your phone number.',
  path: '/docs',
});

export default function DocsIndexPage() {
  const describe = (href: string) =>
    allDocs.find((d) => d.url === href)?.description ?? '';
  return (
    <>
      <h1 className="font-heading text-4xl md:text-5xl text-white leading-tight tracking-tight">
        Implenix documentation
      </h1>
      <p className="mt-4 font-body text-white/70 text-lg leading-relaxed max-w-2xl">
        Everything you need to take an AI receptionist from kickoff to live
        calls, and keep it tuned once it is answering your phone.
      </p>
      <div className="mt-12 flex flex-col gap-12">
        {DOCS_NAV.map((section) => (
          <section key={section.title}>
            <h2 className="font-heading text-2xl text-white">{section.title}</h2>
            <ul className="mt-4 grid sm:grid-cols-2 gap-3">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group h-full flex flex-col gap-2 border border-brand-purple/25 hover:border-brand-purple p-5 transition-colors"
                  >
                    <span className="flex items-center justify-between gap-3 font-heading text-white">
                      {item.title}
                      <ArrowRight
                        size={14}
                        aria-hidden
                        className="text-brand-cyan shrink-0 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                    <span className="font-body text-sm text-white/60 leading-relaxed">
                      {describe(item.href)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
