import fs from 'fs';
import { parseRefs } from './refs.mjs';

const BIBLE = '../../data/bible';
const size = {};
for (const f of fs.readdirSync(BIBLE)) {
  const d = JSON.parse(fs.readFileSync(`${BIBLE}/${f}`, 'utf8'));
  size[f.replace('.json', '')] = Object.fromEntries(d.chapters.map((c) => [c.chapter, c.verses.length]));
}
const valid = (r) => size[r.slug]?.[r.chapter] && (!r.from || r.from <= size[r.slug][r.chapter]);

// Pull one language's text out of a Commons {{Information}} description.
const block = (wt, lang) => {
  const m = (wt || '').match(new RegExp('\\{\\{' + lang + '\\|(?:1=)?([^}]*)\\}\\}'));
  return m ? m[1] : '';
};

const [, , file] = process.argv;
const items = JSON.parse(fs.readFileSync(file, 'utf8'));
let ok = 0;
for (const it of items) {
  const en = `${it.objectName || ''} ${it.description} ${block(it.wikitext, 'en')}`;
  let refs = parseRefs(en).filter(valid);
  if (!refs.length) refs = parseRefs(block(it.wikitext, 'pt'), 'pt').filter(valid);
  it.refs = refs;
  if (refs.length) ok++;
}
console.log(file, 'items', items.length, 'with valid ref', ok);
fs.writeFileSync(file.replace('.json', '.refs.json'), JSON.stringify(items, null, 1));
