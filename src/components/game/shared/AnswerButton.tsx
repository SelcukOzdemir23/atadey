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
        customClasses += " success-pulse shadow-lg shadow-green-500/50";
        buttonStyle = "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-300";
      } else {
        customClasses += " error-shake shadow-lg shadow-red-500/50";
        buttonStyle = "bg-gradient-to-r from-red-500 to-rose-500 text-white border-2 border-red-300";
      }
    } else if (isCorrectOption) {
      customClasses += " animate-pulse";
      buttonStyle = "bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 text-green-800";
    } else {
      customClasses += " opacity-50";
      buttonStyle = "bg-gray-100 border border-gray-200 text-gray-400";
    }
  } else if (isSelected) {
    customClasses += " scale-105";
    buttonStyle = "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-2 border-indigo-400 shadow-lg shadow-indigo-500/50";
  } else {
    buttonStyle = "bg-white border-2 border-gray-200 text-gray-700 font-medium hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-800 hover:shadow-md hover:scale-[1.02]";
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
