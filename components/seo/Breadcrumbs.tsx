import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SchemaOrg } from './SchemaOrg';
import {
  breadcrumbListSchema,
  type BreadcrumbCrumb,
} from '@/lib/schema';

type Props = {
  crumbs: BreadcrumbCrumb[];
  className?: string;
};

// Visual breadcrumbs + paired BreadcrumbList JSON-LD. The last crumb
// is rendered as the current page (no link, aria-current=page) so
// users and crawlers both see the same hierarchy.
export function Breadcrumbs({ crumbs, className = '' }: Props) {
  if (!crumbs.length) return null;
  return (
    <>
      <SchemaOrg schema={breadcrumbListSchema(crumbs)} />
      <nav
        aria-label="Breadcrumb"
        className={`text-[11px] font-mono uppercase tracking-widest text-white/55 ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={`${i}-${c.href}`} className="flex items-center gap-2">
                {isLast ? (
                  <span aria-current="page" className="text-brand-cyan">
                    {c.label}
                  </span>
                ) : (
                  <Link
                    href={c.href}
                    className="hover:text-brand-cyan transition-colors"
                  >
                    {c.label}
                  </Link>
                )}
                {!isLast ? (
                  <ChevronRight
                    size={11}
                    aria-hidden="true"
                    className="text-white/30"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
