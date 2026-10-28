// ينسخ ملفات PDF.js اللازمة للمعاينة إلى public/pdfjs
import fs from 'node:fs';
const src = 'node_modules/pdfjs-dist';
const dst = 'public/pdfjs';
fs.mkdirSync(dst, { recursive: true });
fs.copyFileSync(`${src}/build/pdf.worker.min.mjs`, `${dst}/pdf.worker.min.mjs`);
for (const d of ['cmaps', 'standard_fonts', 'wasm']) fs.cpSync(`${src}/${d}`, `${dst}/${d}`, { recursive: true });
console.log('✓ pdfjs assets copied');

// برنامج لوحة التحكم (Decap CMS) داخل الموقع نفسه، دون الاعتماد على CDN
const cms = 'node_modules/decap-cms/dist';
if (fs.existsSync(cms)) {
  fs.mkdirSync('public/admin/cms', { recursive: true });
  for (const f of fs.readdirSync(cms)) if (f.endsWith('decap-cms.js')) fs.copyFileSync(`${cms}/${f}`, `public/admin/cms/${f}`);
  console.log('✓ decap-cms copied');
}
