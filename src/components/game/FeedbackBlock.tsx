import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface FeedbackBlockProps {
  question: Question | undefined;
  answered: boolean;
  correct: boolean | null;
}

/**
 * The learning half of the question. The true meaning is already the marked
 * option (or the prompt in reverse mode), so repeating it here would be noise:
 * this block adds only what the question did not show — a usage example and
 * any other meanings. Nothing is invented; missing data does not render.
 */
export function FeedbackBlock({ question, answered, correct }: FeedbackBlockProps) {
  if (!question || !answered || correct === null) return null;

  const { definition, alternatives } = question;

  return (
    <div className="mt-7 animate-enter border-t border-rule pt-6">
      <p className={cn("text-label font-medium uppercase", correct ? "text-correct" : "text-wrong")}>
        {correct ? "Doğru" : "Yanlış"}
      </p>

      {definition.example && (
        <figure className="mt-3 border-l-2 border-rule pl-4">
          <figcaption className="text-label font-medium uppercase text-ink-soft">Örnek</figcaption>
          <blockquote className="measure-wide mt-1 font-serif text-base italic leading-relaxed text-ink-soft">
            {definition.example}
          </blockquote>
        </figure>
      )}

      {alternatives.length > 0 && (
        <div className={cn(definition.example ? "mt-5" : "mt-3")}>
          <p className="text-label font-medium uppercase text-ink-soft">
            {alternatives.length === 1 ? "Diğer anlamı" : "Diğer anlamları"}
          </p>
          <ul className="mt-2 space-y-1.5">
            {alternatives.slice(0, 2).map((alternative) => (
              <li key={alternative.definition} className="measure text-sm text-ink-soft">
                {alternative.definition}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
