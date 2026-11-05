export type GameMode = "atasozu" | "deyim";
export type GameFormat = "mistakes" | "questions";
export type GameDirection = "forward" | "reverse"; // forward: phrase→meaning, reverse: meaning→phrase

/** One meaning of a phrase, optionally illustrated with a usage example. */
export interface Definition {
  definition: string;
  example?: string;
}

/** A phrase (atasözü or deyim) with its meanings, in source order. */
export interface PhraseEntry {
  text: string;
  definitions: Definition[];
}

/** Shape of `public/data/*.json`, produced by `scripts/build-data.mjs`. */
export interface Dataset {
  version: number;
  entries: PhraseEntry[];
}

/**
 * A single playable question.
 *
 * `prompt` is what the player reads; `phrase` and `definition` always describe
 * the whole entry, whatever the direction, so feedback never has to guess
 * which half of the pair it is holding.
 */
export interface Question {
  id: string;
  prompt: string;
  answer: string;
  options: string[];
  phrase: string;
  definition: Definition;
  /** Other meanings of the same phrase, shown after answering. */
  alternatives: Definition[];
  mode: GameMode;
  direction: GameDirection;
}

/** Shape of `public/data/manifest.json`. */
export interface DatasetManifest {
  datasetVersion: number;
  categories: Record<GameMode, { file: string; phrases: number; definitions: number; definitionsWithExample: number }>;
  totals: { phrases: number; definitions: number; definitionsWithExample: number };
}
