import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnswerButtonProps {
  option: string;
  isSelected: boolean;
  isCorrect: boolean;
  isCorrectOption: boolean;
  showFeedback: boolean;
  onAnswer: (option: string) => void;
}

export function AnswerButton({
  option,
  isSelected,
  isCorrect,
  isCorrectOption,
  showFeedback,
  onAnswer
}: AnswerButtonProps) {
  let customClasses = "transition duration-200 ease-out active:translate-y-px";
  let buttonStyle = "";

  if (showFeedback) {
    if (isSelected) {
      if (isCorrect) {
        buttonStyle = "bg-green-700 text-white border border-green-800/30 shadow-sm";
      } else {
        customClasses += " error-shake";
        buttonStyle = "bg-red-600 text-white border border-red-700/30 shadow-sm";
      }
    } else if (isCorrectOption) {
      buttonStyle = "bg-green-100 border border-green-300 text-green-900";
    } else {
      buttonStyle = "bg-muted border border-border text-muted-foreground opacity-60";
    }
  } else if (isSelected) {
    buttonStyle = "bg-blue-600 text-white border border-blue-700/30 shadow-sm";
  } else {
    buttonStyle =
      "bg-card border border-border text-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground hover:-translate-y-0.5 hover:shadow-sm";
  }

  return (
    <Button
      onClick={() => onAnswer(option)}
      disabled={showFeedback}
      className={cn(
        "h-auto min-h-[3.5rem] w-full whitespace-normal py-4 px-4 text-left text-base rounded-xl font-medium leading-relaxed",
        customClasses,
        buttonStyle
      )}
      variant="ghost"
    >
      {option}
    </Button>
  );
}
