// Collect file titles + English/other descriptions for Commons categories (one level of subcats).
import fs from 'fs';
const UA = { 'User-Agent': 'my-bible-art-index/0.1 (https://github.com/bishop67/my-bible)' };
const api = async (params) => {
  const u = 'https://commons.wikimedia.org/w/api.php?format=json&' + new URLSearchParams(params);
  for (let i = 0; i < 10; i++) {
    await new Promise((res) => setTimeout(res, 400));
    const r = await fetch(u, { headers: UA });
    if (r.ok) return r.json();
    process.stderr.write(`HTTP ${r.status} retry
`);
    await new Promise((res) => setTimeout(res, 15000 * (i + 1)));
  }
  throw new Error('failed ' + u);
};
async function members(cat, type) {
  let out = [], cont = {};
  do {
    const j = await api({ action: 'query', list: 'categorymembers', cmtitle: cat, cmtype: type, cmlimit: 500, ...cont });
    out.push(...j.query.categorymembers.map((m) => m.title));
    cont = j.continue ? { cmcontinue: j.continue.cmcontinue } : null;
  } while (cont);
  return out;
}
const [, , outFile, ...cats] = process.argv;
const files = new Map();
for (const cat of cats) {
  const subs = await members(cat, 'subcat');
  for (const c of [cat, ...subs]) for (const f of await members(c, 'file')) files.set(f, c);
}
const titles = [...files.keys()];
const result = [];
for (let i = 0; i < titles.length; i += 15) {
  const j = await api({
    action: 'query', prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: 1400,
    titles: titles.slice(i, i + 15).join('|'),
  });
  for (const p of Object.values(j.query.pages)) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    const m = ii.extmetadata || {};
    result.push({
      title: p.title, category: files.get(p.title),
      description: (m.ImageDescription?.value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      objectName: m.ObjectName?.value?.replace(/<[^>]+>/g, '').trim(),
      artist: (m.Artist?.value || '').replace(/<[^>]+>/g, '').trim(),
      date: (m.DateTimeOriginal?.value || '').replace(/<[^>]+>/g, '').trim(),
      license: m.LicenseShortName?.value, width: ii.width, height: ii.height,
      thumb: ii.thumburl, thumbWidth: ii.thumbwidth, thumbHeight: ii.thumbheight, page: ii.descriptionurl,
    });
  }
  process.stderr.write(`${result.length}/${titles.length}\r`);
}
fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
console.log('\nwrote', result.length);
