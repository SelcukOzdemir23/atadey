import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  failed: boolean;
}

/**
 * Last line of defence: a render error should leave the visitor with a paper
 * page and a way back, not a white screen. Real errors still reach the console.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("AtaDey crashed while rendering", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[560px] flex-col justify-center px-5">
        <h1 className="font-serif text-entry-lg text-ink">Bir şeyler ters gitti</h1>
        <p className="measure mt-3 text-ink-soft">
          Sayfayı yenilemek genelde yeterli oluyor. Sorun sürerse tarayıcı konsolundaki
          hata kaydını paylaşabilirsin.
        </p>
        <div className="mt-6">
          <Button onClick={() => window.location.reload()}>Sayfayı yenile</Button>
        </div>
      </main>
    );
  }
}
