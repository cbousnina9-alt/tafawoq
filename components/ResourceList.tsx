import Link from 'next/link';
import { levelById, subjects, trimesters, types } from '@/lib/catalog';
import { pagesLabel, resourceTitle, resourceUrl, type Resource } from '@/lib/content';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/site';
import SubjectIcon from './SubjectIcon';

export type Row = {
  id: string;
  subject: string;
  href: string;
  title: string;
  type: Resource['type'];
  typeLabel: string;
  meta: string;
  solution: boolean;
  sample: boolean;
  trimester?: number;
  short: string;
  file: string;
  solutionFile?: string;
  n?: number;
  level: string;
  added: string;
};

export function shortTitle(l: Locale, r: Resource): string {
  const lv0 = levelById(r.level)!;
  if (r.title?.[l]) {
    const esc = lv0.name[l].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return r.title[l]!
      .replace(/\s*\((النموذج|n°)\s*\d+\)/, '')
      .replace(new RegExp(`\\s*[—–-]\\s*${esc}`), '')
      .replace(/\s+(مع الحل|avec corrigé|with answers)\s*$/, '')
      .trim();
  }
  const sub = subjects[r.subject].name[l];
  const ty = types[r.type].one[l];
  const term = r.trimester ? trimesters[r.trimester][l] : '';
  const lv = levelById(r.level)!;
  if (l === 'ar') {
    if (r.type === 'mock' || r.type === 'official') return `${ty} ل${lv.name.ar.replace(/^ال/, 'ل')} في ${sub}`;
    return [ty, term, `في ${sub}`].filter(Boolean).join(' ');
  }
  if (l === 'fr') return [ty, `de ${sub}`, term && `– ${term}`].filter(Boolean).join(' ');
  return [sub, ty.toLowerCase(), term && `– ${term}`].filter(Boolean).join(' ');
}

export function toRows(locale: Locale, list: Resource[], showContext = false): Row[] {
  return list.map((r) => {
    const lv = levelById(r.level)!;
    const bits = [
      showContext ? `${subjects[r.subject].name[locale]} · ${lv.short[locale]}` : '',
      r.trimester ? trimesters[r.trimester][locale] : '',
      r.year ? String(r.year) : '',
      r.pages ? pagesLabel(locale, r.pages) : '',
    ].filter(Boolean);
    return {
      id: r.id,
      subject: r.subject,
      href: resourceUrl(locale, r),
      title: resourceTitle(locale, r),
      type: r.type,
      typeLabel: types[r.type].one[locale],
      meta: bits.join(' — '),
      solution: !!r.solution,
      sample: !!r.sample,
      trimester: r.trimester,
      short: shortTitle(locale, r),
      file: r.file,
      solutionFile: r.solution,
      n: r.n,
      level: lv.name[locale],
      added: r.added || '',
    };
  });
}

export function RowList({ rows, locale }: { rows: Row[]; locale: Locale }) {
  const d = t(locale);
  return (
    <ul className="register">
      {rows.map((r) => (
        <li key={r.id}>
          <Link className="row" href={r.href}>
            <SubjectIcon subject={r.subject} size={40} />
            <span>
              <span className="title">{r.title}</span>
              {r.sample && <span className="demo-tag">{d.sample}</span>}
              <span className="meta"><span className="type-tag" data-type={r.type}>{r.typeLabel}</span>{r.meta}</span>
            </span>
            {r.solution ? <span className="stamp">{d.withSolution}</span> : <span />}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function ResourceList({ locale, list, showContext }: { locale: Locale; list: Resource[]; showContext?: boolean }) {
  return <RowList locale={locale} rows={toRows(locale, list, showContext)} />;
}
