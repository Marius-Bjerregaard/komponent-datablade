// Henter datablade fra kilder.json ned i datablade/ og skriver index.json (partnummer -> filer).
// Kør: node scripts/hent.mjs   (filer, der allerede findes, hentes ikke igen)
//
// kilder.json: { "<partnummer>": [{ "url": "https://...pdf" | "datablade/fil.pdf", "title"?: "..." }] }
// Et datablad, der dækker flere partnumre, hentes kun én gang.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const kilder = JSON.parse(fs.readFileSync(path.join(root, 'kilder.json'), 'utf8'));

const fileFor = url => {
  if (!/^https?:/.test(url)) return url;
  let name = decodeURIComponent(new URL(url).pathname.split('/').pop()).toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  if (!name.endsWith('.pdf')) name += '.pdf';
  return 'datablade/' + name;
};

const jobs = new Map(); // fil -> url
for (const list of Object.values(kilder)) for (const s of list) if (/^https?:/.test(s.url)) jobs.set(fileFor(s.url), s.url);

async function download(file, url) {
  const dest = path.join(root, file);
  if (fs.existsSync(dest)) return true;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(120000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      if (!buf.subarray(0, 1024).includes('%PDF')) throw new Error('ikke en PDF');
      fs.writeFileSync(dest, buf);
      return true;
    } catch (e) {
      if (attempt === 3) { console.error('FEJL', file, url, e.message); return false; }
    }
  }
}

const failed = new Set();
const queue = [...jobs];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) { const [f, u] = queue.shift(); if (!(await download(f, u))) failed.add(f); }
}));

const index = {};
for (const [part, list] of Object.entries(kilder)) {
  const files = list.map(s => ({ title: s.title || 'Datablad', url: fileFor(s.url) }))
    .filter(x => !failed.has(x.url) && fs.existsSync(path.join(root, x.url)));
  if (files.length) index[part] = files;
}
fs.writeFileSync(path.join(root, 'index.json'), JSON.stringify(index, null, 1) + '\n');
console.log(`${jobs.size} filer, ${failed.size} fejlede, ${Object.keys(index).length} partnumre i index.json`);
