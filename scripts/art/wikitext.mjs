import fs from 'fs';
const UA = { 'User-Agent': 'my-bible-art-index/0.1 (https://github.com/bishop67/my-bible)' };
const [, , file] = process.argv;
const items = JSON.parse(fs.readFileSync(file, 'utf8'));
for (let i = 0; i < items.length; i += 50) {
  const titles = items.slice(i, i + 50).map((x) => x.title).join('|');
  const u = 'https://commons.wikimedia.org/w/api.php?format=json&' + new URLSearchParams({ action: 'query', prop: 'revisions', rvprop: 'content', rvslots: 'main', titles });
  let j;
  for (let t = 0; t < 8; t++) {
    await new Promise((r) => setTimeout(r, 1000));
    const r = await fetch(u, { headers: UA });
    if (r.ok) { j = await r.json(); break; }
    process.stderr.write(`HTTP ${r.status} retry\n`);
    await new Promise((r) => setTimeout(r, 15000 * (t + 1)));
  }
  const byTitle = Object.fromEntries(Object.values(j.query.pages).map((p) => [p.title, p.revisions?.[0]?.slots.main['*'] ?? '']));
  for (const it of items.slice(i, i + 50)) it.wikitext = byTitle[it.title] ?? '';
}
fs.writeFileSync(file, JSON.stringify(items, null, 1));
console.log('done', items.filter((x) => x.wikitext).length);
