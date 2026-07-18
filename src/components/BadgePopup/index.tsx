'use client';

import { useEffect, useState } from 'react';
import { Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BadgePopupProps {
  badgeName: string;
  badgeDescription: string;
  badgeIcon?: string;
  onClose: () => void;
}

export function BadgePopup({ badgeName, badgeDescription, badgeIcon, onClose }: BadgePopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      />
      <div
        className={`relative bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-4 border-yellow-400 dark:border-yellow-600 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors"
        >
          <X className="h-5 w-5 text-yellow-600" />
        </button>

        <div className="text-6xl mb-4 animate-bounce">
          {badgeIcon || '🏆'}
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Award className="h-6 w-6 text-yellow-600" />
          <span className="text-sm font-bold text-yellow-600 uppercase tracking-wider">
            Nova Conquista!
          </span>
        </div>

        <h3 className="text-2xl font-black text-yellow-700 dark:text-yellow-300 mb-2">
          {badgeName}
        </h3>

        <p className="text-yellow-600 dark:text-yellow-400 mb-6">
          {badgeDescription}
        </p>

        <Button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="btn-kid bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold text-lg w-full"
        >
         Continue! 🎉
        </Button>
      </div>
    </div>
  );
}

// Badge definitions for easy reference
export const BADGE_DEFINITIONS: Record<string, { name: string; description: string; icon: string }> = {
  'primeiro_quiz': {
    name: 'Primeiro Quiz',
    description: 'Completaste o teu primeiro quiz!',
    icon: '🎯',
  },
  'perfeicao': {
    name: 'Perfeição',
    description: 'Conseguiste 100% num quiz!',
    icon: '💯',
  },
  'streak_3': {
    name: 'Três Dias Seguidos',
    description: 'Mantiveste a streak por 3 dias!',
    icon: '🔥',
  },
  'streak_7': {
    name: 'Uma Semana Completa',
    description: '7 dias seguidos de aprendizagem!',
    icon: '⭐',
  },
  'streak_30': {
    name: 'Mestre da Consistência',
    description: '30 dias seguidos! Incrível!',
    icon: '👑',
  },
  'mestre_completo': {
    name: 'Mestre Completo',
    description: 'Atingiste 90% de média em todas as disciplinas!',
    icon: '🎓',
  },
  'explorador': {
    name: 'Explorador',
    description: 'Completaste lições em todas as disciplinas!',
    icon: '🧭',
  },
  'colecionador': {
    name: 'Colecionador',
    description: 'Tens 10 conquistas desbloqueadas!',
    icon: '🏅',
  },
  'campeao': {
    name: 'Campeão',
    description: 'Completa 30 desafios diários!',
    icon: '🏆',
  },
  'melhor_da_classe': {
    name: 'Melhor da Classe',
    description: 'Estás no top 10 do ranking!',
    icon: '🥇',
  },
};
