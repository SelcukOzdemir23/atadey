import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, RefreshCw, Share2, Home, Award, TrendingUp } from "lucide-react";

import { generateQuestionBatch } from "@/dataLoader";
import { cn } from "@/lib/utils";
import type { GameMode, GameFormat, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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

function App(): JSX.Element {
  const { toast } = useToast();
  
  // Menu State
  const [selectedMode, setSelectedMode] = useState<GameMode>("atasozu");
  const [selectedFormat, setSelectedFormat] = useState<GameFormat>("mistakes");
  
  // Game State
  const [gameState, setGameState] = useState<"menu" | "loading" | "playing" | "finished">("menu");
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  const [activeFormat, setActiveFormat] = useState<GameFormat | null>(null);
  
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

  const isFetching = useRef(false);

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
    setGameState("loading");
    void fetchAndSetQuestions(selectedMode).then(() => {
      setGameState("playing");
    });
  }, [fetchAndSetQuestions, selectedMode, selectedFormat]);

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
    if (activeFormat === "mistakes" && currentQuestionIndex + 1 >= questions.length - 5) {
      void fetchAndSetQuestions(activeMode, true);
    }
  }, [
    activeMode,
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

  // Share result
  const shareResult = useCallback(() => {
    const modeLabel = MODE_LABELS[activeMode || "atasozu"];
    const formatLabel = FORMAT_LABELS[activeFormat || "mistakes"];
    
    let shareText = "";
    if (activeFormat === "mistakes") {
      shareText = `${modeLabel} oyununda ${formatLabel}'nde ${score} doğru yaptım! Sen de dene: ${window.location.href}`;
    } else {
      shareText = `${modeLabel} oyununda ${formatLabel}'nde ${MAX_QUESTIONS} soruda ${score} doğru yaptım! Sen de dene: ${window.location.href}`;
    }

    navigator.clipboard.writeText(shareText)
      .then(() => {
        toast({
          title: "Kopyalandı!",
          description: "Sonuç panonuza kopyalandı.",
          duration: 2000,
        });
      })
      .catch(() => {
        toast({
          title: "Hata",
          description: "Sonuç kopyalanamadı.",
          variant: "destructive",
          duration: 2000,
        });
      });
  }, [activeMode, activeFormat, score, toast]);

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

        <Card className="glass-card relative w-full max-w-xl border-white/40 shadow-2xl animate-bounce-in z-10">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center space-y-3 pt-4">
              <img 
                src="/damla_arkaplan.png" 
                alt="Damla Logo" 
                className="h-16 w-16 animate-float sm:h-20 sm:w-20 drop-shadow-2xl object-contain"
              />
              <h1 className="text-center">
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl drop-shadow-sm">
                  Atasözleri & Deyimler
                </span>
                <span className="block mt-1 text-base font-medium text-indigo-600/80">
                  Bilgini Test Et
                </span>
              </h1>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="text-center text-muted-foreground text-sm leading-relaxed mb-5">
              Kategori ve oyun tipini seçerek başlayın
            </p>
            
            {/* Kategori ve Oyun Tipi Grid Layout */}
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

            {/* Info Box */}
            <div className="mt-4 text-xs text-center text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-200">
              {selectedFormat === "mistakes" 
                ? "5 yanlış yapana kadar devam et" 
                : "10 soru cevapla ve skorunu gör"}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center px-6 pb-6">
            <Button
              onClick={startGame}
              size="lg"
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-base font-bold h-12 hover:scale-[1.02] transition-all duration-200 ease-out shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-600/50"
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
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="glass-card p-12 rounded-3xl shadow-2xl animate-bounce-in">
          <div className="relative">
            <img 
              src="/damla_arkaplan.png" 
              alt="Damla Logo" 
              className="h-20 w-20 mx-auto animate-pulse object-contain"
            />
            <div className="absolute inset-0 animate-ping">
              <img 
                src="/damla_arkaplan.png" 
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
                src="/damla_arkaplan.png" 
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

        <Card className="glass-card w-full max-w-lg text-center shadow-2xl border-white/40 animate-bounce-in z-10">
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
          <CardContent className="space-y-6 px-6">
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
          <CardFooter className="flex flex-col gap-3 px-6 pb-8">
            <Button
              onClick={shareResult}
              size="lg"
              variant="outline"
              className="w-full border-2 border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400 hover:scale-105 transition-all duration-300 font-semibold h-12"
            >
              <Share2 className="mr-2 h-5 w-5" />
              Sonucu Paylaş
            </Button>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                onClick={restartGame}
                size="lg"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-semibold h-12 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Tekrar
              </Button>
              <Button
                onClick={returnToMenu}
                size="lg"
                variant="outline"
                className="w-full border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400 font-semibold h-12 hover:scale-105 transition-all duration-300"
              >
                <Home className="mr-2 h-5 w-5" />
                Ana Menü
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (!currentQuestion || !activeMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <img 
          src="/damla_arkaplan.png" 
          alt="Damla Logo" 
          className="h-16 w-16 animate-pulse object-contain"
        />
      </div>
    );
  }

  // PLAYING SCREEN
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <header className="mb-8 w-full max-w-2xl z-10">
        <div className="glass-card rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-md">
              🎯 {score}
            </div>
            <span className="text-sm font-medium text-indigo-600">Doğru</span>
          </div>
          
          <div className="flex items-center gap-2">
            {activeFormat === "mistakes" ? (
              <>
                <span className="text-sm font-medium text-muted-foreground mr-2">Can:</span>
                {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      "h-7 w-7 transition-all duration-300 drop-shadow-md",
                      i < MAX_MISTAKES - mistakes 
                        ? "text-red-500 fill-current heart-beat" 
                        : "text-gray-300 fill-current opacity-40"
                    )}
                  />
                ))}
              </>
            ) : (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-md">
                {totalQuestions}/{MAX_QUESTIONS}
              </div>
            )}
          </div>
        </div>
      </header>

      <Card
        key={`${animateKey}-${currentQuestion.id}`}
        className="glass-card w-full max-w-2xl border-white/40 shadow-2xl animate-slide-up z-10"
      >
        <CardHeader className="pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-indigo-700">
                {MODE_LABELS[activeMode!]}
              </span>
            </div>
          </div>
          <CardTitle className="text-center text-2xl italic leading-relaxed font-bold text-indigo-900 sm:text-3xl px-4">
            "{currentQuestion.text}"
          </CardTitle>
          <CardDescription className="pt-3 text-center text-indigo-600 font-medium">
            🤔 Bu {MODE_LABELS[activeMode!].toLowerCase()} ne anlama gelir?
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 px-6 pb-6">
          {currentQuestion.options.map((option) => {
            const isCurrentSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQuestion.correctAnswer;

            let customClasses = "transition-all duration-200 ease-out transform active:scale-95";
            let buttonStyle = "";

            if (showFeedback) {
              if (isCurrentSelected) {
                if (isAnswerCorrect) {
                  customClasses += " success-pulse shadow-lg shadow-green-500/50";
                  buttonStyle = "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-300";
                } else {
                  customClasses += " error-shake shadow-lg shadow-red-500/50";
                  buttonStyle = "bg-gradient-to-r from-red-500 to-rose-500 text-white border-2 border-red-300";
                }
              } else if (isCorrectOption) {
                customClasses += " animate-pulse";
                buttonStyle = "bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 text-green-800";
              } else {
                customClasses += " opacity-50";
                buttonStyle = "bg-gray-100 border border-gray-200 text-gray-400";
              }
            } else if (isCurrentSelected) {
              customClasses += " scale-105";
              buttonStyle = "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-2 border-indigo-400 shadow-lg shadow-indigo-500/50";
            } else {
              buttonStyle = "bg-white border-2 border-gray-200 text-gray-700 font-medium hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-800 hover:shadow-md hover:scale-[1.02]";
            }

            return (
              <Button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
                className={cn(
                  "h-auto min-h-[4rem] w-full whitespace-normal py-4 px-4 text-left text-base rounded-xl font-medium",
                  customClasses,
                  buttonStyle
                )}
                variant="ghost"
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
              {isAnswerCorrect ? "Doğru cevap!" : `Yanlış! Doğru anlam: ${currentQuestion.definition}`}
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
