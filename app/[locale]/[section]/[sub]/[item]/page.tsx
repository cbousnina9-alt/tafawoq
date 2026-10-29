import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import 'katex/dist/katex.min.css';
import AdSlot from '@/components/AdSlot';
import PdfViewer from '@/components/PdfViewer';
import { DownloadIcon } from '@/components/Icons';
import { FavoriteButton, ShareRow } from '@/components/Interactive';
import ResourceList from '@/components/ResourceList';
import { Breadcrumbs, JsonLd } from '@/components/Seo';
import { levelById, stages, subjects, trimesters, types } from '@/lib/catalog';
import { findResource, formatSize, pagesLabel, renderedOf, resourceDescription, resources, resourcesOf, resourceTitle } from '@/lib/content';
import { t } from '@/lib/i18n';
import { abs, alternates, locales, site, type Locale } from '@/lib/site';

type P = { params: Promise<{ locale: Locale; section: string; sub: string; item: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => locales.flatMap((locale) => resources.map((r) => ({ locale, section: r.level, sub: r.subject, item: r.slug })));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, section, sub, item } = await params;
  const r = findResource(section, sub, item);
  if (!r) return {};
  const title = resourceTitle(locale, r);
  return {
    title,
    description: resourceDescription(locale, r),
    alternates: alternates(locale, `/${section}/${sub}/${item}`),
    robots: r.sample ? { index: false, follow: true } : undefined,
    openGraph: { title, description: resourceDescription(locale, r), type: 'article' },
  };
}

export default async function ResourcePage({ params }: P) {
  const { locale, section, sub, item } = await params;
  const r = findResource(section, sub, item);
  if (!r) notFound();
  const d = t(locale);
  const lv = levelById(r.level)!;
  const title = resourceTitle(locale, r);
  const url = `/${locale}/${r.level}/${r.subject}/${r.slug}`;
  const related = resourcesOf(r.level, r.subject).filter((x) => x.id !== r.id).slice(0, 8);
  const others = lv.subjects.filter((s) => s !== r.subject);
  const rendered = renderedOf(r);

  return (
    <>
      <section className="board">
        <div className="wrap page-head">
          <Breadcrumbs
            items={[
              { name: d.home, href: `/${locale}` },
              { name: stages[lv.stage].name[locale], href: `/${locale}/${lv.stage}` },
              { name: lv.name[locale], href: `/${locale}/${lv.id}` },
              { name: subjects[r.subject].name[locale], href: `/${locale}/${lv.id}/${r.subject}` },
              { name: title, href: url },
            ]}
          />
          <h1>{title}</h1>
          <div className="file-meta">
            <span className="type-tag">{types[r.type].one[locale]}</span>
            {r.trimester && <span>{trimesters[r.trimester][locale]}</span>}
            {r.year && <span>{r.year}</span>}
            {r.pages && <span>{pagesLabel(locale, r.pages)}</span>}
            <span>PDF {formatSize(r.size)}</span>
            {r.solution && <span className="stamp">{d.withSolution}</span>}
            {r.sample && <span className="demo-tag">{d.sample}</span>}
          </div>
        </div>
      </section>

      <div className="wrap layout">
        <div>
          <div className="actions">
            <a className="btn btn-primary" href={r.file} download>
              <DownloadIcon /> {d.download}
            </a>
            {r.solution && (
              <a className="btn btn-red" href={r.solution} download>
                <DownloadIcon /> {d.downloadSolution}
              </a>
            )}
            <FavoriteButton href={url} title={title} labels={{ save: d.save, saved: d.saved }} />
          </div>

          <AdSlot pos="afterDownload" format="horizontal" />

          {rendered ? (
            <>
              <article className="sheet exam-paper" lang="ar" dir="rtl">
                <h2 className="exam-title">{rendered.meta.title}</h2>
                {rendered.meta.duration && <p className="exam-duration">{locale === 'ar' ? 'المدة' : locale === 'fr' ? 'Durée' : 'Duration'}: {rendered.meta.duration}</p>}
                <div dangerouslySetInnerHTML={{ __html: rendered.paper }} />
              </article>
              {rendered.solution && (
                <>
                  <AdSlot pos="inContent" />
                  <details className="sheet exam-paper solution-box" lang="ar" dir="rtl">
                    <summary>{locale === 'ar' ? 'إظهار الحل المفصل' : locale === 'fr' ? 'Afficher le corrigé' : 'Show the answers'}</summary>
                    <div dangerouslySetInnerHTML={{ __html: rendered.solution }} />
                  </details>
                </>
              )}
            </>
          ) : (
            <div className="sheet">
              <h2 style={{ fontSize: '1.1rem' }}>{d.preview}</h2>
              <PdfViewer src={r.file} title={title} labels={{ loading: d.loadingPreview, error: d.previewHelp, more: d.morePages }} />
            </div>
          )}

          <div className="sheet">
            <p style={{ margin: 0 }}>{resourceDescription(locale, r)}</p>
            <div style={{ marginTop: 14 }}>
              <ShareRow url={abs(url)} title={title} labels={{ share: d.share, copyLink: d.copyLink, copied: d.copied }} />
            </div>
          </div>

          <AdSlot pos="inContent" />

          {related.length > 0 && (
            <section className="section" style={{ paddingTop: 6 }}>
              <div className="section-head">
                <h2>{d.related}</h2>
                <Link href={`/${locale}/${lv.id}/${r.subject}`}>{d.seeAll}</Link>
              </div>
              <ResourceList locale={locale} list={related} />
            </section>
          )}
        </div>

        <aside>
          <AdSlot pos="sidebar" format="rectangle" />
          <div className="sheet">
            <h3>{d.otherSubjects}</h3>
            <ul className="link-list">
              {others.map((s) => (
                <li key={s}><Link href={`/${locale}/${lv.id}/${s}`}>{subjects[s].name[locale]}</Link></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LearningResource',
          name: title,
          description: resourceDescription(locale, r),
          url: abs(url),
          inLanguage: locale,
          learningResourceType: types[r.type].one.en,
          educationalLevel: lv.name[locale],
          about: subjects[r.subject].name[locale],
          isAccessibleForFree: true,
          datePublished: r.added,
          encoding: { '@type': 'MediaObject', contentUrl: abs(r.file), encodingFormat: 'application/pdf' },
          provider: { '@type': 'Organization', name: site.name[locale], url: site.url },
          educationalAlignment: { '@type': 'AlignmentObject', alignmentType: 'educationalLevel', educationalFramework: 'Algerian national curriculum', targetName: lv.name.fr },
        }}
      />
    </>
  );
}
