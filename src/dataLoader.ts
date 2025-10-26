import type { GameMode, PhraseEntry, Question } from "@/types";
import { sampleSize, shuffleArray } from "@/lib/utils";

const CACHE: Record<GameMode, PhraseEntry[] | null> = {
  atasozu: null,
  deyim: null
};

const DATA_URL: Record<GameMode, string> = {
  atasozu: "/data/atasozleri.json",
  deyim: "/data/deyimler.json"
};

const QUESTIONS_PER_BATCH = 10;
const DISTRACTOR_COUNT = 3;

async function fetchEntries(mode: GameMode): Promise<PhraseEntry[]> {
  if (CACHE[mode]) {
    return CACHE[mode] as PhraseEntry[];
  }

  const response = await fetch(DATA_URL[mode]);
  if (!response.ok) {
    throw new Error(`Veri yüklenemedi: ${response.status}`);
  }

  const data = (await response.json()) as PhraseEntry[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Veri dosyası boş veya hatalı görünüyor");
  }

  CACHE[mode] = data;
  return data;
}

export async function generateQuestionBatch(mode: GameMode): Promise<Question[]> {
  const entries = await fetchEntries(mode);
  const selectedEntries = sampleSize(entries, QUESTIONS_PER_BATCH);

  return selectedEntries.map<Question>((entry: PhraseEntry, index: number) => {
    const distractors = sampleSize(
      entries.filter((candidate: PhraseEntry) => candidate.term !== entry.term),
      DISTRACTOR_COUNT
    );

    const options = shuffleArray([
      entry.meaning,
      ...distractors.map((d: PhraseEntry) => d.meaning)
    ]);

    return {
      id: `${mode}-${Date.now()}-${index}`,
      term: entry.term,
      meaning: entry.meaning,
      options,
      correctAnswer: entry.meaning,
      example: entry.example,
      mode
    };
  });
}

export async function ensureDataPreloaded(): Promise<void> {
  await Promise.all([fetchEntries("atasozu"), fetchEntries("deyim")]);
}
