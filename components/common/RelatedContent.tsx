import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type LinkItem = { href: string; label: string };

type Props = {
  topic: string;
  type: 'industry' | 'blog' | 'resource' | 'case-study';
  links?: LinkItem[];
};

const FALLBACKS: Record<Props['type'], LinkItem[]> = {
  industry: [
    { href: '/ai-receptionist-for-hvac-companies', label: 'AI Receptionist for HVAC Companies' },
    { href: '/ai-receptionist-for-dentists', label: 'AI Receptionist for Dentists' },
    { href: '/ai-receptionist-for-plumbers', label: 'AI Receptionist for Plumbers' },
  ],
  blog: [
    { href: '/blog', label: 'Latest from the Implenix blog' },
    { href: '/resources', label: 'Implementation playbooks' },
    { href: '/case-studies', label: 'Verified case studies' },
  ],
  resource: [
    { href: '/resources', label: 'Resources hub' },
    { href: '/docs/getting-started/quick-start', label: 'Quick Start docs' },
    { href: '/blog', label: 'Implenix blog' },
  ],
  'case-study': [
    { href: '/case-studies', label: 'All case studies' },
    { href: '/', label: 'AI Receptionist solution' },
    { href: '/solutions/ai-followup', label: 'AI Follow-up solution' },
  ],
};

export function RelatedContent({ topic, type, links }: Props) {
  const items = links?.length ? links : FALLBACKS[type];
  return (
    <div className="border-t border-brand-purple/20 pt-10 mt-12">
      <h2 className="font-heading text-xl text-white mb-4">
        {topic}
      </h2>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.slice(0, 3).map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              data-cta-location="related"
              className="group flex items-center justify-between gap-2 border border-brand-purple/20 hover:border-brand-purple p-4 transition-colors"
            >
              <span className="text-white font-body text-sm">{link.label}</span>
              <ArrowRight
                size={16}
                className="text-brand-cyan transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
