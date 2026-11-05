import { CATEGORY_LABEL, DIRECTION_LABEL, MAX_MISTAKES, MAX_QUESTIONS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { GameDirection, GameFormat, GameMode } from "@/types";

interface ScoreStripProps {
  mode: GameMode;
  direction: GameDirection;
  format: GameFormat;
  questionNumber: number;
  answered: number;
  mistakes: number;
  score: number;
}

function Lives({ remaining }: { remaining: number }) {
  return (
    <p className="flex items-center gap-2 text-sm text-ink-soft">
      <span className="sr-only">
        Can {remaining}/{MAX_MISTAKES}
      </span>
      <span aria-hidden="true" className="flex items-center gap-1">
        {Array.from({ length: MAX_MISTAKES }, (_, index) => (
          <span
            key={index}
            className={cn("h-2 w-2", index < remaining ? "bg-ink" : "border border-rule")}
          />
        ))}
      </span>
    </p>
  );
}

/** Current question, progress and score — the whole state, one thin strip. */
export function ScoreStrip({
  mode,
  direction,
  format,
  questionNumber,
  answered,
  mistakes,
  score
}: ScoreStripProps) {
  const remaining = MAX_MISTAKES - mistakes;
  const progress =
    format === "mistakes"
      ? Math.max(0, (remaining / MAX_MISTAKES) * 100)
      : Math.min(100, (answered / MAX_QUESTIONS) * 100);

  return (
    <header className="mb-7">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-label font-medium uppercase text-ink-soft">
          {CATEGORY_LABEL[mode]} · {DIRECTION_LABEL[direction]}
        </p>
        <p className="text-sm text-ink-soft">
          <span className="tabular text-base font-semibold text-ink">{score}</span> doğru
        </p>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {format === "questions" && (
          <div className="h-0.5 flex-1 bg-rule" aria-hidden="true">
            <div
              className="h-full bg-accent transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <p className="tabular text-sm text-ink-soft">
          Soru {String(questionNumber).padStart(2, "0")}
          {format === "questions" && ` / ${MAX_QUESTIONS}`}
        </p>
        {format === "mistakes" && (
          <div className="ml-auto">
            <Lives remaining={remaining} />
          </div>
        )}
      </div>
    </header>
  );
}
