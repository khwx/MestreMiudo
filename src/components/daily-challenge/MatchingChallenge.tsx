"use client"

import { useState } from 'react';

interface MatchingChallengeProps {
  content: Record<string, unknown>;
  showResult: boolean;
  onAnswerSelect: (answer: unknown) => void;
  selectedAnswer: unknown;
  isCorrect: boolean;
}

export function MatchingChallenge({ content, showResult, onAnswerSelect, selectedAnswer: _selectedAnswer, isCorrect: _isCorrect }: MatchingChallengeProps) {
  const pairs = content.pairs as Array<{ left: string; options: string[] }>;
  const correctMatches = content.correct_matches as Record<string, string>;
  const [matches, setMatches] = useState<Record<string, string>>({});

  const handleMatchChange = (left: string, value: string) => {
    if (showResult) return;
    const newMatches = { ...matches, [left]: value };
    setMatches(newMatches);
    onAnswerSelect(newMatches);
  };

  return (
    <div className="space-y-4">
      {pairs.map((pair, index) => (
        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700">
          <p className="font-semibold mb-2">{pair.left}</p>
          <select
            value={matches[pair.left] || ''}
            onChange={(e) => handleMatchChange(pair.left, e.target.value)}
            disabled={showResult}
            className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-lg"
          >
            <option value="">Seleciona...</option>
            {pair.options.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
          {showResult && (
            <p className={`mt-2 text-sm ${
              matches[pair.left] === correctMatches[pair.left]
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {matches[pair.left] === correctMatches[pair.left] ? '✅' : '❌'}
              Correto: {correctMatches[pair.left]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
