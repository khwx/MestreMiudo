"use client";

import { Button } from '@/components/ui/button';
import { Star, Trophy, RefreshCw, BookOpen, Share2 } from 'lucide-react';
import type { PersonalizedLearningPathOutput } from '@/app/shared-schemas';
import React, { useState } from 'react';
import { compareChallenge, shareChallenge, type QuizChallenge } from '@/lib/challenge-share';
import { openCertificate } from '@/lib/certificate';

type QuizResultsProps = {
  score: number;
  totalQuestions: number;
  quizData: PersonalizedLearningPathOutput | null;
  points?: number;
  onRestart: () => void;
  onBack: () => void;
  subject: string;
  practiceMode?: boolean;
  wrongCount?: number;
  onPracticeWrong?: () => void;
  weakTopics?: string[] | null;
  onPracticeWeakTopics?: () => void;
  studentName?: string;
  grade?: number;
  challenge?: QuizChallenge | null;
};

export const QuizResults = React.memo(function QuizResults({
  score,
  totalQuestions,
  points,
  onRestart,
  onBack,
  subject,
  practiceMode = false,
  wrongCount = 0,
  onPracticeWrong,
  weakTopics = null,
  onPracticeWeakTopics,
  studentName = 'Jogador',
  grade = 1,
  challenge = null,
}: QuizResultsProps) {
  const stars = score === totalQuestions ? 3 : score >= totalQuestions * 0.6 ? 2 : 1;
  const canPractice = !practiceMode && wrongCount > 0 && typeof onPracticeWrong === 'function';
  const canPracticeWeakTopics = !practiceMode && Array.isArray(weakTopics) && weakTopics.length > 0 && typeof onPracticeWeakTopics === 'function';
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const myChallenge: QuizChallenge = {
    from: studentName,
    subject: subject as QuizChallenge['subject'],
    grade,
    score,
    total: totalQuestions,
    stars,
  };

  const handleShare = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const result = await shareChallenge(myChallenge, origin);
    if (result === 'copied') setShareState('copied');
    if (result === 'failed') setShareState('failed');
  };

  const handleCertificate = () => {
    openCertificate({
      studentName,
      subject,
      grade,
      score,
      total: totalQuestions,
      stars,
    });
  };

  const comparison = challenge ? compareChallenge(challenge, score) : null;

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
          {practiceMode ? 'Prática Concluída!' : 'Desafio Concluído!'}
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

        {comparison && (
          <div
            className={`rounded-2xl p-4 border-2 ${
              comparison.beat
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 text-green-700 dark:text-green-300'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 text-blue-700 dark:text-blue-300'
            }`}
            role="status"
          >
            {comparison.message}
          </div>
        )}
       
       <div className="flex gap-4 justify-center pt-4 flex-wrap">
          {canPractice && (
            <Button
              onClick={onPracticeWrong}
              variant="secondary"
              size="lg"
              className="btn-kid text-lg"
              aria-label={`Praticar ${wrongCount} pergunta${wrongCount > 1 ? 's' : ''} que erraste`}
            >
              <BookOpen className="mr-2 h-5 w-5" /> Praticar {wrongCount} que erraste
            </Button>
          )}
          {canPracticeWeakTopics && (
            <Button
              onClick={onPracticeWeakTopics}
              variant="secondary"
              size="lg"
              className="btn-kid text-lg"
              aria-label={`Praticar temas fracos: ${weakTopics!.join(', ')}`}
            >
              <BookOpen className="mr-2 h-5 w-5" /> Praticar temas fracos
            </Button>
          )}
          <Button onClick={onRestart} variant="outline" size="lg" className="btn-kid text-lg">
            <RefreshCw className="mr-2 h-5 w-5" /> Jogar Novamente
          </Button>
          <Button
            onClick={handleCertificate}
            variant="secondary"
            size="lg"
            className="btn-kid text-lg"
            aria-label="Ver diploma de conquista"
          >
            🏅 Ver Diploma
          </Button>
          <Button
            onClick={handleShare}
            variant="secondary"
            size="lg"
            className="btn-kid text-lg"
            aria-label="Desafiar amigos com este resultado"
          >
            <Share2 className="mr-2 h-5 w-5" /> Desafiar Amigos
          </Button>
          <Button 
            onClick={onBack} 
            size="lg"
            className="btn-kid btn-kid-primary text-lg"
          >
            Voltar ao Início →
          </Button>
          {shareState === 'copied' && (
            <p className="w-full text-center text-green-600 dark:text-green-400 text-sm" role="status">
              Desafio copiado! Envia aos teus amigos. 📋
            </p>
          )}
          {shareState === 'failed' && (
            <p className="w-full text-center text-amber-600 dark:text-amber-400 text-sm" role="status">
              Não foi possível partilhar. Copia o link manualmente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
