import type { Metadata } from 'next';
import { FavoritesList } from '@/components/Interactive';
import StaticPage from '@/components/StaticPage';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/site';

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return { title: t(locale).favorites, robots: { index: false, follow: true } };
}

export default async function Page({ params }: P) {
  const { locale } = await params;
  return (
    <StaticPage locale={locale} path="/favorites" title={t(locale).favorites}>
      <FavoritesList empty={t(locale).favoritesEmpty} />
    </StaticPage>
  );
}
