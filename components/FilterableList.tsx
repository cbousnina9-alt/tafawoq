'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Row } from './ResourceList';
import SubjectIcon from './SubjectIcon';

type Labels = { all: string; type: string; term: string; withSolution: string; sample: string; terms: Record<number, string>; types: Record<string, string> };

export default function FilterableList({ rows, labels }: { rows: Row[]; labels: Labels }) {
  const [type, setType] = useState<string>('all');
  const [term, setTerm] = useState<number>(0);
  const typeOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.type))), [rows]);
  const termOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.trimester).filter(Boolean) as number[])).sort(), [rows]);
  const shown = rows.filter((r) => (type === 'all' || r.type === type) && (!term || r.trimester === term));

  return (
    <>
      {(typeOptions.length > 1 || termOptions.length > 1) && (
        <div className="filters">
          {typeOptions.length > 1 && (
            <div className="seg" role="group" aria-label={labels.type}>
              <button aria-pressed={type === 'all'} onClick={() => setType('all')}>{labels.all}</button>
              {typeOptions.map((o) => (
                <button key={o} aria-pressed={type === o} onClick={() => setType(o)}>{labels.types[o]}</button>
              ))}
            </div>
          )}
          {termOptions.length > 1 && (
            <div className="seg" role="group" aria-label={labels.term}>
              <button aria-pressed={term === 0} onClick={() => setTerm(0)}>{labels.all}</button>
              {termOptions.map((o) => (
                <button key={o} aria-pressed={term === o} onClick={() => setTerm(o)}>{labels.terms[o]}</button>
              ))}
            </div>
          )}
        </div>
      )}
      <ul className="register">
        {shown.map((r) => (
          <li key={r.id}>
            <Link className="row" href={r.href}>
              <SubjectIcon subject={r.subject} size={40} />
              <span>
                <span className="title">{r.title}</span>
                {r.sample && <span className="demo-tag">{labels.sample}</span>}
                <span className="meta"><span className="type-tag" data-type={r.type}>{r.typeLabel}</span>{r.meta}</span>
              </span>
              {r.solution ? <span className="stamp">{labels.withSolution}</span> : <span />}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
