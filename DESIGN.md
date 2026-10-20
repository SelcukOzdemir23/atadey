# AtaDey — Design System

Recorded with the Impeccable workflow (`/impeccable document`). This is the
single source of truth for tokens; component classes should use these tokens
rather than raw palette values.

## Direction

Blue-only (mavi tonlar). Calm, clear, quick to scan — the player should read a
question and answer choices without decorative noise. Nothing here should read
as AI-generated slop: no purple/pink gradients, no gradient text, no thick
side-tab borders, no bounce easing, no glow effects.

## Type

Font: **Outfit** (Google Fonts, loaded in `index.html`). Chosen because Inter,
Roboto, Geist, Plus Jakarta Sans and Space Grotesk are ubiquitous enough to stop
signalling anything.

Scale (1.25× steps, defined as `--text-*` in `src/styles.css` and wired through
Tailwind's `fontSize`):

| Token | Size | Use |
| --- | --- | --- |
| `text-xs` | 12px | group labels (uppercase, tracked), footer |
| `text-sm` | 14px | helper text, stat captions |
| `text-base` | 16px | body, answer buttons, descriptions |
| `text-lg` | 20px | question quotes (mobile), feedback line |
| `text-xl` | 25px | question quotes (sm) |
| `text-2xl` | 31px | success title, stat values |
| `text-3xl` | 39px | result title |
| `text-4xl` | 49px | masthead wordmark |

Line height: `--leading-tight` 1.2 for display type, `--leading-normal` 1.55 for
body, `--leading-relaxed` 1.75 for quotes and examples. Quote/example copy is
capped with `max-w-prose` so line length stays readable.

## Color

All values are HSL channel triplets in `src/styles.css`.

| Token | Value | Role |
| --- | --- | --- |
| `--foreground` | `215 32% 17%` | text — tinted blue-gray, never pure black |
| `--background` | `210 45% 98%` | page |
| `--primary` | `212 92% 45%` | brand blue: selected options, CTA, score |
| `--muted-foreground` | `215 18% 45%` | secondary text — tinted, never pure gray |
| `--border` | `210 30% 88%` | hairlines |
| `--success` | `152 62% 34%` | (semantic) |
| `--destructive` | `0 66% 50%` | wrong answers |

Semantic green/red appear only as *meaning* (correct/wrong), never as decoration.

## Surfaces

`.glass-card` = 92% white, `blur(10px)`, hairline `--border`, one soft shadow.
Cards are not nested. Buttons use `bg-primary` when selected and `bg-card` +
hairline border + `hover:bg-primary/5` when not.

## Motion

Ease-out only (`cubic-bezier(0.22, 1, 0.36, 1)` for entrances). No bounce or
elastic curves. Utilities: `animate-scale-in`, `animate-slide-up`,
`animate-pulse-soft`, `animate-float`, `error-shake`, `heart-beat`. All motion
is disabled under `prefers-reduced-motion: reduce`.

## Verification

- `npx impeccable detect src/` → 0 anti-patterns, 0 advisories (source rules)
- `npx impeccable detect http://localhost:5173/atadey/` with a Chromium-based
  browser (`IMPECCABLE_BROWSER=/opt/helium-browser-bin/helium`) → `[]`, exit 0.
  This run includes the element-level rules the source scan cannot do: contrast,
  tiny text, tap targets, heading order and card nesting.
- `npm run build` clean · `npm run test` 64 passing · `npm run lint` 0 errors

Fixes this scan forced, worth keeping in mind when editing:

- `--muted-foreground` is 20% 40%, not lighter: 45% measured 4.2:1 on the lightest
  body tint and failed WCAG AA.
- The menu's mode summary is a `border-t` divider, not a bordered box — a second
  rounded surface inside `.glass-card` trips the nested-cards rule.
- Correct answers fill `bg-green-700` (white text = 5.0:1); `green-600` is 3.3:1.

URL scans render only the initial state (menu). The playing and result screens
reuse the same tokens, so their contrast follows from the values measured here.
