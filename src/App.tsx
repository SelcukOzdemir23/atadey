import { useState, useEffect, useRef, useCallback } from "react";
import type { VariantProps } from "class-variance-authority";
import { Film, Sparkles, Heart, RefreshCw, Trophy } from "lucide-react";

import { generateQuestionBatch } from "@/dataLoader";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import type { GameMode, HighScoreEntry, Question } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

const MAX_MISTAKES = 5;
const STORAGE_KEY = "deyimveatasozu-highscores";

const MODE_LABELS: Record<GameMode, string> = {
  atasozu: "Atasözü",
  deyim: "Deyim"
};

function loadHighScores(): HighScoreEntry[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is HighScoreEntry => {
        return (
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as HighScoreEntry).name === "string" &&
          typeof (entry as HighScoreEntry).score === "number" &&
          typeof (entry as HighScoreEntry).timestamp === "number"
        );
      })
      .slice(0, 10);
  } catch (error) {
    console.warn("high scores could not be parsed", error);
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function persistHighScores(scores: HighScoreEntry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch (error) {
    console.warn("high scores could not be saved", error);
  }
}

function App(): JSX.Element {
  const [playerName, setPlayerName] = useState("");
  const [selectedMode, setSelectedMode] = useState<GameMode>("atasozu");
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameOver">("start");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorLoadingQuestions, setErrorLoadingQuestions] = useState<string | null>(null);
  const [animateKey, setAnimateKey] = useState(0);

  const isFetching = useRef(false);

  useEffect(() => {
    setHighScores(loadHighScores());
  }, []);

  const fetchAndSetQuestions = useCallback(
    async (mode: GameMode, append = false) => {
      if (isFetching.current) return;
      isFetching.current = true;

      if (!append) {
        setIsLoading(true);
        setErrorLoadingQuestions(null);
      }

      try {
        const batch = await generateQuestionBatch(mode);
        setQuestions((prev) => (append ? [...prev, ...batch] : batch));
        if (!append) {
          setCurrentQuestionIndex(0);
        }
      } catch (error) {
        console.error("question batch failed", error);
        setErrorLoadingQuestions(
          error instanceof Error ? error.message : "Sorular yüklenirken bir hata oluştu."
        );
        if (!append) {
          setQuestions([]);
        }
      } finally {
        if (!append) {
          setIsLoading(false);
        }
        setAnimateKey((prev) => prev + 1);
        isFetching.current = false;
      }
    },
    []
  );

  useEffect(() => {
    if (gameState === "playing" && questions.length === 0 && activeMode && !isFetching.current) {
      void fetchAndSetQuestions(activeMode);
    }
  }, [activeMode, fetchAndSetQuestions, gameState, questions.length]);

  useEffect(() => {
    if (
      gameState === "playing" &&
      activeMode &&
      questions.length > 0 &&
      currentQuestionIndex >= questions.length - 5 &&
      !isFetching.current
    ) {
      void fetchAndSetQuestions(activeMode, true);
    }
  }, [activeMode, currentQuestionIndex, fetchAndSetQuestions, gameState, questions.length]);

  const startGame = useCallback(() => {
    if (!playerName.trim()) return;
    setScore(0);
    setMistakes(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setShowFeedback(false);
    setErrorLoadingQuestions(null);
    setActiveMode(selectedMode);
    setGameState("playing");
    void fetchAndSetQuestions(selectedMode);
  }, [fetchAndSetQuestions, playerName, selectedMode]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || showFeedback) return;
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsAnswerCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
    } else {
      setMistakes((prev) => prev + 1);
    }
    setShowFeedback(true);
  };

  const saveHighScore = useCallback(() => {
    if (!playerName.trim()) return;
    const nextEntry: HighScoreEntry = {
      name: playerName.trim(),
      score,
      timestamp: Date.now()
    };
    setHighScores((prev) => {
      const updated = [...prev, nextEntry]
        .sort((a, b) => b.score - a.score || a.timestamp - b.timestamp)
        .slice(0, 10);
      persistHighScores(updated);
      return updated;
    });
  }, [playerName, score]);

  const handleNextQuestion = useCallback(() => {
    if (!currentQuestion || !activeMode) return;

    const shouldEndGame = mistakes + (isAnswerCorrect === false ? 1 : 0) >= MAX_MISTAKES;
    if (shouldEndGame || currentQuestionIndex >= questions.length - 1) {
      saveHighScore();
      setGameState("gameOver");
      return;
    }

    setShowFeedback(false);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setCurrentQuestionIndex((prev) => prev + 1);

    if (currentQuestionIndex + 1 >= questions.length - 5) {
      void fetchAndSetQuestions(activeMode, true);
    }
  }, [
    activeMode,
    currentQuestion,
    currentQuestionIndex,
    fetchAndSetQuestions,
    isAnswerCorrect,
    mistakes,
    questions.length,
    saveHighScore
  ]);

  const restartGame = () => {
    setPlayerName("");
    setSelectedMode("atasozu");
    setActiveMode(null);
    setGameState("start");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setShowFeedback(false);
    setScore(0);
    setMistakes(0);
    setErrorLoadingQuestions(null);
  };

  if (gameState === "start") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in-0 duration-1000">
  <Card className="relative w-full max-w-md border border-border/50 bg-card text-center shadow-xl">
          <div className="absolute right-4 top-4">
            <ThemeToggle />
          </div>
          <CardHeader>
            <div className="flex flex-col items-center space-y-3 pt-6">
              <Film className="h-16 w-16 text-accent sm:h-20 sm:w-20" />
              <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl">
                Atasözleri & Deyimler
              </h1>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Adını yaz, oynayacağın modu seç ve atasözü ile deyimlerin anlamlarını tahmin et.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(Object.keys(MODE_LABELS) as GameMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={selectedMode === mode ? "default" : "outline"}
                  onClick={() => setSelectedMode(mode)}
                  className="w-full"
                >
                  {MODE_LABELS[mode]} Testi
                </Button>
              ))}
            </div>
            <Input
              type="text"
              placeholder="Adın"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              onKeyUp={(event) => {
                if (event.key === "Enter") {
                  startGame();
                }
              }}
              className="text-center text-lg"
            />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={startGame}
              size="lg"
              disabled={!playerName.trim()}
              className="w-full bg-accent text-lg text-accent-foreground hover:bg-accent/90"
            >
              Oyuna Başla
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (isLoading && gameState === "playing") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Sparkles className="h-16 w-16 animate-pulse text-accent" />
        <p className="mt-4 text-xl">Yeni sorular yükleniyor...</p>
      </div>
    );
  }

  if (errorLoadingQuestions) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Film className="h-16 w-16 text-destructive" />
        <p className="mt-4 text-center text-xl">{errorLoadingQuestions}</p>
        <Button onClick={restartGame} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
          Yeniden Dene
        </Button>
      </div>
    );
  }

  if (gameState === "gameOver") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in-0 duration-1000">
  <Card className="w-full max-w-lg border border-border/50 bg-card text-center shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl text-accent">Oyun Bitti, {playerName}!</CardTitle>
            <CardDescription>Toplam skorun:</CardDescription>
            <p className="text-6xl font-bold text-primary">{score}</p>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-400" />
              <h3 className="text-2xl font-semibold">En Yüksek Skorlar</h3>
            </div>
            <ol className="space-y-2 text-left">
              {highScores.length === 0 && <p className="text-center text-muted-foreground">Henüz skor yok!</p>}
              {highScores.map((entry, index) => (
                <li key={`${entry.name}-${entry.timestamp}`} className="flex justify-between rounded-md bg-muted/50 p-3">
                  <span className="font-semibold">
                    {index + 1}. {entry.name}
                  </span>
                  <span className="font-bold text-primary">{entry.score}</span>
                </li>
              ))}
            </ol>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={restartGame}
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Yeniden Oyna
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (!currentQuestion || !activeMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Sparkles className="h-16 w-16 animate-pulse text-accent" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <header className="mb-10 w-full max-w-xl">
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium text-muted-foreground">
            Skor: <span className="text-2xl font-bold text-primary">{score}</span>
          </p>
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <span className="sr-only text-xl font-medium text-muted-foreground">Canlar:</span>
            {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
              <Heart
                key={i}
                className={cn(
                  "h-8 w-8 transition-all duration-300",
                  i < MAX_MISTAKES - mistakes ? "text-red-500 fill-current" : "text-muted/50"
                )}
              />
            ))}
          </div>
        </div>
      </header>

      <Card
        key={`${animateKey}-${currentQuestion.id}`}
        className="w-full max-w-xl animate-in fade-in-0 zoom-in-95 duration-500 border border-border/50 bg-card shadow-xl"
      >
        <CardHeader>
          <CardTitle className="text-center text-2xl italic leading-relaxed text-foreground/90 sm:text-3xl">
            “{currentQuestion.term}”
          </CardTitle>
          <CardDescription className="pt-3 text-center text-muted-foreground">
            Bu {MODE_LABELS[activeMode].toLowerCase()} ne anlama gelir?
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {currentQuestion.options.map((option) => {
            const isCurrentSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQuestion.correctAnswer;

            let variant: ButtonVariant = "secondary";
            let customClasses = "transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100";

            if (showFeedback) {
              if (isCurrentSelected) {
                variant = isAnswerCorrect ? "default" : "destructive";
                customClasses = cn(
                  customClasses,
                  isAnswerCorrect ? "bg-accent hover:bg-accent/90 text-accent-foreground animate-pulse" : "animate-shake"
                );
              } else if (isCorrectOption) {
                variant = "outline";
                customClasses = cn(customClasses, "border-accent text-accent opacity-90");
              } else {
                variant = "secondary";
                customClasses = cn(customClasses, "opacity-60");
              }
            } else if (isCurrentSelected) {
              variant = "default";
              customClasses = cn(customClasses, "ring-2 ring-primary");
            }

            return (
              <Button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
                className={cn(
                  "h-auto min-h-[3.5rem] w-full whitespace-normal py-3 text-center text-base",
                  customClasses
                )}
                variant={variant}
              >
                {option}
              </Button>
            );
          })}
        </CardContent>
        {showFeedback && (
          <CardFooter className="flex flex-col items-center space-y-4 pt-5">
            <p className={cn("text-xl font-semibold", isAnswerCorrect ? "text-accent" : "text-destructive")}
            >
              {isAnswerCorrect ? "Doğru cevap!" : `Yanlış! Doğru anlam: ${currentQuestion.meaning}`}
            </p>
            {currentQuestion.example && (
              <p className="text-center text-sm text-muted-foreground">Örnek: {currentQuestion.example}</p>
            )}
            <Button
              onClick={handleNextQuestion}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
            >
              {mistakes >= MAX_MISTAKES - 1 && !isAnswerCorrect ? "Skoru Göster" : "Sonraki Soru"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}

export default App;
