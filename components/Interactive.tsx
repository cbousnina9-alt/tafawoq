'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { StarIcon } from './Icons';

// ---------- المفضلة (تُحفظ في متصفح الزائر) ----------
export type Fav = { href: string; title: string };
const KEY = 'favorites:v1';
export const readFavs = (): Fav[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};
export const writeFavs = (f: Fav[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(f));
  } catch {}
};

export function FavoriteButton({ href, title, labels }: { href: string; title: string; labels: { save: string; saved: string } }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(readFavs().some((f) => f.href === href)), [href]);
  const toggle = () => {
    const list = readFavs().filter((f) => f.href !== href);
    if (!on) list.unshift({ href, title });
    writeFavs(list.slice(0, 200));
    setOn(!on);
  };
  return (
    <button className="btn btn-ghost" aria-pressed={on} onClick={toggle}>
      <StarIcon filled={on} /> {on ? labels.saved : labels.save}
    </button>
  );
}

export function FavoritesList({ empty }: { empty: string }) {
  const [list, setList] = useState<Fav[] | null>(null);
  useEffect(() => setList(readFavs()), []);
  if (list === null) return null;
  if (!list.length) return <div className="empty-state"><p>{empty}</p></div>;
  return (
    <ul className="register">
      {list.map((f) => (
        <li key={f.href}>
          <Link className="row" href={f.href} style={{ gridTemplateColumns: '1fr' }}>
            <span className="title">{f.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ---------- المشاركة ----------
export function ShareRow({ url, title, labels }: { url: string; title: string; labels: { share: string; copyLink: string; copied: string } }) {
  const [toast, setToast] = useState(false);
  const u = encodeURIComponent(url);
  const tx = encodeURIComponent(title);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setToast(true);
      setTimeout(() => setToast(false), 1800);
    } catch {}
  };
  return (
    <div className="share-row">
      <strong style={{ fontSize: '0.88rem' }}>{labels.share}:</strong>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener nofollow">Facebook</a>
      <a href={`https://wa.me/?text=${tx}%20${u}`} target="_blank" rel="noopener nofollow">WhatsApp</a>
      <a href={`https://t.me/share/url?url=${u}&text=${tx}`} target="_blank" rel="noopener nofollow">Telegram</a>
      <button onClick={copy}>{labels.copyLink}</button>
      {toast && <div className="toast" role="status">{labels.copied}</div>}
    </div>
  );
}

// ---------- البحث ----------
type Entry = { u: string; t: string; k: string; s: boolean };

// توحيد الحروف العربية: الهمزات، التاء المربوطة، الياء، التشكيل
export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function SearchClient({ index, initial, labels }: { index: Entry[]; initial: string; labels: { placeholder: string; search: string; results: string; none: string; withSolution: string } }) {
  const [q, setQ] = useState(initial);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('q');
    if (p) setQ(p);
  }, []);
  const prepared = useMemo(() => index.map((e) => ({ ...e, n: norm(`${e.t} ${e.k}`) })), [index]);
  const terms = norm(q).split(' ').filter((w) => w.length > 0).map((w) => w.replace(/^ال/, ''));
  const results = terms.length ? prepared.filter((e) => terms.every((w) => e.n.includes(w))).slice(0, 80) : [];
  return (
    <>
      <form className="search-form" role="search" onSubmit={(e) => e.preventDefault()} style={{ boxShadow: 'none', border: '1px solid var(--line)', maxWidth: 'none' }}>
        <label className="visually-hidden" htmlFor="q">{labels.search}</label>
        <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={labels.placeholder} autoFocus />
        <button type="submit">{labels.search}</button>
      </form>
      {terms.length > 0 && (
        <p style={{ margin: '14px 0 10px', color: 'var(--muted)' }} role="status">{results.length} {labels.results}</p>
      )}
      {terms.length > 0 && results.length === 0 && <div className="empty-state"><p>{labels.none}</p></div>}
      {results.length > 0 && (
        <ul className="register">
          {results.map((r) => (
            <li key={r.u}>
              <Link className="row" href={r.u} style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                <span className="title">{r.t}</span>
                {r.s ? <span className="stamp">{labels.withSolution}</span> : <span />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
