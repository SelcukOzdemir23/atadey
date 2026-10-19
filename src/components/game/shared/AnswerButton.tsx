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
  let customClasses = "transition-all duration-200 ease-out transform active:scale-95";
  let buttonStyle = "";

  if (showFeedback) {
    if (isSelected) {
      if (isCorrect) {
        customClasses += " success-pulse shadow-lg shadow-green-500/40";
        buttonStyle = "bg-green-600 text-white border border-green-300";
      } else {
        customClasses += " error-shake shadow-lg shadow-red-500/40";
        buttonStyle = "bg-red-600 text-white border border-red-300";
      }
    } else if (isCorrectOption) {
      customClasses += " animate-pulse";
      buttonStyle = "bg-green-100 border border-green-200 text-green-800";
    } else {
      customClasses += " opacity-50";
      buttonStyle = "bg-gray-100 border border-gray-200 text-gray-400";
    }
  } else if (isSelected) {
    customClasses += " scale-105";
    buttonStyle = "bg-blue-600 text-white border border-blue-400 shadow-lg shadow-blue-500/40";
  } else {
    buttonStyle = "bg-white border border-gray-200 text-gray-700 font-medium hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-800 hover:shadow-md hover:scale-[1.02]";
  }

  return (
    <Button
      onClick={() => onAnswer(option)}
      disabled={showFeedback}
      className={cn(
        "h-auto min-h-[4rem] w-full whitespace-normal py-4 px-4 text-left text-base rounded-xl font-medium",
        customClasses,
        buttonStyle
      )}
      variant="ghost"
    >
      {option}
    </Button>
  );
}
