import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import 'katex/dist/katex.min.css';
import AdSlot from '@/components/AdSlot';
import PdfViewer from '@/components/PdfViewer';
import type { ReactNode } from 'react';
import { CapIcon, CheckIcon, DocIcon, DownloadIcon, EyeIcon } from '@/components/Icons';
import { ItemActions, ItemViewer } from '@/components/ItemViewer';
import { shortTitle, toRows } from '@/components/ResourceList';
import SubjectIcon from '@/components/SubjectIcon';
import { Breadcrumbs, JsonLd } from '@/components/Seo';
import { levelById, subjects, trimesters, types } from '@/lib/catalog';
import { findResource, formatSize, renderedOf, resourceDescription, resources, resourcesOf, resourceTitle } from '@/lib/content';
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
  const rendered = renderedOf(r);

  const L = (ar: string, fr: string, en: string) => ({ ar, fr, en })[locale];
  const subName = subjects[r.subject].name[locale];
  const short = shortTitle(locale, r);
  const relRows = toRows(locale, related.slice(0, 3));
  const paperNode = rendered ? (
    <article className="exam-paper" lang="ar" dir="rtl">
      {r.sample && <span className="demo-tag sample-pill">{d.sample}</span>}
      <h2 className="exam-title">{rendered.meta.title}</h2>
      <p className="exam-sub">{lv.name.ar}</p>
      {rendered.meta.duration && <p className="exam-duration">{locale === 'ar' ? 'المدة' : locale === 'fr' ? 'Durée' : 'Duration'}: {rendered.meta.duration}</p>}
      <div dangerouslySetInnerHTML={{ __html: rendered.paper }} />
    </article>
  ) : (
    <PdfViewer src={r.file} title={title} labels={{ loading: d.loadingPreview, error: d.previewHelp, more: d.morePages }} />
  );
  const solutionNode = rendered?.solution ? (
    <article className="exam-paper solution-paper" lang="ar" dir="rtl">
      <h2 className="exam-title">{L('الإجابة النموذجية وسلم التنقيط', 'Corrigé type et barème', 'Model answers and marking scheme')}</h2>
      <div dangerouslySetInnerHTML={{ __html: rendered.solution }} />
    </article>
  ) : r.solution ? (
    <PdfViewer src={r.solution} title={title} labels={{ loading: d.loadingPreview, error: d.previewHelp, more: d.morePages }} />
  ) : undefined;
  const info: [ReactNode, string, string][] = [
    [<SubjectIcon key="s" subject={r.subject} size={30} />, L('المادة', 'Matière', 'Subject'), subName],
    [<span key="l" className="ii-ic"><CapIcon /></span>, L('المستوى', 'Niveau', 'Level'), lv.name[locale]],
    ...(r.trimester ? [[<span key="t" className="ii-ic"><DocIcon /></span>, L('الفصل', 'Trimestre', 'Term'), trimesters[r.trimester][locale]] as [ReactNode, string, string]] : []),
    ...(r.pages ? [[<span key="p" className="ii-ic"><DocIcon /></span>, L('عدد الصفحات', 'Pages', 'Pages'), String(r.pages)] as [ReactNode, string, string]] : []),
    [<span key="f" className="ii-ic pdf-ic">PDF</span>, L('الصيغة', 'Format', 'Format'), `PDF · ${formatSize(r.size)}`],
  ];
  const infoCard = (
    <>
      <ul className="info-list">
        {info.map(([ic, k, v]) => (
          <li key={k}>{ic}<b>{k}:</b><span>{v}</span></li>
        ))}
      </ul>
      {r.solution && <p className="sol-ok"><CheckIcon /> {L('التصحيح متوفر', 'Corrigé disponible', 'Answers available')}</p>}
    </>
  );

  return (
    <>
      <section className="it-hero">
        <div className="wrap it-hero-in">
          <div className="it-hero-copy">
            <Breadcrumbs
              items={[
                { name: d.home, href: `/${locale}` },
                { name: lv.name[locale], href: `/${locale}/${lv.id}` },
                { name: subName, href: `/${locale}/${lv.id}/${r.subject}` },
                { name: L('معاينة الموضوع', 'Aperçu du sujet', 'Paper preview'), href: url },
              ]}
            />
            <h1>{short}</h1>
            <p className="visually-hidden">{title}</p>
            <div className="it-chips">
              <Link className="chip-lv" href={`/${locale}/${lv.id}`}><CapIcon /> {lv.name[locale]}</Link>
              {r.trimester && <span>{trimesters[r.trimester][locale]}</span>}
              {!r.trimester && <span>{types[r.type].one[locale]}</span>}
              {r.n ? <span>{L('النموذج', 'Modèle', 'Model')} {r.n}</span> : null}
              {r.solution && <span className="ok"><CheckIcon /> {d.withSolution}</span>}
            </div>
          </div>
          <div className="it-hero-art" aria-hidden>
            {r.subject === 'math' ? (
              <img src="/img/home/item-math.webp" alt="" width={688} height={320} />
            ) : (
              <span className="doc-thumb big"><span className="paper"><i /><i /><i /><i /><i /></span><span className="pdf">PDF</span><SubjectIcon subject={r.subject} size={72} /></span>
            )}
          </div>
        </div>
        <div className="wrap it-actions">
          <a className="dl-btn" href={r.file} download><DownloadIcon /> {d.download}</a>
          <ItemActions href={url} title={title} url={abs(url)} file={r.file} labels={{ print: L('طباعة', 'Imprimer', 'Print'), save: L('حفظ', 'Enregistrer', 'Save'), saved: L('محفوظ', 'Enregistré', 'Saved'), share: d.share, copied: d.copied }} />
        </div>
      </section>

      <div className="wrap it-layout">
        <aside className="it-aside">
          <div className="info-card desk-only">
            <h2 className="gold-h">{L('معلومات الموضوع', 'Infos du sujet', 'Paper details')}</h2>
            {infoCard}
          </div>
          {solutionNode && (
            <div className="try-card desk-only">
              <b>💡 {L('جرّب قبل ما تشوف الحل', 'Essaie avant de voir le corrigé', 'Try before checking')}</b>
              <span>{L('حلّ التمارين بنفسك ثم قارن إجاباتك بالتصحيح.', 'Résous seul puis compare avec le corrigé.', 'Solve it yourself, then compare.')}</span>
              <a className="sol-btn" href="#solution"><EyeIcon /> {L('عرض الحل النموذجي', 'Voir le corrigé', 'Show answers')}</a>
            </div>
          )}
          <AdSlot pos="sidebar" format="rectangle" />
          <Link className="report-btn desk-only" href={`/${locale}/contact`}>⚑ {L('الإبلاغ عن مشكلة', 'Signaler un problème', 'Report a problem')}</Link>
        </aside>

        <div className="it-main">
          <details className="info-card mob-only">
            <summary>ⓘ {L('معلومات الموضوع', 'Infos du sujet', 'Paper details')}</summary>
            {infoCard}
          </details>
          <ItemViewer paper={paperNode} solution={solutionNode} labels={{ paper: L('الموضوع', 'Sujet', 'Paper'), solution: L('الحل النموذجي', 'Corrigé', 'Answers'), fullscreen: L('ملء الشاشة', 'Plein écran', 'Full screen'), noSolution: L('الحل غير متوفر', 'Pas de corrigé', 'No answers') }} />
          {solutionNode && (
            <div className="ready-banner">
              <span className="ok-dot"><CheckIcon /></span>
              <span className="rb-text"><b>{L('جاهز للتصحيح؟', 'Prêt pour la correction ?', 'Ready to check?')}</b><span>{L('راجع خطوات الحل وتعلّم من أخطائك.', 'Revois les étapes et apprends de tes erreurs.', 'Review the steps and learn from your mistakes.')}</span></span>
              <a className="rb-btn" href="#solution"><EyeIcon /> {L('عرض الحل النموذجي', 'Voir le corrigé', 'Show answers')}</a>
            </div>
          )}
          {r.solution && (
            <p className="sol-dl"><a href={r.solution} download><DownloadIcon /> {d.downloadSolution}</a></p>
          )}
          <AdSlot pos="afterDownload" format="horizontal" />
          <p className="it-desc">{resourceDescription(locale, r)}</p>
        </div>
      </div>

      {relRows.length > 0 && (
        <section className="wrap section rel-sec">
          <div className="rel-head">
            <h2 className="gold-h">{L('مواضيع مشابهة', 'Sujets similaires', 'Similar papers')}</h2>
            <Link href={`/${locale}/${lv.id}/${r.subject}`}>{d.seeAll}</Link>
          </div>
          <ul className="rel-cards">
            {relRows.map((x) => (
              <li key={x.id}>
                <Link href={x.href} className="rel-card">
                  <span className="rc-body">
                    <b>{x.short}{x.n ? <small className="model">{L('النموذج', 'Modèle', 'Model')} {x.n}</small> : null}</b>
                    <span className="doc-meta"><span>{x.level}</span><span>{x.trimester ? trimesters[x.trimester as 1 | 2 | 3][locale] : types[x.type].many[locale]}</span></span>
                    <span className="rc-btn"><EyeIcon /> {L('معاينة', 'Voir', 'View')}</span>
                  </span>
                  <span className="doc-thumb"><span className="paper"><i /><i /><i /><i /></span><span className="pdf">PDF</span><SubjectIcon subject={x.subject} size={48} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

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
