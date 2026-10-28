import Link from 'next/link';
import { categories, levelById } from '@/lib/catalog';
import { t } from '@/lib/i18n';
import { site, type Locale } from '@/lib/site';

export default function Footer({ locale }: { locale: Locale }) {
  const d = t(locale);
  const popular = ['5ap', '4am', 'bem', '3as', 'bac'].map((id) => levelById(id)!);
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="cols">
          <div>
            <h3>{site.name[locale]}</h3>
            <p>{d.footerAbout}</p>
            <p style={{ display: 'flex', gap: 14 }}>
              {site.social.facebook && <a href={site.social.facebook} rel="noopener">Facebook</a>}
              {site.social.telegram && <a href={site.social.telegram} rel="noopener">Telegram</a>}
              {site.social.youtube && <a href={site.social.youtube} rel="noopener">YouTube</a>}
            </p>
          </div>
          <div>
            <h3>{locale === 'ar' ? 'الأكثر طلبًا' : locale === 'fr' ? 'Les plus demandés' : 'Most requested'}</h3>
            <ul>
              {popular.map((l) => (
                <li key={l.id}><Link href={`/${locale}/${l.id}`}>{l.name[locale]}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{d.library}</h3>
            <ul>
              {Object.entries(categories).map(([id, c]) => (
                <li key={id}><Link href={`/${locale}/${id}`}>{c.name[locale]}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{site.name[locale]}</h3>
            <ul>
              <li><Link href={`/${locale}/about`}>{d.about}</Link></li>
              <li><Link href={`/${locale}/contact`}>{d.contact}</Link></li>
              <li><Link href={`/${locale}/upload`}>{d.upload}</Link></li>
              <li><Link href={`/${locale}/faqs`}>{d.faqs}</Link></li>
              <li><Link href={`/${locale}/privacy-policy`}>{d.privacy}</Link></li>
              <li><Link href={`/${locale}/terms`}>{d.terms}</Link></li>
            </ul>
          </div>
        </div>
        <div className="bottom">
          <span>© {new Date().getFullYear()} {site.name[locale]} — {d.rights}</span>
          <span>{d.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
