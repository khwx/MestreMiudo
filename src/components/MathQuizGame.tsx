"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { RotateCw, Trophy, Flame, Clock, Calculator, Minus, Plus, X } from 'lucide-react';
import { useSound } from '@/lib/sounds';
import confetti from 'canvas-confetti';

type Grade = 1 | 2 | 3 | 4;

type Question = {
  text: string;
  correct: number;
  options: number[];
};

const ANSWER_COLORS = [
  'bg-red-500 hover:bg-red-600 border-red-700',
  'bg-blue-500 hover:bg-blue-600 border-blue-700',
  'bg-yellow-400 hover:bg-yellow-500 border-yellow-600',
  'bg-green-500 hover:bg-green-600 border-green-700',
];

const ANSWER_ICONS = [
  <Minus key="red" className="h-6 w-6" />,
  <Plus key="blue" className="h-6 w-6" />,
  <X key="yellow" className="h-6 w-6" />,
  <Calculator key="green" className="h-6 w-6" />,
];

const TOTAL_QUESTIONS = 10;
const TIMER_SECONDS = 15;

function generateQuestion(grade: Grade): Question {
  const operations = getOperationsForGrade(grade);
  const operation = operations[Math.floor(Math.random() * operations.length)];
  return operation();
}

function getOperationsForGrade(grade: Grade): (() => Question)[] {
  const generators: (() => Question)[] = [];

  // Addition always available
  generators.push(() => {
    const max = getAdditionMax(grade);
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const correct = a + b;
    return createQuestion(`${a} + ${b}`, correct);
  });

  // Subtraction from grade 1+
  generators.push(() => {
    const max = getAdditionMax(grade);
    const a = Math.floor(Math.random() * max) + 2;
    const b = Math.floor(Math.random() * Math.min(a - 1, max)) + 1;
    const correct = a - b;
    return createQuestion(`${a} - ${b}`, correct);
  });

  // Multiplication from grade 2+
  if (grade >= 2) {
    generators.push(() => {
      const max = grade === 2 ? 5 : grade === 3 ? 10 : 12;
      const a = Math.floor(Math.random() * max) + 1;
      const b = Math.floor(Math.random() * max) + 1;
      const correct = a * b;
      return createQuestion(`${a} × ${b}`, correct);
    });
  }

  // Division from grade 3+
  if (grade >= 3) {
    generators.push(() => {
      const max = grade === 3 ? 10 : 12;
      const b = Math.floor(Math.random() * max) + 1;
      const result = Math.floor(Math.random() * max) + 1;
      const a = b * result;
      return createQuestion(`${a} ÷ ${b}`, result);
    });
  }

  return generators;
}

function getAdditionMax(grade: Grade): number {
  switch (grade) {
    case 1: return 10;
    case 2: return 50;
    case 3: return 100;
    case 4: return 1000;
  }
}

function createQuestion(text: string, correct: number): Question {
  const options = new Set<number>([correct]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 20) - 10;
    const wrong = correct + offset;
    if (wrong >= 0 && wrong !== correct) {
      options.add(wrong);
    }
  }
  const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
  return { text, correct, options: shuffled };
}

function calculatePoints(timeLeft: number): number {
  const basePoints = 100;
  const timeBonus = Math.floor(timeLeft * 10);
  return basePoints + timeBonus;
}

