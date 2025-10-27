import type { GameMode, PhraseEntry, Question, Definition } from "@/types";
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
    // Her entry'nin definitions array'inden rastgele bir tanım seç
    const selectedDefinition: Definition = sampleSize(entry.definitions, 1)[0];

    // Diğer entries'lerden rastgele tanımlar seç (çeldiriciler için)
    const otherEntries = entries.filter((e: PhraseEntry) => e.text !== entry.text);
    const distractorEntries = sampleSize(otherEntries, DISTRACTOR_COUNT);
    
    // Her distractor entry'den rastgele bir tanım seç
    const distractors = distractorEntries.map((e: PhraseEntry) => {
      const randomDef: Definition = sampleSize(e.definitions, 1)[0];
      return randomDef.definition;
    });

    // Şıkları karıştır
    const options = shuffleArray([
      selectedDefinition.definition,
      ...distractors
    ]);

    return {
      id: `${mode}-${Date.now()}-${index}`,
      text: entry.text,
      definition: selectedDefinition.definition,
      options,
      correctAnswer: selectedDefinition.definition,
      example: selectedDefinition.example,
      mode
    };
  });
}

export async function ensureDataPreloaded(): Promise<void> {
  await Promise.all([fetchEntries("atasozu"), fetchEntries("deyim")]);
}
