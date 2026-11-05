#!/usr/bin/env node
/**
 * Data pipeline: data/raw/*.csv -> public/data/*.json + manifest.
 *
 * The raw CSVs are scraped lexicon dumps, so they carry scrape artifacts:
 * section headings stored as phrases, empty definitions, lexicon tags
 * ("tkz.", "argo") stored as if they were meanings, and the same definition
 * repeated for several phrases. The game can only be as good as this text, so
 * every artifact we know about is removed here, once, instead of being
 * patched around in the UI.
 *
 * Rules (see docs/DATA.md for the rationale):
 *   - a phrase keeps only definitions that carry meaning on their own;
 *   - leading lexicon tags are stripped, not deleted;
 *   - duplicates inside one phrase are collapsed;
 *   - phrases without a usable definition are dropped;
 *   - output is sorted and byte-stable, so `--check` can run in CI.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = path.join(ROOT, "public", "data");

const DATASETS = [
  { key: "atasozleri", file: "atasozleri.json", source: "data/raw/atasozleri.csv" },
  { key: "deyimler", file: "deyimler.json", source: "data/raw/deyimler.csv" }
];

const DATASET_VERSION = 1;
const MIN_DEFINITION_LENGTH = 3;

/** Lexicon labels that describe register, not meaning. */
const LEXICON_TAGS = ["tkz", "ktz", "argo", "mecaz", "esk", "halk ağzı", "teklifsiz konuşmada"];

const TAG_PREFIX = new RegExp(`^\\s*(${LEXICON_TAGS.join("|")})\\.?\\s+`, "iu");
const TAG_ONLY = new RegExp(`^\\s*(${LEXICON_TAGS.join("|")})\\.?\\s*$`, "iu");

