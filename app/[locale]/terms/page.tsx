import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';
import { pages } from '@/lib/pages';
import { alternates, type Locale } from '@/lib/site';

type P = { params: Promise<{ locale: Locale }> };
const KEY = 'terms';

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  const pg = pages[KEY][locale];
  return { title: pg.title, description: pg.description, alternates: alternates(locale, '/' + KEY) };
}

export default async function Page({ params }: P) {
  const { locale } = await params;
  const pg = pages[KEY][locale];
  return (
    <StaticPage locale={locale} path={'/' + KEY} title={pg.title}>
      <div className="prose" dangerouslySetInnerHTML={{ __html: pg.html }} />
    </StaticPage>
  );
}
