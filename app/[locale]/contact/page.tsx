import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import StaticPage from '@/components/StaticPage';
import { t } from '@/lib/i18n';
import { alternates, site, type Locale } from '@/lib/site';

type P = { params: Promise<{ locale: Locale }> };
const lead = { ar: 'لسؤال، اقتراح، تصحيح خطأ أو طلب حذف محتوى، راسلنا وسنرد في أقرب وقت.', fr: 'Une question, une suggestion ou une demande de retrait ? Écrivez-nous.', en: 'Questions, suggestions or removal requests — write to us.' };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return { title: t(locale).contact, description: lead[locale], alternates: alternates(locale, '/contact') };
}

export default async function Page({ params }: P) {
  const { locale } = await params;
  return (
    <StaticPage locale={locale} path="/contact" title={t(locale).contact} lead={lead[locale]}>
      <p>E-mail: <a href={`mailto:${site.contactEmail}`} dir="ltr">{site.contactEmail}</a></p>
      <ContactForm locale={locale} />
    </StaticPage>
  );
}
