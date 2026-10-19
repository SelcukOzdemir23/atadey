export type GameMode = "atasozu" | "deyim";
export type GameFormat = "mistakes" | "questions";
export type GameDirection = "forward" | "reverse"; // forward: text→meaning, reverse: meaning→text

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
  direction: GameDirection; // Hangi yönde oynanıyor
}

export interface GameResult {
  score: number;
  total: number;
  mode: GameMode;
  format: GameFormat;
  direction: GameDirection;
  timestamp: number;
}
