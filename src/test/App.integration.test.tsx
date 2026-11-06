import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import App from "../App";
import { resetDataCache } from "../dataLoader";
import type { Dataset, PhraseEntry } from "../types";

const phrases: PhraseEntry[] = [
  ["Damlaya damlaya göl olur", "Küçük birikimler zamanla büyük sonuç verir."],
  ["Acele işe şeytan karışır", "Acele edilen işte hata olur."],
  ["Ağaç yaşken eğilir", "İnsan küçük yaşta eğitilir."],
  ["Balık baştan kokar", "Bozulma yönetimden başlar."],
  ["Dost başa düşman ayağa bakar", "Dost yakın, düşman uzak durur."],
  ["Gülü seven dikenine katlanır", "Sevginin sıkıntısına katlanılır."],
  ["İşleyen demir ışıldar", "Çalışan kişi gelişir."],
  ["Sütten ağzı yanan yoğurdu üfleyerek yer", "Bir kez yanan sonra tedbirli olur."],
  ["Yuvarlanan taş yosun tutmaz", "Yer değiştiren kişi birikim yapamaz."],
  ["Ayağını yorganına göre uzat", "Harcamayı gelirine göre yap."],
  ["Bir elin nesi var iki elin sesi var", "Birlikten güç doğar."],
  ["Komşu komşunun külüne muhtaçtır", "Komşular birbirine ihtiyaç duyar."]
].map(([text, definition]) => ({ text, definitions: [{ definition: definition! }] }));

const dataset: Dataset = { version: 1, entries: phrases };
const manifest = {
  datasetVersion: 1,
  categories: {},
  totals: { phrases: 12, definitions: 12, definitionsWithExample: 0 },
  highlights: [{ text: "Damlaya damlaya göl olur", definition: "Küçük birikimler zamanla büyük sonuç verir." }]
};

/** Prompt → the option a player should click, per direction. */
const forwardAnswers = new Map(phrases.map((phrase) => [phrase.text, phrase.definitions[0].definition]));
const reverseAnswers = new Map(phrases.map((phrase) => [phrase.definitions[0].definition, phrase.text]));

vi.mock("html-to-image", () => ({
  toPng: vi.fn(() => Promise.resolve("data:image/png;base64,mock"))
}));

function mockFetch(failing = false): void {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: RequestInfo | URL) => {
      const href = typeof url === "string" ? url : url instanceof URL ? url.href : url.toString();

      if (failing) {
        return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve(null) } as Response);
      }

      if (href.includes("manifest.json")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(manifest) } as Response);
      }

      if (href.includes("atasozleri.json")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(dataset) } as Response);
      }

      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve(null) } as Response);
    })
  );
}

function optionButtons(): HTMLElement[] {
  return within(screen.getByRole("group", { name: "Seçenekler" })).getAllByRole("button");
}

/** The option text without its decorative letter prefix. */
function optionText(button: HTMLElement): string {
  return button.textContent?.replace(/^[A-D]/, "").trim() ?? "";
}

async function currentPrompt(): Promise<string> {
  const heading = await screen.findByRole("heading", { level: 1 });
  return heading.textContent?.replace(/[“”]/g, "").trim() ?? "";
}

function chooseRadio(name: string): void {
  fireEvent.click(screen.getByRole("radio", { name }));
}

