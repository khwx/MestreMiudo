"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { RotateCw, Trophy, Flame, Sparkles, Check, X } from "lucide-react";
import { useSound } from "@/lib/sounds";
import confetti from "canvas-confetti";
import {
  generateSequencePuzzle,
  checkSequenceAnswer,
  type Grade,
  type SequencePuzzle,
} from "@/lib/magic-sequence";

const TOTAL_ROUNDS = 10;
const TIMER_SECONDS = 20;

function renderTerm(term: number | null): string {
  return term === null ? "___" : String(term);
}

export function MagicSequenceGame() {
  const [grade, setGrade] = useState<Grade | null>(null);
  const [puzzles, setPuzzles] = useState<SequencePuzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef<(() => void) | null>(null);
  const { playSuccess, playError, playGameWin, playLevelUp } = useSound();

  const startGame = useCallback((selectedGrade: Grade) => {
    setGrade(selectedGrade);
    setPuzzles(Array.from({ length: TOTAL_ROUNDS }, () => generateSequencePuzzle(selectedGrade)));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(TIMER_SECONDS);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setTotalAnswered(0);
    setGameOver(false);
  }, []);

  const endGame = useCallback(() => {
    setGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);
    playGameWin();
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
  }, [playGameWin]);

  const moveToNext = useCallback(() => {
    if (currentIndex + 1 >= TOTAL_ROUNDS) {
      endGame();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(TIMER_SECONDS);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [currentIndex, endGame]);

  const handleTimeout = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowResult(true);
    setIsCorrect(false);
    setStreak(0);
    setTotalAnswered((prev) => prev + 1);
    playError();
    setTimeout(moveToNext, 1400);
  }, [moveToNext, playError]);

  onTimeoutRef.current = handleTimeout;

  useEffect(() => {
    if (gameOver || !grade || showResult) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeoutRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, gameOver, grade, showResult]);

  const handleAnswer = useCallback((selected: number) => {
    if (showResult || gameOver) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const puzzle = puzzles[currentIndex];
    const correct = checkSequenceAnswer(puzzle, selected);

    setSelectedAnswer(selected);
    setShowResult(true);
    setIsCorrect(correct);
    setTotalAnswered((prev) => prev + 1);

    if (correct) {
      const points = 100 + timeLeft * 5;
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        if (newStreak > 0 && newStreak % 5 === 0) {
          playLevelUp();
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
        return newStreak;
      });
      playSuccess();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } });
    } else {
      setStreak(0);
      playError();
    }

    setTimeout(moveToNext, 1400);
  }, [showResult, gameOver, puzzles, currentIndex, timeLeft, bestStreak, playSuccess, playError, playLevelUp, moveToNext]);

  if (!grade) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <Sparkles className="h-16 w-16 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Escolhe o teu ano escolar</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {([1, 2, 3, 4] as Grade[]).map((g) => (
            <Button
              key={g}
              onClick={() => startGame(g)}
              variant="outline"
              className="h-20 text-lg font-bold border-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all"
            >
              {g}º Ano
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (gameOver) {
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <Trophy className="h-20 w-20 text-yellow-500" />
        <h2 className="text-3xl font-bold text-foreground">Resultados</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">Pontuação</p>
            <p className="text-3xl font-bold text-primary">{score}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">Precisão</p>
            <p className="text-3xl font-bold text-green-500">{accuracy}%</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">Melhor Sequência</p>
            <p className="text-3xl font-bold text-orange-500">{bestStreak}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">Acertos</p>
            <p className="text-3xl font-bold text-blue-500">{correctCount}</p>
          </div>
        </div>
        <p className="text-muted-foreground">
          {correctCount} de {totalAnswered} corretas
        </p>
        <div className="flex gap-3">
          <Button onClick={() => startGame(grade)} size="lg" className="gap-2">
            <RotateCw className="h-5 w-5" />
            Jogar Novamente
          </Button>
          <Button onClick={() => setGrade(null)} variant="outline" size="lg">
            Mudar Ano
          </Button>
        </div>
      </div>
    );
  }

  const puzzle = puzzles[currentIndex];
  const progress = (currentIndex / TOTAL_ROUNDS) * 100;
  const timerColor = timeLeft > 12 ? "text-green-500" : timeLeft > 6 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <span className="text-sm font-medium text-muted-foreground">{grade}º Ano</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-foreground">{score}</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold text-orange-500">{streak}</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-2xl bg-secondary rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-sm text-muted-foreground -mt-2">
        Pergunta {currentIndex + 1} de {TOTAL_ROUNDS}
      </p>

      <div className="flex flex-col items-center gap-1">
        <div className={cn("flex items-center gap-2", timerColor)}>
          <span className="text-2xl font-bold">{timeLeft}s</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 text-center w-full max-w-2xl">
        <p className="text-sm text-muted-foreground mb-3">Qual é o número que falta?</p>
        <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-wide">
          {puzzle.terms.map((t, i) => (
            <span key={i} className="mx-1">
              {renderTerm(t)}
              {i < puzzle.terms.length - 1 ? " , " : ""}
            </span>
          ))}
        </p>
        <p className="text-xs text-muted-foreground mt-3">Dica: {puzzle.pattern}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
        {puzzle.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isAnsweredOption = showResult && option === puzzle.correct;
          const isWrongSelected = showResult && isSelected && !isCorrect;

          return (
            <button
              key={`${currentIndex}-${option}`}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
              className={cn(
                "relative flex items-center justify-center gap-2 h-20 rounded-xl text-2xl font-bold transition-all duration-200 border-2",
                !showResult && "bg-primary/90 hover:bg-primary border-primary-foreground/20 text-primary-foreground",
                isAnsweredOption && "bg-green-500 border-green-700 ring-4 ring-green-300 dark:ring-green-700",
                isWrongSelected && "bg-red-500 border-red-700 ring-4 ring-red-300 dark:ring-red-700",
                showResult && !isAnsweredOption && !isWrongSelected && "opacity-40",
              )}
            >
              {showResult && isAnsweredOption && <Check className="absolute right-2 top-2 h-5 w-5" />}
              {isWrongSelected && <X className="absolute right-2 top-2 h-5 w-5" />}
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className={cn(
          "text-base font-bold px-6 py-2 rounded-xl animate-bounce text-center max-w-2xl",
          isCorrect
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        )}>
          {isCorrect
            ? `Correto! +${100 + timeLeft * 5} pontos`
            : `Incorreto! Resposta: ${puzzle.correct}`}
          <span className="block text-xs font-normal mt-1">{puzzle.explanation}</span>
        </div>
      )}
    </div>
  );
}
