# Bible art index

Builds `data/art.json`, the public-domain illustrations shown beside each chapter.

Sources, all from Wikimedia Commons and public domain:

- **Gustave Doré**, *The Holy Bible* (1866): plates list their passage in the description, e.g. "Jacob's Dream (Gen. 28:10-15)".
- **Julius Schnorr von Carolsfeld**, *Die Bibel in Bildern* (1860): about a quarter of the woodcuts give a reference (often in Portuguese: "Gn 41:46-57"). The rest are mapped by scene title in `schnorr-manual.json`.

- **Hand-picked works** in `extra.json`, mostly for Apocrypha books the two series barely cover (Rembrandt, Michelangelo, Loutherbourg's Macklin Bible headpieces and others). A few are openly licensed photographs rather than public domain; their author and licence are shown under the picture.

Images are not stored in the repo; the index points at Wikimedia's resized thumbnails.

## Rebuild

Run from this folder (Node 20+). The Commons API rate-limits, so the scripts pause between requests.

```sh
node collect.mjs cache/dore.json "Category:Doré's English Bible"
node collect.mjs cache/schnorr.json "Category:Die Bibel in Bildern by Julius Schnorr von Carolsfeld"
node wikitext.mjs cache/schnorr.json
curl -s "https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&titles=Die%20Bibel%20in%20Bildern" -o cache/gallery.json
node analyze.mjs cache/dore.json
node analyze.mjs cache/schnorr.json
node collect-extra.mjs
node build.mjs
```

Every reference is checked against the verse counts in `data/bible` before it is kept.
