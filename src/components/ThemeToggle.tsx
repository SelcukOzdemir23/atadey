import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Theme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

/** Quiet switch in the footer; the label names the mode it switches to. */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <Button
      variant="quiet"
      onClick={onToggle}
      aria-label={isDark ? "Gündüz moduna geç" : "Gece moduna geç"}
      className="h-8 px-1 text-xs"
    >
      {isDark ? (
        <Sun aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.75} />
      ) : (
        <Moon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.75} />
      )}
      {isDark ? "Gündüz" : "Gece"}
    </Button>
  );
}
