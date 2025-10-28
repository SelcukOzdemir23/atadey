import type { GameMode, GameDirection, PhraseEntry, Question, Definition } from "@/types";
import { sampleSize, shuffleArray } from "@/lib/utils";

const CACHE: Record<GameMode, PhraseEntry[] | null> = {
  atasozu: null,
  deyim: null
};

const DATA_URL: Record<GameMode, string> = {
  atasozu: `${import.meta.env.BASE_URL}data/atasozleri.json`,
  deyim: `${import.meta.env.BASE_URL}data/deyimler.json`
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

export async function generateQuestionBatch(mode: GameMode, direction: GameDirection = "forward"): Promise<Question[]> {
  const entries = await fetchEntries(mode);
  const selectedEntries = sampleSize(entries, QUESTIONS_PER_BATCH);

  return selectedEntries.map<Question>((entry: PhraseEntry, index: number) => {
    // Her entry'nin definitions array'inden rastgele bir tanım seç
    const selectedDefinition: Definition = sampleSize(entry.definitions, 1)[0];

    if (direction === "forward") {
      // FORWARD MODE: Metin göster → Anlam seç
      const otherEntries = entries.filter((e: PhraseEntry) => e.text !== entry.text);
      const distractorEntries = sampleSize(otherEntries, DISTRACTOR_COUNT);
      
      const distractors = distractorEntries.map((e: PhraseEntry) => {
        const randomDef: Definition = sampleSize(e.definitions, 1)[0];
        return randomDef.definition;
      });

      const options = shuffleArray([
        selectedDefinition.definition,
        ...distractors
      ]);

      return {
        id: `${mode}-${direction}-${Date.now()}-${index}`,
        text: entry.text,
        definition: selectedDefinition.definition,
        options,
        correctAnswer: selectedDefinition.definition,
        example: selectedDefinition.example,
        mode,
        direction
      };
    } else {
      // REVERSE MODE: Anlam göster → Metin seç
      const otherEntries = entries.filter((e: PhraseEntry) => e.text !== entry.text);
      const distractorEntries = sampleSize(otherEntries, DISTRACTOR_COUNT);
      
      const distractorTexts = distractorEntries.map((e: PhraseEntry) => e.text);

      const options = shuffleArray([
        entry.text,
        ...distractorTexts
      ]);

      return {
        id: `${mode}-${direction}-${Date.now()}-${index}`,
        text: selectedDefinition.definition, // Anlam gösteriliyor
        definition: selectedDefinition.definition,
        options, // Metin seçenekleri
        correctAnswer: entry.text, // Doğru metin
        example: selectedDefinition.example,
        mode,
        direction
      };
    }
  });
}

export async function ensureDataPreloaded(): Promise<void> {
  await Promise.all([fetchEntries("atasozu"), fetchEntries("deyim")]);
}
