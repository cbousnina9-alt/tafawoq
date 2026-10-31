import type { Metadata } from 'next';
import UploadForm from '@/components/UploadForm';
import StaticPage from '@/components/StaticPage';
import { t } from '@/lib/i18n';
import { alternates, type Locale } from '@/lib/site';

type P = { params: Promise<{ locale: Locale }> };
const lead = {
  ar: 'جاءك فرض أو اختبار في مؤسستك؟ صوّره وأرسله لنا، نكتبه في ورقة نظيفة مع الحل وننشره مجانًا ليستفيد منه آلاف التلاميذ في كل الولايات.',
  fr: 'Tu as eu un devoir ou un examen ? Prends-le en photo et envoie-le : nous le publions gratuitement avec son corrigé.',
  en: 'Had a test or exam at school? Snap a photo and send it — we publish it for free with an answer key.',
};

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return { title: t(locale).upload, description: lead[locale], alternates: alternates(locale, '/upload') };
}

export default async function Page({ params }: P) {
  const { locale } = await params;
  const L = (ar: string, fr: string, en: string) => (locale === 'ar' ? ar : locale === 'fr' ? fr : en);
  const steps = [
    [L('صوّر الموضوع', 'Photographie', 'Snap it'), L('صورة واضحة لكل صفحة، أو ملف PDF.', 'Une photo nette par page, ou un PDF.', 'One clear photo per page, or a PDF.')],
    [L('نراجعه ونكتبه', 'On le met au propre', 'We clean it up'), L('نعيد كتابته في ورقة مرتبة ونضيف الحل وسلم التنقيط.', 'Nous le réécrivons proprement avec le corrigé.', 'We retype it neatly and add the answers.')],
    [L('يُنشر باسمك', 'Publié à ton nom', 'Published with credit'), L('يظهر في صفحة المادة، ونذكر اسمك إن أردت.', 'Il apparaît sur la page de la matière, avec ton nom si tu veux.', 'It appears on the subject page, with your name if you wish.')],
  ];
  return (
    <StaticPage locale={locale} path="/upload" title={L('أرسل موضوعًا', 'Envoyer un sujet', 'Send a paper')} lead={lead[locale]}>
      <ol className="up-steps">
        {steps.map(([h, p], i) => (
          <li key={i}><span className="up-step-n">{i + 1}</span><div><b>{h}</b><p>{p}</p></div></li>
        ))}
      </ol>
      <UploadForm locale={locale} contactHref={`/${locale}/contact`} />
    </StaticPage>
  );
}
