import type { Metadata } from 'next';
import { SearchClient } from '@/components/Interactive';
import StaticPage from '@/components/StaticPage';
import { searchIndex } from '@/lib/content';
import { t } from '@/lib/i18n';
import { alternates, type Locale } from '@/lib/site';

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return { title: t(locale).search, alternates: alternates(locale, '/search'), robots: { index: false, follow: true } };
}

export default async function Page({ params }: P) {
  const { locale } = await params;
  const d = t(locale);
  return (
    <StaticPage locale={locale} path="/search" title={d.search}>
      <SearchClient index={searchIndex(locale)} initial="" labels={{ placeholder: d.searchPlaceholder, search: d.search, results: d.results, none: d.noResults, withSolution: d.withSolution }} />
    </StaticPage>
  );
}
