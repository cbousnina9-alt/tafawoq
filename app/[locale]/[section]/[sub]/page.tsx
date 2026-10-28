import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import FilterableList from '@/components/FilterableList';
import { toRows } from '@/components/ResourceList';
import { Breadcrumbs, JsonLd } from '@/components/Seo';
import { categories, levelById, levels, stages, subjects, trimesters, types } from '@/lib/catalog';
import { articles, articlesOf, resourcesOf } from '@/lib/content';
import { t } from '@/lib/i18n';
import { subjectSeo } from '@/lib/seo';
import { abs, alternates, locales, site, type Locale } from '@/lib/site';

type P = { params: Promise<{ locale: Locale; section: string; sub: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  const subjectPages = locales.flatMap((locale) => levels.flatMap((lv) => lv.subjects.map((sub) => ({ locale, section: lv.id, sub }))));
  const articlePages = articles().map((a) => ({ locale: a.lang, section: a.category, sub: a.slug }));
  return [...subjectPages, ...articlePages];
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, section, sub } = await params;
  const lv = levelById(section);
  if (lv) {
    const s = subjectSeo(locale, lv, sub);
    const has = resourcesOf(lv.id, sub).length > 0;
    return { title: s.title, description: s.description, alternates: alternates(locale, `/${section}/${sub}`), robots: has ? undefined : { index: false, follow: true } };
  }
  const a = articles().find((x) => x.category === section && x.slug === sub && x.lang === locale);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    alternates: alternates(locale, `/${section}/${sub}`, [a.lang]),
    openGraph: { type: 'article', title: a.title, description: a.description, publishedTime: a.date, modifiedTime: a.updated || a.date },
  };
}

export default async function SubPage({ params }: P) {
  const { locale, section, sub } = await params;
  const d = t(locale);
  const home = { name: d.home, href: `/${locale}` };
  const lv = levelById(section);

  // ---------- صفحة المادة ----------
  if (lv) {
    if (!lv.subjects.includes(sub)) notFound();
    const s = subjectSeo(locale, lv, sub);
    const list = resourcesOf(lv.id, sub);
    const rows = toRows(locale, list);
    const others = lv.subjects.filter((x) => x !== sub);
    const url = `/${locale}/${lv.id}/${sub}`;
    const pair = lv.examFor ? levelById(lv.examFor) : lv.exam ? levels.find((x) => x.examFor === lv.id) : undefined;
    const labels = {
      all: d.all,
      type: d.type,
      term: d.term,
      withSolution: d.withSolution,
      sample: d.sample,
      terms: { 1: trimesters[1][locale], 2: trimesters[2][locale], 3: trimesters[3][locale] },
      types: Object.fromEntries(Object.entries(types).map(([k, v]) => [k, v.many[locale]])),
    };
    return (
      <>
        <section className="board">
          <div className="wrap page-head">
            <Breadcrumbs items={[home, { name: stages[lv.stage].name[locale], href: `/${locale}/${lv.stage}` }, { name: lv.name[locale], href: `/${locale}/${lv.id}` }, { name: subjects[sub].name[locale], href: url }]} />
            <h1>{s.h1}</h1>
            <p>{s.description}</p>
          </div>
        </section>
        <div className="wrap layout">
          <div>
            {rows.length ? (
              <FilterableList rows={rows} labels={labels} />
            ) : (
              <div className="empty-state">
                <p>{d.noFiles}</p>
                <Link className="btn btn-primary" href={`/${locale}/upload`}>{d.sendFile}</Link>
              </div>
            )}
            <AdSlot pos="inContent" />
            {locale === 'ar' && rows.length > 0 && (
              <section className="seo-text" style={{ marginTop: 24 }}>
                <h2>حول {lv.exam ? 'مواضيع' : 'فروض واختبارات'} {subjects[sub].name.ar} — {lv.name.ar}</h2>
                <p>
                  تضم هذه الصفحة {rows.length} {rows.length > 10 ? 'ملفًا' : 'ملفات'} في مادة {subjects[sub].name.ar} {lv.exam ? `للتحضير ل${lv.name.ar}` : `في ${lv.name.ar}`}، مطابقة لمحتوى المنهاج الجزائري.
                  استعمل الأزرار أعلاه لتصفية الملفات حسب النوع أو الفصل، وافتح أي موضوع لتقرأه مباشرة على الصفحة أو تحمّله مجانًا بصيغة PDF. الملفات التي تحمل ختم «مع الحل» مرفقة بتصحيح نموذجي يساعدك على تقييم نفسك بعد المحاولة.
                </p>
              </section>
            )}
          </div>
          <aside>
            <AdSlot pos="sidebar" format="rectangle" />
            <div className="sheet">
              <h3>{d.otherSubjects}</h3>
              <ul className="link-list">
                {others.map((x) => (
                  <li key={x}><Link href={`/${locale}/${lv.id}/${x}`}>{subjects[x].name[locale]}</Link></li>
                ))}
              </ul>
            </div>
            {pair && pair.subjects.includes(sub) && (
              <div className="sheet">
                <h3>{lv.examFor ? `${d.prepareFor} ${pair.short[locale]}` : pair.name[locale]}</h3>
                <Link href={`/${locale}/${pair.id}/${sub}`}>{subjects[sub].name[locale]} — {pair.name[locale]}</Link>
              </div>
            )}
          </aside>
        </div>
        {list.length > 0 && (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: s.h1,
              description: s.description,
              url: abs(url),
              inLanguage: locale,
              mainEntity: { '@type': 'ItemList', numberOfItems: rows.length, itemListElement: rows.slice(0, 50).map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(r.href), name: r.title })) },
            }}
          />
        )}
      </>
    );
  }

  // ---------- صفحة المقال ----------
  const c = categories[section];
  const a = articles().find((x) => x.category === section && x.slug === sub && x.lang === locale);
  if (!c || !a) notFound();
  const more = articlesOf(locale).filter((x) => x.slug !== a.slug).slice(0, 5);
  const url = `/${locale}/${section}/${sub}`;
  const fmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : locale, { dateStyle: 'long' });
  return (
    <>
      <section className="board">
        <div className="wrap page-head">
          <Breadcrumbs items={[home, { name: d.library, href: `/${locale}/library` }, { name: c.name[locale], href: `/${locale}/${section}` }, { name: a.title, href: url }]} />
          <h1>{a.title}</h1>
          <p>
            <time dateTime={a.date}>{fmt.format(new Date(a.date))}</time> — {a.readingMinutes} {locale === 'ar' ? 'دقائق قراءة' : 'min'}
          </p>
        </div>
      </section>
      <div className="wrap layout">
        <article className="sheet">
          <div className="prose" dangerouslySetInnerHTML={{ __html: a.html }} />
          <AdSlot pos="inContent" />
        </article>
        <aside>
          <AdSlot pos="sidebar" format="rectangle" />
          {more.length > 0 && (
            <div className="sheet">
              <h3>{d.articles}</h3>
              <ul className="link-list">
                {more.map((m) => (
                  <li key={m.slug}><Link href={`/${locale}/${m.category}/${m.slug}`}>{m.title}</Link></li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.title,
          description: a.description,
          datePublished: a.date,
          dateModified: a.updated || a.date,
          inLanguage: locale,
          mainEntityOfPage: abs(url),
          author: { '@type': 'Organization', name: site.name[locale], url: site.url },
          publisher: { '@type': 'Organization', name: site.name[locale], logo: { '@type': 'ImageObject', url: abs('/icon-512.png') } },
        }}
      />
    </>
  );
}
