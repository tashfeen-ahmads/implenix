'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  PhoneCall,
  PhoneOutgoing,
  Wrench,
  Stethoscope,
  Home as HomeIcon,
  Scale,
  Droplets,
  Sparkles,
  Car,
  HardHat,
  Zap,
  Scissors,
  Calculator,
  Megaphone,
  SprayCan,
  Banknote,
  Umbrella,
  PawPrint,
  Bone,
  Brain,
  Flower2,
  Trees,
  Bug,
  Truck,
  Dumbbell,
  Headphones,
  UserCog,
  ListTree,
  Voicemail,
  PhoneForwarded,
} from 'lucide-react';
import { LogoLockup } from '@/components/common/LogoLockup';
import { TestRonCTA } from '@/components/ron/TestRonCTA';
import { INDUSTRIES, industryUrl } from '@/lib/industries';
import { COMPARISON_PROFILES } from '@/lib/seo/comparisons';
import { COMPETITOR_PROFILES } from '@/lib/seo/competitors';

type NavGroup = {
  label: string;
  href: string;
  type: 'link' | 'mega-solutions' | 'mega-industries' | 'mega-compare';
};

const NAV_GROUPS: NavGroup[] = [
  { label: 'Solutions', href: '/', type: 'mega-solutions' },
  {
    label: 'Industries',
    href: '/ai-receptionist-for-hvac-companies',
    type: 'mega-industries',
  },
  {
    label: 'Compare',
    href: '/ai-receptionist-vs-answering-service',
    type: 'mega-compare',
  },
  { label: 'Pricing', href: '/pricing', type: 'link' },
  { label: 'Case Studies', href: '/case-studies', type: 'link' },
  { label: 'Live demo', href: '/try-it', type: 'link' },
];

const SOLUTIONS = [
  {
    href: '/',
    title: 'AI Receptionist',
    description: 'Answer every inbound call. Qualify and book the lead.',
    Icon: PhoneCall,
  },
  {
    href: '/solutions/ai-followup',
    title: 'AI Follow-up',
    description: 'Outbound sequences, reminders, and re-engagement.',
    Icon: PhoneOutgoing,
  },
];

const COMPARE_ICONS: Record<string, typeof Wrench> = {
  'answering-service': Headphones,
  'virtual-assistant': UserCog,
  'ivr-system': ListTree,
  voicemail: Voicemail,
  'call-center': PhoneForwarded,
};

