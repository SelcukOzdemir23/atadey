import { cn } from "@/lib/utils";

/**
 * Typographic wordmark: a small ink square plus the name in the serif. It
 * replaces the unrelated pink droplet that sat outside the palette.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-2.5 font-serif text-display leading-none tracking-[-0.02em] text-ink", className)}>
      <span aria-hidden="true" className="mb-[0.35em] inline-block h-[0.35em] w-[0.35em] shrink-0 bg-ink" />
      atadey
    </span>
  );
}
