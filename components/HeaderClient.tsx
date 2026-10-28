'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { categoryIds } from '@/lib/catalog';
import { locales, type Locale } from '@/lib/site';
import { CloseIcon, MenuIcon } from './Icons';

export function LangSwitch({ locale }: { locale: Locale }) {
  const path = usePathname() || `/${locale}`;
  const parts = path.split('/').filter(Boolean);
  return (
    <div className="lang-switch" role="navigation" aria-label="language">
      {locales.map((l) => {
        let rest = parts.slice(1);
        // المقالات موجودة بلغة واحدة: نوجّه إلى صفحة القسم
        if (l !== locale && rest.length >= 2 && categoryIds.includes(rest[0])) rest = rest.slice(0, 1);
        const href = `/${[l, ...rest].join('/')}`;
        return (
          <a key={l} href={href} hrefLang={l} lang={l} aria-current={l === locale ? 'true' : undefined}>
            {l === 'ar' ? 'ع' : l.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}

type Group = { title: string; links: { href: string; label: string; exam?: boolean }[] };

export function MobileMenu({ label, closeLabel, groups, extra }: { label: string; closeLabel: string; groups: Group[]; extra: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const path = usePathname();
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [path]);
  const panel = (
    <div id="mobile-menu" className="mobile-menu" data-open={open}>
      {groups.map((g) => (
        <div key={g.title}>
          <h3>{g.title}</h3>
          <div className="chips">
            {g.links.map((l) => (
              <Link key={l.href} className={`chip${l.exam ? ' exam' : ''}`} href={l.href}>{l.label}</Link>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 10 }}>
        {extra.map((e) => (
          <Link key={e.href} href={e.href}>{e.label}</Link>
        ))}
      </div>
    </div>
  );
  return (
    <>
      <button className="icon-btn menu-toggle" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? closeLabel : label} onClick={() => setOpen((v) => !v)}>
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      {mounted && createPortal(panel, document.querySelector('.site-header')!)}
    </>
  );
}
