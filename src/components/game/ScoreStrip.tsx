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
      <span className="tabular">{remaining} can</span>
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
    <header className="mb-7 flex items-start gap-4 sm:gap-5">
      {/* Entry number: the “index card” anchor of the screen. */}
      <p className="tabular shrink-0 font-serif text-[2.25rem] leading-[0.85] text-ink sm:text-[2.75rem]">
        {String(questionNumber).padStart(2, "0")}
      </p>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-label font-medium uppercase text-ink-soft">
            {CATEGORY_LABEL[mode]} · {DIRECTION_LABEL[direction]}
          </p>
          <p className="shrink-0 text-sm text-ink-soft">
            <span className="tabular text-base font-semibold text-ink">{score}</span> doğru
          </p>
        </div>

        <div className="mt-2.5 flex items-center gap-3">
          {format === "questions" ? (
            <>
              <div className="h-0.5 flex-1 bg-rule" aria-hidden="true">
                <div
                  className="h-full bg-accent transition-[width] duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="tabular text-sm text-ink-soft">
                {answered}/{MAX_QUESTIONS}
              </p>
            </>
          ) : (
            <div className="ml-auto">
              <Lives remaining={remaining} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
