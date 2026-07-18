'use client';
import { logger } from "@/lib/logger";

import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import type React from 'react';
import { ChallengeRenderer } from '@/components/ChallengeRenderer';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Star, Coins, BookOpen } from 'lucide-react';
import { getLesson, saveLessonCompletion, calculateStars, calculateCoins } from '@/lib/lessons';
import { addToSpacedRepetition } from '@/lib/spaced-repetition';
import { generateLessonChallengesAction } from '@/app/actions';
import { validateAnswer, getCorrectAnswerText } from '@/lib/challenge-utils';
import { useAccessibility } from '@/components/AccessibilityProvider';
import type { Lesson } from '@/app/shared-schemas';

type ChallengeAnswer = Record<string, string | string[] | Record<string, string>>;

export default function LessonDetailClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subject = params.subject as string;
  const lessonId = params.lesson_id as string;
  const name = searchParams.get('name') || 'Amigo';
  const gradeParam = searchParams.get('grade') || '1';
  const { announceToScreenReader } = useAccessibility();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [answers, setAnswers] = useState<ChallengeAnswer>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [coins, setCoins] = useState(0);
  // Track which answers have been submitted and their correctness
  const [submittedAnswers, setSubmittedAnswers] = useState<string[]>([]);
  const [answerCorrectness, setAnswerCorrectness] = useState<Record<string, boolean | null>>({});
  const [shuffledWordOrders, setShuffledWordOrders] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (completed) {
      announceToScreenReader(`Lição completa! Obtiveste ${stars} estrelas e ${coins} moedas.`, 'assertive');
    }
  }, [completed, stars, coins, announceToScreenReader]);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const lessonData = await getLesson(lessonId);
        
        // If lesson exists but has no challenges, generate them!
        if (lessonData && (!lessonData.challenges || lessonData.challenges.length === 0)) {
          setGenerating(true);
          try {
            const result = await generateLessonChallengesAction({
              lessonId: lessonId,
              subject: lessonData.subject,
              gradeLevel: lessonData.grade_level,
              title: lessonData.title,
              learningObjective: lessonData.learning_objective || '',
              storyContext: lessonData.story_context || ''
            });
            
            if (result && result.challenges) {
              lessonData.challenges = result.challenges;
            }
          } catch (error) {
            logger.error("Falha ao gerar desafios automaticamente:", error);
          } finally {
            setGenerating(false);
          }
        }
        
        setLesson(lessonData);
      } catch (error) {
        logger.error("Falha ao carregar lição:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (loading || generating) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <div className="relative flex justify-center items-center h-24 w-24">
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <Star className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <p className="text-xl text-primary font-bold animate-pulse">
          {generating ? 'A criar desafios fantásticos para ti! ✨' : 'A carregar lição...'}
        </p>
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

  const handleAnswerChange = (challengeId: string, value: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      [challengeId]: value as ChallengeAnswer[string],
    }));
  };

   const handleSubmitChallenge = async () => {
     if (!currentChallenge) return;

     const isCorrect = validateAnswer(currentChallenge, answers[currentChallenge.id || '']);
     
     // Mark this answer as submitted and store its correctness
     setSubmittedAnswers(prev => [...prev, currentChallenge.id || '']);
     setAnswerCorrectness(prev => ({
       ...prev,
       [currentChallenge.id || '']: isCorrect
     }));

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

        // Add missed questions to spaced repetition for future review
        const missedChallenges = challenges.filter(
          (challenge) => !validateAnswer(challenge, answers[challenge.id || ''])
        );
        if (missedChallenges.length > 0 && lesson.subject) {
          try {
            await addToSpacedRepetition(
              name,
              missedChallenges.map((c) => ({
                question: c.question,
                correctAnswer: getCorrectAnswerText(c),
                topic: `${lesson.subject} - ${lesson.title}`,
              }))
            );
          } catch (e) {
            logger.error('[SPACED] Failed to add review items:', e);
          }
        }

        setSubmitting(false);
        setCompleted(true);
     } else {
       // Move to next challenge
       setCurrentChallengeIndex((prev) => prev + 1);
     }
   };

  if (completed) {
    return (
      <div className="space-y-8 animate-in fade-in-50">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/learn/${subject}?name=${name}&grade=${gradeParam}`}>
            <button aria-label="Voltar" className="p-2 hover:bg-secondary rounded-lg transition">
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
                <Coins className="h-8 w-8 text-amber-500 dark:text-amber-400" />
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">+{coins}</p>
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

             {/* Detailed challenge review */}
             <div className="space-y-4">
               <h3 className="text-lg font-semibold text-center">Revisão dos Desafios</h3>
               <div className="space-y-3">
                  {challenges.map((challenge, index) => {
                    const challengeId = challenge.id || '';
                    const isCorrect = answerCorrectness[challengeId];
                    
                    return (
                     <div key={index} className={`border-l-4 pl-3 ${
                       isCorrect === true 
                         ? 'border-success' 
                         : isCorrect === false 
                           ? 'border-destructive' 
                           : 'border-muted'
                     }`}>
                       <div className="flex justify-between items-start mb-1">
                         <span className="font-medium">Desafio {index + 1}:</span>
                         <span className={`text-sm ${
                           isCorrect === true 
                             ? 'text-success' 
                             : isCorrect === false 
                               ? 'text-destructive' 
                               : 'text-muted'
                         }`}>
                           {isCorrect === true ? 'Correto' : isCorrect === false ? 'Incorreto' : 'Aguardando resposta'}
                         </span>
                       </div>
                       <p className="text-sm text-muted-foreground">{challenge.question}</p>
                       {isCorrect != null && (
                         <div className="mt-1 text-xs">
                           {isCorrect === true 
                             ? '✓ Resposta correta!' 
                             : '✗ Resposta incorreta. A resposta correta era: ' + getCorrectAnswerText(challenge)}
                           </div>
                       )}
                     </div>
                   );
                 })}
               </div>
             </div>

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
          <button aria-label="Voltar" className="p-2 hover:bg-secondary rounded-lg transition">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </Link>
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-headline font-bold">{lesson.title}</h1>
          </div>
          <p className="text-muted-foreground">
            Desafio {currentChallengeIndex + 1} de {challenges.length}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2 bg-muted p-4 rounded-xl">
        <Progress value={progressPercentage} className="h-3 rounded-full" />
        <p className="text-sm text-muted-foreground text-right font-medium">
          {Math.round(progressPercentage)}% completo
        </p>
      </div>

      {/* Challenge card */}
       {currentChallenge && (
         <div className="grid md:grid-cols-3 gap-8">
           {/* Info panel on the left */}
           <div className="md:col-span-1 space-y-6">
             <Card className="bg-blue-50 dark:bg-blue-900/20">
               <CardHeader>
                 <CardTitle className="text-lg">📖 {lesson.learning_objective}</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-muted-foreground italic">{lesson.story_context}</p>
               </CardContent>
             </Card>
             
             {/* Additional decorative or info elements can go here */}
             <div className="bg-muted p-6 rounded-2xl text-center flex flex-col items-center">
                <Star className="h-16 w-16 text-yellow-400 mb-4" />
                <p className="font-semibold">Resolve desafios e ganha estrelas!</p>
                <p className="text-sm text-muted-foreground mt-1">Consegues as 3 estrelas nesta lição?</p>
             </div>
           </div>
           
           {/* Challenge itself on the right */}
           <div className="md:col-span-2">
             <Card className="w-full">
               <CardHeader>
                 <CardTitle>{currentChallenge.question}</CardTitle>
                 {currentChallenge.hint && (
                   <CardDescription>💡 Dica: {currentChallenge.hint}</CardDescription>
                 )}
               </CardHeader>
<CardContent className="space-y-6">
                  <ChallengeRenderer
                    challenge={currentChallenge}
                    answer={answers[currentChallenge.id || ''] as string | string[] | undefined}
                    isSubmitted={submittedAnswers.includes(currentChallenge.id || '')}
                    isCorrect={answerCorrectness[currentChallenge.id || '']}
                    shuffledWordOrders={shuffledWordOrders}
setShuffledWordOrders={setShuffledWordOrders}
                    onChange={(value: unknown) => {
                      handleAnswerChange(currentChallenge.id || '', value);
                     // Reset correctness when answer changes
                     setAnswerCorrectness(prev => ({
                       ...prev,
                       [currentChallenge.id || '']: null
                     }));
                   }}
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
           </div>
         </div>
       )}
    </div>
  );
}
