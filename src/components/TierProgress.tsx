'use client';

import React from 'react';

interface TierProgressProps {
  currentTier: {
    level: number;
    name: string;
    emoji: string;
    requiredPoints: number;
    title: string;
  };
  nextTier?: {
    level: number;
    name: string;
    emoji: string;
    requiredPoints: number;
    title: string;
  } | null;
  totalPoints: number;
  progressPercentage: number;
}

export function TierProgress({ currentTier, nextTier, totalPoints, progressPercentage }: TierProgressProps) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 border-blue-100">
      {/* Current Tier Display */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-5xl">{currentTier.emoji}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{currentTier.name}</h3>
          <p className="text-sm text-gray-600">{currentTier.title}</p>
          <p className="text-lg font-semibold text-blue-600 mt-2">{totalPoints} pontos</p>
        </div>
      </div>

      {/* Progress Bar */}
      {nextTier && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progresso para próximo nível</span>
            <span className="font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Nível {currentTier.level}</span>
            <span className="flex items-center gap-1">
              {nextTier.emoji} Nível {nextTier.level}
            </span>
          </div>
        </div>
      )}

      {!nextTier && (
        <div className="text-center py-4">
          <p className="text-lg font-bold text-purple-600">🎉 Parabéns! Atingiu o nível máximo!</p>
        </div>
      )}
    </div>
  );
}
