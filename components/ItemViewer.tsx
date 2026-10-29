'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { BookmarkIcon } from './Icons';
import { readFavs, writeFavs } from './Interactive';

type VLabels = { paper: string; solution: string; fullscreen: string; noSolution: string };

/** تبويبا «الموضوع / الحل النموذجي» مع تكبير وتصغير وملء الشاشة */
export function ItemViewer({ paper, solution, labels }: { paper: ReactNode; solution?: ReactNode; labels: VLabels }) {
  const [tab, setTab] = useState<'paper' | 'solution'>('paper');
  const [zoom, setZoom] = useState(100);
  const box = useRef<HTMLDivElement>(null);

  const openSolution = useCallback(() => {
    if (!solution) return;
    setTab('solution');
    setTimeout(() => box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  }, [solution]);

  useEffect(() => {
    const check = () => {
      if (location.hash === '#solution') openSolution();
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, [openSolution]);

  const full = () => {
    const el = box.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="iv" ref={box} id="viewer">
      <div className="iv-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'paper'} onClick={() => setTab('paper')}>{labels.paper}</button>
        <button role="tab" aria-selected={tab === 'solution'} disabled={!solution} onClick={() => setTab('solution')} title={solution ? undefined : labels.noSolution}>{labels.solution}</button>
      </div>
      <div className="iv-bar">
        <button type="button" className="iv-full" onClick={full} aria-label={labels.fullscreen}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
          <span>{labels.fullscreen}</span>
        </button>
        <div className="iv-zoom">
          <button type="button" onClick={() => setZoom((z) => Math.max(70, z - 10))} aria-label="−">−</button>
          <span>{zoom}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(160, z + 10))} aria-label="+">+</button>
        </div>
      </div>
      <div className="iv-stage">
        <div className="iv-page" style={{ zoom: zoom / 100 }}>
          <div hidden={tab !== 'paper'}>{paper}</div>
          {solution && <div hidden={tab !== 'solution'}>{solution}</div>}
        </div>
      </div>
    </div>
  );
}

/** أزرار: طباعة، حفظ، مشاركة */
export function ItemActions({ href, title, url, file, labels }: { href: string; title: string; url: string; file: string; labels: { print: string; save: string; saved: string; share: string; copied: string } }) {
  const [on, setOn] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => setOn(readFavs().some((f) => f.href === href)), [href]);
  const toggle = () => {
    const list = readFavs().filter((f) => f.href !== href);
    if (!on) list.unshift({ href, title });
    writeFavs(list.slice(0, 200));
    setOn(!on);
  };
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMsg(labels.copied);
      setTimeout(() => setMsg(''), 2200);
    } catch {}
  };
  return (
    <>
      <a className="ia-btn" href={file} target="_blank" rel="noopener">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></svg>
        {labels.print}
      </a>
      <button type="button" className="ia-btn" aria-pressed={on} onClick={toggle}>
        <BookmarkIcon /> {on ? labels.saved : labels.save}
      </button>
      <button type="button" className="ia-btn" onClick={share}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
        {msg || labels.share}
      </button>
    </>
  );
}
