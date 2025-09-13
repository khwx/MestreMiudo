
"use client";

import { useState, useEffect, useCallback } from 'react';
import { generateQuiz, saveQuizResults } from '@/app/actions';
import type { PersonalizedLearningPathOutput } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Volume2, Star, Trophy, RefreshCw, Check, X, Book, Divide, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    "A conectar com o super-cérebro do MestreMiúdo...",
    "A escolher as perguntas perfeitas para ti...",
    "A adicionar um toque de magia...",
    "Quase a postos! A preparar o desafio...",
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
  
  const { toast } = useToast();
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
    try {
      const data = await generateQuiz({
        studentId,
        gradeLevel,
        subject,
        numberOfQuestions: 5,
      });
      if (!data || data.quizQuestions.length === 0) {
        setError('Não foi possível gerar perguntas. Tenta novamente mais tarde.');
        setQuizData(null);
      } else {
        setQuizData(data);
        setCurrentQuestionIndex(0);
        setScore(0);
        setAnswers([]);
        setIsAnswered(false);
        setSelectedAnswer(null);
      }
    } catch (e) {
      setError('Não foi possível carregar o quiz. Tenta novamente.');
      console.error(e);
      setQuizData(null);
    } finally {
      setLoading(false);
    }
  }, [studentId, gradeLevel, subject]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);
  
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
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
  }

  const handleAudioPlayback = () => {
    if (quizData) {
      const text = quizData.quizQuestions[currentQuestionIndex].question;
      speakText(text);
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (isAnswered || !quizData) return;
    
    const currentQuestion = quizData.quizQuestions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    if (isCorrect) {
      setScore(s => s + 1);
    }

    setAnswers(prev => [...prev, {
        question: currentQuestion.question,
        selectedAnswer: option,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: isCorrect,
        topic: currentQuestion.topic,
    }]);
  };

  const finishQuiz = useCallback(async () => {
    if (!quizData) return;
    try {
        await saveQuizResults({
            studentId,
            gradeLevel,
            subject,
            numberOfQuestions: quizData.quizQuestions.length,
            quiz: quizData,
            answers,
            score,
        });
    } catch (error) {
        console.error("Failed to save quiz results:", error);
        toast({
            title: "Erro ao guardar resultados",
            description: "Não foi possível guardar os resultados deste quiz.",
            variant: "destructive",
        });
    }
  }, [quizData, studentId, gradeLevel, subject, answers, score, toast]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex >= (quizData?.quizQuestions.length ?? 0) - 1) {
      // This is the last question, finish the quiz
      finishQuiz();
    }
    setIsAnswered(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(i => i + 1);
  };
  
  const handleRestart = () => {
    fetchQuiz();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8 text-center">
        <div className="relative flex justify-center items-center h-24 w-24">
            <Loader2 className="h-24 w-24 animate-spin text-primary opacity-50" />
            <div className="absolute flex justify-center items-center h-full w-full">
                <Book className="h-10 w-10 text-primary animate-float-up" style={{ animationDelay: '0s' }} />
                <Divide className="h-10 w-10 text-destructive animate-float-up" style={{ animationDelay: '1s' }} />
                <Leaf className="h-10 w-10 text-[hsl(var(--chart-2))] animate-float-up" style={{ animationDelay: '2s' }} />
            </div>
        </div>
        <p className="text-xl text-muted-foreground font-headline animate-in fade-in duration-500">
            {loadingMessages[loadingMessageIndex]}
        </p>
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
            <Button onClick={() => router.push(`/dashboard?name=${studentId}&grade=${gradeLevel}`)} size="lg">
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
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
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
              <div key={i} className="flex gap-2 relative">
                <Button
                  variant="outline"
                  className={cn(
                    'min-h-[4rem] py-4 text-lg whitespace-normal justify-start text-left flex-grow pl-12',
                    isAnswered && isCorrect && 'border-2 border-[hsl(var(--chart-2))] bg-[hsl(var(--chart-2))]/20 text-foreground',
                    isAnswered && isSelected && !isCorrect && 'border-2 border-destructive bg-destructive/20 text-foreground',
                    isAnswered && !isSelected && 'opacity-60'
                  )}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                >
                  <span className="absolute left-4 font-bold text-primary">{String.fromCharCode(65 + i)}.</span>
                  <span className="flex-1">{option}</span>
                </Button>
                 {isAnswered && (isSelected || isCorrect) && (
                  <div className="absolute right-14 top-1/2 -translate-y-1/2">
                    {isCorrect ? (
                       <Check className="h-8 w-8 text-[hsl(var(--chart-2))]" />
                    ) : (
                       <X className="h-8 w-8 text-destructive" />
                    )}
                  </div>
                )}
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={(e) => {
                        e.stopPropagation();
                        speakText(option);
                    }} 
                    aria-label={`Ouvir a resposta ${option}`} 
                    className="shrink-0 min-h-[4rem] w-14"
                    disabled={isAnswered}
                >
                    <Volume2 className="h-6 w-6 text-primary" />
                </Button>
              </div>
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

    