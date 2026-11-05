import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Self-hosted via @fontsource (see src/main.tsx).
        serif: ["IBM Plex Serif", "Georgia", "serif"],
        sans: ["IBM Plex Sans", "system-ui", "-apple-system", "sans-serif"]
      },
      fontSize: {
        label: ["0.75rem", { lineHeight: "1.2", letterSpacing: "0.08em" }],
        xs: ["0.75rem", { lineHeight: "1.35" }],
        sm: ["0.875rem", { lineHeight: "1.45" }],
        base: ["1rem", { lineHeight: "1.55" }],
        lead: ["1.125rem", { lineHeight: "1.5" }],
        quote: ["1.25rem", { lineHeight: "1.7" }],
        entry: ["1.625rem", { lineHeight: "1.3" }],
        "entry-lg": ["2.125rem", { lineHeight: "1.25" }],
        score: ["2.75rem", { lineHeight: "1.05" }],
        hero: ["4rem", { lineHeight: "1" }],
        display: ["3.25rem", { lineHeight: "1.05" }]
      },
      colors: {
        paper: "hsl(var(--paper) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        ink: {
          DEFAULT: "hsl(var(--ink) / <alpha-value>)",
          soft: "hsl(var(--ink-soft) / <alpha-value>)"
        },
        rule: "hsl(var(--rule) / <alpha-value>)",
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          wash: "hsl(var(--accent-wash) / <alpha-value>)"
        },
        correct: {
          DEFAULT: "hsl(var(--correct) / <alpha-value>)",
          foreground: "hsl(var(--correct-foreground) / <alpha-value>)"
        },
        wrong: {
          DEFAULT: "hsl(var(--wrong) / <alpha-value>)",
          foreground: "hsl(var(--wrong-foreground) / <alpha-value>)"
        }
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "4px",
        lg: "4px",
        xl: "4px"
      },
      maxWidth: {
        measure: "60ch",
        "measure-wide": "65ch"
      },
      keyframes: {
        enter: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        enter: "enter 180ms cubic-bezier(0.22, 1, 0.36, 1) both"
      }
    }
  },
  plugins: []
} satisfies Config;
