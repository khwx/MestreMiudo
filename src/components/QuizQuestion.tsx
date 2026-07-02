"use client";

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Volume2, Star, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { PersonalizedLearningPathOutput } from '@/app/shared-schemas';

type QuizQuestionProps = {
  quizData: PersonalizedLearningPathOutput;
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showResult: boolean;
  onAnswerSelect: (answer: string) => void;
  onNext: () => void;
  onAudioPlayback: () => void;
  isPlayingAudio: boolean;
  score: number;
  title: string;
  progress: number;
};

export function QuizQuestion({
  quizData,
  currentQuestionIndex,
  selectedAnswer,
  showResult,
  onAnswerSelect,
  onNext,
  onAudioPlayback,
  isPlayingAudio: _isPlayingAudio,
  score,
  title,
  progress,
}: QuizQuestionProps) {
  const currentQuestion = quizData.quizQuestions[currentQuestionIndex];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="card-kid card-kid-primary shadow-2xl">
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
            <p className="text-md text-gray-500 dark:text-gray-400 text-center">
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
              onClick={onAudioPlayback}
              aria-label="Ouvir a pergunta e as respostas"
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
                    !showResult && 'hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1',
                    showResult && isCorrect && 'border-green-500 bg-green-50 text-green-900 scale-105 shadow-lg',
                    showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50 text-red-900 animate-shake',
                    showResult && !isSelected && 'opacity-50'
                  )}
                  onClick={() => onAnswerSelect(option)}
                  disabled={showResult}
                >
                  <span className="absolute left-4 font-black text-2xl text-blue-600">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <span className="flex-1">{option}</span>
                  {showResult && (isSelected || isCorrect) && (
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
        
        {showResult && (
          <CardFooter className="pt-0">
            <Button 
              onClick={onNext}
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
