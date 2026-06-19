// Fetch image info for the hand-picked works in extra.json into cache/extra.json.
import fs from 'fs';

const UA = { 'User-Agent': 'my-bible-art-index/0.1 (https://github.com/bishop67/my-bible)' };
const picks = JSON.parse(fs.readFileSync('extra.json', 'utf8'));
const out = [];
for (let i = 0; i < picks.length; i += 10) {
  const batch = picks.slice(i, i + 10);
  const u =
    'https://commons.wikimedia.org/w/api.php?format=json&' +
    new URLSearchParams({
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'url|size|extmetadata',
      iiurlwidth: 1280,
      titles: batch.map((p) => `File:${p.file}`).join('|'),
    });
  const j = await (await fetch(u, { headers: UA })).json();
  // The API normalises titles (underscores, first letter), so match on the normalised form.
  const norm = Object.fromEntries((j.query.normalized ?? []).map((n) => [n.from, n.to]));
  const pages = Object.fromEntries(Object.values(j.query.pages).map((p) => [p.title, p]));
  for (const p of batch) {
    const title = norm[`File:${p.file}`] ?? `File:${p.file}`;
    const ii = pages[title]?.imageinfo?.[0];
    if (!ii) {
      console.warn('missing on Commons:', p.file);
      continue;
    }
    // Openly licensed but not public-domain works must carry their author and licence.
    const meta = ii.extmetadata ?? {};
    const license = meta.LicenseShortName?.value ?? '';
    const author = (meta.Artist?.value ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const credit = p.credit ?? (/public domain|cc0|^pd/i.test(license) ? undefined : [author, license].filter(Boolean).join(', '));
    out.push({ ...p, thumb: ii.thumburl, width: ii.width, height: ii.height, page: ii.descriptionurl, credit });
  }
  await new Promise((r) => setTimeout(r, 1000));
}
fs.mkdirSync('cache', { recursive: true });
fs.writeFileSync('cache/extra.json', JSON.stringify(out, null, 1));
console.log('fetched', out.length, 'of', picks.length);