const INDUSTRY_ICONS: Record<string, typeof Wrench> = {
  'hvac-companies': Wrench,
  dentists: Stethoscope,
  'real-estate': HomeIcon,
  'law-firms': Scale,
  plumbers: Droplets,
  'med-spas': Sparkles,
  'auto-repair': Car,
  roofers: HardHat,
  'medical-practices': Stethoscope,
  electricians: Zap,
  contractors: HardHat,
  salons: Scissors,
  accountants: Calculator,
  'marketing-agencies': Megaphone,
  'cleaning-services': SprayCan,
  'mortgage-brokers': Banknote,
  'insurance-agents': Umbrella,
  veterinarians: PawPrint,
  chiropractors: Bone,
  therapists: Brain,
  spas: Flower2,
  landscapers: Trees,
  'pest-control': Bug,
  'moving-companies': Truck,
  'personal-trainers': Dumbbell,
};

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<NavGroup['type'] | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    // Mobile menu is modal: Tab cycles inside it plus the toggle button,
    // and focus returns to the toggle when it closes.
    const button = menuButtonRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !mobileMenuRef.current) return;
      const items = [
        button,
        ...Array.from(
          mobileMenuRef.current.querySelectorAll<HTMLElement>('a[href], button'),
        ),
      ].filter(Boolean) as HTMLElement[];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      button?.focus();
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMega(null);
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onEnter = (type: NavGroup['type']) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (type === 'link') {
      setActiveMega(null);
      return;
    }
    setActiveMega(type);
  };

  const onLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveMega(null), 120);
  };

  return (
    <header
      className="sticky top-0 z-50 bg-brand-dark border-b border-brand-purple/20"
      onBlur={(e) => {
        // Close the mega menu once keyboard focus leaves the header.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setActiveMega(null);
        }
      }}
    >
      <div className="max-w-content mx-auto flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-10">
          <LogoLockup size="sm" />


          <nav className="hidden lg:flex items-center gap-6" onMouseLeave={onLeave}>
            {NAV_GROUPS.map((group) => {
              const isMega = group.type !== 'link';
              return (
                <div
                  key={group.label}
                  onMouseEnter={() => onEnter(group.type)}
                  onFocus={() => onEnter(group.type)}
                  className="relative"
                >
                  <Link
                    href={group.href}
                    data-cta-location="nav"
                    aria-haspopup={isMega ? 'true' : undefined}
                    aria-expanded={isMega ? activeMega === group.type : undefined}
                    className="inline-flex items-center gap-1 text-[13px] text-white/85 hover:text-brand-cyan transition-colors duration-150 font-body py-2"
                  >
                    {group.label}
                    {isMega ? (
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${
                          activeMega === group.type ? 'rotate-180 text-brand-cyan' : ''
                        }`} aria-hidden />
                    ) : null}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <TestRonCTA ctaLocation="nav" variant="nav" />
          <Link
            href="/contact"
            data-cta-location="nav-calendar"
            data-cta-type="primary"
            className="inline-flex items-center gap-1 bg-brand-purple text-white font-medium text-[13px] px-4 py-2 rounded-sm hover:opacity-90"
          >
            Book a call <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          ref={menuButtonRef}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden -mr-2 w-11 h-11 flex items-center justify-center text-white hover:text-brand-cyan transition-colors"
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </div>

      {/* Desktop mega menu panel */}
      <div
        onMouseEnter={() => {
          if (closeTimer.current) clearTimeout(closeTimer.current);
        }}
        onMouseLeave={onLeave}
        className={`hidden lg:block absolute left-0 right-0 top-14 border-b border-brand-purple/20 bg-brand-dark transition-[opacity,transform,visibility] duration-150 ${
          activeMega
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-1 invisible pointer-events-none'
        }`}
      >
        <div className="max-w-content mx-auto px-6 py-8">
          {activeMega === 'mega-solutions' ? (
            <div className="grid md:grid-cols-2 gap-3">
              {SOLUTIONS.map(({ href, title, description, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-start gap-4 border border-brand-purple/20 hover:border-brand-purple p-5 transition-colors"
                >
                  <span className="w-10 h-10 border border-brand-cyan/30 bg-black flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-brand-cyan" aria-hidden />
                  </span>
                  <span className="flex-1">
                    <span className="block font-heading text-white text-base">
                      {title}
                    </span>
                    <span className="block text-sm text-white/65 font-body mt-1 leading-relaxed">
                      {description}
                    </span>
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-brand-cyan mt-1 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              ))}
            </div>
          ) : null}

          {activeMega === 'mega-industries' ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INDUSTRIES.slice(0, 6).map((i) => {
                  const Icon = INDUSTRY_ICONS[i.slug] ?? Wrench;
                  return (
                    <Link
                      key={i.slug}
                      href={industryUrl(i.slug)}
                      className="group flex items-start gap-3 border border-brand-purple/20 hover:border-brand-purple p-4 transition-colors"
                    >
                      <span className="w-8 h-8 border border-brand-cyan/30 bg-black flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-brand-cyan" aria-hidden />
                      </span>
                      <span className="flex-1">
                        <span className="block font-heading text-white text-sm">
                          {i.name}
                        </span>
                        <span className="block text-xs text-white/55 font-body mt-1">
                          {i.painPoint}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/industries"
                className="group inline-flex items-center justify-between gap-3 border border-brand-cyan/40 hover:border-brand-cyan p-4 transition-colors"
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                  ▸ See all {INDUSTRIES.length} industries
                </span>
                <ArrowRight
                  size={14}
                  className="text-brand-cyan transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
          ) : null}

          {activeMega === 'mega-compare' ? (
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan mb-3">
                  ▸ Compare to category
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {COMPARISON_PROFILES.map((c) => {
                    const Icon = COMPARE_ICONS[c.slug] ?? Headphones;
                    return (
                      <Link
                        key={c.slug}
                        href={`/ai-receptionist-vs-${c.slug}`}
                        className="group flex items-start gap-3 border border-brand-purple/20 hover:border-brand-purple p-4 transition-colors"
                      >
                        <span className="w-9 h-9 border border-brand-cyan/30 bg-black flex items-center justify-center shrink-0">
                          <Icon size={16} className="text-brand-cyan" aria-hidden />
                        </span>
                        <span className="flex-1">
                          <span className="block font-heading text-white text-sm">
                            vs {c.alternativeName}
                          </span>
                          <span className="block text-xs text-white/55 font-body mt-1">
                            {c.punchlineLabel}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-brand-violet mb-3">
                  ▸ Brand alternatives
                </p>
                <div className="flex flex-col gap-3">
                  {COMPETITOR_PROFILES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${c.routeSlug}`}
                      className="group flex items-start gap-3 border border-brand-purple/20 hover:border-brand-purple p-4 transition-colors"
                    >
                      <span className="flex-1">
                        <span className="block font-heading text-white text-sm">
                          {c.competitorName} alternative
                        </span>
                        <span className="block text-xs text-white/55 font-body mt-1">
                          {c.punchlineLabel}
                        </span>
                      </span>
                      <ArrowRight
                        size={14}
                        className="text-brand-cyan mt-1 transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {open && (
        <div id="mobile-menu" ref={mobileMenuRef} className="lg:hidden fixed inset-0 top-14 bg-brand-dark z-40 flex flex-col px-6 py-8 gap-5 overflow-y-auto overscroll-contain">
          {NAV_GROUPS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              data-cta-location="nav"
              className="text-xl font-heading text-white border-b border-brand-purple/20 pb-4"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            data-cta-location="nav"
            data-cta-type="primary"
            className="bg-brand-purple text-white text-center font-medium px-5 py-3 rounded-sm"
          >
            Book a call
          </Link>
        </div>
      )}
    </header>
  );
}
