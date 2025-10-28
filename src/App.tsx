import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, Share2, Home, Award, TrendingUp } from "lucide-react";
import { toPng } from "html-to-image";

import { generateQuestionBatch } from "@/dataLoader";
import { cn } from "@/lib/utils";
import type { GameMode, GameFormat, GameDirection, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="w-full max-w-xl space-y-4 z-10">
          <Card className="glass-card relative border-white/40 shadow-2xl animate-bounce-in">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center space-y-3 pt-4">
              <img 
                src={LOGO_URL}
                alt="AtaDey Logo" 
                className="h-16 w-16 animate-float sm:h-20 sm:w-20 drop-shadow-2xl object-contain"
              />
              <h1 className="text-center">
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl drop-shadow-sm">
                  AtaDey
                </span>
                <span className="block mt-1 text-base font-medium text-indigo-600/80">
                  Atasözleri & Deyimler Oyunu
                </span>
              </h1>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="text-center text-muted-foreground text-sm leading-relaxed mb-5">
              Kategori, oyun tipi ve modu seçerek başlayın
            </p>
            
            {/* Kategori, Oyun Tipi ve Mod Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Kategori */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
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
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-[1.02]" 
                          : "border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-800 hover:scale-[1.01]"
                      )}
                    >
                      {MODE_LABELS[mode]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Oyun Tipi */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
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
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-[1.02]" 
                          : "border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-800 hover:scale-[1.01]"
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
              <p className="text-sm font-semibold text-foreground mb-2">
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
                        ? "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg shadow-green-500/50 scale-[1.02]" 
                        : "border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50 hover:text-green-800 hover:scale-[1.01]"
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
            <div className="mt-4 text-xs text-center text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-200">
              <div className="font-semibold mb-1">
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
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-base font-bold h-12 hover:scale-[1.02] transition-all duration-200 ease-out shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-600/50"
        >
          Oyuna Başla
        </Button>
      </div>
    </main>
    );
  }

  if (isLoading && gameState === "playing") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="glass-card p-12 rounded-3xl shadow-2xl animate-bounce-in">
          <div className="relative">
            <img 
              src={LOGO_URL}
              alt="Damla Logo" 
              className="h-20 w-20 mx-auto animate-pulse object-contain"
            />
            <div className="absolute inset-0 animate-ping">
              <img 
                src={LOGO_URL}
                alt="Damla Logo" 
                className="h-20 w-20 mx-auto opacity-75 object-contain"
              />
            </div>
          </div>
          <p className="mt-6 text-xl font-semibold text-indigo-900 animate-pulse text-center">
            Yeni sorular yükleniyor...
          </p>
          <div className="mt-4 flex gap-2 justify-center">
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (errorLoadingQuestions) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Card className="glass-card max-w-md p-8 text-center shadow-2xl border-white/40 animate-bounce-in">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
              <img 
                src={LOGO_URL}
                alt="Error" 
                className="h-16 w-16 object-contain opacity-50"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">Bir Hata Oluştu</h2>
          <p className="text-muted-foreground mb-6">{errorLoadingQuestions}</p>
          <Button 
            onClick={restartGame} 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold h-12 shadow-lg"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Yeniden Dene
          </Button>
        </Card>
      </div>
    );
  }

  // FINISHED SCREEN
  if (gameState === "finished") {
    const totalAttempted = activeFormat === "mistakes" ? score : totalQuestions;
    const accuracy = totalAttempted > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Confetti Background Effect */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute top-40 left-1/4 w-4 h-4 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          <div className="absolute top-60 right-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
        </div>

        <div className="w-full max-w-lg space-y-4 z-10">
          <Card ref={resultCardRef} className="glass-card text-center shadow-2xl border-white/40 animate-bounce-in">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-16 w-16 text-yellow-500 animate-pulse drop-shadow-lg" />
              </div>
              <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tebrikler! 🎉
              </CardTitle>
              <CardDescription className="text-base font-medium text-indigo-600">
                {FORMAT_LABELS[activeFormat!]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 p-8 rounded-2xl">
                  <p className="text-7xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                    {score}
                  </p>
                  <p className="text-sm font-semibold text-indigo-600 mt-2">Doğru Cevap ✨</p>
              </div>
            </div>
            
            {activeFormat === "mistakes" && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                <p className="text-indigo-800 font-medium">
                  🎯 {score} doğru cevap verdin!
                </p>
                <p className="text-indigo-600 text-sm mt-1">
                  5 yanlış yaparak oyunu tamamladın
                </p>
              </div>
            )}
            
            {activeFormat === "questions" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-2 border-green-200">
                  <span className="font-semibold text-green-900 flex items-center gap-2">
                    <span className="text-2xl">✓</span> Doğru
                  </span>
                  <span className="font-bold text-2xl text-green-600">{score}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-red-50 to-rose-50 p-4 border-2 border-red-200">
                  <span className="font-semibold text-red-900 flex items-center gap-2">
                    <span className="text-2xl">✗</span> Yanlış
                  </span>
                  <span className="font-bold text-2xl text-red-600">{mistakes}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-2 border-indigo-200">
                  <span className="font-semibold text-indigo-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Başarı Oranı
                  </span>
                  <span className="font-bold text-2xl text-indigo-600">{accuracy}%</span>
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
            className="w-full border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-800 hover:scale-105 transition-all duration-200 font-semibold h-12 disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur"
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
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold h-12 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Tekrar
            </Button>
            <Button
              onClick={returnToMenu}
              size="lg"
              variant="outline"
              className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-800 font-semibold h-12 hover:scale-105 transition-all duration-200 bg-white/80 backdrop-blur"
            >
              <Home className="mr-2 h-5 w-5" />
              Ana Menü
            </Button>
          </div>
        </div>
      </div>
    </main>
    );
  }

  if (!currentQuestion || !activeMode || !activeDirection) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <img 
          src={LOGO_URL}
          alt="Damla Logo" 
          className="h-16 w-16 animate-pulse object-contain"
        />
      </div>
    );
  }

  const isGameEnding = (activeFormat === "mistakes" && mistakes >= MAX_MISTAKES - 1 && isAnswerCorrect === false) || 
                       (activeFormat === "questions" && totalQuestions >= MAX_QUESTIONS - 1);

  // PLAYING SCREEN
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
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
    </main>
  );
}

export default App;
