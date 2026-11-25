# Komponent-datablade

Filer til [komponent-shop](https://github.com/Marius-Bjerregaard/komponent-shop): datablade, og senere footprints m.m.
Serveres via GitHub Pages: `https://marius-bjerregaard.github.io/komponent-datablade/<sti>`.

- `datablade/` – PDF'er. Datablade, der dækker flere partnumre, ligger der kun én gang.
- `footprints/` – KiCad-footprints o.l.
- `kilder.json` – hvor hvert datablad kommer fra (partnummer → `[{ url, title? }]`). En lokal fil skrives som `datablade/fil.pdf`.
- `index.json` – genereres: partnummer → filer her i repoet. Komponent-siden læser den.

## Tilføj et datablad
1. Tilføj partnummeret i `kilder.json` med en URL til PDF'en (eller læg PDF'en i `datablade/` og skriv stien).
2. `node scripts/hent.mjs` henter nye filer og opdaterer `index.json`.
3. Commit og push. Siden kan bruge den efter et par minutter.

Databladene tilhører producenterne og er samlet her for nem adgang.
