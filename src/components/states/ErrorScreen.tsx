import { Button } from "@/components/ui/button";

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[560px] flex-col justify-center px-5">
      <h1 className="font-serif text-entry-lg text-ink">Veri yüklenemedi</h1>
      <p className="measure mt-3 text-ink-soft">{message}</p>
      <div className="mt-6">
        <Button onClick={onRetry}>Yeniden dene</Button>
      </div>
    </main>
  );
}
