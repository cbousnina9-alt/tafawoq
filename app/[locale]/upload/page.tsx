import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import StaticPage from '@/components/StaticPage';
import { t } from '@/lib/i18n';
import { alternates, type Locale } from '@/lib/site';

type P = { params: Promise<{ locale: Locale }> };
const lead = {
  ar: 'عندك فرض، اختبار، درس أو حل غير موجود في الموقع؟ أرسله لنا، نراجعه ونضيفه ليستفيد منه آلاف التلاميذ، ويمكننا ذكر اسمك.',
  fr: 'Vous avez un devoir, un examen ou un corrigé ? Envoyez-le, nous le vérifions et le publions.',
  en: 'Have a test, exam or answer key we don’t have? Send it — we review and publish it.',
};

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return { title: t(locale).upload, description: lead[locale], alternates: alternates(locale, '/upload') };
}

export default async function Page({ params }: P) {
  const { locale } = await params;
  return (
    <StaticPage locale={locale} path="/upload" title={t(locale).upload} lead={lead[locale]}>
      <ContactForm locale={locale} upload />
    </StaticPage>
  );
}
