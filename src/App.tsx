import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, Share2, Home, Award, TrendingUp } from "lucide-react";
import { toPng } from "html-to-image";

import { generateQuestionBatch } from "@/dataLoader";
import { cn } from "@/lib/utils";
import type { GameMode, GameFormat, GameDirection, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GameHeader } from "@/components/game/shared/GameHeader";
import { TextToMeaningMode } from "@/components/game/modes/TextToMeaningMode";
import { MeaningToTextMode } from "@/components/game/modes/MeaningToTextMode";

const LOGO_URL = `${import.meta.env.BASE_URL}damla_arkaplan.png`;

const MAX_MISTAKES = 5;
const MAX_QUESTIONS = 10;

const MODE_LABELS: Record<GameMode, string> = {
  atasozu: "Atasözü",
  deyim: "Deyim"
};

const FORMAT_LABELS: Record<GameFormat, string> = {
  mistakes: "5 Hata Modu",
  questions: "10 Soru Testi"
};

const DIRECTION_LABELS: Record<GameDirection, string> = {
  forward: "Normal Mod",
  reverse: "Ters Mod"
};

// Footer Component - Hidden on mobile for better UX
const Footer = () => (
  <footer className="hidden sm:block fixed bottom-0 left-0 right-0 py-3 text-center pointer-events-none">
    <p className="text-xs text-muted-foreground">
      Geliştirici: Müşerref Selçuk ÖZDEMİR
    </p>
  </footer>
);