export function MathQuizGame() {
  const [grade, setGrade] = useState<Grade | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
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
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef<(() => void) | null>(null);
  const { playSuccess, playError, playGameWin, playLevelUp } = useSound();

  const startGame = useCallback((selectedGrade: Grade) => {
    setGrade(selectedGrade);
    const qs = Array.from({ length: TOTAL_QUESTIONS }, () => generateQuestion(selectedGrade));
    setQuestions(qs);
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
    setTotalTimeTaken(0);
  }, []);

  const endGame = useCallback(() => {
    setGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);
    playGameWin();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  }, [playGameWin]);

  const moveToNext = useCallback(() => {
    if (currentIndex + 1 >= TOTAL_QUESTIONS) {
      endGame();
    } else {
      setCurrentIndex(prev => prev + 1);
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
    setTotalAnswered(prev => prev + 1);
    playError();
    setTimeout(moveToNext, 1200);
  }, [moveToNext, playError]);

  onTimeoutRef.current = handleTimeout;

  useEffect(() => {
    if (gameOver || !grade || showResult) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
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

    const question = questions[currentIndex];
    const correct = selected === question.correct;
    const timeTaken = TIMER_SECONDS - timeLeft;

    setSelectedAnswer(selected);
    setShowResult(true);
    setIsCorrect(correct);
    setTotalAnswered(prev => prev + 1);
    setTotalTimeTaken(prev => prev + timeTaken);

    if (correct) {
      const points = calculatePoints(timeLeft);
      setScore(prev => prev + points);
      setCorrectCount(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        if (newStreak > 0 && newStreak % 5 === 0) {
          playLevelUp();
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
        return newStreak;
      });
      playSuccess();
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.5 },
      });
    } else {
      setStreak(0);
      playError();
    }

    setTimeout(moveToNext, 1200);
  }, [showResult, gameOver, questions, currentIndex, timeLeft, bestStreak, playSuccess, playError, playLevelUp, moveToNext]);

  // Grade selector screen
  if (!grade) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <Calculator className="h-16 w-16 text-primary" />
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

  // Game over screen
  if (gameOver) {
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const avgTime = totalAnswered > 0 ? (totalTimeTaken / totalAnswered).toFixed(1) : '0';

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
            <p className="text-sm text-muted-foreground">Tempo Médio</p>
            <p className="text-3xl font-bold text-blue-500">{avgTime}s</p>
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

  const question = questions[currentIndex];
  const progress = ((currentIndex) / TOTAL_QUESTIONS) * 100;
  const timerPercentage = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 10 ? 'text-green-500' : timeLeft > 5 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{grade}º Ano</span>
        </div>
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

      {/* Progress bar */}
      <div className="w-full max-w-2xl bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground -mt-2">
        Pergunta {currentIndex + 1} de {TOTAL_QUESTIONS}
      </p>

      {/* Timer */}
      <div className="flex flex-col items-center gap-1">
        <div className={cn("flex items-center gap-2", timerColor)}>
          <Clock className="h-5 w-5" />
          <span className="text-2xl font-bold">{timeLeft}s</span>
        </div>
        <div className="w-48 bg-secondary rounded-full h-1.5">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-1000",
              timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-2xl p-8 text-center w-full max-w-2xl">
        <p className="text-4xl font-bold text-foreground">{question.text} = ?</p>
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isAnsweredOption = showResult && option === question.correct;
          const isWrongSelected = showResult && isSelected && !isCorrect;

          return (
            <button
              key={`${currentIndex}-${option}`}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
              className={cn(
                "relative flex items-center justify-center gap-2 h-20 rounded-xl text-white text-2xl font-bold transition-all duration-200 border-2",
                !showResult && ANSWER_COLORS[index],
                isAnsweredOption && "bg-green-500 border-green-700 ring-4 ring-green-300 dark:ring-green-700",
                isWrongSelected && "bg-red-500 border-red-700 ring-4 ring-red-300 dark:ring-red-700",
                showResult && !isAnsweredOption && !isWrongSelected && "opacity-40",
              )}
            >
              <span className="hidden sm:inline">{ANSWER_ICONS[index]}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showResult && (
        <div className={cn(
          "text-lg font-bold px-6 py-2 rounded-xl animate-bounce",
          isCorrect
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {isCorrect ? `Correto! +${calculatePoints(timeLeft)} pontos` : `Incorreto! Resposta: ${question.correct}`}
        </div>
      )}
    </div>
  );
}
