import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/noto-naskh-arabic/700.css';
import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { t } from '@/lib/i18n';
import { dirOf, isLocale, locales, site, type Locale } from '@/lib/site';

export const dynamicParams = false;
export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export const viewport: Viewport = { themeColor: '#2251e3', width: 'device-width', initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name[locale]} — ${t(locale).tagline}`, template: `%s | ${site.name[locale]}` },
    applicationName: site.name[locale],
    formatDetection: { telephone: false },
    verification: site.googleVerification ? { google: site.googleVerification } : undefined,
    openGraph: { siteName: site.name[locale], locale: locale === 'ar' ? 'ar_DZ' : locale === 'fr' ? 'fr_DZ' : 'en_US', type: 'website', images: [{ url: '/og-tafawoq.png', width: 1200, height: 630, alt: 'تفوّق — فروض واختبارات بالحل' }] },
    twitter: { card: 'summary_large_image' },
    icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
    manifest: '/manifest.webmanifest',
    other: site.adsenseClient ? { 'google-adsense-account': site.adsenseClient } : undefined,
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  return (
    <html lang={l === 'ar' ? 'ar-DZ' : l} dir={dirOf(l)}>
      <body>
        <Header locale={l} />
        <main id="main">{children}</main>
        <Footer locale={l} />
        {site.adsenseClient && (
          <Script async strategy="afterInteractive" crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseClient}`} />
        )}
        {site.gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${site.gaId}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.gaId}');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
