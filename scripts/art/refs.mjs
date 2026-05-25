// Parse Bible references like "Gen. 28:10-15", "2Kings 6:18", "I Kings 18", "Gn 41:46-57" (pt)
// into { slug, chapter, from, to } using the slugs in my-bible's manifest.
const EN_ALIASES = {
  genesis: ['gen', 'gn', 'ge'], exodus: ['exod', 'ex', 'exo'], leviticus: ['lev', 'lv'], numbers: ['num', 'nm', 'nb'],
  deuteronomy: ['deut', 'dt', 'deu'], joshua: ['josh', 'jos'], judges: ['judg', 'jdg', 'jgs', 'jud'], ruth: ['ru'],
  '1-samuel': ['1 sam', '1 sa', 'i samuel', 'i sam'], '2-samuel': ['2 sam', '2 sa', 'ii samuel', 'ii sam'],
  '1-kings': ['1 king', '1 kgs', '1 ki', 'i kings', 'i kgs'], '2-kings': ['2 king', '2 kgs', '2 ki', 'ii kings', 'ii kgs'],
  '1-chronicles': ['1 chr', '1 chron', 'i chronicles'], '2-chronicles': ['2 chr', '2 chron', 'ii chronicles'],
  ezra: ['ezr'], nehemiah: ['neh'], esther: ['esth'], job: [], psalms: ['ps', 'psa', 'psalm'],
  proverbs: ['prov'], ecclesiastes: ['eccl', 'eccles'], 'song-of-solomon': ['song of songs', 'cant', 'canticles'],
  isaiah: ['isa'], jeremiah: ['jer'], lamentations: ['lam'], ezekiel: ['ezek', 'eze'], daniel: ['dan'],
  hosea: ['hos'], joel: [], amos: [], obadiah: ['obad'], jonah: ['jon'], micah: ['mic'], nahum: ['nah'],
  habakkuk: ['hab'], zephaniah: ['zeph'], haggai: ['hag'], zechariah: ['zech'], malachi: ['mal'],
  tobit: ['tob'], judith: ['jdt'], wisdom: ['wis', 'wisdom of solomon'], ecclesiasticus: ['sir', 'sirach', 'ecclus'],
  baruch: ['bar'], susanna: ['sus'], 'bel-and-the-dragon': ['bel'], '1-maccabees': ['1 macc', '1 mac', 'i maccabees'],
  '2-maccabees': ['2 macc', '2 mac', 'ii maccabees'], '1-esdras': ['1 esd'], '2-esdras': ['2 esd'],
  matthew: ['matt', 'mt', 'mat'], mark: ['mk', 'mrk'], luke: ['lk', 'luk'], john: ['jn', 'joh', 'jhn'],
  acts: ['acts of the apostles'], romans: ['rom'], '1-corinthians': ['1 cor', 'i corinthians'], '2-corinthians': ['2 cor', 'ii corinthians'],
  galatians: ['gal'], ephesians: ['eph'], philippians: ['phil'], colossians: ['col'], '1-thessalonians': ['1 thess'], '2-thessalonians': ['2 thess'],
  '1-timothy': ['1 tim'], '2-timothy': ['2 tim'], titus: ['tit'], philemon: ['phlm', 'philem'], hebrews: ['heb'], james: ['jas'],
  '1-peter': ['1 pet'], '2-peter': ['2 pet'], '1-john': ['1 jn', 'i john'], '2-john': ['2 jn'], '3-john': ['3 jn'],
  jude: [], revelation: ['rev', 'apoc', 'apocalypse', 'revelations'],
};