function normalizeWhitespace(value) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[\t\n\r\v\f]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Turkish-aware case folding that does not depend on the host ICU data. */
// Keep in sync with the identical helper in src/dataLoader.ts.
function foldForCompare(value) {
  return normalizeWhitespace(value)
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase()
    .replace(/[\s.,;:!?'"‘’“”…()[\]]+/g, " ")
    .trim();
}

function isSectionHeading(text) {
  const words = text.split(/\s+/);
  const isUpper = text === text.toLocaleUpperCase("tr") && /[A-ZÇĞİÖŞÜ]/.test(text);
  return isUpper && words.length > 2;
}

function cleanDefinition(raw) {
  let value = normalizeWhitespace(raw);
  if (!value) return { dropped: "empty" };

  while (TAG_PREFIX.test(value)) {
    value = normalizeWhitespace(value.replace(TAG_PREFIX, ""));
  }

  if (!value || TAG_ONLY.test(value)) return { dropped: "tag-only" };
  if (!/[\p{L}]/u.test(value)) return { dropped: "no-letters" };

  // The scrape leaves stray separators on some rows (“… hazırlanmak;”).
  value = value.replace(/[\s;,:]+$/u, "").trim();

  if (value.length < MIN_DEFINITION_LENGTH) return { dropped: "too-short" };

  return { value };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ";") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function buildDataset(csvText) {
  const rows = parseCsv(csvText);
  const body = rows.slice(1);
  const byPhrase = new Map();
  const stats = {
    rows: body.length,
    malformedRows: 0,
    droppedPhrases: 0,
    droppedDefinitions: { empty: 0, "tag-only": 0, "no-letters": 0, "too-short": 0 },
    duplicateDefinitions: 0,
    phrasesWithoutDefinition: 0
  };

  for (const row of body) {
    if (row.length !== 4) {
      if (row.some((cell) => cell.trim())) stats.malformedRows += 1;
      continue;
    }

    const text = normalizeWhitespace(row[0]);
    if (!text || isSectionHeading(text)) {
      stats.droppedPhrases += 1;
      continue;
    }

    const definition = cleanDefinition(row[2]);
    if (!definition.value) {
      stats.droppedDefinitions[definition.dropped] += 1;
      if (!byPhrase.has(text)) byPhrase.set(text, []);
      continue;
    }

    const example = normalizeWhitespace(row[3] ?? "");
    const bucket = byPhrase.get(text) ?? [];
    const duplicate = bucket.some((item) => foldForCompare(item.definition) === foldForCompare(definition.value));

    if (duplicate) {
      stats.duplicateDefinitions += 1;
      continue;
    }

    bucket.push(example ? { definition: definition.value, example } : { definition: definition.value });
    byPhrase.set(text, bucket);
  }

  const entries = [];
  for (const [text, definitions] of byPhrase) {
    if (definitions.length === 0) {
      stats.phrasesWithoutDefinition += 1;
      stats.droppedPhrases += 1;
      continue;
    }
    entries.push({ text, definitions });
  }

  // Codepoint sort, not localeCompare: byte-identical output on every machine.
  entries.sort((a, b) => (a.text < b.text ? -1 : a.text > b.text ? 1 : 0));

  return { entries, stats };
}

function summarize(entries) {
  const definitions = entries.reduce((total, entry) => total + entry.definitions.length, 0);
  const withExample = entries.reduce(
    (total, entry) => total + entry.definitions.filter((item) => item.example).length,
    0
  );

  return { phrases: entries.length, definitions, definitionsWithExample: withExample };
}

function serialize(dataset) {
  return `${JSON.stringify({ version: DATASET_VERSION, entries: dataset.entries })}\n`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const outputs = new Map();
  const manifestCategories = {};
  const report = [];

  for (const dataset of DATASETS) {
    const csvText = await readFile(path.join(ROOT, dataset.source), "utf8");
    const built = buildDataset(csvText);
    const json = serialize(built);

    outputs.set(dataset.file, json);
    manifestCategories[dataset.key] = {
      file: `data/${dataset.file}`,
      ...summarize(built.entries),
      bytes: Buffer.byteLength(json),
      sha256: sha256(json)
    };
    report.push({ dataset, stats: built.stats, summary: manifestCategories[dataset.key] });
  }

  const totals = Object.values(manifestCategories).reduce(
    (acc, category) => ({
      phrases: acc.phrases + category.phrases,
      definitions: acc.definitions + category.definitions,
      definitionsWithExample: acc.definitionsWithExample + category.definitionsWithExample
    }),
    { phrases: 0, definitions: 0, definitionsWithExample: 0 }
  );

  const manifest = {
    datasetVersion: DATASET_VERSION,
    generator: "scripts/build-data.mjs",
    source: "data/raw/*.csv (see data/raw/SOURCE.md)",
    categories: manifestCategories,
    totals
  };
  const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;

  if (checkOnly) {
    const stale = [];
    for (const [file, expected] of outputs) {
      const actual = await readFile(path.join(OUTPUT_DIR, file), "utf8").catch(() => null);
      if (actual !== expected) stale.push(`public/data/${file}`);
    }
    const actualManifest = await readFile(path.join(OUTPUT_DIR, "manifest.json"), "utf8").catch(() => null);
    if (actualManifest !== manifestJson) stale.push("public/data/manifest.json");

    if (stale.length > 0) {
      console.error("Generated data is out of date. Run `npm run data:build` and commit the result.");
      for (const file of stale) console.error(`  - ${file}`);
      process.exitCode = 1;
      return;
    }

    console.log("Generated data matches the raw CSVs.");
    return;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  for (const [file, json] of outputs) {
    await writeFile(path.join(OUTPUT_DIR, file), json);
  }
  await writeFile(path.join(OUTPUT_DIR, "manifest.json"), manifestJson);

  for (const { dataset, stats, summary } of report) {
    console.log(
      `${dataset.key}: ${summary.phrases} phrases, ${summary.definitions} definitions ` +
        `(${summary.definitionsWithExample} with example), ${(summary.bytes / 1024).toFixed(0)} kB`
    );
    console.log(
      `  removed: ${stats.droppedPhrases} phrases, ` +
        `${Object.entries(stats.droppedDefinitions)
          .map(([reason, count]) => `${count} ${reason}`)
          .join(", ")}, ${stats.duplicateDefinitions} duplicates`
    );
  }
  console.log(`total: ${totals.phrases} phrases, ${totals.definitions} definitions`);
}

await main();
