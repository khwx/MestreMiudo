"use client";
import { logger } from "@/lib/logger";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { generateQuiz, saveQuizResults } from '@/app/actions';
import type { PersonalizedLearningPathOutput } from '@/app/shared-schemas';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Book, Divide, Leaf, Shuffle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { useSound } from '@/lib/sounds';
import confetti from 'canvas-confetti';
import { QuizResults } from '@/components/QuizResults';
import { QuizQuestion } from '@/components/QuizQuestion';

type QuizProps = {
  studentId: string;
  gradeLevel: number;
  subject: 'Português' | 'Matemática' | 'Estudo do Meio' | 'Misto';
  title: string;
};

type Answer = {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  topic: string;
};

const loadingMessages = [
  "🧠 A conectar com o super-cérebro...",
  "📚 A escolher perguntas perfeitas...",
  "✨ A adicionar um toque de mágia...",
  "🚀 Quase pronto! A preparar o desafio...",
];

export function Quiz({ studentId, gradeLevel, subject, title }: QuizProps) {
  const [quizData, setQuizData] = useState<PersonalizedLearningPathOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const quizStarted = useRef(false);
  const { playSuccess, playError, playLevelUp } = useSound();
  
  const { toast: _toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    quizStarted.current = true;
    try {
      const data = await generateQuiz({
        studentId,
        gradeLevel,
        subject,
        numberOfQuestions: 5,
      });
      if (!data || data.quizQuestions.length === 0) {
        setError('Não foram geradas perguntas. Por favor tenta novamente.');
        setQuizData(null);
      } else {
        setQuizData(data);
      }
    } catch (err) {
      logger.error('Erro ao gerar quiz:', err);
      setError('Ocorreu um erro ao gerar o quiz. Por favor tenta novamente.');
    } finally {
      setLoading(false);
    }
  }, [studentId, gradeLevel, subject]);

  useEffect(() => {
    if (!quizStarted.current) {
      fetchQuiz();
    }
  }, [fetchQuiz]);

  const handleAnswerSelect = useCallback((answer: string) => {
    if (isAnswered) return;
    window.speechSynthesis.cancel();
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const currentQuestion = quizData!.quizQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      playSuccess();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      playError();
    }
    
    setAnswers(prev => [...prev, {
      question: currentQuestion.question,
      selectedAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      topic: currentQuestion.topic || 'Geral',
    }]);
  }, [isAnswered, quizData, currentQuestionIndex, playSuccess, playError]);

  const finishQuiz = useCallback(async () => {
    try {
      await saveQuizResults({
        studentId,
        gradeLevel,
        subject,
        score,
        answers,
        quiz: quizData,
        numberOfQuestions: quizData!.quizQuestions.length,
      });
      
      playLevelUp();
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
    } catch (error) {
      logger.error('Erro ao guardar resultados do quiz:', error);
    }
  }, [studentId, gradeLevel, subject, score, answers, quizData, playLevelUp]);

  const handleNext = useCallback(() => {
    window.speechSynthesis.cancel();
    if (currentQuestionIndex < quizData!.quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
  } else {
    setCurrentQuestionIndex(prev => prev + 1);
    finishQuiz();
  }
  }, [currentQuestionIndex, quizData, finishQuiz]);

  const handleRestart = useCallback(() => {
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setAnswers([]);
    setLoading(true);
    quizStarted.current = false;
    fetchQuiz();
  }, [fetchQuiz]);

  const handleAudioPlayback = useCallback(() => {
    if (!quizData) return;
    window.speechSynthesis.cancel();

    const q = quizData.quizQuestions[currentQuestionIndex];
    const parts = [q.question, ...q.options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`)];
    const fullText = parts.join('. ');

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'pt-PT';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, [quizData, currentQuestionIndex]);

  const isQuizFinished = useMemo(
    () => currentQuestionIndex >= (quizData?.quizQuestions.length ?? 0),
    [currentQuestionIndex, quizData]
  );

  const progress = useMemo(
    () => quizData ? ((currentQuestionIndex) / quizData.quizQuestions.length) * 100 : 0,
    [currentQuestionIndex, quizData]
  );

  const handleBack = useCallback(() => {
    router.push(`/dashboard?name=${studentId}&grade=${gradeLevel}`);
  }, [router, studentId, gradeLevel]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center p-6">
        <div className="relative flex justify-center items-center h-32 w-32">
          <Loader2 className="h-32 w-32 animate-spin text-blue-500 opacity-50" />
          <div className="absolute flex justify-center items-center h-full w-full">
            {subject === 'Português' && <Book className="h-12 w-12 text-green-600 animate-float" />}
            {subject === 'Matemática' && <Divide className="h-12 w-12 text-blue-600 animate-float" />}
            {subject === 'Estudo do Meio' && <Leaf className="h-12 w-12 text-orange-600 animate-float" />}
            {subject === 'Misto' && <Shuffle className="h-12 w-12 text-purple-600 animate-float" />}
          </div>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 font-bold animate-pulse">
          {loadingMessages[loadingMessageIndex]}
        </p>
      </div>
    );
  }

  if (error || !quizData || quizData.quizQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 p-6">
        <div className="bg-red-50 dark:bg-red-900/30 rounded-2xl p-8 border-4 border-red-300">
          <p className="text-lg text-red-600 dark:text-red-400 mb-4">{error || 'Não foram encontradas perguntas.'}</p>
          <Button onClick={handleRestart} variant="outline" size="lg" className="btn-kid">
            <RefreshCw className="mr-2 h-5 w-5" /> Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (isQuizFinished) {
    return (
      <QuizResults
        score={score}
        totalQuestions={quizData.quizQuestions.length}
        quizData={quizData}
        onRestart={handleRestart}
        onBack={handleBack}
        subject={subject}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack}
        className="gap-2"
      >
        ← Voltar ao Dashboard
      </Button>
      
      <QuizQuestion
        quizData={quizData}
        currentQuestionIndex={currentQuestionIndex}
        selectedAnswer={selectedAnswer}
        showResult={isAnswered}
        onAnswerSelect={handleAnswerSelect}
        onNext={handleNext}
        onAudioPlayback={handleAudioPlayback}
        isPlayingAudio={false}
        score={score}
        title={title}
        progress={progress}
      />
    </div>
  );
}
