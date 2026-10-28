import Link from 'next/link';
import { levelById, stages, stageIds } from '@/lib/catalog';
import { t } from '@/lib/i18n';
import { site, type Locale } from '@/lib/site';
import { LangSwitch, MobileMenu } from './HeaderClient';
import { SearchIcon, StarIcon } from './Icons';

export default function Header({ locale }: { locale: Locale }) {
  const d = t(locale);
  const nav = [
    { href: `/${locale}/ep`, label: { ar: 'الابتدائي', fr: 'Primaire', en: 'Primary' }[locale] },
    { href: `/${locale}/em`, label: { ar: 'المتوسط', fr: 'Moyen', en: 'Middle' }[locale] },
    { href: `/${locale}/es`, label: { ar: 'الثانوي', fr: 'Secondaire', en: 'Secondary' }[locale] },
    { href: `/${locale}/bem`, label: 'BEM' },
    { href: `/${locale}/bac`, label: 'BAC' },
    { href: `/${locale}/library`, label: d.library },
  ];
  const groups = stageIds.map((s) => ({
    title: stages[s].name[locale],
    links: stages[s].levels.map((id) => ({ href: `/${locale}/${id}`, label: levelById(id)!.short[locale], exam: !!levelById(id)!.exam })),
  }));
  return (
    <header className="site-header">
      <a className="skip" href="#main">{locale === 'ar' ? 'انتقل إلى المحتوى' : locale === 'fr' ? 'Aller au contenu' : 'Skip to content'}</a>
      <div className="wrap">
        <Link href={`/${locale}`} className="logo" aria-label={site.name[locale]}>
          <span className="logo-mark" aria-hidden />
          {site.name[locale]}
          <small>{locale === 'ar' ? 'فروض واختبارات' : locale === 'fr' ? 'Devoirs & examens' : 'Tests & exams'}</small>
        </Link>
        <nav className="main-nav" aria-label="main">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
        </nav>
        <div className="header-tools">
          <Link className="icon-btn" href={`/${locale}/search`} aria-label={d.search}><SearchIcon /></Link>
          <Link className="icon-btn fav-link" href={`/${locale}/favorites`} aria-label={d.favorites}><StarIcon /><span>{d.favorites}</span></Link>
          <LangSwitch locale={locale} />
        </div>
        <MobileMenu label={d.menu} closeLabel={d.close} groups={groups} extra={[{ href: `/${locale}/library`, label: d.library }, { href: `/${locale}/upload`, label: d.upload }]} />
      </div>
    </header>
  );
}
