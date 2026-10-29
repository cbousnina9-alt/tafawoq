import type { Metadata } from 'next';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import ResourceList from '@/components/ResourceList';
import { JsonLd } from '@/components/Seo';
import { categories, levelById, stages, stageIds, subjects } from '@/lib/catalog';
import { articlesOf, countOf, resources } from '@/lib/content';
import { t } from '@/lib/i18n';
import { abs, alternates, site, type Locale } from '@/lib/site';

type P = { params: Promise<{ locale: Locale }> };

const meta = {
  ar: {
    title: 'فروض واختبارات مع الحلول لكل المستويات — ابتدائي، متوسط، ثانوي، BEM و BAC',
    description: 'بنك فروض واختبارات الفصول الثلاثة مع الحلول، مواضيع شهادة التعليم المتوسط والبكالوريا، دروس وملخصات لكل المواد وفق المنهاج الجزائري. تحميل مجاني PDF.',
  },
  fr: {
    title: 'Devoirs et examens corrigés — primaire, moyen, secondaire, BEM et BAC',
    description: 'Banque de devoirs et d’examens corrigés des trois trimestres, sujets du BEM et du BAC, cours et résumés conformes au programme algérien. Téléchargement PDF gratuit.',
  },
  en: {
    title: 'Algerian tests and exams with answers — primary, middle, secondary, BEM & BAC',
    description: 'Term tests and exams with answers, official BEM and BAC papers, lessons and summaries following the Algerian curriculum. Free PDF downloads.',
  },
};

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return { title: { absolute: `${meta[locale].title} | ${site.name[locale]}` }, description: meta[locale].description, alternates: alternates(locale, '/') };
}

export default async function Home({ params }: P) {
  const { locale } = await params;
  const d = t(locale);
  // الأكثر طلبًا أولًا: الشهادات ثم الأقسام النهائية
  const priority = ['bac', 'bem', '4am', '3as', '5ap', '1as', '2as', '3am', '2am', '1am', '4ap', '3ap', '2ap', '1ap', '0ap'];
  const rank = (lv: string) => (priority.indexOf(lv) + 1 || 99);
  const latest = [...resources].sort((a, b) => (b.added || '').localeCompare(a.added || '') || rank(a.level) - rank(b.level)).slice(0, 10);
  const arts = articlesOf(locale).slice(0, 3);
  const examSubjects = (id: string) => levelById(id)!.subjects.filter((s) => countOf(id, s) > 0);

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: site.name[locale],
            url: abs(`/${locale}`),
            inLanguage: locale,
            potentialAction: { '@type': 'SearchAction', target: `${abs(`/${locale}/search`)}?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
          },
          { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: site.name[locale], url: site.url, logo: abs('/icon-512.png'), areaServed: 'DZ', sameAs: Object.values(site.social).filter(Boolean) },
        ]}
      />

      <section className="board">
        <div className="wrap hero">
          <h1>{d.heroTitle}</h1>
          <p className="lead">{d.heroText}</p>
          <form className="search-form" role="search" action={`/${locale}/search`} method="get">
            <label className="visually-hidden" htmlFor="hq">{d.search}</label>
            <input id="hq" name="q" type="search" placeholder={d.searchPlaceholder} />
            <button type="submit">{d.search}</button>
          </form>

          <nav className="path" aria-label={locale === 'ar' ? 'المستويات الدراسية' : locale === 'fr' ? 'Niveaux scolaires' : 'School levels'}>
            {stageIds.map((s) => (
              <div className="path-stage" key={s}>
                <h2><Link href={`/${locale}/${s}`}>{stages[s].name[locale]}</Link></h2>
                <div className="path-row">
                  {stages[s].levels.map((id) => {
                    const lv = levelById(id)!;
                    const label = lv.short[locale];
                    const m = label.match(/^(\d+)\s*(.*)$/);
                    const n = countOf(id);
                    const unit = locale === 'ar' ? 'موضوع' : locale === 'fr' ? 'sujets' : 'papers';
                    return (
                      <Link key={id} href={`/${locale}/${id}`} className={`step${lv.exam ? ' exam' : ''}${m ? '' : ' word'}`} aria-label={lv.name[locale]}>
                        <span className="num">{m ? m[1] : label}</span>
                        {m && <span className="lbl">{m[2]}</span>}
                        <span className="cnt">{n} {unit}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </section>

      <div className="wrap">
        <AdSlot pos="top" format="horizontal" />

        <section className="section">
          <div className="section-head">
            <h2>{d.latest}</h2>
            <Link href={`/${locale}/search`}>{d.seeAll}</Link>
          </div>
          <ResourceList locale={locale} list={latest} showContext />
        </section>

        <section className="section">
          <div className="section-head"><h2>{d.officialExams} BEM / BAC</h2></div>
          <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {['bem', 'bac'].map((id) => {
              const lv = levelById(id)!;
              const subs = examSubjects(id);
              return (
                <div className="sheet" key={id}>
                  <h3><Link href={`/${locale}/${id}`}>{lv.name[locale]}</Link></h3>
                  <ul className="link-list">
                    {(subs.length ? subs : lv.subjects.slice(0, 5)).map((s) => (
                      <li key={s}><Link href={`/${locale}/${id}/${s}`}>{subjects[s].name[locale]}</Link></li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {arts.length > 0 && (
          <section className="section">
            <div className="section-head">
              <h2>{d.articles}</h2>
              <Link href={`/${locale}/library`}>{d.seeAll}</Link>
            </div>
            <div className="article-list">
              {arts.map((a) => (
                <article className="article-item" key={a.slug}>
                  <span className="cat">{categories[a.category]?.name[locale]}</span>
                  <h3><Link href={`/${locale}/${a.category}/${a.slug}`}>{a.title}</Link></h3>
                  <p>{a.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <AdSlot pos="inContent" />

        <section className="section seo-text">
          {locale === 'ar' ? (
            <>
              <h2>منصة {site.name.ar} للدعم المدرسي في الجزائر</h2>
              <p>
                يجمع {site.name.ar} فروضًا واختبارات مع الحل المفصل في كل المواد، من القسم التحضيري إلى السنة الثالثة ثانوي، مكتوبة وفق المنهاج الجزائري. تجد أيضًا مواضيع تجريبية
                على نمط شهادة التعليم المتوسط وشهادة البكالوريا، وملخصات دروس تساعدك على الفهم قبل التدرّب.
              </p>
              <p>كل المواضيع مرتبة حسب المستوى ثم المادة ثم الفصل. تقرأ الموضوع مباشرة على الصفحة، وتُظهر الحل عند الحاجة، أو تحمّلهما مجانًا بصيغة PDF للطباعة. إذا كنت أستاذًا أو تلميذًا وعندك موضوع غير موجود، شاركه معنا ليستفيد منه الجميع.</p>
            </>
          ) : locale === 'fr' ? (
            <>
              <h2>{site.name.fr}, plateforme de soutien scolaire en Algérie</h2>
              <p>{site.name.fr} rassemble des devoirs et examens des trois trimestres dans toutes les matières, du préscolaire à la 3e année secondaire, avec corrigés lorsqu’ils sont disponibles, ainsi que les sujets du BEM et du BAC des années précédentes.</p>
            </>
          ) : (
            <>
              <h2>{site.name.en}: study support for Algerian students</h2>
              <p>{site.name.en} collects term tests and exams in every subject, from preschool to the final year of secondary school, with answer keys when available, plus past BEM and BAC papers.</p>
            </>
          )}
        </section>
      </div>
    </>
  );
}
