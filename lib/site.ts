// ============================================================
//  إعدادات الموقع — غيّر هنا الاسم والدومين ومعرّفات الإعلانات
// ============================================================

export const locales = ['ar', 'fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ar';

export const site = {
  // اسم العلامة (يظهر في الشعار والعناوين)
  name: { ar: 'تفوّق', fr: 'Tafawoq', en: 'Tafawoq' } as Record<Locale, string>,
  // الدومين النهائي بدون "/" في الآخر — ضعه في متغير البيئة NEXT_PUBLIC_SITE_URL
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com').replace(/\/$/, ''),
  // Google AdSense: ca-pub-XXXXXXXXXXXXXXXX
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '',
  // أرقام الوحدات الإعلانية (Ad units) من لوحة AdSense
  adSlots: {
    top: process.env.NEXT_PUBLIC_AD_SLOT_TOP || '',
    inContent: process.env.NEXT_PUBLIC_AD_SLOT_IN_CONTENT || '',
    sidebar: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || '',
    afterDownload: process.env.NEXT_PUBLIC_AD_SLOT_AFTER_DOWNLOAD || '',
  },
  // Google Analytics 4: G-XXXXXXX
  gaId: process.env.NEXT_PUBLIC_GA_ID || '',
  // Google Search Console verification code
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@example.com',
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || '',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
  },
};

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);
export const dirOf = (l: Locale) => (l === 'ar' ? 'rtl' : 'ltr');

export function abs(path: string) {
  return `${site.url}${path.startsWith('/') ? path : '/' + path}`;
}

// روابط hreflang لكل اللغات لنفس المسار (بدون بادئة اللغة)
export function alternates(locale: Locale, pathNoLocale: string, available: readonly Locale[] = locales) {
  const p = pathNoLocale === '/' ? '' : pathNoLocale;
  const languages: Record<string, string> = {};
  for (const l of available) languages[l === 'ar' ? 'ar-DZ' : l === 'fr' ? 'fr-DZ' : 'en'] = abs(`/${l}${p}`);
  if (available.includes('ar')) languages['x-default'] = abs(`/ar${p}`);
  return { canonical: abs(`/${locale}${p}`), languages };
}
