'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Row } from './ResourceList';
import SubjectIcon from './SubjectIcon';
import { BookmarkIcon, CheckIcon, DownloadIcon, EyeIcon, SearchIcon } from './Icons';
import { norm, readFavs, writeFavs } from './Interactive';

export type ListLabels = {
  all: string;
  type: string;
  term: string;
  withSolution: string;
  sample: string;
  terms: Record<number, string>;
  types: Record<string, string>;
  filterTitle: string;
  allTerms: string;
  solOnly: string;
  reset: string;
  available: string;
  searchPh: string;
  sortNew: string;
  sortOld: string;
  sortTerm: string;
  preview: string;
  download: string;
  showSolution: string;
  model: string;
  prev: string;
  next: string;
  none: string;
  save: string;
};

const PER_PAGE = 10;

function Bookmark({ href, title, label }: { href: string; title: string; label: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(readFavs().some((f) => f.href === href)), [href]);
  return (
    <button
      type="button"
      className="fc-save"
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={() => {
        const list = readFavs().filter((f) => f.href !== href);
        if (!on) list.unshift({ href, title });
        writeFavs(list.slice(0, 200));
        setOn(!on);
      }}
    >
      <BookmarkIcon />
    </button>
  );
}

export default function FilterableList({ rows, labels, aside }: { rows: Row[]; labels: ListLabels; aside?: ReactNode }) {
  const [type, setType] = useState<string>('all');
  const [term, setTerm] = useState<number>(0);
  const [sol, setSol] = useState(false);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'new' | 'old' | 'term'>('term');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const typeOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.type))), [rows]);
  const termOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.trimester).filter(Boolean) as number[])).sort(), [rows]);

  const shown = useMemo(() => {
    const nq = norm(q.trim());
    const list = rows.filter(
      (r) => (type === 'all' || r.type === type) && (!term || r.trimester === term) && (!sol || r.solution) && (!nq || norm(`${r.title} ${r.short}`).includes(nq)),
    );
    const byN = (a: Row, b: Row) => (a.n || 1) - (b.n || 1);
    if (sort === 'new') list.sort((a, b) => b.added.localeCompare(a.added) || byN(a, b));
    if (sort === 'old') list.sort((a, b) => a.added.localeCompare(b.added) || byN(a, b));
    if (sort === 'term') list.sort((a, b) => (a.trimester || 9) - (b.trimester || 9) || a.type.localeCompare(b.type) || byN(a, b));
    return list;
  }, [rows, type, term, sol, q, sort]);

  useEffect(() => setPage(1), [type, term, sol, q, sort]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const slice = shown.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const go = (p: number) => {
    setPage(p);
    document.getElementById('available')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const reset = () => {
    setType('all');
    setTerm(0);
    setSol(false);
    setQ('');
    setSort('term');
  };

  const controls = (p: string) => (
    <>
          {termOptions.length > 0 && (
        <fieldset>
          <legend>{labels.term}</legend>
          <label className="radio"><input type="radio" name={`term-${p}`} checked={term === 0} onChange={() => setTerm(0)} /> {labels.allTerms}</label>
          {[1, 2, 3].map((o) => (
            <label className="radio" key={o}>
              <input type="radio" name={`term-${p}`} checked={term === o} disabled={!termOptions.includes(o)} onChange={() => setTerm(o)} /> {labels.terms[o]}
            </label>
          ))}
        </fieldset>
      )}
      {typeOptions.length > 1 && (
        <fieldset>
          <legend>{labels.type}</legend>
          <label className="radio"><input type="radio" name={`type-${p}`} checked={type === 'all'} onChange={() => setType('all')} /> {labels.all}</label>
          {typeOptions.map((o) => (
            <label className="radio" key={o}><input type="radio" name={`type-${p}`} checked={type === o} onChange={() => setType(o)} /> {labels.types[o]}</label>
          ))}
        </fieldset>
      )}
      <fieldset>
        <label className="check"><input type="checkbox" checked={sol} onChange={(e) => setSol(e.target.checked)} /> {labels.solOnly}</label>
      </fieldset>
      <button type="button" className="reset-btn" onClick={reset}>↻ {labels.reset}</button>
    </>
  );

  return (
    <div className="sp-layout">
      <aside className="sp-aside">
        <div className="filter-card desk-filter">
          <h2 className="gold-h">{labels.filterTitle}</h2>
          {controls('d')}
        </div>
        {aside}
      </aside>

      <div className="sp-main">
        <div className="sp-tools">
          <label className="sp-search">
            <SearchIcon />
            <span className="visually-hidden">{labels.searchPh}</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={labels.searchPh} />
          </label>
          <div className="sp-row">
          <button type="button" className="mob-filter-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>
            {labels.filterTitle}
            <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value as 'new' | 'old' | 'term')} aria-label="sort">
            <option value="term">{labels.sortTerm}</option>
            <option value="new">{labels.sortNew}</option>
            <option value="old">{labels.sortOld}</option>
          </select>
          </div>
        </div>
        {open && <div className="filter-card mob-filter">{controls('m')}</div>}

        <h2 className="gold-h" id="available">{labels.available} <small>({shown.length})</small></h2>

        {slice.length === 0 ? (
          <div className="empty-state"><p>{labels.none}</p></div>
        ) : (
          <ul className="doc-cards">
            {slice.map((r) => (
              <li key={r.id} className="doc-card">
                <Link href={r.href} className="doc-thumb" aria-hidden tabIndex={-1}>
                  <span className="paper"><i /><i /><i /><i /><i /></span>
                  <span className="pdf">PDF</span>
                  <SubjectIcon subject={r.subject} size={56} />
                </Link>
                <div className="doc-body">
                  <div className="doc-top">
                    <h3><Link href={r.href}>{r.short}</Link></h3>
                    <span className="doc-badges">
                      {r.n ? <span className="model">{labels.model} {r.n}</span> : null}
                      <Bookmark href={r.href} title={r.title} label={labels.save} />
                    </span>
                  </div>
                  <p className="doc-meta">
                    <span>{r.level}</span>
                    {r.trimester ? <span>{labels.terms[r.trimester]}</span> : <span>{labels.types[r.type]}</span>}
                    {r.sample && <span className="demo-tag">{labels.sample}</span>}
                  </p>
                  {r.solution && <span className="sol-chip"><CheckIcon /> {labels.withSolution}</span>}
                  <div className="doc-actions">
                    <Link className="act primary" href={r.href}><EyeIcon /> {labels.preview}</Link>
                    <a className="act" href={r.file} download><DownloadIcon /> {labels.download}</a>
                    {r.solution && <Link className="act green" href={`${r.href}#solution`}><CheckIcon /> {labels.showSolution}</Link>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav className="pager" aria-label="pagination">
            <button type="button" disabled={page === 1} onClick={() => go(page - 1)}>‹ {labels.prev}</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button type="button" key={p} aria-current={p === page ? 'page' : undefined} onClick={() => go(p)}>{p}</button>
            ))}
            <button type="button" disabled={page === pages} onClick={() => go(page + 1)}>{labels.next} ›</button>
          </nav>
        )}
      </div>
    </div>
  );
}
