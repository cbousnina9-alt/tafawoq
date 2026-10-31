import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import FilterableList from '@/components/FilterableList';
import { toRows } from '@/components/ResourceList';
import { Breadcrumbs, JsonLd } from '@/components/Seo';
import SubjectIcon from '@/components/SubjectIcon';
import { ArrowIcon, CapIcon } from '@/components/Icons';
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
    openGraph: { type: 'article', title: a.title, description: a.description, publishedTime: a.date, modifiedTime: a.updated || a.date , siteName: 'تفوّق', images: [{ url: '/og-tafawoq.png', width: 1200, height: 630 }] },
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
    const url = `/${locale}/${lv.id}/${sub}`;
    const pair = lv.examFor ? levelById(lv.examFor) : lv.exam ? levels.find((x) => x.examFor === lv.id) : undefined;
    const L = (ar: string, fr: string, en: string) => ({ ar, fr, en })[locale];
    const subName = subjects[sub].name[locale];
    const labels = {
      all: d.all,
      type: L('نوع الموضوع', 'Type', 'Type'),
      term: L('الفصل الدراسي', 'Trimestre', 'Term'),
      withSolution: d.withSolution,
      sample: d.sample,
      terms: { 1: trimesters[1][locale], 2: trimesters[2][locale], 3: trimesters[3][locale] },
      types: Object.fromEntries(Object.entries(types).map(([k, v]) => [k, v.many[locale]])),
      filterTitle: L('تصفية المواضيع', 'Filtrer', 'Filter'),
      allTerms: L('جميع الفصول', 'Tous', 'All terms'),
      solOnly: L('مواضيع مع الحل فقط', 'Avec corrigé seulement', 'With answers only'),
      reset: L('إعادة ضبط', 'Réinitialiser', 'Reset'),
      available: L('المواضيع المتاحة', 'Sujets disponibles', 'Available papers'),
      searchPh: L(`ابحث داخل مواضيع ${subName}...`, `Chercher dans ${subName}...`, `Search ${subName} papers...`),
      sortNew: L('الأحدث أولًا', 'Plus récents', 'Newest first'),
      sortOld: L('الأقدم أولًا', 'Plus anciens', 'Oldest first'),
      sortTerm: L('حسب الفصل', 'Par trimestre', 'By term'),
      preview: L('معاينة الموضوع', 'Voir le sujet', 'Preview'),
      download: L('تحميل PDF', 'Télécharger PDF', 'Download PDF'),
      showSolution: L('عرض الحل', 'Voir le corrigé', 'Answers'),
      model: L('النموذج', 'Modèle', 'Model'),
      prev: L('السابق', 'Précédent', 'Previous'),
      next: L('التالي', 'Suivant', 'Next'),
      none: L('لا توجد مواضيع مطابقة لهذا الاختيار.', 'Aucun sujet ne correspond.', 'No matching papers.'),
      save: L('حفظ في المفضلة', 'Ajouter aux favoris', 'Save'),
    };
    const hero = sub === 'math' ? '/img/home/subj-math.webp' : '/img/home/hero.webp';
    const asideNode = (
      <>
        {pair && pair.subjects.includes(sub) && (
          <Link className="promo-card" href={`/${locale}/${pair.id}/${sub}`}>
            <b>{lv.examFor ? L(`تستعد ل${pair.name.ar}؟`, `Tu prépares le ${pair.short.fr} ?`, `Preparing for the ${pair.short.en}?`) : L(`راجع ${subName} للسنة النهائية`, 'Révise l’année finale', 'Review the final year')}</b>
            <span>{L(`اكتشف جميع مواضيع ${subName} ل${pair.name.ar} مع الحلول النموذجية.`, `Tous les sujets de ${subName} avec corrigés.`, `All ${subName} papers with answers.`)}</span>
            <span className="promo-btn">{L('مواضيع', 'Sujets', 'Papers')} {pair.short[locale]} <ArrowIcon /></span>
          </Link>
        )}
        <Link className="share-card" href={`/${locale}/upload`}>
          <b>{L(`جاءك فرض في ${subName}؟`, 'Tu as eu un devoir ?', 'Had a test at school?')}</b>
          <span>{L('صوّره وأرسله لنا، ننشره مع الحل ونذكر اسمك ليستفيد منه زملاؤك في كل الولايات.', 'Envoie-le-nous : nous le publions avec le corrigé.', 'Send it to us: we publish it with answers.')}</span>
          <span className="share-btn">{L('أرسل موضوعًا', 'Envoyer un sujet', 'Send a paper')}</span>
        </Link>
        <AdSlot pos="sidebar" format="rectangle" />
      </>
    );
    return (
      <>
        <section className="sp-hero">
          <div className="wrap sp-hero-in">
            <div className="sp-hero-copy">
              <Breadcrumbs items={[home, { name: stages[lv.stage].name[locale], href: `/${locale}/${lv.stage}` }, { name: lv.name[locale], href: `/${locale}/${lv.id}` }, { name: subName, href: url }]} />
              <Link className="lv-pill" href={`/${locale}/${lv.id}`}><CapIcon /> {lv.name[locale]}</Link>
              <h1>{L(`فروض واختبارات ${subName}`, `Devoirs et examens de ${subName}`, `${subName} tests and exams`)}<span className="h1-lv"> — {lv.name[locale]}</span></h1>
              <p>{L('راجع، تدرّب، وتحقّق من الحل خطوة بخطوة', 'Révise, entraîne-toi et vérifie le corrigé pas à pas', 'Review, practise and check the answers step by step')} · {rows.length} {L('موضوع', 'sujets', 'papers')}</p>
            </div>
            <div className="sp-hero-art"><img src={hero} alt="" width={1096} height={504} fetchPriority="high" /></div>
          </div>
          <div className="wrap">
            <nav className="subj-tabs" aria-label={d.otherSubjects}>
              {lv.subjects.map((x) => (
                <Link key={x} href={`/${locale}/${lv.id}/${x}`} aria-current={x === sub ? 'page' : undefined}>
                  <SubjectIcon subject={x} size={34} />
                  <span>{subjects[x].name[locale]}</span>
                </Link>
              ))}
            </nav>
          </div>
        </section>
        <div className="wrap sp-wrap">
          {rows.length ? (
            <FilterableList rows={rows} labels={labels} aside={asideNode} />
          ) : (
            <div className="empty-state">
              <p>{d.noFiles}</p>
              <Link className="btn btn-primary" href={`/${locale}/upload`}>{d.sendFile}</Link>
            </div>
          )}
          <div className="tip-banner">
            <span className="bulb" aria-hidden>💡</span>
            <b>{L('نصيحة للمراجعة', 'Conseil', 'Study tip')}</b>
            <span>{L('حاول حلّ الموضوع بنفسك قبل الاطلاع على التصحيح، ثم قيّم إجابتك بسلم التنقيط.', 'Essaie de résoudre le sujet seul avant de consulter le corrigé.', 'Try the paper on your own before checking the answers.')}</span>
          </div>
          <AdSlot pos="inContent" />
          {locale === 'ar' && rows.length > 0 && (
            <section className="seo-text" style={{ marginTop: 24 }}>
              <h2>حول {lv.exam ? 'مواضيع' : 'فروض واختبارات'} {subjects[sub].name.ar} — {lv.name.ar}</h2>
              <p>
                تضم هذه الصفحة {rows.length} {rows.length > 10 ? 'ملفًا' : 'ملفات'} في مادة {subjects[sub].name.ar} {lv.exam ? `للتحضير ل${lv.name.ar}` : `في ${lv.name.ar}`}، مطابقة لمحتوى المنهاج الجزائري.
                استعمل خانة التصفية لاختيار الفصل أو نوع الموضوع، وافتح أي موضوع لتقرأه مباشرة على الصفحة أو تحمّله مجانًا بصيغة PDF. المواضيع التي تحمل علامة «مع الحل» مرفقة بتصحيح نموذجي وسلم تنقيط يساعدك على تقييم نفسك بعد المحاولة.
              </p>
            </section>
          )}
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
