import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateQuestionBatch, loadPool, resetDataCache } from "../dataLoader";
import type { Dataset, PhraseEntry } from "../types";

function entry(text: string, definition: string, example?: string): PhraseEntry {
  return { text, definitions: [example ? { definition, example } : { definition }] };
}

/** 12 phrases with unique primary meanings — 10 questions need 4 options each. */
const atasozleri: Dataset = {
  version: 1,
  entries: [
    "Damlaya damlaya göl olur",
    "Acele işe şeytan karışır",
    "Ağaç yaşken eğilir",
    "Balık baştan kokar",
    "Dost başa düşman ayağa bakar",
    "Gülü seven dikenine katlanır",
    "İşleyen demir ışıldar",
    "Sütten ağzı yanan yoğurdu üfleyerek yer",
    "Yuvarlanan taş yosun tutmaz",
    "Ayağını yorganına göre uzat",
    "Bir elin nesi var iki elin sesi var",
    "Komşu komşunun külüne muhtaçtır"
  ].map((text, index) => entry(text, `Anlam ${index + 1}: bu sözün açıklaması burada yer alır.`))
};

const deyimler: Dataset = {
  version: 1,
  entries: [
    entry("Göz atmak", "Kısaca bakıvermek, göz gezdirmek.", "Kitaba bir göz attı."),
    entry("Kulak kabartmak", "Belli etmeden dinlemek."),
    entry("Ağzı kulaklarına varmak", "Çok sevinmek."),
    entry("Etekleri zil çalmak", "Sevinçten yerinde duramamak."),
    entry("Dili dönmemek", "Söylemek istediğini söyleyememek."),
    entry("Gözü kara olmak", "Korkusuz olmak.")
  ]
};

function mockFetch(data: Record<string, Dataset>): void {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: RequestInfo | URL) => {
      const href = typeof url === "string" ? url : url instanceof URL ? url.href : url.toString();
      const key = href.includes("atasozleri.json") ? "atasozu" : href.includes("deyimler.json") ? "deyim" : null;
      const dataset = key ? data[key] : undefined;

      if (!dataset) {
        return Promise.resolve({ ok: false, status: 404, json: () => Promise.reject(new Error("Not found")) } as Response);
      }

      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(dataset) } as Response);
    })
  );
}

describe("dataLoader", () => {
  beforeEach(() => {
    resetDataCache();
    mockFetch({ atasozu: atasozleri, deyim: deyimler });
  });

  it("asks the requested number of questions", async () => {
    const questions = await generateQuestionBatch({ mode: "atasozu" });
    expect(questions).toHaveLength(10);
  });

  it("gives every question four distinct options that contain the answer", async () => {
    const questions = await generateQuestionBatch({ mode: "atasozu" });

    for (const question of questions) {
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options).size).toBe(4);
      expect(question.options).toContain(question.answer);
    }
  });

  it("drops phrases whose meaning is claimed by another phrase", async () => {
    // Two phrases sharing one meaning make a question unanswerable in either
    // direction: the shared text could be right for both, or for neither.
    const ambiguous: Dataset = {
      version: 1,
      entries: [
        { text: "Söz A", definitions: [{ definition: "Ayrı bir anlam" }, { definition: "Ortak anlam" }] },
        entry("Söz B", "Ortak anlam"),
        ...atasozleri.entries
      ]
    };
    mockFetch({ atasozu: ambiguous, deyim: deyimler });

    const pool = await loadPool("atasozu");

    expect(pool.entries.map((item) => item.text)).toContain("Söz A");
    expect(pool.entries.map((item) => item.text)).not.toContain("Söz B");

    const questions = await generateQuestionBatch({ mode: "atasozu", count: 12 });
    for (const question of questions) {
      expect(question.answer).not.toBe("Ortak anlam");
      expect(question.options.filter((option) => option === "Ortak anlam")).toHaveLength(0);
    }
  });

  it("turns a meaning into the question in reverse mode", async () => {
    const [question] = await generateQuestionBatch({ mode: "deyim", direction: "reverse", count: 1 });

    expect(question.prompt).toBe(question.definition.definition);
    expect(question.answer).toBe(question.phrase);
    expect(question.options).toContain(question.answer);
  });

  it("keeps the full entry around for feedback", async () => {
    const questions = await generateQuestionBatch({ mode: "deyim", count: 6 });
    const withExample = questions.find((question) => question.definition.example !== undefined);

    expect(withExample?.phrase).toBe("Göz atmak");
    expect(withExample?.definition.example).toBe("Kitaba bir göz attı.");
  });

  it("does not repeat a prompt already asked in the run", async () => {
    const first = await generateQuestionBatch({ mode: "deyim", count: 3 });
    const asked = first.map((question) => question.prompt);
    const second = await generateQuestionBatch({ mode: "deyim", count: 2, excludePrompts: asked });

    for (const question of second) {
      expect(asked).not.toContain(question.prompt);
    }
  });

  it("gives every question a unique id", async () => {
    const questions = await generateQuestionBatch({ mode: "atasozu" });
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
  });

  it("fetches a category once and reuses the pool", async () => {
    await loadPool("atasozu");
    const callsAfterFirst = vi.mocked(fetch).mock.calls.length;

    await generateQuestionBatch({ mode: "atasozu" });
    await generateQuestionBatch({ mode: "atasozu" });

    expect(vi.mocked(fetch).mock.calls.length).toBe(callsAfterFirst);
  });

  it("dedupes concurrent loads into one request", async () => {
    await Promise.all([loadPool("deyim"), loadPool("deyim"), loadPool("deyim")]);
    expect(vi.mocked(fetch).mock.calls.length).toBe(1);
  });

  it("surfaces a readable error when the data cannot be fetched", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve(null) } as Response))
    );

    await expect(generateQuestionBatch({ mode: "atasozu" })).rejects.toThrow(/Veri yüklenemedi/);
  });

  it("rejects an empty dataset instead of returning an empty game", async () => {
    mockFetch({ atasozu: { version: 1, entries: [] }, deyim: deyimler });

    await expect(generateQuestionBatch({ mode: "atasozu" })).rejects.toThrow(/Veri dosyası boş/);
  });
});
