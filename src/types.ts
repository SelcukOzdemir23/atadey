export type GameMode = "atasozu" | "deyim";

export interface PhraseEntry {
  term: string;
  meaning: string;
  example?: string;
}

export interface Question {
  id: string;
  term: string;
  meaning: string;
  options: string[];
  correctAnswer: string;
  example?: string;
  mode: GameMode;
}

export interface HighScoreEntry {
  name: string;
  score: number;
  timestamp: number;
}
