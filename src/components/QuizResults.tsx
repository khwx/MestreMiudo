"use client";

import { Button } from '@/components/ui/button';
import { Star, Trophy, RefreshCw } from 'lucide-react';
import type { PersonalizedLearningPathOutput } from '@/app/shared-schemas';
import React from 'react';

type QuizResultsProps = {
  score: number;
  totalQuestions: number;
  quizData: PersonalizedLearningPathOutput | null;
  points?: number;
  onRestart: () => void;
  onBack: () => void;
  subject: string;
};

export const QuizResults = React.memo(function QuizResults({ score, totalQuestions, points, onRestart, onBack }: QuizResultsProps) {
  const stars = score === totalQuestions ? 3 : score >= totalQuestions * 0.6 ? 2 : 1;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button 
        variant="ghost" 
        size="lg" 
        onClick={onBack}
        aria-label="Voltar ao Dashboard"
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
              className={`h-12 w-12 ${star <= stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 dark:text-gray-600'}`}
            />
          ))}
        </div>
        
        <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
          A tua pontuação: <span className="text-green-600">{score}</span> em <span className="text-blue-600">{totalQuestions}</span>!
        </p>
        
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Isso dá-te <span className="font-bold text-yellow-600">{points ?? score * 10} pontos</span>!
        </p>
        
        <div className="flex gap-4 justify-center pt-4">
          <Button onClick={onRestart} variant="outline" size="lg" className="btn-kid text-lg">
            <RefreshCw className="mr-2 h-5 w-5" /> Jogar Novamente
          </Button>
          <Button 
            onClick={onBack} 
            size="lg"
            className="btn-kid btn-kid-primary text-lg"
          >
            Voltar ao Início →
          </Button>
        </div>
      </div>
    </div>
  );
});
