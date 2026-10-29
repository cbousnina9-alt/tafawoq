import Link from 'next/link';
import { levelById, stages, stageIds } from '@/lib/catalog';
import { countOf } from '@/lib/content';
import { t } from '@/lib/i18n';
import { site, type Locale } from '@/lib/site';
import { LangSwitch, MobileMenu } from './HeaderClient';
import { SearchIcon, StarIcon } from './Icons';
import LogoMark from './Logo';

export default function Header({ locale }: { locale: Locale }) {
  const d = t(locale);
  const L = (ar: string, fr: string, en: string) => ({ ar, fr, en })[locale];
  const groups = stageIds.map((s) => ({
    title: stages[s].name[locale],
    href: `/${locale}/${s}`,
    links: stages[s].levels.map((id) => {
      const lv = levelById(id)!;
      return { href: `/${locale}/${id}`, label: lv.short[locale], full: lv.name[locale], exam: !!lv.exam, n: countOf(id) };
    }),
  }));
  const unit = L('موضوع', 'sujets', 'papers');
  return (
    <header className="site-header">
      <a className="skip" href="#main">{L('انتقل إلى المحتوى', 'Aller au contenu', 'Skip to content')}</a>
      <div className="wrap">
        <Link href={`/${locale}`} className="logo" aria-label={site.name[locale]}>
          <LogoMark />
          <span className="logo-text">
            {site.name[locale]}
            <small>{L('فروض واختبارات بالحل', 'Devoirs et examens corrigés', 'Tests & exams with answers')}</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="main">
          <div className="mega">
            <button className="mega-btn" aria-haspopup="true">
              {L('المستويات', 'Niveaux', 'Levels')}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div className="mega-panel">
              {groups.map((g) => (
                <div className="mega-col" key={g.title}>
                  <Link className="mega-head" href={g.href}>{g.title}</Link>
                  <ul>
                    {g.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className={l.exam ? 'is-exam' : undefined}>
                          <span>{l.full}</span>
                          <small>{l.n} {unit}</small>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <Link href={`/${locale}/bem`}>{L('شهادة التعليم المتوسط', 'BEM', 'BEM')}</Link>
          <Link href={`/${locale}/bac`}>{L('البكالوريا', 'BAC', 'BAC')}</Link>
          <Link href={`/${locale}/library`}>{d.library}</Link>
          <Link href={`/${locale}/upload`}>{d.upload}</Link>
        </nav>
        <div className="header-tools">
          <Link className="icon-btn" href={`/${locale}/search`} aria-label={d.search}><SearchIcon /></Link>
          <Link className="icon-btn fav-link" href={`/${locale}/favorites`} aria-label={d.favorites}><StarIcon /></Link>
          <LangSwitch locale={locale} />
        </div>
        <MobileMenu label={d.menu} closeLabel={d.close} groups={groups.map((g) => ({ title: g.title, links: g.links }))} extra={[{ href: `/${locale}/library`, label: d.library }, { href: `/${locale}/upload`, label: d.upload }]} />
      </div>
    </header>
  );
}
