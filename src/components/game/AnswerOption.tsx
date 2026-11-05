import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D"];

export type OptionState = "idle" | "correct" | "wrong" | "muted";

interface AnswerOptionProps {
  index: number;
  text: string;
  state: OptionState;
  onSelect: () => void;
}

/**
 * Answer rows, not buttons in boxes: letter, text, hairline. The correct row
 * is marked with an accent rule and an icon, never by dimming the others.
 */
export function AnswerOption({ index, text, state, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "grid w-full grid-cols-[1.25rem_minmax(0,1fr)_1rem] items-start gap-3 border-l-2 border-t border-t-rule border-l-transparent px-2 py-4 text-left transition-colors duration-150",
        state === "idle" && "hover:bg-ink/[0.03]",
        state === "correct" && "border-l-correct bg-correct/[0.06]",
        state === "wrong" && "border-l-wrong bg-wrong/[0.05]"
      )}
    >
      <span aria-hidden="true" className="pt-0.5 text-label font-medium text-ink-soft">
        {LETTERS[index]}
      </span>
      <span
        className={cn(
          "text-base leading-relaxed text-ink",
          state === "muted" && "text-ink-soft",
          state === "wrong" && "line-through decoration-wrong/70"
        )}
      >
        {text}
      </span>
      <span aria-hidden="true" className="pt-1">
        {state === "correct" && <Check className="h-4 w-4 text-correct" strokeWidth={2} />}
        {state === "wrong" && <X className="h-4 w-4 text-wrong" strokeWidth={2} />}
      </span>
    </button>
  );
}
