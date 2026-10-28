import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import resourcesJson from '@/content/resources.json';
import { levelById, levels, subjects, trimesters, types, type Level, type TypeId } from './catalog';
import type { Locale } from './site';

export type Resource = {
  id: string;
  slug: string;
  level: string;
  subject: string;
  type: TypeId;
  trimester?: 1 | 2 | 3;
  year?: number;
  n?: number;
  file: string;
  solution?: string;
  sample?: boolean;
  size: number;
  pages?: number;
  added: string;
  title?: Partial<Record<Locale, string>>;
  description?: Partial<Record<Locale, string>>;
  stream?: string;
};

export const resources = resourcesJson as unknown as Resource[];

export const resourcesOf = (level: string, subject?: string) =>
  resources.filter((r) => r.level === level && (!subject || r.subject === subject));

export const countOf = (level: string, subject?: string) => resourcesOf(level, subject).length;

export const findResource = (level: string, subject: string, slug: string) =>
  resources.find((r) => r.level === level && r.subject === subject && r.slug === slug);

export const resourceUrl = (l: Locale, r: Resource) => `/${l}/${r.level}/${r.subject}/${r.slug}`;

// ---------- العناوين (مهمة جدًا للسيو) ----------
export function levelPhrase(l: Locale, lv: Level) {
  if (l === 'ar') return `ل${lv.name.ar.replace(/^ال/, 'ل')}`;
  if (l === 'fr') return lv.exam ? `du ${lv.name.fr}` : `— ${lv.name.fr}`;
  return lv.exam ? `— ${lv.name.en}` : `— ${lv.name.en}`;
}

export function resourceTitle(l: Locale, r: Resource): string {
  if (r.title?.[l]) return r.title[l]!;
  const lv = levelById(r.level)!;
  const sub = subjects[r.subject].name[l];
  const ty = types[r.type].one[l];
  const term = r.trimester ? trimesters[r.trimester][l] : '';
  const model = r.n && r.n > 1 ? (l === 'ar' ? ` (النموذج ${r.n})` : ` (n°${r.n})`) : '';
  const nameFromFile = !r.trimester && !r.year ? r.slug.replace(`${r.type}-`, '').replace(/^demo-/, '').replace(/-/g, ' ') : '';
  if (l === 'ar') {
    if (r.type === 'official') return `موضوع ${lv.name.ar} ${r.year ?? ''} في ${sub}${r.solution ? ' مع الحل' : ''}`.replace(/\s+/g, ' ').trim();
    return [ty, term && term, `في ${sub}`, levelPhrase('ar', lv), r.year, nameFromFile].filter(Boolean).join(' ') + model;
  }
  if (l === 'fr') {
    if (r.type === 'official') return `Sujet ${lv.name.fr} ${r.year ?? ''} – ${sub}${r.solution ? ' avec corrigé' : ''}`.replace(/\s+/g, ' ').trim();
    return [ty, sub, term && `– ${term}`, `– ${lv.name.fr}`, r.year, nameFromFile].filter(Boolean).join(' ') + model;
  }
  if (r.type === 'official') return `${lv.name.en} ${r.year ?? ''} ${sub} paper${r.solution ? ' with answers' : ''}`.replace(/\s+/g, ' ').trim();
  return [sub, ty.toLowerCase(), term && `– ${term}`, `– ${lv.name.en}`, r.year, nameFromFile].filter(Boolean).join(' ') + model;
}

export function resourceDescription(l: Locale, r: Resource): string {
  if (r.description?.[l]) return r.description[l]!;
  const lv = levelById(r.level)!;
  const sub = subjects[r.subject].name[l];
  const title = resourceTitle(l, r);
  if (l === 'ar')
    return `${title}. ملف PDF مطابق للمنهاج الجزائري${r.solution ? ' مع التصحيح النموذجي' : ''}، للمعاينة والتحميل المجاني. مناسب لتلاميذ ${lv.name.ar} للتحضير في مادة ${sub}.`;
  if (l === 'fr')
    return `${title}. Fichier PDF conforme au programme algérien${r.solution ? ', avec corrigé type' : ''}, à consulter et télécharger gratuitement pour réviser ${sub} en ${lv.name.fr}.`;
  return `${title}. Free PDF following the Algerian curriculum${r.solution ? ', with a model answer key' : ''}, to preview and download for ${lv.name.en} ${sub} revision.`;
}

export function pagesLabel(l: Locale, n: number) {
  if (l === 'ar') return n === 1 ? 'صفحة واحدة' : n === 2 ? 'صفحتان' : n <= 10 ? `${n} صفحات` : `${n} صفحة`;
  if (l === 'fr') return `${n} page${n > 1 ? 's' : ''}`;
  return `${n} page${n > 1 ? 's' : ''}`;
}

export const formatSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

// ---------- نص الموضوع (للمواضيع المعدّة في content/papers) ----------
export type Rendered = { meta: { title: string; duration?: string; topics?: string[] }; paper: string; solution: string | null };
export function renderedOf(r: Resource): Rendered | null {
  const p = path.join(process.cwd(), 'content', 'rendered', r.level, r.subject, `${r.slug}.json`);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
}

// ---------- المقالات (content/articles/*.md) ----------
export type Article = {
  slug: string;
  category: string;
  lang: Locale;
  title: string;
  description: string;
  date: string;
  updated?: string;
  html: string;
  readingMinutes: number;
};

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');
let cache: Article[] | null = null;

export function articles(): Article[] {
  if (cache) return cache;
  if (!fs.existsSync(ARTICLES_DIR)) return (cache = []);
  cache = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8'));
      const words = content.split(/\s+/).length;
      return {
        slug: f.replace(/\.md$/, ''),
        category: String(data.category || 'advice'),
        lang: (data.lang || 'ar') as Locale,
        title: String(data.title),
        description: String(data.description || ''),
        date: String(data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date),
        updated: data.updated ? String(data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : data.updated) : undefined,
        html: marked.parse(content, { async: false }) as string,
        readingMinutes: Math.max(1, Math.round(words / 200)),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  return cache;
}

export const articlesOf = (l: Locale, category?: string) => articles().filter((a) => a.lang === l && (!category || a.category === category));

// ---------- فهرس البحث ----------
export function searchIndex(l: Locale) {
  const res = resources.map((r) => ({
    u: resourceUrl(l, r),
    t: resourceTitle(l, r),
    k: `${levelById(r.level)!.short[l]} ${levelById(r.level)!.name.fr} ${subjects[r.subject].name.fr} ${r.level}`,
    s: !!r.solution,
  }));
  const lv = levels.flatMap((lvl) => [
    { u: `/${l}/${lvl.id}`, t: lvl.name[l], k: `${lvl.short[l]} ${lvl.id}`, s: false },
    ...lvl.subjects.filter((s) => countOf(lvl.id, s) > 0).map((s) => ({ u: `/${l}/${lvl.id}/${s}`, t: `${subjects[s].name[l]} — ${lvl.name[l]}`, k: `${lvl.short[l]} ${lvl.id}`, s: false })),
  ]);
  const arts = articlesOf(l).map((a) => ({ u: `/${l}/${a.category}/${a.slug}`, t: a.title, k: a.description, s: false }));
  return [...lv, ...res, ...arts];
}
