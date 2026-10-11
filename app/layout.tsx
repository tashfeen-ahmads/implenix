import type { Metadata, Viewport } from 'next';
import { Dela_Gothic_One, Montserrat, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { organizationSchema, websiteSchema } from '@/lib/schema';
import { DEFAULT_SEO, SITE_URL } from '@/lib/seo';
import '@/styles/globals.css';

const heading = Dela_Gothic_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

const body = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const mono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_SEO.defaultTitle,
    template: DEFAULT_SEO.titleTemplate,
  },
  description: DEFAULT_SEO.description,
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': [
        { url: `${SITE_URL}/blog/rss.xml`, title: 'Implenix Blog RSS' },
      ],
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Implenix',
    title: DEFAULT_SEO.defaultTitle,
    description: DEFAULT_SEO.description,
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@implenix',
    title: DEFAULT_SEO.defaultTitle,
    description: DEFAULT_SEO.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.webmanifest',
  // Search Console + Bing Webmaster verification.
  // Set NEXT_PUBLIC_GOOGLE_VERIFICATION + NEXT_PUBLIC_BING_VERIFICATION
  // before launch to validate site ownership.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? { 'msvalidate.01': [process.env.NEXT_PUBLIC_BING_VERIFICATION] }
      : undefined,
  },
};

// Next.js 14+ separates viewport into its own export so it can be
// dynamically overridden per-route without polluting metadata.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  // The site is dark-only, so the browser chrome matches in every mode.
  themeColor: '#070538',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <SchemaOrg schema={[organizationSchema(), websiteSchema()]} />
        {/* DNS prefetch + preconnect for the third-party origins the
            site actually talks to. Shaves 100-200ms off first render
            when GTM/analytics/audio need to fire. */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link
          rel="preconnect"
          href="https://connect.facebook.net"
          crossOrigin=""
        />
        <link rel="dns-prefetch" href="https://storage.vapi.ai" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* GTM: set NEXT_PUBLIC_GTM_ID to enable. */}
        {process.env.NEXT_PUBLIC_GTM_ID ? (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`}
          </Script>
        ) : null}
        {/* META PIXEL: set NEXT_PUBLIC_META_PIXEL_ID to enable. */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID ? (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
              n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
              t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${process.env.NEXT_PUBLIC_META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        ) : null}
        {/* GOOGLE ADS: set NEXT_PUBLIC_GOOGLE_ADS_ID to enable. */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-ads" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');`}
            </Script>
          </>
        ) : null}
      </head>
      <body className="min-h-screen bg-brand-dark text-white antialiased">
        {process.env.NEXT_PUBLIC_GTM_ID ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}
        {children}
      </body>
    </html>
  );
}
