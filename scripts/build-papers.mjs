// ============================================================
//  يحوّل المواضيع المكتوبة في content/papers إلى ملفات PDF
//
//  كل موضوع = ملف HTML واحد:
//    content/papers/<المستوى>/<المادة>/<النوع>/<الاسم>.html
//  فيه:
//    <!-- {"title":"...","duration":"ساعة واحدة","term":1} -->
//    <section class="paper"> ... الموضوع ... </section>
//    <section class="solution"> ... الحل ... </section>   (اختياري)
//  الرياضيات بين $...$ (داخل السطر) أو $$...$$ (سطر مستقل) بصيغة LaTeX.
//
//  الناتج: public/files/<...>/<الاسم>.pdf و <الاسم>-sol.pdf
//  التشغيل: npm run papers   (يحتاج Chromium/Playwright على الجهاز)
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import katex from 'katex';

const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const SRC = path.join(ROOT, 'content', 'papers');
const OUT = path.join(ROOT, 'public', 'files');
const only = process.argv[2]; // اختياري: جزء من المسار لبناء ملف واحد

const fontFile = (pkg, w) => path.join(ROOT, 'node_modules', '@fontsource', pkg, 'files', `${pkg}-arabic-${w}-normal.woff2`);
const katexCss = fs
  .readFileSync(path.join(ROOT, 'node_modules', 'katex', 'dist', 'katex.min.css'), 'utf8')
  .replace(/url\(fonts\//g, `url(file://${path.join(ROOT, 'node_modules', 'katex', 'dist', 'fonts')}/`);

const levelNames = { '0ap': 'القسم التحضيري', '1ap': 'السنة الأولى ابتدائي', '2ap': 'السنة الثانية ابتدائي', '3ap': 'السنة الثالثة ابتدائي', '4ap': 'السنة الرابعة ابتدائي', '5ap': 'السنة الخامسة ابتدائي', '1am': 'السنة الأولى متوسط', '2am': 'السنة الثانية متوسط', '3am': 'السنة الثالثة متوسط', '4am': 'السنة الرابعة متوسط', bem: 'شهادة التعليم المتوسط', '1as': 'السنة الأولى ثانوي', '2as': 'السنة الثانية ثانوي', '3as': 'السنة الثالثة ثانوي', bac: 'شهادة البكالوريا' };
const subjectNames = { math: 'الرياضيات', physics: 'العلوم الفيزيائية', science: 'علوم الطبيعة والحياة', arabic: 'اللغة العربية', french: 'اللغة الفرنسية', english: 'اللغة الإنجليزية', philosophy: 'الفلسفة', islamic: 'التربية الإسلامية', 'history-geo': 'التاريخ والجغرافيا', civic: 'التربية المدنية', scientific: 'التربية العلمية والتكنولوجية', history: 'التاريخ', geography: 'الجغرافيا', tamazight: 'اللغة الأمازيغية', informatics: 'الإعلام الآلي', economics: 'التسيير المحاسبي والمالي' };

const SITE = process.env.SITE_NAME || 'تفوّق';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

const unesc = (t) => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, '~');
function renderMath(html) {
  const opts = { throwOnError: true, output: 'html', strict: false };
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => `<div class="math-block" dir="ltr">${katex.renderToString(unesc(tex.trim()), { ...opts, displayMode: true })}</div>`);
  html = html.replace(/\$([^$\n]+?)\$/g, (_, tex) => `<span class="m" dir="ltr">${katex.renderToString(unesc(tex.trim()), opts)}</span>`);
  return html;
}

