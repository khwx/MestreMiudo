'use client';
import React, { useEffect } from 'react';
import type { LessonChallenge } from '@/app/shared-schemas';

interface MatchingPair {
  left: string;
  options: string[];
  correct_matches?: Record<string, string>;
}

type ChallengeRendererProps = {
  challenge: LessonChallenge;
  answer: unknown;
  onChange: (value: unknown) => void;
  isSubmitted?: boolean;
  isCorrect?: boolean | null;
  shuffledWordOrders: Record<string, string[]>;
  setShuffledWordOrders: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
};

export const ChallengeRenderer = React.memo(function ChallengeRenderer({
  challenge,
  answer,
  onChange,
  isSubmitted,
  isCorrect,
  shuffledWordOrders,
  setShuffledWordOrders,
}: ChallengeRendererProps) {
  useEffect(() => {
    if (challenge.challenge_type === 'word_order' && challenge.id && !shuffledWordOrders[challenge.id]) {
      const correctOrder: string[] = challenge.content.correct_order || [];
      const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
      setShuffledWordOrders(prev => ({ ...prev, [challenge.id!]: shuffled }));
    }
  }, [challenge, shuffledWordOrders, setShuffledWordOrders]);

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
        value={(answer as string) || ''}
        onChange={!isSubmitted ? (e) => onChange(e.target.value) : undefined}
        placeholder="Escreve a resposta..."
        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
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

    const base = shuffledWordOrders[challenge.id || ''] || [];
    const availableWords = (() => {
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
                className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:bg-primary/90 transition"
                disabled={isSubmitted}
              >
                {word} x
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
    const content = challenge.content as Record<string, unknown>;
    const pairs = (content.pairs as MatchingPair[]) || [];
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
      {pairs.map((pair, index: number) => {
          const answerRecord = (typeof answer === 'object' && answer !== null && !Array.isArray(answer)) ? answer as Record<string, string> : {};
          const userAnswer = answerRecord[pair.left];
          const correctAnswer = pair.correct_matches?.[pair.left];
          const isPairCorrect = userAnswer === correctAnswer;
          
          return (
            <div key={index} className="flex gap-3 items-center">
              <div className="flex-1 p-3 bg-secondary rounded-lg">{pair.left}</div>
              <select
                value={userAnswer || ''}
                onChange={!isSubmitted ? (e: React.ChangeEvent<HTMLSelectElement>) => {
                  onChange({
                    ...answerRecord,
                    [pair.left]: e.target.value,
                  });
                } : undefined}
               disabled={isSubmitted}
               className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 ${
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
});