async function advance(label: RegExp): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: label }));
  await waitFor(() => expect(screen.queryByRole("button", { name: /Sonraki|Sonuçları gör/ })).not.toBeInTheDocument());
}

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDataCache();
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    mockFetch();
  });

  it("opens on the menu with one primary action", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("atadey");
    expect(screen.getByRole("radio", { name: "Atasözü" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "5 can" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Sözden anlama" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Oyuna başla" })).toBeInTheDocument();
  });

  it("shows the data counts once the manifest arrives", async () => {
    render(<App />);
    expect(await screen.findByText(/12 söz/)).toBeInTheDocument();
  });

  it("shows the proverb of the day from the manifest", async () => {
    render(<App />);

    expect(await screen.findByText("Günün sözü")).toBeInTheDocument();
    expect(screen.getByText(/Damlaya damlaya göl olur/)).toBeInTheDocument();
  });

  it("starts a game with one question and four options", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Oyuna başla" }));

    expect(await currentPrompt()).not.toBe("");
    expect(optionButtons()).toHaveLength(4);
  });

  it("marks a correct answer, announces it and offers the next step", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Oyuna başla" }));

    const answer = forwardAnswers.get(await currentPrompt());
    fireEvent.click(screen.getByRole("button", { name: answer! }));

    expect(await screen.findByRole("button", { name: "Sonraki" })).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(/^Doğru\./);
  });

  it("shows the right meaning when the answer is wrong", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Oyuna başla" }));

    const prompt = await currentPrompt();
    const answer = forwardAnswers.get(prompt)!;
    const wrong = optionButtons().find((button) => optionText(button) !== answer)!;
    fireEvent.click(wrong);

    expect(await screen.findByText("Yanlış")).toBeInTheDocument();
    expect(optionButtons().some((button) => optionText(button) === answer)).toBe(true);
    expect(screen.getByRole("status")).toHaveTextContent(`Doğru cevap: ${answer}`);
  });

  it("answers with the number keys", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Oyuna başla" }));

    await currentPrompt();
    fireEvent.keyDown(window, { key: "1" });

    expect(await screen.findByRole("button", { name: "Sonraki" })).toBeInTheDocument();
  });

  it("swaps questions inside a view transition when the browser supports it", async () => {
    const startViewTransition = vi.fn((callback: () => void) => {
      callback();
      return { finished: Promise.resolve() };
    });
    Object.assign(document, { startViewTransition });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Oyuna başla" }));

    const first = await currentPrompt();
    fireEvent.click(screen.getByRole("button", { name: forwardAnswers.get(first)! }));
    fireEvent.click(await screen.findByRole("button", { name: "Sonraki" }));

    // One transition for loading → playing, one for the card swap; the mode
    // travels on the root element so the CSS knows what to animate.
    expect(startViewTransition).toHaveBeenCalledTimes(2);
    expect(document.documentElement.dataset.vt).toBe("card");

    await waitFor(() => expect(document.documentElement.dataset.vt).toBeUndefined());

    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
  });

  it("asks the phrase in reverse mode", async () => {
    render(<App />);
    chooseRadio("Anlamdan söze");
    fireEvent.click(screen.getByRole("button", { name: "Oyuna başla" }));

    const prompt = await currentPrompt();
    const answer = reverseAnswers.get(prompt);
    expect(answer).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: answer! }));
    expect(await screen.findByRole("button", { name: "Sonraki" })).toBeInTheDocument();
  });

  it("reaches the result screen with a perfect ten-question run", async () => {
    render(<App />);
    chooseRadio("10 soru");
    fireEvent.click(screen.getByRole("button", { name: "Oyuna başla" }));

    for (let index = 0; index < 10; index += 1) {
      const answer = forwardAnswers.get(await currentPrompt());
      fireEvent.click(screen.getByRole("button", { name: answer! }));
      await advance(index === 9 ? /Sonuçları gör/ : /Sonraki/);
    }

    expect(await screen.findByRole("button", { name: "Yeniden oyna" })).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sonuç: 10 doğru cevap");
  });

  it("ends after the fifth wrong answer in can mode", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Oyuna başla" }));

    for (let index = 0; index < 5; index += 1) {
      const answer = forwardAnswers.get(await currentPrompt())!;
      const wrong = optionButtons().find((button) => optionText(button) !== answer)!;
      fireEvent.click(wrong);
      await advance(index === 4 ? /Sonuçları gör/ : /Sonraki/);
    }

    expect(await screen.findByRole("button", { name: "Yeniden oyna" })).toBeInTheDocument();
  });

  it("returns to the menu from the result screen", async () => {
    render(<App />);
    chooseRadio("10 soru");
    fireEvent.click(screen.getByRole("button", { name: "Oyuna başla" }));

    for (let index = 0; index < 10; index += 1) {
      const answer = forwardAnswers.get(await currentPrompt());
      fireEvent.click(screen.getByRole("button", { name: answer! }));
      await advance(index === 9 ? /Sonuçları gör/ : /Sonraki/);
    }

    fireEvent.click(await screen.findByRole("button", { name: "Ana menü" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Oyuna başla" })).toBeInTheDocument();
    });
  });

  it("switches to the night theme and remembers the choice", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Gece moduna geç" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("atadey.theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Gündüz moduna geç" })).toBeInTheDocument();
  });

  it("offers a retry when the data cannot be loaded", async () => {
    mockFetch(true);
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Oyuna başla" }));

    expect(await screen.findByRole("heading", { name: "Veri yüklenemedi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yeniden dene" })).toBeInTheDocument();
  });
});

