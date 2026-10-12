import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Team dashboard', template: '%s · Implenix team' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#07061a] text-white">{children}</div>;
}
