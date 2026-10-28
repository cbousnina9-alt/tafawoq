// يولّد ملفات PDF تجريبية لمعاينة الموقع فقط.
// احذف كل الملفات التي تبدأ بـ demo- قبل الإطلاق:  find public/files -name "demo-*.pdf" -delete
import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const plan = [
  ['5ap', 'arabic', 'exam', ['t1-2025-1', 't2-2025-1']],
  ['5ap', 'math', 'exam', ['t1-2025-1', 't3-2025-1']],
  ['1am', 'math', 'test', ['t1-2025-1', 't1-2025-2']],
  ['1am', 'french', 'exam', ['t1-2025-1']],
  ['4am', 'math', 'exam', ['t1-2025-1', 't1-2025-2', 't2-2025-1', 't3-2025-1']],
  ['4am', 'math', 'test', ['t1-2025-1', 't2-2025-1']],
  ['4am', 'math', 'summary', ['equations']],
  ['4am', 'physics', 'exam', ['t1-2025-1', 't2-2025-1']],
  ['4am', 'arabic', 'exam', ['t1-2025-1']],
  ['4am', 'english', 'test', ['t1-2025-1']],
  ['bem', 'math', 'official', ['2024', '2023']],
  ['bem', 'arabic', 'official', ['2024']],
  ['1as', 'physics', 'lesson', ['mouvement']],
  ['1as', 'math', 'exam', ['t1-2025-1']],
  ['3as', 'math', 'exam', ['t1-2025-1', 't2-2025-1']],
  ['3as', 'philosophy', 'summary', ['problematique']],
  ['3as', 'science', 'exercises', ['proteines']],
  ['bac', 'math', 'official', ['2024', '2023']],
  ['bac', 'philosophy', 'official', ['2024']],
  ['bac', 'physics', 'official', ['2024']],
];

const withSolution = (type) => ['exam', 'test', 'official', 'exercises'].includes(type);

async function make(target, lines) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let p = 0; p < 2; p++) {
    const page = doc.addPage([595, 842]);
    page.drawRectangle({ x: 40, y: 40, width: 515, height: 762, borderColor: rgb(0.12, 0.27, 0.21), borderWidth: 1.5 });
    page.drawText('DEMO FILE', { x: 60, y: 760, size: 22, font: bold, color: rgb(0.77, 0.16, 0.13) });
    lines.forEach((l, i) => page.drawText(l, { x: 60, y: 720 - i * 22, size: 13, font }));
    page.drawText(`Page ${p + 1} / 2`, { x: 60, y: 60, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  }
  fs.writeFileSync(target, await doc.save());
}

let count = 0;
for (const [level, subject, type, names] of plan) {
  const dir = path.join('public', 'files', level, subject, type);
  fs.mkdirSync(dir, { recursive: true });
  for (const n of names) {
    const base = `demo-${n}`;
    const info = [`Level: ${level}`, `Subject: ${subject}`, `Type: ${type}`, `File: ${n}`, '', 'Replace this file with a real exam paper', 'before launching the website.'];
    await make(path.join(dir, `${base}.pdf`), info);
    count++;
    if (withSolution(type)) {
      await make(path.join(dir, `${base}-sol.pdf`), ['ANSWER KEY', ...info]);
      count++;
    }
  }
}
console.log(`✓ ${count} demo PDFs created`);
