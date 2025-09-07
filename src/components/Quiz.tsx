"use client";

import { useState, useEffect, useCallback } from 'react';
import { generateQuiz } from '@/app/actions';
import type { PersonalizedLearningPathOutput } from '@/ai/flows/personalized-learning-paths';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Volume2, Star, Trophy, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

type QuizProps = {
  studentId: string;
  gradeLevel: number;
  subject: 'Português' | 'Matemática' | 'Estudo do Meio';
};

export function Quiz({ studentId, gradeLevel, subject }: QuizProps) {
  const [quizData, setQuizData] = useState<PersonalizedLearningPathOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const grade = searchParams.get('grade');

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await generateQuiz({
        studentId,
        gradeLevel,
        subject,
        numberOfQuestions: 5,
      });
      if (data.quizQuestions.length === 0) {
        setError('Não foi possível gerar perguntas. Tenta novamente mais tarde.');
      } else {
        setQuizData(data);
      }
    } catch (e) {
      setError('Não foi possível carregar o quiz. Tenta novamente.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [studentId, gradeLevel, subject]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleAudioPlayback = () => {
    if (quizData && 'speechSynthesis' in window) {
      const text = quizData.quizQuestions[currentQuestionIndex].question;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-PT';
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Audio não suportado",
        description: "O teu navegador não suporta a leitura de áudio.",
        variant: "destructive"
      });
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    if (option === quizData?.quizQuestions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(i => i + 1);
  };
  
  const handleRestart = () => {
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    fetchQuiz();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-xl text-muted-foreground font-headline">A preparar um desafio especial para ti...</p>
      </div>
    );
  }

  if (error || !quizData || quizData.quizQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <p className="text-xl text-destructive">{error || 'Não foram encontradas perguntas.'}</p>
        <Button onClick={handleRestart}>Tentar Novamente</Button>
      </div>
    );
  }

  const isQuizFinished = currentQuestionIndex >= quizData.quizQuestions.length;
  const progress = ((currentQuestionIndex) / quizData.quizQuestions.length) * 100;

  if (isQuizFinished) {
    return (
      <Card className="text-center shadow-lg animate-in fade-in-50">
        <CardHeader>
          <Trophy className="h-20 w-20 text-accent mx-auto" />
          <CardTitle className="text-4xl font-headline mt-4">Desafio Concluído!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl">A tua pontuação foi <span className="font-bold text-primary">{score}</span> em <span className="font-bold">{quizData.quizQuestions.length}</span>!</p>
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={handleRestart} variant="outline" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" /> Jogar Novamente
            </Button>
            <Button onClick={() => router.push(`/dashboard?name=${name}&grade=${grade}`)} size="lg">
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = quizData.quizQuestions[currentQuestionIndex];

  return (
    <Card className="w-full shadow-lg animate-in fade-in-50">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl font-bold">{subject}</CardTitle>
          <div className="flex items-center gap-2 text-lg font-bold text-accent">
            <Star className="h-6 w-6 fill-current" />
            <span>{score * 10} Pontos</span>
          </div>
        </div>
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground text-center mt-2">Pergunta {currentQuestionIndex + 1} de {quizData.quizQuestions.length}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentQuestion.imageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                <Image 
                    src={currentQuestion.imageUrl} 
                    alt={currentQuestion.question}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
        )}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-semibold flex-1">{currentQuestion.question}</p>
          <Button variant="outline" size="icon" onClick={handleAudioPlayback} aria-label="Ouvir a pergunta" className="shrink-0">
            <Volume2 className="h-8 w-8 text-primary" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, i) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedAnswer;
            
            return (
              <Button
                key={i}
                variant="outline"
                className={cn(
                  'h-auto min-h-[4rem] py-4 text-lg whitespace-normal justify-start text-left',
                  isAnswered && isCorrect && 'border-2 border-[hsl(var(--chart-2))] bg-[hsl(var(--chart-2))]/20 text-foreground',
                  isAnswered && isSelected && !isCorrect && 'border-2 border-destructive bg-destructive/20 text-foreground',
                  isAnswered && !isSelected && 'opacity-60'
                )}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
              >
                <span className="mr-4 font-bold text-primary">{String.fromCharCode(65 + i)}.</span>
                <span>{option}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
      {isAnswered && (
        <CardFooter className="justify-end">
          <Button onClick={handleNextQuestion} className="text-lg px-8 py-6 animate-pulse">
            {currentQuestionIndex < quizData.quizQuestions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
