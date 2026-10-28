// ============================================================
//  يمسح مجلد public/files ويولّد content/resources.json تلقائيًا
//
//  ضع الملفات بهذا الترتيب:
//    public/files/<المستوى>/<المادة>/<النوع>/<اسم-الملف>.pdf
//  مثال:
//    public/files/4am/math/exam/t1-2025-1.pdf        ← اختبار الفصل 1، 2025، النموذج 1
//    public/files/4am/math/exam/t1-2025-1-sol.pdf    ← الحل (نفس الاسم + -sol)
//    public/files/bac/philosophy/official/2024.pdf   ← موضوع بكالوريا 2024
//    public/files/1as/physics/lesson/mouvement.pdf   ← درس
//
//  الأنواع: lesson | summary | exercises | test | exam | mock (موضوع تجريبي) | official (موضوع رسمي فقط)
//  t1 / t2 / t3 = الفصل، و 4 أرقام = السنة.
//  لإضافة عنوان أو وصف مخصص: content/resources.extra.json
// ============================================================
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FILES = path.join(ROOT, 'public', 'files');
const OUT = path.join(ROOT, 'content', 'resources.json');
const EXTRA = path.join(ROOT, 'content', 'resources.extra.json');
const LEVELS_AR = { '0ap': 'القسم التحضيري', '1ap': 'السنة الأولى ابتدائي', '2ap': 'السنة الثانية ابتدائي', '3ap': 'السنة الثالثة ابتدائي', '4ap': 'السنة الرابعة ابتدائي', '5ap': 'السنة الخامسة ابتدائي', '1am': 'السنة الأولى متوسط', '2am': 'السنة الثانية متوسط', '3am': 'السنة الثالثة متوسط', '4am': 'السنة الرابعة متوسط', bem: 'شهادة التعليم المتوسط', '1as': 'السنة الأولى ثانوي', '2as': 'السنة الثانية ثانوي', '3as': 'السنة الثالثة ثانوي', bac: 'شهادة البكالوريا' };
const TYPES = ['lesson', 'summary', 'exercises', 'test', 'exam', 'mock', 'official'];

let PDFDocument = null;
try {
  ({ PDFDocument } = await import('pdf-lib'));
} catch {}

const readJson = (f, d) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    return d;
  }
};

const previous = new Map(readJson(OUT, []).map((r) => [r.id, r]));
const extra = readJson(EXTRA, {});
const today = new Date().toISOString().slice(0, 10);
const out = [];
const warnings = [];

const dirs = (p) => (fs.existsSync(p) ? fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []);

