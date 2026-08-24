"use client";
import { logger } from "@/lib/logger";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { generateQuiz, saveQuizResults, awardQuizPoints, getFullQuizHistory, unlockAchievement } from '@/app/actions';
import type { PersonalizedLearningPathOutput } from '@/app/shared-schemas';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Book, Divide, Leaf, Shuffle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSound } from '@/lib/sounds';
import { useAccessibility } from '@/components/AccessibilityProvider';
import confetti from 'canvas-confetti';
import { QuizResults } from '@/components/QuizResults';
import { QuizQuestion } from '@/components/QuizQuestion';
import { BadgePopup } from '@/components/BadgePopup';
import { getBadgeByAnyId } from '@/lib/badges';
import { selectPortugueseVoice } from '@/lib/tts-voice';
import { getWrongQuestions, getWeakTopicsFromAnswers, getQuestionsForWeakTopics } from '@/lib/quiz-practice';
import { buildQuizResultAnnouncement } from '@/lib/quiz-announcements';
import type { QuizChallenge } from '@/lib/challenge-share';

type QuizProps = {
  studentId: string;
  gradeLevel: number;
  subject: 'Português' | 'Matemática' | 'Estudo do Meio' | 'Misto';
  title: string;
  challenge?: QuizChallenge | null;
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

export function Quiz({ studentId, gradeLevel, subject, title, challenge = null }: QuizProps) {
  const [quizData, setQuizData] = useState<PersonalizedLearningPathOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [newBadge, setNewBadge] = useState<{ name: string; description: string; icon: string } | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [challengeDismissed, setChallengeDismissed] = useState(false);
  const quizStarted = useRef(false);
  const { playSuccess, playError, playLevelUp } = useSound();
  const { settings: a11y, announceToScreenReader } = useAccessibility();
  
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
      if (a11y.soundEnabled) playSuccess();
      if (a11y.reducedMotion === false) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      if (a11y.soundEnabled) playError();
    }
    
    setAnswers(prev => [...prev, {
      question: currentQuestion.question,
      selectedAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      topic: currentQuestion.topic || 'Geral',
    }]);
  }, [isAnswered, quizData, currentQuestionIndex, playSuccess, playError, a11y.soundEnabled, a11y.reducedMotion]);

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
      
      // Award points for gamification system
      const pointsResult = await awardQuizPoints(studentId, score, quizData!.quizQuestions.length, gradeLevel);
      logger.log(`[QUIZ] Points awarded: ${pointsResult.points}`);
      
      // Check for new badges
      try {
        const history = await getFullQuizHistory(studentId);
        const totalQuizzes = history.length;
        const perfectScores = history.filter(h => h.score === h.numberOfQuestions).length;
        
        // Check for first quiz badge
        if (totalQuizzes === 1) {
          const badge = getBadgeByAnyId('first_quiz');
          if (badge) {
            await unlockAchievement(studentId, 'first_quiz');
            setNewBadge({ name: badge.name, description: badge.description, icon: badge.icon });
          }
        }
        
        // Check for perfect score badge
        if (score === quizData!.quizQuestions.length && perfectScores >= 1) {
          const badge = getBadgeByAnyId('perfect_score');
          if (badge && !newBadge) {
            await unlockAchievement(studentId, 'perfect_score');
            setNewBadge({ name: badge.name, description: badge.description, icon: badge.icon });
          }
        }
      } catch (badgeError) {
        logger.error('[QUIZ] Failed to check badges:', badgeError);
      }
      
      if (a11y.soundEnabled) playLevelUp();
      if (a11y.reducedMotion === false) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      logger.error('Erro ao guardar resultados do quiz:', error);
    }
  }, [studentId, gradeLevel, subject, score, answers, quizData, playLevelUp, newBadge, a11y.soundEnabled, a11y.reducedMotion]);

  const handleNext = useCallback(() => {
    window.speechSynthesis.cancel();
    if (currentQuestionIndex < quizData!.quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
  } else {
    setCurrentQuestionIndex(prev => prev + 1);
    if (!practiceMode) {
      finishQuiz();
    }
  }
  }, [currentQuestionIndex, quizData, practiceMode, finishQuiz]);

  const handlePracticeWrong = useCallback(() => {
    if (!quizData) return;
    const wrong = getWrongQuestions(quizData.quizQuestions, answers);
    if (wrong.length === 0) return;
    setQuizData({ ...quizData, quizQuestions: wrong });
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setAnswers([]);
    setPracticeMode(true);
    setNewBadge(null);
  }, [quizData, answers]);

  const handlePracticeWeakTopics = useCallback(() => {
    if (!quizData) return;
    const weakTopics = getWeakTopicsFromAnswers(answers);
    if (weakTopics.length === 0) return;
    const weakQuestions = getQuestionsForWeakTopics(quizData.quizQuestions, weakTopics);
    if (weakQuestions.length === 0) return;
    setQuizData({ ...quizData, quizQuestions: weakQuestions });
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setAnswers([]);
    setPracticeMode(true);
    setNewBadge(null);
  }, [quizData, answers]);

  const handleRestart = useCallback(() => {
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setAnswers([]);
    setPracticeMode(false);
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

    const voices = typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : [];
    const portugueseVoice = selectPortugueseVoice(voices);
    if (portugueseVoice) {
      utterance.voice = portugueseVoice as SpeechSynthesisVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [quizData, currentQuestionIndex]);

  const isQuizFinished = useMemo(
    () => currentQuestionIndex >= (quizData?.quizQuestions.length ?? 0),
    [currentQuestionIndex, quizData]
  );

  useEffect(() => {
    if (isQuizFinished && quizData) {
      announceToScreenReader(
        buildQuizResultAnnouncement({
          score,
          total: quizData.quizQuestions.length,
          subject,
          practiceMode,
        })
      );
    }
  }, [isQuizFinished, quizData, score, subject, practiceMode, announceToScreenReader]);

  useEffect(() => {
    if (newBadge) {
      announceToScreenReader(`Parabéns! Desbloqueaste uma nova conquista: ${newBadge.name}. ${newBadge.description}`, 'assertive');
    }
  }, [newBadge, announceToScreenReader]);

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
      <>
        {newBadge && (
          <BadgePopup
            badgeName={newBadge.name}
            badgeDescription={newBadge.description}
            badgeIcon={newBadge.icon}
            onClose={() => setNewBadge(null)}
          />
        )}
         <QuizResults
          score={score}
          totalQuestions={quizData.quizQuestions.length}
          quizData={quizData}
          onRestart={handleRestart}
          onBack={handleBack}
          subject={subject}
          practiceMode={practiceMode}
          wrongCount={practiceMode ? 0 : answers.filter((a) => !a.isCorrect).length}
          onPracticeWrong={handlePracticeWrong}
          weakTopics={practiceMode ? null : getWeakTopicsFromAnswers(answers)}
          onPracticeWeakTopics={handlePracticeWeakTopics}
          studentName={studentId}
          grade={gradeLevel}
          challenge={challenge}
        />
      </>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {challenge && !challengeDismissed && (
        <div
          className="flex items-center justify-between gap-3 rounded-2xl border-2 border-purple-300 bg-purple-50 dark:bg-purple-900/20 p-4 text-purple-800 dark:text-purple-200"
          role="status"
        >
          <span className="font-bold">
            🏅 Foste desafiado por <span className="underline">{challenge.from}</span>! Ele/a fez{' '}
            {challenge.score}/{challenge.total} no quiz de {challenge.subject}. Bate a marca!
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChallengeDismissed(true)}
            aria-label="Dispensar desafio"
            className="shrink-0"
          >
            ✕
          </Button>
        </div>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack}
        aria-label="Voltar ao Dashboard"
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
