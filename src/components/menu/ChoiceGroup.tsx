import { cn } from "@/lib/utils";

interface Choice<T extends string> {
  value: T;
  label: string;
}

interface ChoiceGroupProps<T extends string> {
  legend: string;
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * A real radio group: arrow keys move between options, the legend names the
 * group. Visually it is a printed row of choices, not a stack of buttons.
 */
export function ChoiceGroup<T extends string>({ legend, choices, value, onChange }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="grid gap-2 border-t border-rule py-4 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start sm:gap-6">
      <legend className="sr-only">{legend}</legend>
      <p aria-hidden="true" className="text-label font-medium uppercase text-ink-soft sm:pt-2.5">
        {legend}
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        {choices.map((choice) => (
          <label
            key={choice.value}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2.5 py-2",
              "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
            )}
          >
            <input
              type="radio"
              name={legend}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 border border-ink-soft transition-colors peer-checked:border-ink peer-checked:bg-ink"
            />
            <span className="text-lead text-ink-soft transition-colors peer-checked:font-medium peer-checked:text-ink">
              {choice.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
