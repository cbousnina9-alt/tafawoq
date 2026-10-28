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
const subjectNames = { math: 'الرياضيات', physics: 'العلوم الفيزيائية', science: 'علوم الطبيعة والحياة', arabic: 'اللغة العربية', french: 'اللغة الفرنسية', english: 'اللغة الإنجليزية', philosophy: 'الفلسفة', islamic: 'التربية الإسلامية', 'history-geo': 'التاريخ والجغرافيا', civic: 'التربية المدنية' };

const SITE = process.env.SITE_NAME || 'تفوّق';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

const unesc = (t) => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, '~');
function renderMath(html) {
  const opts = { throwOnError: true, output: 'html', strict: false };
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => `<div class="math-block" dir="ltr">${katex.renderToString(unesc(tex.trim()), { ...opts, displayMode: true })}</div>`);
  html = html.replace(/\$([^$\n]+?)\$/g, (_, tex) => `<span class="m" dir="ltr">${katex.renderToString(unesc(tex.trim()), opts)}</span>`);
  return html;
}

function page({ meta, level, subject, body, solution }) {
  const head = `
<header class="head">
  <div class="brand"><span class="mark"></span>${SITE}${SITE_URL ? `<small dir="ltr">${SITE_URL}</small>` : ''}</div>
  <table class="info"><tr>
    <td><b>المستوى:</b> ${levelNames[level] || level}</td>
    <td><b>المادة:</b> ${subjectNames[subject] || subject}</td>
    <td><b>${solution ? 'التصحيح' : 'المدة'}:</b> ${solution ? 'حل مقترح' : meta.duration || ''}</td>
  </tr></table>
  <h1>${meta.title}${solution ? ' — الحل' : ''}</h1>
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
.head{border:1.4pt solid #1e4636;border-radius:6pt;padding:8pt 12pt 6pt;margin-bottom:12pt}
.brand{font-family:Naskh;font-size:15pt;color:#1e4636;display:flex;align-items:center;gap:7pt}
.brand small{font-family:Plex;font-size:8.5pt;color:#5b656d;margin-inline-start:auto}
.mark{width:8pt;height:8pt;background:#e0b92c;transform:rotate(45deg);display:inline-block}
.info{width:100%;border-collapse:collapse;font-size:10pt;margin-top:4pt}
.info td{padding:2pt 0}
h1{font-family:Naskh;font-size:15pt;text-align:center;margin:6pt 0 0;color:#1d3c91}
h2{font-size:12pt;margin:14pt 0 4pt;padding:2pt 8pt;background:#eef3ef;border-inline-start:3pt solid #1e4636;break-after:avoid}
h2 .pts{float:left;font-weight:400;font-size:10pt;color:#5b656d}
[dir=ltr] h2 .pts{float:right}
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
</style></head><body>${head}${body}</body></html>`;
}

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.html')) yield p;
  }
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
  // نسخة HTML للعرض داخل صفحة الموقع (نص قابل للفهرسة في جوجل)
  const slug = `${type}-${name}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const rdir = path.join(ROOT, 'content', 'rendered', level, subject);
  fs.mkdirSync(rdir, { recursive: true });
  fs.writeFileSync(path.join(rdir, `${slug}.json`), JSON.stringify({ meta, paper: renderMath(paper), solution: sol ? renderMath(sol) : null }));
  const pdfPath = path.join(dest, `${name}.pdf`);
  if (!process.env.FORCE && fs.existsSync(pdfPath) && fs.statSync(pdfPath).mtimeMs > fs.statSync(file).mtimeMs && fs.statSync(pdfPath).mtimeMs > fs.statSync(new URL(import.meta.url)).mtimeMs) {
    continue;
  }
  const jobs = [[`${name}.pdf`, page({ meta, level, subject, body: renderMath(paper) + '<p class="good">بالتوفيق</p>' })]];
  if (sol) jobs.push([`${name}-sol.pdf`, page({ meta, level, subject, body: renderMath(sol), solution: true })]);
  for (const [out, html] of jobs) {
    const pg = await browser.newPage();
    const tmp = path.join(dest, `.${out}.html`);
    fs.writeFileSync(tmp, html);
    await pg.goto('file://' + tmp);
    await pg.evaluate(() => document.fonts.ready);
    await pg.pdf({
      path: path.join(dest, out),
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `<div style="width:100%;text-align:center;font-size:8px;color:#7b858c;font-family:sans-serif">${SITE_URL || 'Tafawoq'} &nbsp;|&nbsp; <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    });
    fs.unlinkSync(tmp);
    await pg.close();
    built++;
  }
  console.log('✓', rel);
}
await browser.close();
console.log(`✓ ${built} PDF`);
