import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { LeadMagnetPopup } from '@/components/common/LeadMagnetPopup';
import { RonLauncher } from '@/components/ron/RonLauncher';
import { MotionProvider } from '@/components/motion/MotionProvider';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-brand-purple focus:text-white focus:px-4 focus:py-2 focus:rounded-sm focus:font-medium focus:text-sm"
      >
        Skip to main content
      </a>
      <NavBar />
      <main id="main">{children}</main>
      <Footer />
      <LeadMagnetPopup />
      <RonLauncher />
    </MotionProvider>
  );
}
