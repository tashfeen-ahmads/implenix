'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { DOCS_NAV, type DocsNavSection } from '@/lib/docsNav';

// `collapseInactive` (mobile): only the section holding the current page
// starts open, so the article is not pushed a full screen down.
export function DocsSidebar({ collapseInactive = false }: { collapseInactive?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Documentation">
      <ul className="space-y-1">
        {DOCS_NAV.map((section) => (
          <SidebarSection
            key={section.title}
            section={section}
            pathname={pathname}
            startOpen={
              !collapseInactive ||
              section.items.some((item) => item.href === pathname)
            }
          />
        ))}
      </ul>
    </nav>
  );
}

function SidebarSection({
  section,
  pathname,
  startOpen,
}: {
  section: DocsNavSection;
  pathname: string | null;
  startOpen: boolean;
}) {
  const [open, setOpen] = useState<boolean>(startOpen);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-left text-xs uppercase tracking-widest text-white/60 hover:text-white py-3 lg:py-2"
      >
        {section.title}
        <ChevronDown
          aria-hidden
          size={14}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul className="border-l border-brand-purple/20 ml-1 pl-3 space-y-1">
          {section.items.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`block py-2.5 lg:py-1.5 text-sm font-body transition-colors ${
                    active
                      ? 'text-brand-violet'
                      : 'text-white/80 hover:text-brand-cyan'
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
