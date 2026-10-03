import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const sharp = require(require.resolve('sharp', { paths: [require.resolve('next')] }));

const ART = '../../data/art.json';
const OUT = '../../public/art';
const WIDTH = 720;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const art = JSON.parse(fs.readFileSync(ART, 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

async function download(src) {
  for (let tries = 0; ; tries++) {
    const res = await fetch(src, { headers: { 'User-Agent': 'my-bible/1.0 (https://github.com/bishop67/my-bible)' } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (tries > 5 || (res.status !== 429 && res.status < 500)) throw new Error(`${res.status} ${src}`);
    await sleep(5000 * (tries + 1));
  }
}

const done = new Map();
for (const chapters of Object.values(art)) {
  for (const list of Object.values(chapters)) {
    for (const a of list) {
      if (a.src.startsWith('/')) continue;
      if (!done.has(a.src)) {
        const name = decodeURIComponent(a.src.split('/').pop())
          .replace(/^\d+px-/, '')
          .replace(/\.\w+$/, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const file = `${OUT}/${name}.webp`;
        if (!fs.existsSync(file)) {
          const input = await download(a.src);
          await sharp(input).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 72 }).toFile(file);
          console.log(name);
          await sleep(1000);
        }
        const { width, height } = await sharp(file).metadata();
        done.set(a.src, { src: `/art/${name}.webp`, width, height });
      }
      Object.assign(a, done.get(a.src));
    }
  }
}

fs.writeFileSync(ART, JSON.stringify(art));
