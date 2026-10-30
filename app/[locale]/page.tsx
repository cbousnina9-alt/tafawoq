import type { Metadata } from 'next';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import SubjectIcon from '@/components/SubjectIcon';
import { ArrowIcon, CapIcon, CloudIcon, DocIcon, DownloadIcon, EyeIcon, SearchIcon } from '@/components/Icons';
import { JsonLd } from '@/components/Seo';
import { levelById, stages, stageIds, subjects, trimesters, types } from '@/lib/catalog';
import { articlesOf, countOf, resources, resourceUrl } from '@/lib/content';
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
  const L = (ar: string, fr: string, en: string) => ({ ar, fr, en })[locale];
  // الأكثر طلبًا أولًا: الشهادات ثم الأقسام النهائية
  const priority = ['bac', 'bem', '4am', '3as', '5ap', '1as', '2as', '3am', '2am', '1am', '4ap', '3ap', '2ap', '1ap', '0ap'];
  const rank = (lv: string) => (priority.indexOf(lv) + 1 || 99);
  const latest = [...resources].sort((a, b) => (b.added || '').localeCompare(a.added || '') || rank(a.level) - rank(b.level)).slice(0, 10);
  const tipImg: Record<string, string> = { 'khotat-muraja3a-ikhtibarat': 'tip-time', 'istighlal-mawadi3-sabiqa-bem-bac': 'tip-exam', 'nasaih-lil-awliya': 'tip-parents' };
  const all = articlesOf(locale);
  const tips = [...all.filter((a) => tipImg[a.slug]), ...all.filter((a) => !tipImg[a.slug])].slice(0, 3).map((a, i) => ({ a, img: `/img/home/${tipImg[a.slug] || ['tip-time', 'tip-exam', 'tip-parents'][i]}.webp` }));

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

      <section className="hx">
        <div className="wrap hx-in">
          <div className="hx-copy">
            <h1>{L('خطوتك الأولى نحو ', 'Ton premier pas vers ', 'Your first step to ')}<span className="hx-mark">{L('التفوّق', 'la réussite', 'success')}</span></h1>
            <p className="lead">{L('فروض، اختبارات ودروس مع الحلول من التحضيري إلى البكالوريا', 'Devoirs, examens et cours corrigés, du préscolaire au BAC', 'Tests, exams and lessons with answers, from preschool to BAC')}</p>
            <form className="search-form" role="search" action={`/${locale}/search`} method="get">
              <label className="visually-hidden" htmlFor="hq">{d.search}</label>
              <SearchIcon />
              <input id="hq" name="q" type="search" placeholder={L('ابحث عن مادة أو موضوع...', 'Cherche une matière ou un sujet...', 'Search a subject or a paper...')} />
              <button type="submit">{d.search}</button>
            </form>
            <ul className="hx-stats">
              <li><span className="ic"><DocIcon /></span><span><b>{resources.length}</b>{L('موضوع بالحل', 'sujets corrigés', 'papers with answers')}</span></li>
              <li><span className="ic"><CapIcon /></span><span><b>15</b>{L('مستوى دراسي', 'niveaux', 'school levels')}</span></li>
              <li><span className="ic"><CloudIcon /></span><span><b>{L('مجاني', 'Gratuit', 'Free')}</b>{L('تحميل PDF', 'PDF', 'PDF download')}</span></li>
            </ul>
          </div>
          <div className="hx-art"><img src="/img/home/hero.webp" alt="" width={1052} height={680} fetchPriority="high" /></div>
        </div>
      </section>

      <div className="wrap">
        <section className="section">
          <div className="sec-title">
            <h2>{L('اختر مستواك الدراسي', 'Choisis ton niveau', 'Choose your level')}</h2>
            <p>{L('كل ما تحتاجه، منظم حسب سنتك', 'Tout ce qu’il te faut, classé par année', 'Everything you need, sorted by year')}</p>
          </div>
          <div className="stage-cards">
            {stageIds.map((s) => (
              <div className={`stage-card st-${s}`} key={s}>
                <div className="stage-top">
                  <h3><Link href={`/${locale}/${s}`}>{stages[s].name[locale]}</Link></h3>
                  <img src={`/img/home/stage-${s}.webp`} alt="" width={380} height={292} loading="lazy" />
                </div>
                <div className="stage-years">
                  {stages[s].levels.filter((id) => !levelById(id)!.exam).map((id) => {
                    const lv = levelById(id)!;
                    const full = locale === 'ar' ? lv.name.ar.replace(/^السنة\s+/, '').replace(/^القسم\s+/, '') : lv.short[locale];
                    return (
                      <Link key={id} href={`/${locale}/${id}`} title={`${lv.name[locale]} — ${countOf(id)} ${L('موضوع', 'sujets', 'papers')}`}>
                        {full}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <AdSlot pos="top" format="horizontal" />

        <section className="section">
          <div className="sec-title"><h2>{L('استعد للشهادات الرسمية', 'Prépare les examens officiels', 'Prepare for the national exams')}</h2></div>
          <div className="cert-banners">
            {['bac', 'bem'].map((id) => {
              const lv = levelById(id)!;
              return (
                <Link className={`cert-banner cb-${id}`} key={id} href={`/${locale}/${id}`}>
                  <span className="cb-text">
                    <b>{lv.name[locale]}</b>
                    <span>{L(`جميع فروض واختبارات ${id === 'bac' ? 'البكالوريا' : 'شهادة التعليم المتوسط'} مع الحلول`, 'Tous les sujets types avec corrigés', 'All mock papers with answers')} · {countOf(id)} {L('موضوع', 'sujets', 'papers')}</span>
                    <span className="cb-btn">{L('تصفّح المواضيع', 'Voir les sujets', 'Browse papers')} <ArrowIcon /></span>
                  </span>
                  <img src={`/img/home/cert-${id}.webp`} alt="" width={490} height={328} loading="lazy" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="section">
          <div className="sec-title with-link">
            <h2>{d.latest}</h2>
            <Link className="pill-link" href={`/${locale}/search`}>{d.seeAll} <ArrowIcon /></Link>
          </div>
          <div className="file-cards">
            {latest.slice(0, 6).map((r) => {
              const lv = levelById(r.level)!;
              return (
                <article className="file-card" key={r.id}>
                  <Link href={resourceUrl(locale, r)} className="fc-main">
                    <SubjectIcon subject={r.subject} size={64} />
                    <span className="fc-body">
                      <b>{types[r.type].one[locale]} {L('في', 'de', 'in')} {subjects[r.subject].name[locale]}</b>
                      <span className="fc-lvl">{lv.name[locale]}</span>
                      <span className="fc-tags">
                        {r.solution && <span className="ok">✓ {d.withSolution}</span>}
                        {r.trimester && <span>{trimesters[r.trimester][locale]}</span>}
                      </span>
                    </span>
                    <span className="pdf-badge">PDF</span>
                  </Link>
                  <div className="fc-foot">
                    <Link href={resourceUrl(locale, r)}><EyeIcon /> {L('قراءة', 'Lire', 'Read')}</Link>
                    <a href={r.file} download><DownloadIcon /> {L('تحميل', 'Télécharger', 'Download')}</a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {tips.length > 0 && (
          <section className="section">
            <div className="sec-title"><h2>{L('نصائح تساعدك على النجاح', 'Conseils pour réussir', 'Tips for success')}</h2></div>
            <div className="tip-cards">
              {tips.map(({ a, img }) => (
                <Link className="tip-card" key={a.slug} href={`/${locale}/${a.category}/${a.slug}`}>
                  <img src={img} alt="" width={634} height={244} loading="lazy" />
                  <span className="tc-body">
                    <b>{a.title}</b>
                    <span>{a.description}</span>
                    <span className="more">{L('اقرأ المزيد', 'Lire la suite', 'Read more')} <ArrowIcon /></span>
                  </span>
                </Link>
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
