import { Breadcrumbs } from './Seo';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/site';

export default function StaticPage({ locale, path, title, lead, children }: { locale: Locale; path: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <>
      <section className="board">
        <div className="wrap page-head">
          <Breadcrumbs items={[{ name: t(locale).home, href: `/${locale}` }, { name: title, href: `/${locale}${path}` }]} />
          <h1>{title}</h1>
          {lead && <p>{lead}</p>}
        </div>
      </section>
      <div className="wrap" style={{ paddingTop: 26 }}>
        <div className="sheet">{children}</div>
      </div>
    </>
  );
}
