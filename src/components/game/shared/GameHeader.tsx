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
      <div className="glass-card rounded-2xl p-3 sm:p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-base sm:text-lg shadow-md">
            🎯 {score}
          </div>
          <span className="text-xs sm:text-sm font-medium text-blue-600">Doğru</span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {activeFormat === "mistakes" ? (
            <>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground mr-1 sm:mr-2">Can:</span>
              {Array.from({ length: maxMistakes }).map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    "h-5 w-5 sm:h-7 sm:w-7 transition-all duration-300 drop-shadow-md",
                    i < maxMistakes - mistakes 
                      ? "text-red-500 fill-current heart-beat" 
                      : "text-gray-300 fill-current opacity-40"
                  )}
                />
              ))}
            </>
          ) : (
            <div className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-base sm:text-lg shadow-md">
              {totalQuestions}/{maxQuestions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