function App(): JSX.Element {
  const { toast } = useToast();
  
  // Menu State
  const [selectedMode, setSelectedMode] = useState<GameMode>("atasozu");
  const [selectedFormat, setSelectedFormat] = useState<GameFormat>("mistakes");
  const [selectedDirection, setSelectedDirection] = useState<GameDirection>("forward");
  
  // Game State
  const [gameState, setGameState] = useState<"menu" | "loading" | "playing" | "finished">("menu");
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  const [activeFormat, setActiveFormat] = useState<GameFormat | null>(null);
  const [activeDirection, setActiveDirection] = useState<GameDirection | null>(null);
  
  // Question State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Score State
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorLoadingQuestions, setErrorLoadingQuestions] = useState<string | null>(null);
  const [animateKey, setAnimateKey] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const isFetching = useRef(false);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const fetchAndSetQuestions = useCallback(
    async (mode: GameMode, direction: GameDirection, append = false) => {
      if (isFetching.current) return;
      isFetching.current = true;

      if (!append) {
        setIsLoading(true);
        setErrorLoadingQuestions(null);
      }

      try {
        const batch = await generateQuestionBatch(mode, direction);
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
    if (gameState === "playing" && questions.length === 0 && activeMode && activeDirection && !isFetching.current) {
      void fetchAndSetQuestions(activeMode, activeDirection);
    }
  }, [activeMode, activeDirection, fetchAndSetQuestions, gameState, questions.length]);

  useEffect(() => {
    if (
      gameState === "playing" &&
      activeMode &&
      activeDirection &&
      questions.length > 0 &&
      currentQuestionIndex >= questions.length - 5 &&
      !isFetching.current
    ) {
      void fetchAndSetQuestions(activeMode, activeDirection, true);
    }
  }, [activeMode, activeDirection, currentQuestionIndex, fetchAndSetQuestions, gameState, questions.length]);

  // Start game handler
  const startGame = useCallback(() => {
    setScore(0);
    setMistakes(0);
    setTotalQuestions(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setShowFeedback(false);
    setErrorLoadingQuestions(null);
    setActiveMode(selectedMode);
    setActiveFormat(selectedFormat);
    setActiveDirection(selectedDirection);
    setGameState("loading");
    void fetchAndSetQuestions(selectedMode, selectedDirection).then(() => {
      setGameState("playing");
    });
  }, [fetchAndSetQuestions, selectedMode, selectedFormat, selectedDirection]);

  const currentQuestion = questions[currentQuestionIndex];

  // Handle answer selection
  const handleAnswer = useCallback((answer: string) => {
    if (!currentQuestion || showFeedback) return;
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsAnswerCorrect(correct);
    setTotalQuestions((prev) => prev + 1);
    if (correct) {
      setScore((prev) => prev + 1);
    } else {
      setMistakes((prev) => prev + 1);
    }
    setShowFeedback(true);
  }, [currentQuestion, showFeedback]);

  // Handle next question
  const handleNextQuestion = useCallback(() => {
    if (!currentQuestion || !activeMode || !activeFormat) return;

    // Check if game should end
    let shouldEndGame = false;
    
    if (activeFormat === "mistakes") {
      shouldEndGame = mistakes >= MAX_MISTAKES;
    } else {
      shouldEndGame = totalQuestions >= MAX_QUESTIONS;
    }

    if (shouldEndGame) {
      setGameState("finished");
      return;
    }

    // Move to next question
    setShowFeedback(false);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setCurrentQuestionIndex((prev) => prev + 1);

    // Pre-fetch more questions if needed (for mistakes mode)
    if (activeFormat === "mistakes" && activeDirection && currentQuestionIndex + 1 >= questions.length - 5) {
      void fetchAndSetQuestions(activeMode, activeDirection, true);
    }
  }, [
    activeMode,
    activeDirection,
    activeFormat,
    currentQuestion,
    currentQuestionIndex,
    fetchAndSetQuestions,
    mistakes,
    questions.length,
    totalQuestions
  ]);

  // Return to menu
  const returnToMenu = useCallback(() => {
    setSelectedMode("atasozu");
    setSelectedFormat("mistakes");
    setActiveMode(null);
    setActiveFormat(null);
    setGameState("menu");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setShowFeedback(false);
    setScore(0);
    setMistakes(0);
    setTotalQuestions(0);
    setErrorLoadingQuestions(null);
  }, []);

  // Restart game with same settings
  const restartGame = useCallback(() => {
    setScore(0);
    setMistakes(0);
    setTotalQuestions(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setShowFeedback(false);
    setErrorLoadingQuestions(null);
    setGameState("playing");
  }, []);

  // Share result as PNG
  const shareResult = useCallback(async () => {
    if (!resultCardRef.current) return;

    setIsSharing(true);

    try {
      const dataUrl = await toPng(resultCardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Try to copy to clipboard (works on most modern browsers)
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);

        toast({
          title: "✅ Görsel Kopyalandı!",
          description: "Sonuç görseli panonuza kopyalandı. Artık paylaşabilirsiniz!",
          duration: 3000,
        });
      } catch {
        // Fallback: Download the image if clipboard fails
        const link = document.createElement('a');
        link.download = `deyim-atasozu-sonuc-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

        toast({
          title: "📥 Görsel İndirildi!",
          description: "Sonuç görseli indirildi. Dosyalarınızdan paylaşabilirsiniz!",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Görsel oluşturma hatası:', error);
      toast({
        title: "Hata",
        description: "Görsel oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSharing(false);
    }
  }, [toast]);

  // MENU SCREEN
  if (gameState === "menu") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-8 h-72 w-72 rounded-full bg-blue-200 blur-2xl opacity-50 animate-float" />
          <div className="absolute top-40 right-8 h-72 w-72 rounded-full bg-blue-300 blur-2xl opacity-40 animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute -bottom-10 left-1/4 h-72 w-72 rounded-full bg-blue-200 blur-2xl opacity-40 animate-float" style={{ animationDelay: "4s" }} />
        </div>

        <div className="w-full max-w-xl space-y-5 z-10">
          <Card className="glass-card animate-scale-in">
          <CardHeader className="pb-2">
            <div className="flex flex-col items-center gap-3 pt-6">
              <img 
                src={LOGO_URL}
                alt="AtaDey Logo" 
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain animate-float"
              />
              <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                  AtaDey
                </h1>
                <p className="mt-2 text-base font-medium text-muted-foreground">
                  Atasözleri &amp; Deyimler Oyunu
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-2">
            <p className="mb-5 text-center text-sm text-muted-foreground">
              Kategori, oyun tipi ve mod seçerek başla
            </p>
            
            {/* Kategori, Oyun Tipi ve Mod Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Kategori */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Kategori
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {(Object.keys(MODE_LABELS) as GameMode[]).map((mode) => (
                    <Button
                      key={mode}
                      variant={selectedMode === mode ? "default" : "outline"}
                      onClick={() => setSelectedMode(mode)}
                      className={cn(
                        "w-full transition-all duration-200 ease-out font-medium h-11",
                        selectedMode === mode 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
                      )}
                    >
                      {MODE_LABELS[mode]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Oyun Tipi */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Oyun Tipi
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {(Object.keys(FORMAT_LABELS) as GameFormat[]).map((format) => (
                    <Button
                      key={format}
                      variant={selectedFormat === format ? "default" : "outline"}
                      onClick={() => setSelectedFormat(format)}
                      className={cn(
                        "w-full transition-all duration-200 ease-out font-medium h-11",
                        selectedFormat === format 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
                      )}
                    >
                      <span className="text-sm">{FORMAT_LABELS[format]}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Oyun Modu - Yeni Eklendi */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Oyun Modu
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(DIRECTION_LABELS) as GameDirection[]).map((direction) => (
                  <Button
                    key={direction}
                    variant={selectedDirection === direction ? "default" : "outline"}
                    onClick={() => setSelectedDirection(direction)}
                    className={cn(
                      "w-full transition-all duration-200 ease-out font-medium h-11",
                      selectedDirection === direction 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    <span className="text-sm">
                      {direction === "forward" ? "📝 " : "🔄 "}
                      {DIRECTION_LABELS[direction]}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-5 border-t border-border pt-4 text-center text-xs text-muted-foreground">
              <div className="mb-1 font-semibold text-foreground">
                {selectedDirection === "forward" ? "📝 Normal Mod" : "🔄 Ters Mod"}
              </div>
              <div>
                {selectedDirection === "forward" 
                  ? "Metin gösterilir, anlam seçilir" 
                  : "Anlam gösterilir, metin seçilir"}
                {" • "}
                {selectedFormat === "mistakes" 
                  ? "5 yanlış hakkı" 
                  : "10 soru"}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Start Button - Görselin Dışında */}
        <Button
          onClick={startGame}
          size="lg"
          className="h-12 w-full text-base font-semibold transition-transform duration-200 ease-out hover:-translate-y-0.5"
        >
          Oyuna Başla
        </Button>
      </div>
      <Footer />
    </main>
    );
  }

  if (isLoading && gameState === "playing") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="glass-card p-12 rounded-3xl animate-scale-in">
          <img 
            src={LOGO_URL}
            alt="AtaDey"
            className="mx-auto h-20 w-20 object-contain animate-pulse-soft"
          />
          <p className="mt-6 text-center text-lg font-semibold text-foreground">
            Yeni sorular yükleniyor…
          </p>
          <div className="mt-4 flex justify-center gap-2" aria-hidden="true">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-soft"></div>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (errorLoadingQuestions) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="glass-card max-w-md p-8 text-center animate-scale-in">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <img 
                src={LOGO_URL}
                alt="Error" 
                className="h-16 w-16 object-contain opacity-50"
              />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Bir Hata Oluştu</h2>
          <p className="mb-6 text-muted-foreground">{errorLoadingQuestions}</p>
          <Button onClick={restartGame} className="h-11 w-full font-semibold">
            <RefreshCw className="mr-2 h-5 w-5" />
            Yeniden Dene
          </Button>
        </Card>
        <Footer />
      </div>
    );
  }

  // FINISHED SCREEN
  if (gameState === "finished") {
    const totalAttempted = activeFormat === "mistakes" ? score : totalQuestions;
    const accuracy = totalAttempted > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Quiet celebratory field */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-12 left-10 h-2 w-2 rounded-full bg-blue-400 animate-pulse-soft"></div>
          <div className="absolute top-24 right-20 h-2 w-2 rounded-full bg-blue-500 animate-pulse-soft" style={{ animationDelay: "0.3s" }}></div>
          <div className="absolute top-40 left-1/4 h-3 w-3 rounded-full bg-blue-400 animate-pulse-soft" style={{ animationDelay: "0.6s" }}></div>
          <div className="absolute top-56 right-1/3 h-2 w-2 rounded-full bg-blue-500 animate-pulse-soft" style={{ animationDelay: "0.9s" }}></div>
        </div>

        <div className="w-full max-w-lg space-y-4 z-10">
          <Card ref={resultCardRef} className="glass-card text-center animate-scale-in">
            <CardHeader className="pb-4">
              <div className="mb-2 flex items-center justify-center">
                <Award className="h-14 w-14 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground">
                Tebrikler!
              </h2>
              <CardDescription className="pt-1 text-base font-medium text-muted-foreground">
                {FORMAT_LABELS[activeFormat!]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6">
              <div className="rounded-2xl bg-primary/5 px-6 py-8 ring-1 ring-inset ring-primary/10">
                <p className="text-5xl font-extrabold tracking-tight text-primary tabular-nums sm:text-6xl">
                  {score}
                </p>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">doğru cevap</p>
              </div>
            
            {activeFormat === "mistakes" && (
              <div className="rounded-xl border border-border bg-secondary/60 px-4 py-3">
                <p className="font-medium text-foreground">
                  {score} doğru cevap verdin
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  5 yanlış yaparak oyunu tamamladın
                </p>
              </div>
            )}
            
            {activeFormat === "questions" && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <span className="flex items-center gap-2 font-semibold text-green-900">
                    <span className="text-xl" aria-hidden="true">✓</span> Doğru
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-green-700">{score}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <span className="flex items-center gap-2 font-semibold text-red-900">
                    <span className="text-xl" aria-hidden="true">✗</span> Yanlış
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-red-700">{mistakes}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <TrendingUp className="h-5 w-5 text-primary" /> Başarı Oranı
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-primary">{accuracy}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons - Görselin Dışında */}
        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={shareResult}
            size="lg"
            variant="outline"
            disabled={isSharing}
            className="h-11 w-full font-semibold"
          >
            {isSharing ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Görsel Hazırlanıyor...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-5 w-5" />
                Görseli Paylaş
              </>
            )}
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button
              onClick={restartGame}
              size="lg"
              className="h-11 w-full font-semibold"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Tekrar
            </Button>
            <Button
              onClick={returnToMenu}
              size="lg"
              variant="outline"
              className="h-11 w-full font-semibold"
            >
              <Home className="mr-2 h-5 w-5" />
              Ana Menü
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
    );
  }

  if (!currentQuestion || !activeMode || !activeDirection) {
    return (
      <>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <img 
            src={LOGO_URL}
            alt="AtaDey" 
            className="h-16 w-16 object-contain animate-pulse-soft"
          />
        </div>
        <Footer />
      </>
    );
  }

  const isGameEnding = (activeFormat === "mistakes" && mistakes >= MAX_MISTAKES - 1 && isAnswerCorrect === false) || 
                       (activeFormat === "questions" && totalQuestions >= MAX_QUESTIONS - 1);

  // PLAYING SCREEN
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 right-16 h-64 w-64 rounded-full bg-blue-200 blur-2xl opacity-40 animate-float"></div>
        <div className="absolute bottom-20 left-16 h-64 w-64 rounded-full bg-blue-300 blur-2xl opacity-30 animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

      <GameHeader
        score={score}
        mistakes={mistakes}
        totalQuestions={totalQuestions}
        maxMistakes={MAX_MISTAKES}
        maxQuestions={MAX_QUESTIONS}
        activeFormat={activeFormat!}
      />

      {activeDirection === "forward" ? (
        <TextToMeaningMode
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          isAnswerCorrect={isAnswerCorrect}
          showFeedback={showFeedback}
          animateKey={animateKey}
          modeLabel={MODE_LABELS[activeMode]}
          onAnswer={handleAnswer}
          onNext={handleNextQuestion}
          isGameEnding={isGameEnding}
        />
      ) : (
        <MeaningToTextMode
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          isAnswerCorrect={isAnswerCorrect}
          showFeedback={showFeedback}
          animateKey={animateKey}
          modeLabel={MODE_LABELS[activeMode]}
          onAnswer={handleAnswer}
          onNext={handleNextQuestion}
          isGameEnding={isGameEnding}
        />
      )}
      
      <Footer />
    </main>
  );
}

export default App;
