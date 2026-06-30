'use client';

import React, { useState } from 'react';
import { generateHint, generateFeedback, generateExplanation } from '@/lib/feedback-system';

interface QuestionFeedbackProps {
  question: string;
  options: string[];
  correctAnswer: string;
  studentAnswer?: string;
  topic: string;
  isAnswered: boolean;
  isCorrect?: boolean;
  streak?: number;
}

export function QuestionFeedback({
  question,
  options,
  correctAnswer,
  studentAnswer,
  topic,
  isAnswered,
  isCorrect,
  streak,
}: QuestionFeedbackProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  if (!isAnswered) {
    return null;
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Main Feedback */}
      <div
        className={`p-4 rounded-lg border-2 ${
          isCorrect
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
        }`}
      >
        <p className={`text-lg font-semibold whitespace-pre-line ${
          isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
        }`}>
          {generateFeedback({
            question,
            correctAnswer,
            topic,
            studentAnswer: studentAnswer || '',
            isCorrect: isCorrect || false,
            streak,
          })}
        </p>
      </div>

      {/* Answer Review */}
      {!isCorrect && studentAnswer && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Sua resposta:</p>
          <p className="text-base font-semibold text-blue-700 dark:text-blue-300">{studentAnswer}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Resposta correta:</p>
          <p className="text-base font-semibold text-green-700">{correctAnswer}</p>
        </div>
      )}

      {/* Hint Button (for incorrect answers) */}
      {!isCorrect && hintLevel < 4 && (
        <button
          onClick={() => setHintLevel(hintLevel + 1)}
          className="w-full px-4 py-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg font-semibold text-yellow-700 dark:text-yellow-300 transition"
        >
          💡 Dica {hintLevel > 0 && `(${hintLevel}/4)`}
        </button>
      )}

      {/* Hint Display */}
      {hintLevel > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Dica #{hintLevel}:</p>
          <p className="text-base font-semibold text-yellow-800 dark:text-yellow-200">
            {generateHint({
              question,
              correctAnswer,
              options,
              topic,
              attemptNumber: hintLevel,
            })}
          </p>
        </div>
      )}

      {/* Explanation Button */}
      {isCorrect && (
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border-2 border-blue-300 dark:border-blue-700 rounded-lg font-semibold text-blue-700 dark:text-blue-300 transition"
        >
          {showExplanation ? '✕ Fechar Explicação' : '📖 Ver Explicação'}
        </button>
      )}

      {/* Explanation Display */}
      {showExplanation && isCorrect && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <p className="text-base text-blue-900 dark:text-blue-200 leading-relaxed">
            {generateExplanation({
              question,
              correctAnswer,
              topic,
              studentAnswer: studentAnswer || '',
            })}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Hint-only component for quiz taking
 */
export function QuestionHint({
  question,
  options,
  correctAnswer,
  topic,
}: {
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
}) {
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  return (
    <div className="space-y-2">
      {!showHint && hintLevel === 0 && (
        <button
          onClick={() => {
            setShowHint(true);
            setHintLevel(1);
          }}
          className="text-sm px-3 py-1 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-lg font-semibold transition"
        >
          💡 Dica
        </button>
      )}

      {showHint && hintLevel > 0 && hintLevel < 4 && (
        <>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-3">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
              {generateHint({
                question,
                correctAnswer,
                options,
                topic,
                attemptNumber: hintLevel,
              })}
            </p>
          </div>
          <button
            onClick={() => setHintLevel(hintLevel + 1)}
            className="text-xs px-2 py-1 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded font-semibold"
          >
            Mais uma dica
          </button>
        </>
      )}

      {hintLevel >= 4 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-3">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            {generateHint({
              question,
              correctAnswer,
              options,
              topic,
              attemptNumber: 4,
            })}
          </p>
        </div>
      )}
    </div>
  );
}