const TERM = { 1: 'الأول', 2: 'الثاني', 3: 'الثالث' };
const SCHOOL_YEAR = process.env.SCHOOL_YEAR || '2025/2026';
const SESSION = process.env.EXAM_SESSION || '2026';
function examLabel(meta, level, type) {
  const lv = levelNames[level] || level;
  const t = TERM[meta.term] ? ` الفصل ${TERM[meta.term]}` : '';
  if (type === 'mock' || type === 'official') {
    const ex = level === 'bac' ? 'شهادة البكالوريا' : level === 'bem' ? 'شهادة التعليم المتوسط' : lv;
    return { right: `${type === 'mock' ? 'موضوع تجريبي لامتحان' : 'امتحان'} ${ex}`, left: `دورة: ${SESSION}${type === 'mock' ? ' (تجريبية)' : ''}`, sub: meta.stream ? `الشعبة: ${meta.stream}` : '' };
  }
  const kind = { exam: `اختبار${t}`, test: `فرض${t}`, exercises: 'سلسلة تمارين', summary: 'ملخص درس', lesson: 'درس' }[type] || '';
  return { right: lv, left: `السنة الدراسية: ${SCHOOL_YEAR}`, sub: kind };
}

function page({ meta, level, subject, type, body, solution }) {
  const L = examLabel(meta, level, type);
  const subj = subjectNames[subject] || subject;
  const what = { exam: 'اختبار في مادة', test: 'فرض في مادة', mock: 'اختبار في مادة', official: 'اختبار في مادة' }[type] || 'المادة';
  const head = `
<header class="head">
  <div class="brand"><span class="mark"></span>${SITE}${SITE_URL ? ` <small dir="ltr">${SITE_URL}</small>` : ''}</div>
  <div class="row"><b>${L.right}</b><b>${L.left}</b></div>
  ${L.sub ? `<div class="row"><span>${L.sub}</span><span></span></div>` : ''}
  <div class="row subj"><b>${solution ? 'الإجابة النموذجية وسلم التنقيط — ' : ''}${what}: ${subj}</b><b>${solution ? '' : meta.duration ? `المدة: ${meta.duration}` : ''}</b></div>
  ${['lesson', 'summary', 'exercises'].includes(type) || !['exam', 'test', 'mock', 'official'].includes(type) ? `<h1>${meta.title}</h1>` : ''}
</header>`;
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>
@font-face{font-family:Plex;font-weight:400;src:url(file://${fontFile('ibm-plex-sans-arabic', 400)})}
@font-face{font-family:Plex;font-weight:600;src:url(file://${fontFile('ibm-plex-sans-arabic', 600)})}
@font-face{font-family:Plex;font-weight:700;src:url(file://${fontFile('ibm-plex-sans-arabic', 700)})}
@font-face{font-family:Naskh;font-weight:700;src:url(file://${fontFile('noto-naskh-arabic', 700)})}
${katexCss}
@page{size:A4;margin:14mm 14mm 16mm}
*{box-sizing:border-box}
body{font-family:Plex,sans-serif;font-size:11.5pt;line-height:1.75;color:#1f2428;margin:0}
.head{border-bottom:3pt double #1f2428;padding:0 0 5pt;margin-bottom:12pt;font-family:Naskh;font-size:12.5pt;line-height:1.7}
.brand{font-family:Naskh;font-size:14pt;color:#1f2428;display:flex;align-items:baseline;justify-content:center;gap:7pt;margin-bottom:2pt}
.brand small{font-family:Plex;font-size:8.5pt;color:#5b656d}
.head .row{display:flex;justify-content:space-between;gap:12pt}
.head .subj{border-top:0.8pt solid #1f2428;margin-top:3pt;padding-top:3pt}
.mark{width:8pt;height:8pt;background:#e0b92c;transform:rotate(45deg);display:inline-block}
.info{width:100%;border-collapse:collapse;font-size:10pt;margin-top:4pt}
.info td{padding:2pt 0}
h1{font-family:Naskh;font-size:14pt;text-align:center;margin:6pt 0 0;color:#1d3c91}
h2{font-family:Naskh;font-size:13pt;margin:12pt 0 3pt;text-decoration:underline;text-underline-offset:3pt;break-after:avoid}
h2 .pts{font-weight:700}
h2 .pts::before{content:': '}
[dir=ltr] h2{font-family:Plex,sans-serif}
.text-box{border:1pt solid #c9d3cd;border-radius:5pt;padding:8pt 12pt;margin:4pt 0 10pt;background:#fbfcfb;font-family:Naskh,serif;font-size:13pt;line-height:2}
.text-box[dir=ltr]{font-family:Georgia,'Times New Roman',serif;font-size:12pt;line-height:1.7}
.text-box p{margin:0 0 4pt}
[dir=ltr] ol{padding-inline-start:20pt}
h3{font-size:11.5pt;margin:10pt 0 2pt}
p{margin:0 0 5pt}
ol{margin:0 0 6pt;padding-inline-start:18pt}
li{margin-bottom:3pt}
.m{unicode-bidi:isolate;white-space:nowrap}
.katex{font-size:1.08em}
.math-block{margin:4pt 0;text-align:center}
.part{font-family:Naskh;font-size:13pt;text-align:center;margin:14pt 0 2pt;color:#1e4636}
.fig{float:left;margin:0 12pt 6pt 0}
.fig svg{display:block;overflow:visible}
.fig svg text{direction:ltr;unicode-bidi:plaintext}
.clear{clear:both}
.box{border:1pt dashed #9aa7a0;border-radius:4pt;padding:6pt 9pt;margin:6pt 0}
.ans{color:#1d3c91}
table.grid{border-collapse:collapse;margin:4pt auto}
table.grid td,table.grid th{border:0.8pt solid #888;padding:2pt 8pt;text-align:center}
.foot{position:fixed;bottom:-10mm;left:0;right:0;text-align:center;font-size:8.5pt;color:#7b858c}
.good{text-align:center;font-family:Naskh;font-size:12pt;margin-top:16pt;color:#1e4636}
section{break-inside:auto}
.ex{break-inside:avoid}
.ex:has(table.bareme){break-inside:auto}
table.bareme{width:100%;border-collapse:collapse;margin:2pt 0 8pt;font-size:11pt}
table.bareme th,table.bareme td{border:0.8pt solid #444;padding:3pt 7pt;vertical-align:middle}
table.bareme th{background:#f0f0f0;font-size:10pt}
table.bareme td.p,table.bareme td.t{width:13%;text-align:center;white-space:nowrap;direction:ltr}
table.bareme td.t{width:9%;font-weight:700;font-size:13pt}
table.bareme td p,table.bareme td ol,table.bareme td ul{margin:0}
table.bareme tr{break-inside:avoid}
</style></head><body>${head}<main id="content">${body}</main></body></html>`;
}

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

// يحوّل <div class="ex" data-total="3"> وعناصره ذات data-pts إلى جدول «سلم التنقيط»
function bareme() {
  const fmt = (v) => String(v).replace(/\./g, ',');
  const val = (v) => (v ? String(v).split('+').reduce((s, x) => { const m = x.trim().match(/^(\d+)\s*[×x*]\s*([\d.]+)$/); return s + (m ? m[1] * m[2] : Number(x) || 0); }, 0) : 0);
  const issues = [];
  for (const ex of document.querySelectorAll('.ex[data-total]')) {
    const h2 = ex.querySelector(':scope > h2');
    const items = [...ex.children].filter((c) => c !== h2);
    const t = document.createElement('table');
    t.className = 'bareme';
    const lang = ex.closest('[lang]')?.getAttribute('lang');
    const L = { fr: ['Éléments de réponse', 'Barème', 'Total'], en: ['Answer key', 'Marks', 'Total'] }[lang] || ['عناصر الإجابة', 'العلامة مجزأة', 'المجموع'];
    t.innerHTML = `<thead><tr><th>${L[0]}</th><th>${L[1]}</th><th>${L[2]}</th></tr></thead><tbody></tbody>`;
    const tb = t.querySelector('tbody');
    let sum = 0;
    items.forEach((it, i) => {
      const tr = document.createElement('tr');
      const a = document.createElement('td');
      a.append(it);
      const p = document.createElement('td');
      p.className = 'p';
      p.textContent = it.dataset.pts ? (lang === 'en' ? it.dataset.pts : fmt(it.dataset.pts)) : '';
      sum += val(it.dataset.pts);
      tr.append(a, p);
      if (i === 0) {
        const tt = document.createElement('td');
        tt.className = 't';
        tt.rowSpan = items.length;
        tt.textContent = lang === 'en' ? ex.dataset.total : fmt(ex.dataset.total);
        tr.append(tt);
      }
      tb.append(tr);
    });
    if (Math.abs(sum - Number(ex.dataset.total)) > 1e-6) issues.push(`${h2 ? h2.textContent.trim() : '?'}: ${sum} ≠ ${ex.dataset.total}`);
    ex.replaceChildren(...(h2 ? [h2] : []), t);
    ex.removeAttribute('data-total');
  }
  return issues;
}

const { chromium } = require('playwright');
const browser = await chromium.launch();
let built = 0;
for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file);
  if (only && !rel.includes(only)) continue;
  const [level, subject, type] = rel.split(path.sep);
  const name = path.basename(file, '.html');
  const raw = fs.readFileSync(file, 'utf8');
  const meta = JSON.parse((raw.match(/<!--\s*(\{[\s\S]*?\})\s*-->/) || [, '{}'])[1]);
  const paper = (raw.match(/<section class="paper">([\s\S]*?)<\/section>/) || [])[1];
  const sol = (raw.match(/<section class="solution">([\s\S]*?)<\/section>/) || [])[1];
  if (!paper) {
    console.warn('⚠ no <section class="paper"> in', rel);
    continue;
  }
  const dest = path.join(OUT, level, subject, type);
  fs.mkdirSync(dest, { recursive: true });
  const slug = `${type}-${name}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const rdir = path.join(ROOT, 'content', 'rendered', level, subject);
  const rfile = path.join(rdir, `${slug}.json`);
  const pdfPath = path.join(dest, `${name}.pdf`);
  const fresh = (f) => fs.existsSync(f) && fs.statSync(f).mtimeMs > fs.statSync(file).mtimeMs && fs.statSync(f).mtimeMs > fs.statSync(new URL(import.meta.url)).mtimeMs;
  if (!process.env.FORCE && fresh(pdfPath) && fresh(rfile)) continue;
  const web = { meta, paper: null, solution: null };
  const jobs = [['paper', `${name}.pdf`, page({ meta, level, subject, type, body: renderMath(paper) + '<p class="good">بالتوفيق</p>' })]];
  if (sol) jobs.push(['solution', `${name}-sol.pdf`, page({ meta, level, subject, type, body: renderMath(sol), solution: true })]);
  for (const [kind, out, html] of jobs) {
    const pg = await browser.newPage();
    const tmp = path.join(dest, `.${out}.html`);
    fs.writeFileSync(tmp, html);
    await pg.goto('file://' + tmp);
    await pg.evaluate(() => document.fonts.ready);
    const issues = await pg.evaluate(bareme);
    for (const i of issues) console.warn(`⚠ مجموع النقاط: ${rel} — ${i}`);
    // نسخة HTML للعرض داخل صفحة الموقع (نص قابل للفهرسة في جوجل)
    web[kind] = await pg.evaluate(() => { const m = document.getElementById('content').cloneNode(true); m.querySelector('.good')?.remove(); return m.innerHTML; });
    await pg.pdf({
      path: path.join(dest, out),
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `<div style="width:100%;text-align:center;font-size:8.5px;color:#555;font-family:sans-serif" dir="rtl">صفحة <span class="pageNumber"></span> من <span class="totalPages"></span> &nbsp;—&nbsp; <span dir="ltr">${SITE_URL || 'Tafawoq'}</span></div>`,
    });
    fs.unlinkSync(tmp);
    await pg.close();
    built++;
  }
  fs.mkdirSync(rdir, { recursive: true });
  fs.writeFileSync(rfile, JSON.stringify(web));
  console.log('✓', rel);
}
await browser.close();
console.log(`✓ ${built} PDF`);
