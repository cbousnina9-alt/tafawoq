import type { Metadata } from 'next';
import { JsonLd } from '@/components/Seo';
import StaticPage from '@/components/StaticPage';
import { t } from '@/lib/i18n';
import { faqs } from '@/lib/pages';
import { alternates, type Locale } from '@/lib/site';

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return { title: t(locale).faqs, description: faqs[locale].map((f) => f.q).join(' '), alternates: alternates(locale, '/faqs') };
}

export default async function Page({ params }: P) {
  const { locale } = await params;
  const list = faqs[locale];
  return (
    <StaticPage locale={locale} path="/faqs" title={t(locale).faqs}>
      <div className="prose">
        {list.map((f) => (
          <section key={f.q}>
            <h2 style={{ fontSize: '1.1rem' }}>{f.q}</h2>
            <p>{f.a}</p>
          </section>
        ))}
      </div>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }} />
    </StaticPage>
  );
}
