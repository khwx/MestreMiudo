'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Star, Coins, CheckCircle, AlertCircle } from 'lucide-react';
import { getLesson, saveLessonCompletion, calculateStars, calculateCoins } from '@/lib/lessons';
import type { Lesson, LessonChallenge } from '@/app/shared-schemas';

type ChallengeAnswer = Record<string, string | string[]>;

export default function LessonDetailClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subject = params.subject as string;
  const lessonId = params.lesson_id as string;
  const name = searchParams.get('name') || 'Amigo';
  const gradeParam = searchParams.get('grade') || '1';

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [answers, setAnswers] = useState<ChallengeAnswer>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      const lessonData = await getLesson(lessonId);
      setLesson(lessonData);
      setLoading(false);
    };

    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">A carregar lição...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-destructive">Não foi possível carregar a lição.</p>
      </div>
    );
  }

  const challenges = lesson.challenges || [];
  const currentChallenge = challenges[currentChallengeIndex];
  const isLastChallenge = currentChallengeIndex === challenges.length - 1;
  const progressPercentage =
    challenges.length > 0 ? ((currentChallengeIndex + 1) / challenges.length) * 100 : 0;

  const handleAnswerChange = (challengeId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [challengeId]: value,
    }));
  };

  const handleSubmitChallenge = async () => {
    if (!currentChallenge) return;

    const isCorrect = validateAnswer(currentChallenge, answers[currentChallenge.id || '']);

    if (isLastChallenge) {
      // Calculate final score
      const totalAnswers = challenges.length;
      const correctAnswers = challenges.filter((challenge) =>
        validateAnswer(challenge, answers[challenge.id || ''])
      ).length;
      const finalScore = (correctAnswers / totalAnswers) * 100;
      const finalStars = calculateStars(finalScore);
      const finalCoins = calculateCoins(finalStars);

      setScore(finalScore);
      setStars(finalStars);
      setCoins(finalCoins);

      // Save completion
      setSubmitting(true);
      await saveLessonCompletion(name, lessonId, answers, Math.round(finalScore));
      setSubmitting(false);
      setCompleted(true);
    } else {
      // Move to next challenge
      setCurrentChallengeIndex((prev) => prev + 1);
    }
  };

  const validateAnswer = (challenge: LessonChallenge, answer: string | string[] | undefined) => {
    if (!answer) return false;

    if (challenge.challenge_type === 'multiple_choice') {
      return answer === challenge.content.correct_answer;
    }

    if (challenge.challenge_type === 'fill_blank') {
      const correctAnswers = challenge.content.correct_answers || [challenge.content.correct_answer];
      return correctAnswers.includes((answer as string).toLowerCase().trim());
    }

    if (challenge.challenge_type === 'word_order') {
      const correctOrder = challenge.content.correct_order;
      return JSON.stringify(answer) === JSON.stringify(correctOrder);
    }

    if (challenge.challenge_type === 'matching') {
      const correctMatches = challenge.content.correct_matches;
      return JSON.stringify(answer) === JSON.stringify(correctMatches);
    }

    return false;
  };

  if (completed) {
    return (
      <div className="space-y-8 animate-in fade-in-50">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/learn/${subject}?name=${name}&grade=${gradeParam}`}>
            <button className="p-2 hover:bg-secondary rounded-lg transition">
              <ArrowLeft className="h-6 w-6" />
            </button>
          </Link>
          <h1 className="text-4xl font-headline font-bold">Parabéns! 🎉</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Lição Completa!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            {/* Score display */}
            <div className="space-y-2">
              <p className="text-6xl font-bold text-primary">{Math.round(score)}%</p>
              <p className="text-muted-foreground">O teu resultado</p>
            </div>

            {/* Stars display */}
            <div className="space-y-2">
              <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-12 w-12 ${
                      i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">{stars} estrelas</p>
            </div>

            {/* Coins earned */}
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg space-y-2">
              <p className="text-muted-foreground">Moedas ganhas</p>
              <div className="flex justify-center items-center gap-2">
                <Coins className="h-8 w-8 text-amber-500" />
                <p className="text-3xl font-bold text-amber-600">+{coins}</p>
              </div>
            </div>

            {/* Messages based on performance */}
            {score === 100 && (
              <p className="text-lg text-green-600 dark:text-green-400">
                ✨ Desempenho perfeito! Podes ficar muito orgulhoso!
              </p>
            )}
            {score >= 80 && score < 100 && (
              <p className="text-lg text-blue-600 dark:text-blue-400">
                🌟 Excelente trabalho! Estás no bom caminho!
              </p>
            )}
            {score >= 60 && score < 80 && (
              <p className="text-lg text-purple-600 dark:text-purple-400">
                💪 Bem feito! Continua a praticar!
              </p>
            )}
            {score < 60 && (
              <p className="text-lg text-orange-600 dark:text-orange-400">
                📚 Não desanimes! Tenta novamente para melhorar!
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-4 justify-center pt-4">
              <Link href={`/dashboard/learn/${subject}?name=${name}&grade=${gradeParam}`}>
                <Button>Voltar às Lições</Button>
              </Link>
              <Link href={`/dashboard?name=${name}&grade=${gradeParam}`}>
                <Button variant="outline">Ir para Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/learn/${subject}?name=${name}&grade=${gradeParam}`}>
          <button className="p-2 hover:bg-secondary rounded-lg transition">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </Link>
        <div className="flex-grow">
          <h1 className="text-3xl font-headline font-bold">{lesson.title}</h1>
          <p className="text-muted-foreground">
            Desafio {currentChallengeIndex + 1} de {challenges.length}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={progressPercentage} />
        <p className="text-sm text-muted-foreground text-right">
          {Math.round(progressPercentage)}% completo
        </p>
      </div>

      {/* Story context and learning objective */}
      {currentChallengeIndex === 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-lg">📖 {lesson.learning_objective}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic">{lesson.story_context}</p>
          </CardContent>
        </Card>
      )}

      {/* Challenge card */}
      {currentChallenge && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{currentChallenge.question}</CardTitle>
            {currentChallenge.hint && (
              <CardDescription>💡 Dica: {currentChallenge.hint}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <ChallengeRenderer
              challenge={currentChallenge}
              answer={answers[currentChallenge.id || '']}
              onChange={(value) =>
                handleAnswerChange(currentChallenge.id || '', value)
              }
            />

            <Button
              onClick={handleSubmitChallenge}
              disabled={submitting || !answers[currentChallenge.id || '']}
              className="w-full"
            >
              {isLastChallenge ? 'Terminar Lição' : 'Próximo Desafio'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Challenge renderer component
function ChallengeRenderer({
  challenge,
  answer,
  onChange,
}: {
  challenge: LessonChallenge;
  answer: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}) {
  if (challenge.challenge_type === 'multiple_choice') {
    return (
      <div className="space-y-3">
        {challenge.content.options?.map((option: string) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`w-full p-3 text-left rounded-lg border-2 transition ${
              answer === option
                ? 'border-primary bg-primary/10'
                : 'border-muted hover:border-primary'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  if (challenge.challenge_type === 'fill_blank') {
    return (
      <input
        type="text"
        value={answer || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escreve a resposta..."
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
    );
  }

  if (challenge.challenge_type === 'word_order') {
    const words = challenge.content.words || [];
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Arrasta as palavras para a ordem correta:</p>
        <div className="flex flex-wrap gap-2">
          {words.map((word: string, index: number) => (
            <div
              key={index}
              className="px-3 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold cursor-move"
            >
              {word}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (challenge.challenge_type === 'matching') {
    const pairs = challenge.content.pairs || [];
    return (
      <div className="space-y-3">
        {pairs.map((pair: any, index: number) => (
          <div key={index} className="flex gap-3 items-center">
            <div className="flex-1 p-3 bg-secondary rounded-lg">{pair.left}</div>
            <select
              value={(answer as any)?.[pair.left] || ''}
              onChange={(e) =>
                onChange({
                  ...((answer as any) || {}),
                  [pair.left]: e.target.value,
                })
              }
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleciona...</option>
              {pair.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-muted-foreground">Tipo de desafio não suportado</p>;
}
