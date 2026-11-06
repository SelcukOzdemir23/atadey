import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "atadey.theme";

function systemTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Effective theme is the explicit choice, otherwise the system preference.
 * Only the explicit choice is stored, so someone who never touches the switch
 * keeps following their device.
 */
export function useTheme() {
  const [explicit, setExplicit] = useState<Theme | null>(readStoredTheme);
  const [system, setSystem] = useState<Theme>(systemTheme);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!query) return;

    const onChange = () => setSystem(query.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const theme = explicit ?? system;

  useEffect(() => {
    const root = document.documentElement;

    if (explicit) root.dataset.theme = explicit;
    else delete root.dataset.theme;

    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#0d1117" : "#f7f7f9";
  }, [explicit, theme]);

  const toggle = useCallback(() => {
    setExplicit((current) => {
      const next: Theme = (current ?? systemTheme()) === "dark" ? "light" : "dark";

      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Private mode: the choice still applies for this session.
      }

      return next;
    });
  }, []);

  return { theme, toggle };
}
