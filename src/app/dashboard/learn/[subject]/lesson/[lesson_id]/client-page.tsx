'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Star, Coins, CheckCircle, AlertCircle } from 'lucide-react';
import { getLesson, saveLessonCompletion, calculateStars, calculateCoins } from '@/lib/lessons';
import { addToSpacedRepetition } from '@/lib/spaced-repetition';
import { generateLessonChallengesAction } from '@/app/actions';
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
    const fetchLesson = async () => {
      let lessonData = await getLesson(lessonId);
      
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
          console.error("Failed to generate challenges automatically:", error);
        } finally {
          setGenerating(false);
        }
      }
      
      setLesson(lessonData);
      setLoading(false);
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

  const handleAnswerChange = (challengeId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [challengeId]: value,
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
            console.error('[SPACED] Failed to add review items:', e);
          }
        }

        setSubmitting(false);
        setCompleted(true);
     } else {
       // Move to next challenge
       setCurrentChallengeIndex((prev) => prev + 1);
     }
   };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const validateAnswer = (challenge: LessonChallenge, answer: string | string[] | undefined) => {
    if (!answer) return false;

    if (challenge.challenge_type === 'multiple_choice') {
      return answer === challenge.content.correct_answer;
    }

    if (challenge.challenge_type === 'fill_blank') {
      const correctAnswers = challenge.content.correct_answers || [challenge.content.correct_answer];
      const normalizedAnswer = normalizeText(answer as string);
      return correctAnswers.some((ca: string) => normalizeText(ca) === normalizedAnswer);
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

             {/* Detailed challenge review */}
             <div className="space-y-4">
               <h3 className="text-lg font-semibold text-center">Revisão dos Desafios</h3>
               <div className="space-y-3">
                 {challenges.map((challenge, index) => {
                   const challengeId = challenge.id || '';
                   const isCorrect = answerCorrectness[challengeId];
                   const studentAnswer = answers[challengeId];
                   
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
          isSubmitted={submittedAnswers.includes(currentChallenge.id || '')}
          isCorrect={answerCorrectness[currentChallenge.id || '']}
          shuffledWordOrders={shuffledWordOrders}
          setShuffledWordOrders={setShuffledWordOrders}
          onChange={(value) => {
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
       )}
    </div>
  );
}

// Challenge renderer component
function ChallengeRenderer({
  challenge,
  answer,
  onChange,
  isSubmitted,
  isCorrect,
  shuffledWordOrders,
  setShuffledWordOrders,
}: {
  challenge: LessonChallenge;
  answer: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  isSubmitted?: boolean;
  isCorrect?: boolean | null;
  shuffledWordOrders: Record<string, string[]>;
  setShuffledWordOrders: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}) {
   if (challenge.challenge_type === 'multiple_choice') {
     return (
       <div className="space-y-3">
         {challenge.content.options?.map((option: string) => {
           const isSelected = answer === option;
           const isCorrectOption = isSubmitted && isCorrect != null && 
                                 isCorrect && challenge.content.correct_answer === option;
           const isWrongOption = isSubmitted && isCorrect != null && 
                               !isCorrect && challenge.content.correct_answer === option;
           
           return (
             <button
               key={option}
               onClick={!isSubmitted ? () => onChange(option) : undefined}
               className={`w-full p-3 text-left rounded-lg border-2 transition ${
                 isSelected
                   ? 'border-primary bg-primary/10'
                   : isCorrectOption
                     ? 'border-success bg-success/10'
                     : isWrongOption
                       ? 'border-destructive bg-destructive/10'
                       : 'border-muted hover:border-primary'
               } ${
                 !isSubmitted && isSelected && 'hover:border-primary'
               }`}
               disabled={isSubmitted}
             >
               {isSubmitted && isCorrect != null && (
                 isCorrectOption ? '✓ ' : isWrongOption ? '✗ ' : ''
               )}
               {option}
             </button>
           );
         })}
       </div>
     );
   }

   if (challenge.challenge_type === 'fill_blank') {
     const isCorrectAnswer = isSubmitted && isCorrect != null && isCorrect;
     const isWrongAnswer = isSubmitted && isCorrect != null && !isCorrect;
     
     return (
       <input
         type="text"
         value={answer || ''}
         onChange={!isSubmitted ? (e) => onChange(e.target.value) : undefined}
         placeholder="Escreve a resposta..."
         className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
           isCorrectAnswer
             ? 'border-success'
             : isWrongAnswer
               ? 'border-destructive'
               : isSubmitted
                 ? 'border-muted'
                 : 'focus:ring-primary'
         }`}
         disabled={isSubmitted}
       />
     );
   }

  if (challenge.challenge_type === 'word_order') {
    const isCorrectAnswer = isSubmitted && isCorrect != null && isCorrect;
    const isWrongAnswer = isSubmitted && isCorrect != null && !isCorrect;
    const correctOrder: string[] = challenge.content.correct_order || [];
    const selectedWords: string[] = (answer as string[]) || [];

    const availableWords = (() => {
      if (!shuffledWordOrders[challenge.id || '']) {
        const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
        setShuffledWordOrders(prev => ({ ...prev, [challenge.id || '']: shuffled }));
        return shuffled;
      }
      const base = shuffledWordOrders[challenge.id || ''];
      const unselected: string[] = [];
      const used = [...selectedWords];
      for (const w of base) {
        const idx = used.indexOf(w);
        if (idx !== -1) {
          used.splice(idx, 1);
        } else {
          unselected.push(w);
        }
      }
      return unselected;
    })();

    const handleWordClick = (word: string) => {
      if (isSubmitted) return;
      const newSelected = [...selectedWords, word];
      onChange(newSelected);
    };

    const handleRemoveWord = (index: number) => {
      if (isSubmitted) return;
      const newSelected = [...selectedWords];
      newSelected.splice(index, 1);
      onChange(newSelected);
    };

    return (
      <div className={`space-y-4 ${isSubmitted && isCorrect != null ? (
        isCorrectAnswer
        ? 'border-success bg-success/50 p-4 rounded-lg'
        : isWrongAnswer
        ? 'border-destructive bg-destructive/50 p-4 rounded-lg'
        : ''
      ) : ''}`}>
        <p className="text-sm text-muted-foreground">Clica nas palavras pela ordem correta:</p>
        {selectedWords.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg min-h-[48px]">
            {selectedWords.map((word: string, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => handleRemoveWord(index)}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold"
                disabled={isSubmitted}
              >
                {word}
              </button>
            ))}
          </div>
        )}
        {availableWords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableWords.map((word: string, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => handleWordClick(word)}
                className="px-3 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold hover:bg-primary/30 active:bg-primary/40 transition-colors"
                disabled={isSubmitted}
              >
                {word}
              </button>
            ))}
          </div>
        )}
        {isSubmitted && isCorrect != null && (
          <p className={`mt-2 text-sm ${
            isCorrectAnswer
            ? 'text-success'
            : isWrongAnswer
            ? 'text-destructive'
            : 'text-muted-foreground'
          }`}>
            {isCorrectAnswer ? '✓ Ordem correta!' : '✗ Ordem incorreta. A ordem certa é: ' + correctOrder.join(' ')}
          </p>
        )}
      </div>
    );
  }

   if (challenge.challenge_type === 'matching') {
     const pairs = challenge.content.pairs || [];
     const isCorrectAnswer = isSubmitted && isCorrect != null && isCorrect;
     const isWrongAnswer = isSubmitted && isCorrect != null && !isCorrect;
     
     return (
       <div className={`space-y-3 ${isSubmitted && isCorrect != null ? (
         isCorrectAnswer 
           ? 'border-success bg-success/50 p-4 rounded-lg' 
           : isWrongAnswer
             ? 'border-destructive bg-destructive/50 p-4 rounded-lg'
             : ''
       ) : ''}`}>
         {pairs.map((pair: any, index: number) => {
           const userAnswer = (answer as any)?.[pair.left];
           const correctAnswer = pair.correct_matches?.[pair.left];
           const isPairCorrect = userAnswer === correctAnswer;
           
           return (
             <div key={index} className="flex gap-3 items-center">
               <div className="flex-1 p-3 bg-secondary text-secondary-foreground font-semibold rounded-lg">{pair.left}</div>
               <select
                 value={userAnswer || ''}
                 onChange={!isSubmitted ? (e) => {
                   onChange({
                     ...((answer as any) || {}),
                     [pair.left]: e.target.value,
                   });
                 } : undefined}
                 disabled={isSubmitted}
                 className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                   isSubmitted && isCorrect != null
                     ? isPairCorrect
                       ? 'border-success'
                       : 'border-destructive'
                     : 'focus:ring-primary'
                 }`}
               >
                 <option value="">Seleciona...</option>
                 {pair.options?.map((option: string) => (
                   <option key={option} value={option}>
                     {option}
                   </option>
                 ))}
               </select>
               {isSubmitted && isCorrect != null && (
                 <span className="ml-2 text-xs">
                   {isPairCorrect ? '✓' : '✗'}
                 </span>
               )}
             </div>
           );
         })}
         {isSubmitted && isCorrect != null && (
           <p className={`mt-2 text-sm ${
             isCorrectAnswer 
               ? 'text-success' 
               : isWrongAnswer
                 ? 'text-destructive'
                 : 'text-muted-foreground'
           }`}>
             {isCorrectAnswer ? '✓ Todas as correspondências corretas!' : '✗ Algumas correspondências estão incorretas. Tenta novamente!'}
           </p>
         )}
       </div>
     );
   }

  return <p className="text-muted-foreground">Tipo de desafio não suportado</p>;
}
