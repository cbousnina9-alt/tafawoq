import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import SubjectIcon from '@/components/SubjectIcon';
import ResourceList from '@/components/ResourceList';
import { Breadcrumbs, JsonLd } from '@/components/Seo';
import { categories, categoryIds, levelById, levels, stages, stageIds, subjects, type StageId } from '@/lib/catalog';
import { articlesOf, countOf, resourcesOf } from '@/lib/content';
import { t } from '@/lib/i18n';
import { levelSeo, stageSeo } from '@/lib/seo';
import { abs, alternates, locales, site, type Locale } from '@/lib/site';

type P = { params: Promise<{ locale: Locale; section: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  const sections = [...stageIds, ...levels.map((l) => l.id), 'library', ...categoryIds];
  return locales.flatMap((locale) => sections.map((section) => ({ locale, section })));
}

const libraryText = {
  ar: { h1: 'منوعات: نصائح، قصص، ألغاز ووثائق', desc: 'مقالات ونصائح للمراجعة، قصص للأطفال، ألغاز مع الحل ووثائق للأساتذة.' },
  fr: { h1: 'Bibliothèque : conseils, histoires et énigmes', desc: 'Conseils de révision, histoires pour enfants, énigmes et documents pour enseignants.' },
  en: { h1: 'Library: tips, stories and riddles', desc: 'Revision tips, stories for children, riddles and teaching documents.' },
};

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, section } = await params;
  if (stageIds.includes(section as StageId)) {
    const s = stageSeo(locale, section as StageId);
    return { title: s.title, description: s.description, alternates: alternates(locale, `/${section}`) };
  }
  const lv = levelById(section);
  if (lv) {
    const s = levelSeo(locale, lv);
    return { title: s.title, description: s.description, alternates: alternates(locale, `/${section}`), robots: countOf(lv.id) ? undefined : { index: false, follow: true } };
  }
  if (section === 'library') return { title: libraryText[locale].h1, description: libraryText[locale].desc, alternates: alternates(locale, '/library') };
  const c = categories[section];
  const has = articlesOf(locale, section).length > 0;
  return { title: c.name[locale], description: c.desc[locale], alternates: alternates(locale, `/${section}`), robots: has ? undefined : { index: false, follow: true } };
}

