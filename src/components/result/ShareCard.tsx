import { forwardRef } from "react";
import type { RunSettings } from "@/hooks/useGameRun";
import { CATEGORY_LABEL, DIRECTION_LABEL, FORMAT_LABEL } from "@/lib/labels";

interface ShareCardProps {
  run: RunSettings;
  score: number;
  answered: number;
  mistakes: number;
}

const RULE = "1px solid hsl(var(--rule))";

/**
 * Fixed 1080×1920 “fiş” for sharing to stories. It is deliberately not the
 * on-screen card: a vertical composition needs its own proportions, and the
 * screenshot pipeline wants a node with a fixed size. Rendered off-screen,
 * in the current theme's colours.
 */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { run, score, answered, mistakes },
  ref
) {
  const accuracy = answered > 0 ? Math.round((score / answered) * 100) : 0;

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", left: -4000, top: 0, width: 1080, height: 1920, overflow: "hidden" }}
    >
      {/* The captured node must sit at (0,0) inside this wrapper: html-to-image
          keeps the node's own offsets, so an element parked at left:-4000
          would paint outside the snapshot and come out blank. */}
      <div
        ref={ref}
        className="bg-paper text-ink"
        style={{ width: 1080, height: 1920, overflow: "hidden" }}
      >
      <div style={{ height: "100%", padding: "112px 96px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
          <span aria-hidden="true" style={{ width: 26, height: 26, background: "hsl(var(--ink))" }} />
          <span className="font-serif" style={{ fontSize: 92, lineHeight: 1, letterSpacing: "-0.02em" }}>
            atadey
          </span>
        </div>

        <div style={{ marginTop: 48, borderTop: RULE }} />

        <div style={{ marginTop: "auto", marginBottom: "auto", paddingBottom: 24 }}>
          <p
            className="text-ink-soft"
            style={{ fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            {CATEGORY_LABEL[run.mode]} · {DIRECTION_LABEL[run.direction]} · {FORMAT_LABEL[run.format]}
          </p>

          <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 24 }}>
            <span className="font-serif tabular" style={{ fontSize: 300, lineHeight: 0.85 }}>
              {score}
            </span>
            <span className="text-ink-soft" style={{ fontSize: 34 }}>
              doğru cevap
            </span>
          </div>

          <div
            style={{
              marginTop: 88,
              borderTop: RULE,
              paddingTop: 36,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24
            }}
          >
            {[
              { label: "Doğru", value: score },
              { label: "Yanlış", value: mistakes },
              { label: "Oran", value: `${accuracy}%` }
            ].map((item) => (
              <div key={item.label}>
                <p
                  className="text-ink-soft"
                  style={{ fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                  {item.label}
                </p>
                <p className="tabular" style={{ fontSize: 52, fontWeight: 600, marginTop: 8 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 36, height: 3, background: "hsl(var(--rule))" }}>
            <div style={{ height: "100%", width: `${accuracy}%`, background: "hsl(var(--accent))" }} />
          </div>
        </div>

        <div
          className="text-ink-soft"
          style={{
            borderTop: RULE,
            paddingTop: 28,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22
          }}
        >
          <span>selcukozdemir23.github.io/atadey</span>
          <span>atasözü ve deyim oyunu</span>
        </div>
      </div>
      </div>
    </div>
  );
});