// Portuguese (many Schnorr woodcut pages). Some short forms clash with English: "Jn" is Jonah here.
const PT_ALIASES = {
  genesis: ['gn'], exodus: ['êx', 'ex'], leviticus: ['lv'], numbers: ['nm'], deuteronomy: ['dt'], joshua: ['js'], judges: ['jz'],
  ruth: ['rt'], '1-samuel': ['1 sm'], '2-samuel': ['2 sm'], '1-kings': ['1 rs'], '2-kings': ['2 rs'], '1-chronicles': ['1 cr'],
  '2-chronicles': ['2 cr'], ezra: ['ed', 'esd'], nehemiah: ['ne'], esther: ['et', 'est'], job: ['jó'], psalms: ['sl'],
  proverbs: ['pv'], ecclesiastes: ['ec'], 'song-of-solomon': ['ct'], isaiah: ['is'], jeremiah: ['jr'], lamentations: ['lm'],
  ezekiel: ['ez'], daniel: ['dn'], hosea: ['os'], joel: ['jl'], amos: ['am'], obadiah: ['ob'], jonah: ['jn'], micah: ['mq'],
  nahum: ['na'], habakkuk: ['hc'], zephaniah: ['sf'], haggai: ['ag'], zechariah: ['zc'], malachi: ['ml'], tobit: ['tb'],
  judith: ['jt'], wisdom: ['sb'], ecclesiasticus: ['eclo'], baruch: ['br'], '1-maccabees': ['1 mc'], '2-maccabees': ['2 mc'],
  matthew: ['mt'], mark: ['mc'], luke: ['lc'], john: ['jo', 'joão'], acts: ['at'], romans: ['rm'], revelation: ['ap'],
};

// "2Kings", "2 Kings" and "II Kings" all normalise to "2 kings".
const norm = (s) =>
  s.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim()
    .replace(/^(iii|ii|i) (?=\p{L})/u, (m, r) => `${r.length} `)
    .replace(/^([123]) ?(?=\p{L})/u, '$1 ');

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function build(aliases) {
  const table = new Map();
  for (const [slug, list] of Object.entries(aliases)) {
    table.set(norm(slug.replace(/-/g, ' ')), slug);
    for (const a of list) table.set(norm(a), slug);
  }
  // Longest first so "1 kings" wins over "kings" and "song of songs" over "song".
  const raw = Object.values(aliases).flat().map((a) => a.replace(/\./g, ''));
  const names = [...new Set([...table.keys(), ...raw])]
    .sort((a, b) => b.length - a.length)
    .map((n) => escape(n).replace(/ /g, '\\.?\\s*'));
  const re = new RegExp(
    `(?<![\\p{L}\\d])(${names.join('|')})\\.?\\s*(\\d{1,3})(?:\\s*[:,.]\\s*(\\d{1,3})(?:\\s*[-–—]\\s*(\\d{1,3})(?![:\\d]))?)?`,
    'giu'
  );
  return { table, re };
}

const EN = build(EN_ALIASES);
// Portuguese pages sometimes spell books out in full, so keep the full English names too.
const PT = build({ ...Object.fromEntries(Object.keys(EN_ALIASES).map((k) => [k, []])), ...PT_ALIASES });

const LOOKALIKE = { М: 'M', а: 'a', с: 'c', С: 'C', е: 'e', о: 'o', К: 'K' };

export function parseRefs(text, lang = 'en') {
  const { table, re } = lang === 'pt' ? PT : EN;
  const out = [];
  // Cyrillic look-alikes turn up in some descriptions ("2 Масс.").
  const clean = (text || '').replace(/[МасСеоК]/g, (c) => LOOKALIKE[c]);
  for (const m of clean.matchAll(re)) {
    const slug = table.get(norm(m[1]));
    if (!slug) continue;
    const chapter = +m[2];
    const from = m[3] ? +m[3] : null;
    const to = m[4] ? +m[4] : from;
    // Catholic numbering folds two Apocrypha books into Daniel; the KJV prints them separately.
    if (slug === 'daniel' && chapter === 13) out.push({ slug: 'susanna', chapter: 1, from, to, raw: m[0] });
    else if (slug === 'daniel' && chapter === 14) out.push({ slug: 'bel-and-the-dragon', chapter: 1, from, to, raw: m[0] });
    else out.push({ slug, chapter, from, to, raw: m[0] });
  }
  return out;
}
