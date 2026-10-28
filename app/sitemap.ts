export const dynamic = 'force-static';
import type { MetadataRoute } from 'next';
import { categoryIds, levels, stageIds } from '@/lib/catalog';
import { articles, articlesOf, countOf, resources } from '@/lib/content';
import { abs, locales, type Locale } from '@/lib/site';

const langs = (p: string, only: readonly Locale[] = locales) =>
  Object.fromEntries(only.map((l) => [l === 'ar' ? 'ar-DZ' : l === 'fr' ? 'fr-DZ' : 'en', abs(`/${l}${p}`)]));

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const out: MetadataRoute.Sitemap = [];
  const add = (p: string, priority: number, freq: 'daily' | 'weekly' | 'monthly', lastModified: Date = now, only: readonly Locale[] = locales) => {
    for (const l of only) out.push({ url: abs(`/${l}${p}`), lastModified, changeFrequency: freq, priority, alternates: { languages: langs(p, only) } });
  };

  add('', 1, 'daily');
  stageIds.forEach((s) => add(`/${s}`, 0.8, 'weekly'));
  // نضيف فقط الصفحات التي فيها محتوى (الصفحات الفارغة noindex)
  for (const lv of levels) {
    if (!countOf(lv.id)) continue;
    add(`/${lv.id}`, 0.9, 'daily');
    for (const s of lv.subjects) if (countOf(lv.id, s)) add(`/${lv.id}/${s}`, 0.8, 'daily');
  }
  for (const r of resources) if (!r.sample) add(`/${r.level}/${r.subject}/${r.slug}`, 0.6, 'monthly', new Date(r.added));
  add('/library', 0.5, 'weekly');
  for (const c of categoryIds) for (const l of locales) if (articlesOf(l, c).length) add(`/${c}`, 0.5, 'weekly', now, [l]);
  for (const a of articles()) add(`/${a.category}/${a.slug}`, 0.6, 'monthly', new Date(a.updated || a.date), [a.lang]);
  ['/about', '/contact', '/faqs', '/privacy-policy', '/terms', '/upload'].forEach((p) => add(p, 0.3, 'monthly'));
  return out;
}
