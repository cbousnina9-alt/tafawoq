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
};

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