export default async function SectionPage({ params }: P) {
  const { locale, section } = await params;
  const d = t(locale);
  const home = { name: d.home, href: `/${locale}` };

  // ---------- صفحة الطور ----------
  if (stageIds.includes(section as StageId)) {
    const st = stages[section as StageId];
    const s = stageSeo(locale, section as StageId);
    return (
      <>
        <section className="board">
          <div className="wrap page-head">
            <Breadcrumbs items={[home, { name: st.name[locale], href: `/${locale}/${section}` }]} />
            <h1>{s.h1}</h1>
            <p>{s.description}</p>
          </div>
        </section>
        <div className="wrap">
          <AdSlot pos="top" format="horizontal" />
          {st.levels.map((id) => {
            const lv = levelById(id)!;
            return (
              <section className="section" key={id}>
                <div className="section-head">
                  <h2><Link href={`/${locale}/${id}`}>{lv.name[locale]}</Link></h2>
                  <span style={{ color: 'var(--muted)', fontSize: '.9rem' }}>{countOf(id)} {d.files}</span>
                </div>
                <SubjectGrid locale={locale} levelId={id} />
              </section>
            );
          })}
        </div>
      </>
    );
  }

  // ---------- صفحة المستوى ----------
  const lv = levelById(section);
  if (lv) {
    const s = levelSeo(locale, lv);
    const stage = stages[lv.stage];
    const latest = resourcesOf(lv.id).slice(0, 10);
    const siblings = stage.levels.filter((x) => x !== lv.id).map((x) => levelById(x)!);
    return (
      <>
        <section className="board">
          <div className="wrap page-head">
            <Breadcrumbs items={[home, { name: stage.name[locale], href: `/${locale}/${lv.stage}` }, { name: lv.name[locale], href: `/${locale}/${lv.id}` }]} />
            <h1>{s.h1}</h1>
            <p>{s.description}</p>
          </div>
        </section>
        <div className="wrap layout">
          <div>
            <h2>{d.subjects}</h2>
            <SubjectGrid locale={locale} levelId={lv.id} />
            {lv.examFor && (
              <p style={{ marginTop: 16 }}>
                <Link className="btn btn-ghost" href={`/${locale}/${lv.examFor}`}>{d.prepareFor} {levelById(lv.examFor)!.name[locale]}</Link>
              </p>
            )}
            <AdSlot pos="inContent" />
            {latest.length > 0 && (
              <section className="section" style={{ paddingTop: 10 }}>
                <h2>{d.latest}</h2>
                <ResourceList locale={locale} list={latest} showContext />
              </section>
            )}
          </div>
          <aside>
            <AdSlot pos="sidebar" format="rectangle" />
            <div className="sheet">
              <h3>{stage.name[locale]}</h3>
              <ul className="link-list">
                {siblings.map((x) => (
                  <li key={x.id}><Link href={`/${locale}/${x.id}`}>{x.name[locale]}</Link></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </>
    );
  }

  // ---------- المنوعات ----------
  if (section === 'library') {
    return (
      <>
        <section className="board">
          <div className="wrap page-head">
            <Breadcrumbs items={[home, { name: d.library, href: `/${locale}/library` }]} />
            <h1>{libraryText[locale].h1}</h1>
            <p>{libraryText[locale].desc}</p>
          </div>
        </section>
        <div className="wrap">
          <section className="section">
            <div className="subject-grid">
              {categoryIds.map((c) => (
                <Link key={c} href={`/${locale}/${c}`} className={articlesOf(locale, c).length ? '' : 'empty'}>
                  {categories[c].name[locale]}
                  <span className="count">{articlesOf(locale, c).length}</span>
                </Link>
              ))}
            </div>
          </section>
          <ArticleGrid locale={locale} list={articlesOf(locale)} />
        </div>
      </>
    );
  }

  // ---------- قسم مقالات ----------
  const c = categories[section];
  if (!c) notFound();
  const list = articlesOf(locale, section);
  return (
    <>
      <section className="board">
        <div className="wrap page-head">
          <Breadcrumbs items={[home, { name: d.library, href: `/${locale}/library` }, { name: c.name[locale], href: `/${locale}/${section}` }]} />
          <h1>{c.name[locale]}</h1>
          <p>{c.desc[locale]}</p>
        </div>
      </section>
      <div className="wrap">
        {list.length ? <ArticleGrid locale={locale} list={list} /> : (
          <section className="section"><div className="empty-state"><p>{locale === 'ar' ? 'لا توجد مقالات في هذا القسم بعد.' : locale === 'fr' ? 'Aucun article pour l’instant.' : 'No articles yet.'}</p></div></section>
        )}
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.name[locale], url: abs(`/${locale}/${section}`), isPartOf: { '@type': 'WebSite', name: site.name[locale], url: site.url } }} />
      </div>
    </>
  );
}

function SubjectGrid({ locale, levelId }: { locale: Locale; levelId: string }) {
  const lv = levelById(levelId)!;
  const d = t(locale);
  return (
    <div className="subj-grid">
      {[...lv.subjects].sort((a, b) => countOf(levelId, b) - countOf(levelId, a)).map((s) => {
        const n = countOf(levelId, s);
        return (
          <Link key={s} href={`/${locale}/${levelId}/${s}`} className={`subj-card${n ? '' : ' empty'}`}>
            <SubjectIcon subject={s} />
            <span className="subj-txt">
              <span className="subj-name">{subjects[s].name[locale]}</span>
              <span className="count">{n ? `${n} ${d.files}` : (locale === 'ar' ? 'قريبًا' : locale === 'fr' ? 'Bientôt' : 'Soon')}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function ArticleGrid({ locale, list }: { locale: Locale; list: ReturnType<typeof articlesOf> }) {
  const d = t(locale);
  if (!list.length) return null;
  return (
    <section className="section">
      <div className="article-list">
        {list.map((a) => (
          <article className="article-item" key={a.slug}>
            <span className="cat">{categories[a.category]?.name[locale]}</span>
            <h3><Link href={`/${locale}/${a.category}/${a.slug}`}>{a.title}</Link></h3>
            <p>{a.description}</p>
            <Link href={`/${locale}/${a.category}/${a.slug}`} style={{ fontSize: '.9rem', fontWeight: 600, marginTop: 'auto' }}>{d.readMore}</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
