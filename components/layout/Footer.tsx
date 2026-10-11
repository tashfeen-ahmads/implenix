import Link from 'next/link';
import { LogoLockup } from '@/components/common/LogoLockup';
import { TestRonCTA } from '@/components/ron/TestRonCTA';
import { FooterCta } from './FooterCta';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { href: '/', label: 'AI Receptionist' },
      { href: '/solutions/ai-followup', label: 'AI Follow-up' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/preview/dashboard', label: 'Inside the dashboard' },
      { href: '/docs/getting-started/quick-start', label: 'Documentation' },
    ],
  },
  {
    heading: 'Industries',
    links: [
      { href: '/ai-receptionist-for-hvac-companies', label: 'HVAC' },
      { href: '/ai-receptionist-for-dentists', label: 'Dental' },
      { href: '/ai-receptionist-for-real-estate', label: 'Real Estate' },
      { href: '/ai-receptionist-for-law-firms', label: 'Law Firms' },
      { href: '/industries', label: 'All 25 industries' },
    ],
  },
  {
    heading: 'By business size',
    links: [
      { href: '/ai-receptionist-for-solopreneurs', label: 'Solopreneurs' },
      { href: '/ai-receptionist-for-small-business', label: 'Small Business' },
      { href: '/ai-receptionist-for-startups', label: 'Startups' },
      { href: '/ai-receptionist-for-agencies', label: 'Agencies' },
      { href: '/ai-receptionist-for-multi-location-businesses', label: 'Multi-location' },
    ],
  },
  {
    heading: 'Compare',
    links: [
      { href: '/ai-receptionist-vs-answering-service', label: 'vs Answering Service' },
      { href: '/ai-receptionist-vs-virtual-assistant', label: 'vs Virtual Assistant' },
      { href: '/ai-receptionist-vs-ivr-system', label: 'vs IVR System' },
      { href: '/ai-receptionist-vs-voicemail', label: 'vs Voicemail' },
      { href: '/ai-receptionist-vs-call-center', label: 'vs Call Center' },
      { href: '/smith-ai-alternative', label: 'Smith.ai alternative' },
      { href: '/goodcall-alternative', label: 'Goodcall alternative' },
      { href: '/ruby-receptionists-alternative', label: 'Ruby alternative' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/privacy-policy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { href: '/audit', label: 'Free missed-call audit' },
      { href: '/try-it', label: 'Test Ron now' },
      { href: '/blog', label: 'Blog' },
      { href: '/resources', label: 'Guides & Playbooks' },
      { href: '/glossary', label: 'Voice AI glossary' },
      { href: '/what-is-an-ai-receptionist', label: 'What is an AI receptionist?' },
      { href: '/how-does-an-ai-receptionist-work', label: 'How does it work?' },
      { href: '/benefits-of-ai-receptionist', label: 'Benefits' },
      { href: '/24-7-ai-receptionist', label: '24/7 coverage' },
      { href: '/virtual-ai-receptionist', label: 'Virtual receptionist' },
      { href: '/ai-phone-answering-service', label: 'AI phone answering service' },
      { href: '/ai-receptionist-cost-comparison', label: 'Cost comparison' },
    ],
  },
];

export function Footer() {
  return (
    <footer>
      <FooterCta />

      <div className="bg-black border-t border-brand-purple/20">
        <div className="max-w-content mx-auto px-6 py-16 grid grid-cols-2 lg:grid-cols-8 gap-8">
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-5">
            <LogoLockup size="md" />
            <p className="text-white/60 text-sm font-body max-w-xs">
              We Automate the Call. You Close the Deal.
            </p>
            <div className="border border-brand-cyan/30 bg-brand-dark p-4 flex flex-col gap-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
                ▸ Skip the form, talk to Ron
              </p>
              <p className="font-body text-xs text-white/65 leading-relaxed">
                Ron is the same AI receptionist that answers our customers’ phones.
                Live conversation, real qualification, in 60 seconds.
              </p>
              <TestRonCTA
                ctaLocation="footer-ron"
                variant="primary"
              />
            </div>
            <p className="text-xs text-white/55 font-mono uppercase tracking-widest">
              ▸ implenix.net
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-mono text-white/55 text-xs uppercase tracking-widest mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/85 hover:text-brand-cyan text-sm font-body transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-content mx-auto px-6 py-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/50 font-mono uppercase tracking-widest">
            <span>© 2026 Implenix. All rights reserved.</span>
            <span>We Automate the Call. You Close the Deal.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
