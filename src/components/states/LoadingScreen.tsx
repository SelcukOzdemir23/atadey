export function LoadingScreen() {
  return (
    <main
      className="mx-auto flex min-h-[100dvh] w-full max-w-[560px] flex-col justify-center px-5"
      role="status"
      aria-live="polite"
    >
      <div className="h-0.5 w-full overflow-hidden bg-rule" aria-hidden="true">
        <div className="h-full w-1/3 animate-enter bg-accent" />
      </div>
      <p className="mt-4 text-sm text-ink-soft">Sorular hazırlanıyor…</p>
    </main>
  );
}
