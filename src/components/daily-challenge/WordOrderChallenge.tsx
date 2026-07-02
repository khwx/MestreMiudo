"use client"

import { useState } from 'react';

interface WordOrderChallengeProps {
  content: Record<string, unknown>;
  showResult: boolean;
  onAnswerSelect: (answer: unknown) => void;
  isCorrect: boolean;
}

export function WordOrderChallenge({ content, showResult, onAnswerSelect, isCorrect }: WordOrderChallengeProps) {
  const correctOrder = content.correct_order as string[];
  const [order, setOrder] = useState<string[]>(() => {
    return [...correctOrder].sort(() => Math.random() - 0.5);
  });

  const moveUp = (index: number) => {
    if (showResult || index === 0) return;
    const newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setOrder(newOrder);
    onAnswerSelect(newOrder);
  };

  const moveDown = (index: number) => {
    if (showResult || index === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setOrder(newOrder);
    onAnswerSelect(newOrder);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Ordena as palavras (usa as setas ↑↓)
      </p>
      <div className="space-y-2">
        {order.map((word, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
            <span className="text-2xl font-bold flex-1 text-center">{word}</span>
            <div className="flex flex-col">
              <button
                onClick={() => moveUp(index)}
                disabled={showResult || index === 0}
                className="text-orange-500 hover:text-orange-700 disabled:opacity-50"
              >
                ↑
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={showResult || index === order.length - 1}
                className="text-orange-500 hover:text-orange-700 disabled:opacity-50"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
      {showResult && (
        <p className={`text-center text-lg font-bold ${
          isCorrect ? 'text-green-600' : 'text-red-600'
        }`}>
          Ordem correta: {correctOrder.join(' → ')}
        </p>
      )}
    </div>
  );
}
