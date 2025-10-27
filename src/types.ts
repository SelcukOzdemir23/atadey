export type GameMode = "atasozu" | "deyim";
export type GameFormat = "mistakes" | "questions";

export interface Definition {
  id: number;
  definition: string;
  example: string;
}

export interface PhraseEntry {
  text: string;
  definitions: Definition[];
}

export interface Question {
  id: string;
  text: string;
  definition: string;
  options: string[];
  correctAnswer: string;
  example: string;
  mode: GameMode;
}

export interface GameResult {
  score: number;
  total: number;
  mode: GameMode;
  format: GameFormat;
  timestamp: number;
}
