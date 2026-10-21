import { Card, CardHeader, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnswerButton } from "../shared/AnswerButton";
import type { Question } from "@/types";

interface MeaningToTextModeProps {
  question: Question;
  selectedAnswer: string | null;
  isAnswerCorrect: boolean | null;
  showFeedback: boolean;
  animateKey: number;
  modeLabel: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  isGameEnding: boolean;
}

export function MeaningToTextMode({
  question,
  selectedAnswer,
  isAnswerCorrect,
  showFeedback,
  animateKey,
  modeLabel,
  onAnswer,
  onNext,
  isGameEnding
}: MeaningToTextModeProps) {
  return (
    <Card
      key={`${animateKey}-${question.id}`}
      className="glass-card w-full max-w-2xl animate-slide-up z-10"
    >
      <CardHeader className="pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 px-3 py-1.5 rounded-full">
            <span className="text-sm font-semibold text-primary">
              {modeLabel} · Ters Mod
            </span>
          </div>
        </div>
        <h2 className="px-4 text-center text-lg font-bold text-balance leading-relaxed text-foreground sm:text-xl md:text-2xl">
          {question.text}
        </h2>
        <CardDescription className="pt-3 text-center text-muted-foreground font-medium text-base">
          Bu anlam hangi {modeLabel.toLowerCase()}e ait?
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 px-6 pb-6">
        {question.options.map((option) => {
          const isCurrentSelected = selectedAnswer === option;
          const isCorrectOption = option === question.correctAnswer;

          return (
            <AnswerButton
              key={option}
              option={option}
              isSelected={isCurrentSelected}
              isCorrect={isAnswerCorrect === true}
              isCorrectOption={isCorrectOption}
              showFeedback={showFeedback}
              onAnswer={onAnswer}
            />
          );
        })}
      </CardContent>
      {showFeedback && (
        <CardFooter className="flex flex-col items-center space-y-3 pt-5">
          <p className={cn("text-lg font-semibold text-center", isAnswerCorrect ? "text-green-700" : "text-destructive")}>
            {isAnswerCorrect ? "Doğru cevap!" : `Yanlış! Doğru ${modeLabel.toLowerCase()}: ${question.correctAnswer}`}
          </p>
          {question.example && (
            <p className="text-center text-sm text-muted-foreground leading-relaxed max-w-prose">
              Örnek: {question.example}
            </p>
          )}
          <Button onClick={onNext} className="w-full sm:w-auto">
            {isGameEnding ? "Skoru Göster" : "Sonraki Soru"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
