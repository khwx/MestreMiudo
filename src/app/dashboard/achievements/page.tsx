'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkAchievementUnlock, getAllAchievements } from '@/lib/achievements';
import type { Achievement } from '@/lib/achievements';

// Mock data - em produção viria do servidor
const mockUnlockedAchievements = [
  {
    id: 'first_quiz',
    title: '🚀 Primeiro Passo',
    description: 'Completou o primeiro quiz',
    icon: '🚀',
    color: '#3b82f6',
    unlockDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'five_quizzes',
    title: '📚 Aprendiz',
    description: 'Completou 5 quizzes',
    icon: '📚',
    color: '#8b5cf6',
    unlockDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'perfect_score',
    title: '💯 Perfeição!',
    description: 'Acertou um quiz com 100%',
    icon: '💯',
    color: '#10b981',
    unlockDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'week_streak',
    title: '🔥 Uma Semana de Fogo',
    description: 'Manteve uma streak de 7 dias',
    icon: '🔥',
    color: '#ef4444',
    unlockDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const allAchievements = [
  {
    id: 'first_quiz',
    title: '🚀 Primeiro Passo',
    description: 'Completou o primeiro quiz',
    icon: '🚀',
    color: '#3b82f6',
  },
  {
    id: 'five_quizzes',
    title: '📚 Aprendiz',
    description: 'Completou 5 quizzes',
    icon: '📚',
    color: '#8b5cf6',
  },
  {
    id: 'ten_quizzes',
    title: '⭐ Estudante Dedicado',
    description: 'Completou 10 quizzes',
    icon: '⭐',
    color: '#ec4899',
  },
  {
    id: 'fifty_quizzes',
    title: '👑 Mestre do Conhecimento',
    description: 'Completou 50 quizzes',
    icon: '👑',
    color: '#f59e0b',
  },
  {
    id: 'perfect_score',
    title: '💯 Perfeição!',
    description: 'Acertou um quiz com 100%',
    icon: '💯',
    color: '#10b981',
  },
  {
    id: 'week_streak',
    title: '🔥 Uma Semana de Fogo',
    description: 'Manteve uma streak de 7 dias',
    icon: '🔥',
    color: '#ef4444',
  },
  {
    id: 'month_streak',
    title: '💪 Consistência é Chave',
    description: 'Manteve uma streak de 30 dias',
    icon: '💪',
    color: '#f97316',
  },
  {
    id: 'best_in_class',
    title: '🏆 Melhor da Classe',
    description: 'Liderou o ranking da sua turma',
    icon: '🏆',
    color: '#fbbf24',
  },
  {
    id: 'all_subjects_master',
    title: '🎓 Mestre Completo',
    description: 'Atingiu média de 90% em todas as disciplinas',
    icon: '🎓',
    color: '#6b7280',
  },
  {
    id: 'daily_challenge_master',
    title: '🎯 Desafio Diário - Campeão',
    description: 'Completou 30 desafios diários com sucesso',
    icon: '🎯',
    color: '#8b5cf6',
  },
];

interface AchievementCardProps {
  achievement: typeof allAchievements[0];
  unlocked: boolean;
  unlockedDate?: string;
}

function AchievementCard({ achievement, unlocked, unlockedDate }: AchievementCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareText = `🎉 Desbloqueei a conquista "${achievement.title}" no MestreMiudo! ${achievement.icon}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copiado!',
      description: 'Texto copiado para a área de transferência',
    });
  };

  return (
    <div
      className={`rounded-lg border-2 p-6 text-center transition-all duration-300 ${
        unlocked
          ? 'bg-white dark:bg-gray-800 border-gray-200 shadow-md hover:shadow-lg'
          : 'bg-gray-100 border-gray-300 opacity-60'
      }`}
    >
      <div className="mb-3 text-5xl">{achievement.icon}</div>
      <h3 className="mb-2 text-lg font-bold">{achievement.title}</h3>
       <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>

      {unlocked && unlockedDate && (
        <div className="mb-4">
          <Badge className="bg-green-500">Desbloqueado</Badge>
           <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
             {new Date(unlockedDate).toLocaleDateString('pt-PT')}
           </p>
        </div>
      )}

      {unlocked && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-2 w-full"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copiado!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Partilhar
            </>
          )}
        </Button>
      )}

      {!unlocked && (
         <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Bloqueado</p>
      )}
    </div>
  );
}

function AchievementsPageContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Jogador';
  
  const [unlockedAchievements, setUnlockedAchievements] = useState<typeof mockUnlockedAchievements>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load real achievements based on student name
    setUnlockedAchievements(mockUnlockedAchievements);
    setLoading(false);
  }, [name]);

  const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));
  const unlockedMap = new Map(unlockedAchievements.map((a) => [a.id, a]));

  const progressPercentage = (unlockedAchievements.length / allAchievements.length) * 100;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-6 max-w-6xl mx-auto">
      {/* Voltar */}
      <button
        onClick={() => window.history.back()}
        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
      >
        ← Voltar ao Dashboard
      </button>

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">🏆 As Minhas Conquistas</h1>
         <p className="text-xl text-gray-600 dark:text-gray-300">
           Coleciona badges enquanto aprendes e jogas no MestreMiudo!
         </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso de Conquistas</CardTitle>
          <CardDescription>
            {unlockedAchievements.length} de {allAchievements.length} desbloqueadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-center text-sm font-semibold">
            {Math.round(progressPercentage)}% completo
          </p>
        </CardContent>
      </Card>

      {/* Unlocked Achievements */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">✨ Desbloqueadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {unlockedAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={true}
              unlockedDate={achievement.unlockDate}
            />
          ))}
        </div>
      </div>

      {/* Locked Achievements */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">🔒 Ainda para Desbloquear</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allAchievements
            .filter((a) => !unlockedIds.has(a.id))
            .map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={false}
              />
            ))}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Como Desbloquear Mais Conquistas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>✅ Completa quizzes regularmente para desbloquear badges de progresso</p>
          <p>🔥 Mantém uma streak diária para ganhar badges de consistência</p>
          <p>💯 Consegue 100% num quiz para desbloquear a conquista "Perfeição"</p>
          <p>📊 Atinge 90% de média em todas as disciplinas para ser um Mestre Completo</p>
          <p>🎯 Completa 30 desafios diários para te tornares um Campeão</p>
          <p>👑 Sobe no ranking para desbloquear "Melhor da Classe"</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Carregando conquistas...</div>}>
      <AchievementsPageContent />
    </Suspense>
  );
}
