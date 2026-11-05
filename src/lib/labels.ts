import type { GameDirection, GameFormat, GameMode } from "@/types";

/** Every user-facing label lives here so copy changes stay in one place. */
export const CATEGORY_LABEL: Record<GameMode, string> = {
  atasozu: "Atasözü",
  deyim: "Deyim"
};

/** Turkish dative of the category: “hangi atasözüne”, not “atasözüe”. */
export const CATEGORY_DATIVE: Record<GameMode, string> = {
  atasozu: "atasözüne",
  deyim: "deyime"
};

export const FORMAT_LABEL: Record<GameFormat, string> = {
  mistakes: "5 can",
  questions: "10 soru"
};

export const DIRECTION_LABEL: Record<GameDirection, string> = {
  forward: "Sözden anlama",
  reverse: "Anlamdan söze"
};

/** One-line description of what the current direction asks of the player. */
export const PROMPT_QUESTION: Record<GameDirection, (mode: GameMode) => string> = {
  forward: (mode) => `Bu ${CATEGORY_LABEL[mode].toLowerCase()} ne anlama gelir?`,
  reverse: (mode) => `Bu anlam hangi ${CATEGORY_DATIVE[mode]} ait?`
};

export const MAX_MISTAKES = 5;
export const MAX_QUESTIONS = 10;
