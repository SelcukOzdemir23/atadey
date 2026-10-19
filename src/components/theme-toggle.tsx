import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (!mounted) {
    return <Button variant="ghost" size="sm" disabled className="w-[80px]" />;
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-[80px]">
      {theme === "light" ? "Karanlık" : "Aydınlık"}
    </Button>
  );
}
