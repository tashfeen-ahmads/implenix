import Link from 'next/link';
import { LogoLockup } from '@/components/common/LogoLockup';
import { RonLauncher } from '@/components/ron/RonLauncher';
import { MotionProvider } from '@/components/motion/MotionProvider';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <header className="border-b border-brand-purple/15">
        <div className="max-w-content mx-auto px-6 h-14 flex items-center">
          <LogoLockup size="sm" />
        </div>
      </header>
      <main id="main" className="flex-1">{children}</main>
      <footer className="border-t border-brand-purple/20 bg-black">
        <div className="max-w-content mx-auto px-6 py-6 text-xs text-white/60 flex flex-wrap items-center justify-between gap-2 font-body">
          <span>© 2025 Implenix. All rights reserved.</span>
          <Link href="/privacy-policy" className="hover:text-brand-cyan">
            Privacy
          </Link>
        </div>
      </footer>
      <RonLauncher />
    </div>
    </MotionProvider>
  );
}
