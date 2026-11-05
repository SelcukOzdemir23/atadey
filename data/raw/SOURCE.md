# Data source

`atasozleri.csv` and `deyimler.csv` are the raw inputs of the data pipeline
(`scripts/build-data.mjs`). They were produced by scraping
[turkcedersi.net](https://www.turkcedersi.net):

- <https://www.turkcedersi.net/atasozleri-ve-atasozlerinin-anlamlari/>
- <https://www.turkcedersi.net/deyimler-ve-deyimlerin-anlamlari/>

Columns: `Deyim;Tanım_No;Tanım;Örnek`.

## Source caveat

The upstream site does not state a licence for this text. The definitions are
dictionary-style summaries of Turkish proverbs and idioms; the wording is
lexicographic rather than creative. If you plan to reuse the dataset outside
this project, check the terms of the upstream site first, or replace
`data/raw/*.csv` with your own licensed corpus and re-run
`npm run data:build`.

The application code (everything outside `data/` and `public/data/`) is MIT
licensed; the dataset is distributed for study and personal use with the
caveat above.

## Changing the data

Never edit `public/data/*.json` by hand — it is generated output. Edit the CSV
files here and run:

```bash
npm run data:build
```

The build is deterministic: the same CSVs always produce byte-identical JSON,
which is what `npm run data:check` verifies in CI.
