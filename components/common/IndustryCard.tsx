import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type Props = {
  industry: string;
  painPoint: string;
  href: string;
};

export function IndustryCard({ industry, painPoint, href }: Props) {
  return (
    <Link
      href={href}
      data-cta-location="industries-grid"
      data-cta-type="industry"
      className="group block bg-black border border-brand-purple/20 hover:border-brand-purple p-6 transition-colors duration-200 flex flex-col gap-3 min-h-[180px]"
    >
      <span className="text-[10px] uppercase tracking-widest text-brand-cyan font-mono">
        ▸ Industry
      </span>
      <h3 className="font-heading text-2xl text-white">{industry}</h3>
      <p className="text-white/65 text-sm font-body leading-relaxed flex-1">
        {painPoint}
      </p>
      <span className="inline-flex items-center gap-1.5 text-brand-cyan text-sm font-medium">
        See solution
        <ArrowRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}
