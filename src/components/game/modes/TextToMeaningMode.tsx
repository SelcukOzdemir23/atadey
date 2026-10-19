import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnswerButton } from "../shared/AnswerButton";
import type { Question } from "@/types";

interface TextToMeaningModeProps {
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

export function TextToMeaningMode({
  question,
  selectedAnswer,
  isAnswerCorrect,
  showFeedback,
  animateKey,
  modeLabel,
  onAnswer,
  onNext,
  isGameEnding
}: TextToMeaningModeProps) {
  return (
    <Card
      key={`${animateKey}-${question.id}`}
      className="glass-card w-full max-w-2xl border-white/30 shadow-lg animate-slide-up z-10"
    >
      <CardHeader className="pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-100 px-4 py-2 rounded-full">
            <span className="text-sm font-semibold text-blue-700">
              {modeLabel}
            </span>
          </div>
        </div>
        <CardTitle className="text-center text-xl italic leading-relaxed font-bold text-blue-900 sm:text-2xl md:text-3xl px-4">
          "{question.text}"
        </CardTitle>
        <CardDescription className="pt-3 text-center text-blue-600 font-medium text-sm sm:text-base">
          🤔 Bu {modeLabel.toLowerCase()} ne anlama gelir?
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 px-6 pb-6">
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
        <CardFooter className="flex flex-col items-center space-y-4 pt-5">
          <p className={cn("text-xl font-semibold", isAnswerCorrect ? "text-accent" : "text-destructive")}>
            {isAnswerCorrect ? "Doğru cevap!" : `Yanlış! Doğru anlam: ${question.definition}`}
          </p>
          {question.example && (
            <p className="text-center text-sm text-muted-foreground">Örnek: {question.example}</p>
          )}
          <Button
            onClick={onNext}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
          >
            {isGameEnding ? "Skoru Göster" : "Sonraki Soru"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
