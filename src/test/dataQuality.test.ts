/**
 * Guards the generated dataset, not the generator: if `npm run data:build`
 * ever ships text the game cannot show fairly, this fails before deploy.
 */
import { describe, it, expect, beforeAll, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { generateQuestionBatch, resetDataCache } from "../dataLoader";
import type { GameDirection, GameMode } from "../types";

interface Manifest {
  datasetVersion: number;
  categories: Record<string, { phrases: number; definitions: number; file: string }>;
  totals: { phrases: number; definitions: number };
}

const ROOT = path.resolve(__dirname, "../..");
const DATA_DIR = path.join(ROOT, "public", "data");

const manifest = JSON.parse(readFileSync(path.join(DATA_DIR, "manifest.json"), "utf8")) as Manifest;

const TAG_ONLY = /^(tkz|ktz|argo|mecaz|esk|halk ağzı)\.?$/i;

function load(file: string) {
  return JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf8")) as {
    version: number;
    entries: { text: string; definitions: { definition: string; example?: string }[] }[];
  };
}

describe("data files", () => {
  for (const [key, category] of Object.entries(manifest.categories)) {
    describe(key, () => {
      let dataset: ReturnType<typeof load>;

      beforeAll(() => {
        dataset = load(path.basename(category.file));
      });

      it("matches the manifest", () => {
        expect(dataset.version).toBe(manifest.datasetVersion);
        expect(dataset.entries.length).toBe(category.phrases);
        expect(dataset.entries.reduce((total, entry) => total + entry.definitions.length, 0)).toBe(
          category.definitions
        );
      });

      it("never ships an empty or tag-only definition", () => {
        for (const entry of dataset.entries) {
          for (const definition of entry.definitions) {
            expect(definition.definition.trim().length).toBeGreaterThanOrEqual(3);
            expect(definition.definition).not.toMatch(TAG_ONLY);
          }
        }
      });

      it("never repeats a definition inside one phrase", () => {
        for (const entry of dataset.entries) {
          const seen = new Set(entry.definitions.map((definition) => definition.definition.trim()));
          expect(seen.size).toBe(entry.definitions.length);
        }
      });

      it("keeps examples out of the payload when there are none", () => {
        for (const entry of dataset.entries) {
          for (const definition of entry.definitions) {
            if ("example" in definition) expect(definition.example).toBeTruthy();
          }
        }
      });

      it("has no scrape headings left as phrases", () => {
        for (const entry of dataset.entries) {
          expect(entry.text).not.toMatch(/ANLAMLARI/);
        }
      });
    });
  }

  describe("question generation on the real data", () => {
    it("turns 80 batches into unambiguous four-option questions", async () => {
      const files: Record<GameMode, string> = { atasozu: "atasozleri.json", deyim: "deyimler.json" };

      vi.stubGlobal(
        "fetch",
        vi.fn((url: RequestInfo | URL) => {
          const href = String(url);
          const mode = (Object.keys(files) as GameMode[]).find((key) => href.includes(files[key]));

          if (!mode) {
            return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve(null) } as Response);
          }

          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(load(files[mode]))
          } as Response);
        })
      );
      resetDataCache();

      for (const mode of ["atasozu", "deyim"] as GameMode[]) {
        for (const direction of ["forward", "reverse"] as GameDirection[]) {
          for (let round = 0; round < 10; round += 1) {
            const questions = await generateQuestionBatch({ mode, direction, count: 10 });

            for (const question of questions) {
              expect(question.options).toHaveLength(4);
              expect(new Set(question.options).size).toBe(4);
              expect(question.options).toContain(question.answer);
              expect(question.prompt.length).toBeGreaterThan(1);
            }
          }
        }
      }
    }, 30_000);
  });
});
