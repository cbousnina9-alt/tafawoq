// Après `next build` en export statique : supprime les fichiers __next._full.txt,
// copies exactes de <route>.txt que le routeur client ne demande jamais.
// Cloudflare Pages limite un déploiement à 20 000 fichiers ; cela en retire ~3 000.
import fs from 'node:fs';
import path from 'node:path';
const OUT = 'out';
if (process.env.STATIC_EXPORT !== '1' || !fs.existsSync(OUT)) process.exit(0);
let removed = 0, total = 0;
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    total++;
    if (e.name === '__next._full.txt' && fs.existsSync(dir + '.txt')) { fs.rmSync(p); removed++; }
  }
};
walk(OUT);
console.log(`✓ prune-export: ${removed} doublons supprimés, ${total - removed} fichiers dans ${OUT}/`);
if (total - removed > 19000) console.warn('⚠ plus de 19 000 fichiers : proche de la limite Cloudflare Pages (20 000).');