for (const level of dirs(FILES)) {
  for (const subject of dirs(path.join(FILES, level))) {
    for (const type of dirs(path.join(FILES, level, subject))) {
      if (!TYPES.includes(type)) {
        warnings.push(`نوع غير معروف: ${level}/${subject}/${type}`);
        continue;
      }
      const dir = path.join(FILES, level, subject, type);
      const pdfs = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'));
      const names = new Set(pdfs);
      for (const file of pdfs) {
        const base = file.replace(/\.pdf$/i, '');
        if (/[-.]sol$/i.test(base)) continue; // ملف حل، يُربط بالموضوع
        const solFile = [`${base}-sol.pdf`, `${base}.sol.pdf`].find((s) => names.has(s));
        const slug = `${type}-${base}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const id = `${level}/${subject}/${slug}`;
        const tm = base.match(/(?:^|[-_])t([123])(?:[-_]|$)/i);
        const ym = base.match(/(?:^|[-_])(20\d\d|19\d\d)(?:[-_]|$)/);
        const nm = base.match(/[-_](\d{1,2})$/);
        const full = path.join(dir, file);
        const size = fs.statSync(full).size;
        let pages;
        if (PDFDocument) {
          try {
            const doc = await PDFDocument.load(fs.readFileSync(full), { ignoreEncryption: true, updateMetadata: false });
            pages = doc.getPageCount();
          } catch {}
        }
        const prev = previous.get(id);
        // بيانات الموضوع إن كان من إعداد الموقع (content/papers)
        let paperMeta = null;
        const rendered = path.join(ROOT, 'content', 'rendered', level, subject, `${slug}.json`);
        if (fs.existsSync(rendered)) paperMeta = JSON.parse(fs.readFileSync(rendered, 'utf8')).meta;
        const fromPaper = paperMeta
          ? {
              html: true,
              title: paperMeta.title ? { ar: `${paperMeta.title}${paperMeta.title.includes(LEVELS_AR[level]) ? '' : ` — ${LEVELS_AR[level] || level}`}${solFile ? ' مع الحل' : ''}` } : undefined,
              description: paperMeta.topics
                ? { ar: `${paperMeta.title}${!LEVELS_AR[level] || paperMeta.title.includes(LEVELS_AR[level]) ? '' : ' ل' + LEVELS_AR[level].replace(/^ال/, 'ل')}${paperMeta.duration && !/مراجعة/.test(paperMeta.duration) ? ` (المدة: ${paperMeta.duration})` : ''}. موضوع مقترح${solFile ? ' مع الحل المفصل' : ''} يتناول: ${paperMeta.topics.join('، ')}. للمعاينة والتحميل المجاني PDF.` }
                : undefined,
            }
          : {};
        out.push({
          id,
          slug,
          level,
          subject,
          type,
          trimester: tm ? Number(tm[1]) : undefined,
          year: ym ? Number(ym[1]) : undefined,
          n: nm ? Number(nm[1]) : undefined,
          file: `/files/${level}/${subject}/${type}/${file}`,
          solution: solFile ? `/files/${level}/${subject}/${type}/${solFile}` : undefined,
          sample: /demo/i.test(base) || undefined,
          size,
          pages,
          added: prev?.added || today,
          ...fromPaper,
          ...(extra[id] || {}),
        });
      }
    }
  }
}

// ---------- المواضيع المضافة من لوحة التحكم (content/uploads/*.json) ----------
const UPLOADS = path.join(ROOT, 'content', 'uploads');
if (fs.existsSync(UPLOADS)) {
  for (const f of fs.readdirSync(UPLOADS).filter((x) => x.endsWith('.json'))) {
    let e;
    try {
      e = JSON.parse(fs.readFileSync(path.join(UPLOADS, f), 'utf8'));
    } catch {
      warnings.push(`ملف غير صالح: content/uploads/${f}`);
      continue;
    }
    if (!e.level || !e.subject || !e.type || !e.file) {
      warnings.push(`ناقص (المستوى/المادة/النوع/الملف): ${f}`);
      continue;
    }
    const local = path.join(ROOT, 'public', e.file.replace(/^\//, ''));
    if (!fs.existsSync(local)) {
      warnings.push(`الملف غير موجود: ${e.file}`);
      continue;
    }
    const base = f.replace(/\.json$/, '');
    const slug = `${e.type}-u${base}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const id = `${e.level}/${e.subject}/${slug}`;
    let pages;
    if (PDFDocument) {
      try {
        pages = (await PDFDocument.load(fs.readFileSync(local), { ignoreEncryption: true, updateMetadata: false })).getPageCount();
      } catch {}
    }
    const prev = previous.get(id);
    out.push({
      id,
      slug,
      level: e.level,
      subject: e.subject,
      type: e.type,
      trimester: e.trimester ? Number(e.trimester) : undefined,
      year: e.year ? Number(e.year) : undefined,
      file: e.file,
      solution: e.solution || undefined,
      size: fs.statSync(local).size,
      pages,
      added: prev?.added || (/^\d{8}/.test(base) ? `${base.slice(0, 4)}-${base.slice(4, 6)}-${base.slice(6, 8)}` : today),
      title: e.title ? { ar: e.title } : undefined,
      description: e.description ? { ar: e.description } : undefined,
      ...(extra[id] || {}),
    });
  }
}

out.sort((a, b) => (b.added || '').localeCompare(a.added || '') || a.id.localeCompare(b.id));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
for (const w of warnings) console.warn('⚠', w);
console.log(`✓ ${out.length} ملف مفهرس → content/resources.json`);
