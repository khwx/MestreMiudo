'use client';

import React from 'react';

interface BadgeShowcaseProps {
  badges: Array<{
    id: string;
    name: string;
    emoji: string;
    description: string;
    unlocked: boolean;
    unlockedDate?: string;
  }>;
  maxDisplay?: number;
}

export function BadgeShowcase({ badges, maxDisplay = 12 }: BadgeShowcaseProps) {
  const unlockedBadges = badges.filter((b) => b.unlocked);
  const lockedBadges = badges.filter((b) => !b.unlocked);
  const displayedBadges = [...unlockedBadges, ...lockedBadges].slice(0, maxDisplay);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 border-purple-100">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Conquistas 🏆</h3>
        <p className="text-sm text-gray-600">
          Desbloqueou {unlockedBadges.length} de {badges.length} badges
        </p>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
        {displayedBadges.map((badge) => (
          <div
            key={badge.id}
            className="flex flex-col items-center gap-2 cursor-pointer group"
            title={badge.description}
          >
            {/* Badge */}
            <div
              className={`
                w-16 h-16 rounded-full flex items-center justify-center text-3xl
                transition-all duration-300 transform group-hover:scale-110
                ${
                  badge.unlocked
                    ? 'bg-yellow-100 shadow-lg ring-2 ring-yellow-300'
                    : 'bg-gray-200 opacity-50 grayscale'
                }
              `}
            >
              {badge.emoji}
            </div>

            {/* Badge Name */}
            <p className="text-xs font-semibold text-center text-gray-700 line-clamp-2">{badge.name}</p>

            {/* Locked Badge Indicator */}
            {!badge.unlocked && (
              <div className="text-xl opacity-30">🔒</div>
            )}

            {/* Unlock Date */}
            {badge.unlocked && badge.unlockedDate && (
              <p className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {new Date(badge.unlockedDate).toLocaleDateString('pt-PT')}
              </p>
            )}

            {/* Tooltip on Hover */}
            <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 mt-1 pointer-events-none">
              {badge.description}
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {badges.length > maxDisplay && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            +{badges.length - maxDisplay} más badges para descobrir
          </p>
        </div>
      )}
    </div>
  );
}
