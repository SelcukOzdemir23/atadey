import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function shuffleArray<T>(input: T[]): T[] {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function sampleSize<T>(items: T[], count: number): T[] {
  if (count >= items.length) {
    return shuffleArray(items);
  }
  const result: T[] = [];
  const used = new Set<number>();
  while (result.length < count && used.size < items.length) {
    const idx = Math.floor(Math.random() * items.length);
    if (used.has(idx)) continue;
    used.add(idx);
    result.push(items[idx]);
  }
  return result;
}
