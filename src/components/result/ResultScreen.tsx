import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/Wordmark";
import type { RunSettings } from "@/hooks/useGameRun";
import { CATEGORY_LABEL, DIRECTION_LABEL, FORMAT_LABEL } from "@/lib/labels";

interface ResultScreenProps {
  run: RunSettings;
  score: number;
  answered: number;
  mistakes: number;
  onRetry: () => void;
  onMenu: () => void;
}

async function shareCard(node: HTMLElement, score: number): Promise<string> {
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
  const blob = await (await fetch(dataUrl)).blob();

  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return "Görsel panoya kopyalandı.";
  } catch {
    const link = document.createElement("a");
    link.download = `atadey-${score}-dogru.png`;
    link.href = dataUrl;
    link.click();
    return "Görsel indirildi.";
  }
}

export function ResultScreen({ run, score, answered, mistakes, onRetry, onMenu }: ResultScreenProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const accuracy = answered > 0 ? Math.round((score / answered) * 100) : 0;

  async function handleShare() {
    if (!cardRef.current) return;

    setSharing(true);
    setStatus(null);

    try {
      setStatus(await shareCard(cardRef.current, score));
    } catch {
      setStatus("Görsel oluşturulamadı. Yeniden dene.");
    } finally {
      setSharing(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[560px] flex-col justify-center px-5 py-10 sm:py-16">
      <h1 className="sr-only">Sonuç: {score} doğru cevap</h1>

      <div ref={cardRef} className="animate-enter border border-rule bg-surface p-7 sm:p-9">
        <Wordmark className="text-lead" />

        <p className="mt-7 text-label font-medium uppercase text-ink-soft">
          {CATEGORY_LABEL[run.mode]} · {DIRECTION_LABEL[run.direction]} · {FORMAT_LABEL[run.format]}
        </p>

        <div className="mt-3 flex items-baseline gap-3">
          <p className="tabular font-serif text-hero text-ink">{score}</p>
          <p className="text-sm text-ink-soft">doğru cevap</p>
        </div>

        <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-rule pt-4">
          <div>
            <dt className="text-label font-medium uppercase text-ink-soft">Doğru</dt>
            <dd className="tabular mt-1 text-lead font-semibold text-ink">{score}</dd>
          </div>
          <div>
            <dt className="text-label font-medium uppercase text-ink-soft">Yanlış</dt>
            <dd className="tabular mt-1 text-lead font-semibold text-ink">{mistakes}</dd>
          </div>
          <div>
            <dt className="text-label font-medium uppercase text-ink-soft">Oran</dt>
            <dd className="tabular mt-1 text-lead font-semibold text-ink">{accuracy}%</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={onRetry}>Yeniden oyna</Button>
        <Button variant="secondary" onClick={onMenu}>
          Ana menü
        </Button>
        <Button variant="quiet" className="ml-auto" onClick={handleShare} disabled={sharing}>
          {sharing ? "Hazırlanıyor…" : "Görseli paylaş"}
        </Button>
      </div>

      <p role="status" aria-live="polite" className="mt-3 text-sm text-ink-soft">
        {status}
      </p>
    </main>
  );
}
