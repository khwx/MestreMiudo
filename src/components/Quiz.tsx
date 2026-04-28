"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { generateQuiz, saveQuizResults } from '@/app/actions';
import type { PersonalizedLearningPathOutput } from '@/app/shared-schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Volume2, Star, Trophy, RefreshCw, Check, X, Book, Divide, Leaf, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSound } from '@/lib/sounds';
import confetti from 'canvas-confetti';

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
      console.error('Error generating quiz:', err);
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

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
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
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData!.quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
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
      console.error('Error saving quiz results:', error);
    }
  };

  const handleRestart = () => {
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setAnswers([]);
    setLoading(true);
    quizStarted.current = false;
    fetchQuiz();
  };

  const handleAudioPlayback = () => {
    if (!quizData) return;
    const utterance = new SpeechSynthesisUtterance(quizData.quizQuestions[currentQuestionIndex].question);
    utterance.lang = 'pt-PT';
    window.speechSynthesis.speak(utterance);
  };

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

  const isQuizFinished = currentQuestionIndex >= quizData.quizQuestions.length;
  const progress = ((currentQuestionIndex) / quizData.quizQuestions.length) * 100;
  const currentQuestion = quizData.quizQuestions[currentQuestionIndex];

  if (isQuizFinished) {
    const percentage = Math.round((score / quizData.quizQuestions.length) * 100);
    const stars = score === quizData.quizQuestions.length ? 3 : score >= quizData.quizQuestions.length * 0.6 ? 2 : 1;
    
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={() => router.push(`/dashboard?name=${studentId}&grade=${gradeLevel}`)}
          className="gap-2 text-lg"
        >
          ← Voltar ao Dashboard
        </Button>
        
        <div className="text-center space-y-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-3xl p-8 border-4 border-yellow-300 shadow-2xl">
          <div className="animate-bounce">
            {stars === 3 ? '🎉' : stars === 2 ? '🎊' : '🎈'}
          </div>
          
          <Trophy className="h-24 w-24 mx-auto text-yellow-500 animate-pulse" />
          
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Desafio Concluído!
          </h2>
          
          <div className="flex justify-center gap-2 text-4xl">
            {[1, 2, 3].map((star) => (
              <Star 
                key={star}
                className={`h-12 w-12 ${star <= stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
              />
            ))}
          </div>
          
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
            A tua pontuação: <span className="text-green-600">{score}</span> em <span className="text-blue-600">{quizData.quizQuestions.length}</span>!
          </p>
          
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Isso dá-te <span className="font-bold text-yellow-600">{score * 10} pontos</span>! 🎁
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            <Button onClick={handleRestart} variant="outline" size="lg" className="btn-kid text-lg">
              <RefreshCw className="mr-2 h-5 w-5" /> Jogar Novamente
            </Button>
            <Button 
              onClick={() => router.push(`/dashboard?name=${studentId}&grade=${gradeLevel}`)} 
              size="lg"
              className="btn-kid btn-kid-primary text-lg"
            >
              Voltar ao Início →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => router.push(`/dashboard?name=${studentId}&grade=${gradeLevel}`)}
        className="gap-2"
      >
        ← Voltar ao Dashboard
      </Button>
      
      <div className="card-kid card-kid-primary bg-white shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </CardTitle>
            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/40 px-4 py-2 rounded-full">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              <span className="font-black text-yellow-700 text-lg">{score * 10} Pontos</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-4 progress-kid" />
            <p className="text-md text-gray-500 text-center">
              Pergunta {currentQuestionIndex + 1} de {quizData.quizQuestions.length}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentQuestion.imageUrl && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-4 border-blue-200">
              <Image 
                src={currentQuestion.imageUrl} 
                alt={currentQuestion.question}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          
          <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200">
            <p className="text-2xl font-bold flex-1 text-gray-800 dark:text-gray-100">
              {currentQuestion.question}
            </p>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleAudioPlayback}
              aria-label="Ouvir a pergunta"
              className="shrink-0 hover:scale-110 transition-transform"
            >
              <Volume2 className="h-6 w-6 text-blue-600" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option: string, i: number) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isSelected = option === selectedAnswer;
              
              return (
                <Button
                  key={i}
                  variant="outline"
                  className={cn(
                    'min-h-[4rem] py-6 text-xl whitespace-normal justify-start text-left flex-row pl-16 relative border-4 transition-all duration-300',
                    !isAnswered && 'hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1',
                    isAnswered && isCorrect && 'border-green-500 bg-green-50 text-green-900 scale-105 shadow-lg',
                    isAnswered && isSelected && !isCorrect && 'border-red-500 bg-red-50 text-red-900 animate-shake',
                    isAnswered && !isSelected && 'opacity-50'
                  )}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                >
                  <span className="absolute left-4 font-black text-2xl text-blue-600">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <span className="flex-1">{option}</span>
                  {isAnswered && (isSelected || isCorrect) && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {isCorrect ? (
                        <Check className="h-10 w-10 text-green-600" />
                      ) : (
                        <X className="h-10 w-10 text-red-600" />
                      )}
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
        
        {isAnswered && (
          <CardFooter className="pt-0">
            <Button 
              onClick={handleNext}
              size="lg"
              className="w-full btn-kid btn-kid-primary text-xl h-16"
            >
              {currentQuestionIndex < quizData.quizQuestions.length - 1 ? 'Próxima Pergunta →' : 'Ver Resultados 🎉'}
            </Button>
          </CardFooter>
        )}
      </div>
    </div>
  );
}
