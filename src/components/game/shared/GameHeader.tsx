import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GameFormat } from "@/types";

interface GameHeaderProps {
  score: number;
  mistakes: number;
  totalQuestions: number;
  maxMistakes: number;
  maxQuestions: number;
  activeFormat: GameFormat;
}

export function GameHeader({
  score,
  mistakes,
  totalQuestions,
  maxMistakes,
  maxQuestions,
  activeFormat
}: GameHeaderProps) {
  return (
    <header className="mb-6 sm:mb-8 w-full max-w-2xl z-10">
      <div className="glass-card rounded-2xl px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary text-primary-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-base sm:text-lg tabular-nums">
            {score}
          </div>
          <span className="text-sm font-medium text-muted-foreground">Doğru</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {activeFormat === "mistakes" ? (
            <>
              <span className="text-sm font-medium text-muted-foreground mr-1">Can</span>
              {Array.from({ length: maxMistakes }).map((_, i) => (
                <Heart
                  key={i}
                  aria-hidden="true"
                  className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300",
                    i < maxMistakes - mistakes
                      ? "text-red-500 fill-current heart-beat"
                      : "text-blue-200 fill-current opacity-60"
                  )}
                />
              ))}
            </>
          ) : (
            <div className="bg-primary text-primary-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-base sm:text-lg tabular-nums">
              {totalQuestions}
              <span className="opacity-60">/</span>
              {maxQuestions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
