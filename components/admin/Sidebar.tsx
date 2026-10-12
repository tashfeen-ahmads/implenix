'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  CalendarDays,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  Users,
  X,
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/browser';

const NAV = [
  { href: '/admin', label: 'Overview', Icon: LayoutDashboard, exact: true },
  { href: '/admin/pipeline', label: 'Pipeline', Icon: KanbanSquare },
  { href: '/admin/calendar', label: 'Calendar', Icon: CalendarDays },
  { heading: 'Outreach' },
  { href: '/admin/outreach/contacts', label: 'Contacts', Icon: Users },
  { href: '/admin/outreach/campaigns', label: 'Campaigns', Icon: Megaphone },
  { href: '/admin/outreach/inbox', label: 'Inbox', Icon: Inbox },
] as const;

export function Sidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabaseBrowser().auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  };

  const nav = (
    <nav aria-label="Dashboard" className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        if ('heading' in item) {
          return (
            <p key={item.heading} className="mt-5 mb-1 px-3 font-mono text-[10px] uppercase tracking-widest text-white/45">
              {item.heading}
            </p>
          );
        }
        const active = 'exact' in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-sm font-body text-sm transition-colors ${
              active ? 'bg-brand-purple/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.Icon size={16} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const account = (
    <div className="border-t border-white/10 pt-4 mt-4">
      <p className="px-3 font-body text-sm text-white truncate">{name}</p>
      <p className="px-3 font-body text-xs text-white/55 truncate">{email}</p>
      <button
        type="button"
        onClick={signOut}
        className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-sm font-body text-sm text-white/70 hover:text-white hover:bg-white/5"
      >
        <LogOut size={16} aria-hidden /> Sign out
      </button>
    </div>
  );

  return (
    <>
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-black border-b border-white/10">
        <span className="font-heading text-white">implenix <span className="text-white/50 text-sm">team</span></span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="admin-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="w-10 h-10 flex items-center justify-center text-white"
        >
          {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </div>
      <div
        id="admin-nav"
        className={`${open ? 'flex' : 'hidden'} lg:flex flex-col fixed lg:sticky top-14 lg:top-0 inset-x-0 bottom-0 lg:h-screen z-20 lg:w-60 shrink-0 bg-black border-r border-white/10 p-4 overflow-y-auto`}
      >
        <Link href="/admin" className="hidden lg:block px-3 mb-6 font-heading text-lg text-white">
          implenix <span className="text-white/50 text-sm">team</span>
        </Link>
        <div className="flex-1">{nav}</div>
        {account}
      </div>
    </>
  );
}
