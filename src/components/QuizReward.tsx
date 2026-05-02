'use client';

import React, { useEffect, useState } from 'react';

interface QuizRewardProps {
  score: number;
  total: number;
  points: number;
  message: string;
  tier?: string;
  nextTier?: string;
  progressPercentage?: number;
  showConfetti?: boolean;
}

export function QuizReward({
  score,
  total,
  points,
  message,
  tier,
  nextTier,
  progressPercentage = 0,
  showConfetti = true,
}: QuizRewardProps) {
  const [showReward, setShowReward] = useState(true);
  const percentage = (score / total) * 100;

  useEffect(() => {
    if (showConfetti && percentage >= 80) {
      // Trigger confetti animation
      const confetti = createConfetti();
      return () => {
        confetti.forEach((c) => c.remove?.());
      };
    }
  }, [showConfetti, percentage]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-bounce">
        {/* Score Circle */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute w-full h-full" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="55"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="60"
                cy="60"
                r="55"
                fill="none"
                stroke={percentage >= 90 ? '#fbbf24' : percentage >= 80 ? '#60a5fa' : percentage >= 70 ? '#34d399' : '#f87171'}
                strokeWidth="4"
                strokeDasharray={`${(percentage / 100) * 345.6} 345.6`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>

            {/* Score Text */}
            <div className="text-center">
               <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">{score}</p>
               <p className="text-sm text-gray-600 dark:text-gray-300">/ {total}</p>
            </div>
          </div>
        </div>

        {/* Percentage Badge */}
        <div className="text-center mb-4">
          <span
            className={`
              inline-block px-4 py-2 rounded-full font-bold text-white
              ${
                percentage >= 90
                  ? 'bg-yellow-400'
                  : percentage >= 80
                  ? 'bg-blue-400'
                  : percentage >= 70
                  ? 'bg-green-400'
                  : 'bg-red-400'
              }
            `}
          >
            {Math.round(percentage)}%
          </span>
        </div>

        {/* Message */}
        <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
           <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 whitespace-pre-line">{message}</p>
        </div>

        {/* Points and Tier */}
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 rounded-lg">
               <p className="text-sm text-gray-600 dark:text-gray-300">Pontos Ganhos</p>
            <p className="text-3xl font-bold text-blue-600">+{points}</p>
          </div>

          {tier && (
            <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-4 rounded-lg">
               <p className="text-sm text-gray-600 dark:text-gray-300">Nível Atual</p>
              <p className="text-xl font-bold text-purple-600">{tier}</p>
            </div>
          )}

          {nextTier && progressPercentage > 0 && (
            <div className="bg-gradient-to-r from-orange-100 to-orange-50 p-4 rounded-lg">
               <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Progresso para {nextTier}</p>
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-orange-600 mt-1 text-right">{Math.round(progressPercentage)}%</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowReward(false)}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Voltar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
          >
            Novo Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

function createConfetti(): HTMLElement[] {
  const confettiPieces: HTMLElement[] = [];

  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';

    const colors = ['#fbbf24', '#60a5fa', '#34d399', '#f87171', '#a78bfa'];
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = '50%';

    document.body.appendChild(confetti);
    confettiPieces.push(confetti);

    // Animate confetti
    let top = -10;
    let left = parseInt(confetti.style.left);
    const speed = Math.random() * 3 + 2;
    const xSpeed = Math.random() * 2 - 1;

    const animate = () => {
      top += speed;
      left += xSpeed;
      confetti.style.top = top + 'px';
      confetti.style.left = left + 'px';

      if (top < window.innerHeight) {
        requestAnimationFrame(animate);
      } else {
        confetti.remove();
      }
    };
    animate();
  }

  return confettiPieces;
}
