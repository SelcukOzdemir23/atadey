import { GameScreen } from "@/components/game/GameScreen";
import { MenuScreen } from "@/components/menu/MenuScreen";
import { ResultScreen } from "@/components/result/ResultScreen";
import { ErrorScreen } from "@/components/states/ErrorScreen";
import { LoadingScreen } from "@/components/states/LoadingScreen";
import { useGameRun } from "@/hooks/useGameRun";
import { useTheme } from "@/hooks/useTheme";

/**
 * The whole app: pick a screen from the run state. All game rules live in
 * `useGameRun`; screens only render what they are handed.
 */
function App() {
  const game = useGameRun();
  const theme = useTheme();

  switch (game.screen) {
    case "menu":
      return <MenuScreen onStart={game.start} theme={theme.theme} onToggleTheme={theme.toggle} />;

    case "loading":
      return <LoadingScreen />;

    case "error":
      return <ErrorScreen message={game.error ?? "Sorular yüklenemedi."} onRetry={game.retry} />;

    case "finished":
      if (!game.run) return <LoadingScreen />;
      return (
        <ResultScreen
          run={game.run}
          score={game.score}
          answered={game.answered}
          mistakes={game.mistakes}
          onRetry={game.retry}
          onMenu={game.toMenu}
        />
      );

    case "playing":
      if (!game.run || !game.question) return <LoadingScreen />;
      return (
        <GameScreen
          run={game.run}
          question={game.question}
          questionNumber={game.questionNumber}
          answered={game.answered}
          score={game.score}
          mistakes={game.mistakes}
          selected={game.selected}
          isCorrect={game.isCorrect}
          runOver={game.runOver}
          onAnswer={game.answer}
          onNext={game.next}
        />
      );
  }
}

export default App;
