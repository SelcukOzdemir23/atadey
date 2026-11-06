import { useEffect, useRef } from "react";
import { AnswerOption, type OptionState } from "@/components/game/AnswerOption";
import { FeedbackBlock } from "@/components/game/FeedbackBlock";
import { ScoreStrip } from "@/components/game/ScoreStrip";
import { Button } from "@/components/ui/button";
import type { RunSettings } from "@/hooks/useGameRun";
import { PROMPT_QUESTION } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface GameScreenProps {
  run: RunSettings;
  question: Question;
  questionNumber: number;
  answered: number;
  score: number;
  mistakes: number;
  selected: string | null;
  isCorrect: boolean | null;
  runOver: boolean;
  onAnswer: (option: string) => void;
  onNext: () => void;
}

export function GameScreen({
  run,
  question,
  questionNumber,
  answered,
  score,
  mistakes,
  selected,
  isCorrect,
  runOver,
  onAnswer,
  onNext
}: GameScreenProps) {
  const answeredQuestion = selected !== null;
  const nextRef = useRef<HTMLButtonElement>(null);

  // Keyboard: 1–4 answers, Enter moves on. Both are announced in the hint
  // below the options, so the shortcut is discoverable.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (answeredQuestion) {
        if (event.key === "Enter") {
          event.preventDefault();
          onNext();
        }
        return;
      }

      const index = Number(event.key);
      if (index >= 1 && index <= question.options.length) {
        event.preventDefault();
        onAnswer(question.options[index - 1]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answeredQuestion, onAnswer, onNext, question.options]);

  useEffect(() => {
    if (answeredQuestion) nextRef.current?.focus();
  }, [answeredQuestion]);

  function stateFor(option: string): OptionState {
    if (!answeredQuestion) return "idle";
    if (option === question.answer) return "correct";
    if (option === selected) return "wrong";
    return "muted";
  }

  const announcement = answeredQuestion
    ? isCorrect
      ? `Doğru. Anlamı: ${question.definition.definition}`
      : `Yanlış. Doğru cevap: ${question.answer}`
    : "";

  return (
    <main className="mx-auto w-full max-w-[680px] px-5 py-7 sm:px-8 sm:py-12">
      <ScoreStrip
        mode={run.mode}
        direction={run.direction}
        format={run.format}
        questionNumber={questionNumber}
        answered={answered}
        mistakes={mistakes}
        score={score}
      />

      <section key={question.id} className="question-card animate-enter">
        <h1
          className={cn(
            "font-serif text-ink",
            run.direction === "forward"
              ? "text-entry sm:text-entry-lg"
              : "text-quote sm:text-entry"
          )}
        >
          {run.direction === "forward" ? `“${question.prompt}”` : question.prompt}
        </h1>

        <p className="mt-3 text-sm text-ink-soft">{PROMPT_QUESTION[run.direction](run.mode)}</p>

        <div className="mt-6 border-b border-rule" role="group" aria-label="Seçenekler">
          {question.options.map((option, index) => (
            <AnswerOption
              key={option}
              index={index}
              text={option}
              state={stateFor(option)}
              onSelect={() => {
                if (!answeredQuestion) onAnswer(option);
              }}
            />
          ))}
        </div>

        {!answeredQuestion && (
          <p className="mt-3 hidden text-xs text-ink-soft sm:block">
            1–4 tuşlarıyla da seçebilirsin
          </p>
        )}      </section>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <FeedbackBlock question={question} answered={answeredQuestion} correct={isCorrect} />

      {answeredQuestion && (
        <div className="mt-7 flex justify-end">
          <Button ref={nextRef} onClick={onNext}>
            {runOver ? "Sonuçları gör" : "Sonraki"}
          </Button>
        </div>
      )}
    </main>
  );
}
