import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/menu/ChoiceGroup";
import { Wordmark } from "@/components/Wordmark";
import { loadManifest } from "@/dataLoader";
import { CATEGORY_LABEL, DIRECTION_LABEL, FORMAT_LABEL } from "@/lib/labels";
import type { RunSettings } from "@/hooks/useGameRun";
import type { GameDirection, GameFormat, GameMode } from "@/types";

interface MenuScreenProps {
  onStart: (run: RunSettings) => void;
}

const CATEGORY_CHOICES = (Object.keys(CATEGORY_LABEL) as GameMode[]).map((value) => ({
  value,
  label: CATEGORY_LABEL[value]
}));
const FORMAT_CHOICES = (Object.keys(FORMAT_LABEL) as GameFormat[]).map((value) => ({
  value,
  label: FORMAT_LABEL[value]
}));
const DIRECTION_CHOICES = (Object.keys(DIRECTION_LABEL) as GameDirection[]).map((value) => ({
  value,
  label: DIRECTION_LABEL[value]
}));

const DIRECTION_HINT: Record<GameDirection, string> = {
  forward: "Söz gösterilir, anlamı sen seçersin.",
  reverse: "Anlam gösterilir, sözü sen seçersin."
};

function formatCount(value: number): string {
  return value.toLocaleString("tr-TR");
}

export function MenuScreen({ onStart }: MenuScreenProps) {
  const [mode, setMode] = useState<GameMode>("atasozu");
  const [format, setFormat] = useState<GameFormat>("mistakes");
  const [direction, setDirection] = useState<GameDirection>("forward");
  const [counts, setCounts] = useState<{ phrases: number; definitions: number } | null>(null);

  useEffect(() => {
    let alive = true;

    loadManifest()
      .then((manifest) => {
        if (alive) setCounts(manifest.totals);
      })
      .catch(() => {
        // Counts are a nicety; the game reports loading failures itself.
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[1040px] flex-col px-5 py-10 sm:px-8 sm:py-14 lg:py-20">
      <div className="grid flex-1 gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-12">
        <section className="flex animate-enter flex-col">
          <h1>
            <Wordmark />
          </h1>
          <p className="measure mt-5 text-lead text-ink-soft">
            Atasözü ve deyimleri anlamlarıyla eşleştiren kısa bir oyun. Kurulum yok, kayıt yok.
          </p>

          <ol className="mt-10 hidden max-w-[38ch] space-y-3 border-t border-rule pt-5 text-sm text-ink-soft lg:block">
            {[
              "Dört seçenekten birini seç.",
              "Yanlışta doğru anlamı işaretli görürsün.",
              "5 can veya 10 soru; sonunda skorun hazır."
            ].map((step, index) => (
              <li key={step} className="grid grid-cols-[1.5rem_1fr] gap-2">
                <span aria-hidden="true" className="tabular text-ink">{`0${index + 1}`}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {counts && (
            <p className="tabular mt-10 border-t border-rule pt-4 text-sm text-ink-soft">
              {`${formatCount(counts.phrases)} söz · ${formatCount(counts.definitions)} anlam`}
            </p>
          )}
        </section>

        <section
          aria-labelledby="setup-heading"
          className="animate-enter lg:border-t lg:border-rule lg:pt-5"
        >
          <h2 id="setup-heading" className="text-label font-medium uppercase text-ink-soft">
            Oyun kurulumu
          </h2>

          <div className="mt-3 [&>*:first-child]:border-t-0">
            <ChoiceGroup legend="Kategori" choices={CATEGORY_CHOICES} value={mode} onChange={setMode} />
            <ChoiceGroup legend="Oyun tipi" choices={FORMAT_CHOICES} value={format} onChange={setFormat} />
            <ChoiceGroup
              legend="Yön"
              choices={DIRECTION_CHOICES}
              value={direction}
              onChange={setDirection}
            />
          </div>

          <Button
            className="mt-6 w-full"
            onClick={() => onStart({ mode, format, direction })}
          >
            Oyuna başla
          </Button>

          <p className="mt-3 text-sm text-ink-soft" aria-live="polite">
            {DIRECTION_HINT[direction]}
          </p>
        </section>
      </div>

      <footer className="mt-12 border-t border-rule pt-4 text-xs text-ink-soft">
        Geliştirici: Müşerref Selçuk Özdemir
      </footer>
    </main>
  );
}
