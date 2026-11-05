import type { Dataset, DatasetManifest, Definition, GameDirection, GameMode, PhraseEntry, Question } from "@/types";
import { sampleSize, shuffleArray } from "@/lib/utils";

const DATA_URL: Record<GameMode, string> = {
  atasozu: `${import.meta.env.BASE_URL}data/atasozleri.json`,
  deyim: `${import.meta.env.BASE_URL}data/deyimler.json`
};
const MANIFEST_URL = `${import.meta.env.BASE_URL}data/manifest.json`;

const DEFAULT_BATCH_SIZE = 10;
const OPTION_COUNT = 4;

/**
 * A phrase is playable only when its primary meaning belongs to exactly one
 * phrase in the dataset. That single rule makes both directions unambiguous:
 * in phrase→meaning a distractor can never be the answer, and in
 * meaning→phrase no second phrase can legitimately claim the prompt.
 * Repeated definitions are common in the source data, so this filter is what
 * keeps a question from having two correct options.
 */
interface PlayablePool {
  entries: PhraseEntry[];
}

const pools = new Map<GameMode, Promise<PlayablePool>>();

let manifest: Promise<DatasetManifest> | null = null;

let sequence = 0;

/** Turkish-aware fold used only for comparing option strings. */
// Keep in sync with the identical helper in scripts/build-data.mjs: the build
// dedupes definitions with it, the game compares options with it.
function fold(value: string): string {
  return value
    .normalize("NFC")
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase()
    .replace(/[\s.,;:!?'"‘’“”…()[\]]+/g, " ")
    .trim();
}

async function fetchDataset(mode: GameMode): Promise<Dataset> {
  const response = await fetch(DATA_URL[mode]);

  if (!response.ok) {
    throw new Error(`Veri yüklenemedi (${response.status}). Bağlantını kontrol edip yeniden dene.`);
  }

  const data = (await response.json()) as Dataset;

  if (!data || !Array.isArray(data.entries) || data.entries.length === 0) {
    throw new Error("Veri dosyası boş görünüyor. `npm run data:build` ile yeniden üret.");
  }

  return data;
}

/**
 * A definition shorter than this cannot carry its own weight as a multiple
 * choice option (“çok az.”), so the phrase is not asked about at all.
 */
const MIN_PRIMARY_LENGTH = 12;

function buildPool(entries: PhraseEntry[]): PlayablePool {
  const owners = new Map<string, number>();

  for (const entry of entries) {
    for (const definition of entry.definitions) {
      const key = fold(definition.definition);
      owners.set(key, (owners.get(key) ?? 0) + 1);
    }
  }

  const playable = entries.filter((entry) => {
    const primary = entry.definitions[0];
    if (!primary) return false;
    if (primary.definition.trim().length < MIN_PRIMARY_LENGTH) return false;
    return owners.get(fold(primary.definition)) === 1;
  });

  return { entries: playable };
}

/** Loads (and caches) the playable pool for a category. */
export function loadPool(mode: GameMode): Promise<PlayablePool> {
  let pool = pools.get(mode);

  if (!pool) {
    pool = fetchDataset(mode).then((dataset) => buildPool(dataset.entries));
    pools.set(mode, pool);
  }

  return pool;
}

/** Category counts for the menu; the game itself never needs the manifest. */
export function loadManifest(): Promise<DatasetManifest> {
  if (!manifest) {
    manifest = fetch(MANIFEST_URL).then((response) => {
      if (!response.ok) throw new Error(`Manifest okunamadı (${response.status}).`);
      return response.json() as Promise<DatasetManifest>;
    });
  }

  return manifest;
}

/** Clears the cache — used by tests that swap the network layer. */
export function resetDataCache(): void {
  pools.clear();
  manifest = null;
}

function optionValue(entry: PhraseEntry, direction: GameDirection): string {
  return direction === "forward" ? entry.definitions[0].definition : entry.text;
}

function pickDistractors(
  pool: PlayablePool,
  answerEntry: PhraseEntry,
  direction: GameDirection,
  answer: string
): string[] {
  const needed = OPTION_COUNT - 1;
  const picked: string[] = [];
  const seen = new Set<string>([fold(answer)]);

  const consider = (candidate: PhraseEntry) => {
    if (candidate === answerEntry || picked.length === needed) return;

    const value = optionValue(candidate, direction);
    const key = fold(value);

    if (seen.has(key)) return;

    seen.add(key);
    picked.push(value);
  };

  for (const candidate of sampleSize(pool.entries, Math.min(pool.entries.length, OPTION_COUNT * 10))) {
    consider(candidate);
  }

  // Small pools (tests, tiny datasets) may need a full pass to fill the row.
  if (picked.length < needed) {
    for (const candidate of shuffleArray(pool.entries)) {
      consider(candidate);
    }
  }

  return picked;
}

export interface GenerateQuestionsOptions {
  mode: GameMode;
  direction?: GameDirection;
  count?: number;
  /** Prompts already asked in this run, so a long game never repeats one. */
  excludePrompts?: Iterable<string>;
}

export async function generateQuestionBatch({
  mode,
  direction = "forward",
  count = DEFAULT_BATCH_SIZE,
  excludePrompts = []
}: GenerateQuestionsOptions): Promise<Question[]> {
  const pool = await loadPool(mode);
  const asked = new Set(excludePrompts);
  const candidates = pool.entries.filter((entry) => !asked.has(entry.text) && !asked.has(entry.definitions[0].definition));
  const selected = sampleSize(candidates, Math.min(count, candidates.length));

  return selected.map<Question>((entry) => {
    const definition: Definition = entry.definitions[0];
    const answer = optionValue(entry, direction);
    const distractors = pickDistractors(pool, entry, direction, answer);

    sequence += 1;

    return {
      id: `${mode}-${direction}-${sequence}`,
      prompt: direction === "forward" ? entry.text : definition.definition,
      answer,
      options: shuffleArray([answer, ...distractors]),
      phrase: entry.text,
      definition,
      alternatives: entry.definitions.slice(1),
      mode,
      direction
    };
  });
}
