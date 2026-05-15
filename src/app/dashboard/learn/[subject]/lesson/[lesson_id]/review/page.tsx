'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Star } from 'lucide-react';
import { getLesson, getLessonProgress } from '@/lib/lessons';
import type { Lesson, LessonChallenge, LessonCompletion } from '@/app/shared-schemas';

export default function LessonReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = params.subject as string;
  const lessonId = params.lesson_id as string;
  const name = searchParams.get('name') || 'Amigo';
  const gradeParam = searchParams.get('grade') || '1';
  const grade = parseInt(gradeParam, 10);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completion, setCompletion] = useState<LessonCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [correctness, setCorrectness] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      const lessonData = await getLesson(lessonId);
      const completionData = await getLessonProgress(name, lessonId);
      
      setLesson(lessonData);
      setCompletion(completionData);
      
      // Calculate correctness for each challenge
      if (lessonData && completionData && completionData.answers) {
        const correctnessMap: Record<string, boolean> = {};
        const answers = completionData.answers;
        lessonData.challenges?.forEach((challenge) => {
          const challengeId = challenge.id || '';
          const studentAnswer = answers[challengeId];
          if (studentAnswer !== undefined) {
            correctnessMap[challengeId] = validateAnswer(challenge, studentAnswer);
          }
        });
        setCorrectness(correctnessMap);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [lessonId, name]);

  const validateAnswer = (challenge: LessonChallenge, answer: string | string[] | undefined): boolean => {
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

  const getCorrectAnswerText = (challenge: LessonChallenge): string => {
    if (challenge.challenge_type === 'multiple_choice') {
      return challenge.content.correct_answer;
    }

    if (challenge.challenge_type === 'fill_blank') {
      const correctAnswers = challenge.content.correct_answers || [challenge.content.correct_answer];
      return correctAnswers.join(' ou ');
    }

    if (challenge.challenge_type === 'word_order') {
      const correctOrder = challenge.content.correct_order;
      return correctOrder ? correctOrder.join(' ') : 'ordem correta';
    }

    if (challenge.challenge_type === 'matching') {
      const correctMatches = challenge.content.correct_matches;
      return Object.entries(correctMatches || {}).map(([key, value]) => `${key} -> ${value}`).join(', ');
    }

    return 'resposta correta';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">A carregar detalhes da lição...</p>
      </div>
    );
  }

  if (!lesson || !completion) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-destructive">Não foi possível carregar os detalhes da lição.</p>
      </div>
    );
  }

  const totalChallenges = lesson.challenges?.length || 0;
  const correctCount = Object.values(correctness).filter(Boolean).length;
  const score = totalChallenges > 0 ? (correctCount / totalChallenges) * 100 : 0;
  const stars = score >= 100 ? 3 : score >= 80 ? 2 : score >= 60 ? 1 : 0;

  return (
    <div className="space-y-8 animate-in fade-in-50 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </Button>
        <div className="flex-grow">
          <h1 className="text-3xl font-headline font-bold">Revisão da Lição</h1>
          <p className="text-muted-foreground">{lesson.title}</p>
        </div>
      </div>

      {/* Score summary */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">O Teu Desempenho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-5xl font-bold text-primary text-center">{Math.round(score)}%</p>
            <p className="text-muted-foreground text-center">Resultado final</p>
          </div>

          <div className="flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <Star
                key={i}
                className={`h-10 w-10 ${
                  i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{correctCount}</p>
              <p className="text-sm text-muted-foreground">Desafios corretos</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{totalChallenges - correctCount}</p>
              <p className="text-sm text-muted-foreground">Desafios incorretos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Detalhes dos Desafios</CardTitle>
          <CardDescription>
            {correctCount === totalChallenges
              ? '🎉 Parabéns! Todos os desafios corretos!'
              : '📚 Revisa os teus erros para melhorar!'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lesson.challenges?.map((challenge, index) => {
            const challengeId = challenge.id || '';
            const isCorrect = correctness[challengeId];
            const studentAnswer = completion.answers?.[challengeId];

            return (
              <div
                key={index}
                className={`border-l-4 pl-3 space-y-2 ${
                  isCorrect === true
                    ? 'border-success bg-success/5' 
                    : isCorrect === false
                      ? 'border-destructive bg-destructive/5' 
                      : 'border-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Desafio {index + 1}:</span>
                  {isCorrect === true ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : isCorrect === false ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : null}
                  <span className={`text-sm font-medium ${
                    isCorrect === true
                      ? 'text-success' 
                      : isCorrect === false
                        ? 'text-destructive' 
                        : 'text-muted-foreground'
                  }`}>
                    {isCorrect === true ? 'Correto' : isCorrect === false ? 'Incorreto' : 'Aguardando'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{challenge.question}</p>
                {studentAnswer !== undefined && (
                  <div className="text-xs space-y-1">
                    <p><strong>Resposta:</strong> {studentAnswer}</p>
                    {isCorrect === false && (
                      <p><strong>Resposta correta:</strong> {getCorrectAnswerText(challenge)}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-4 justify-center pt-4">
        <Button onClick={() => router.push(`/dashboard/learn/${subject}/lesson/${lessonId}?name=${name}&grade=${gradeParam}`)}>
          Tentar novamente
        </Button>
        <Link href={`/dashboard/learn/${subject}?name=${name}&grade=${gradeParam}`}>
          <Button variant="outline">Voltar às Lições</Button>
        </Link>
      </div>
    </div>
  );
}
