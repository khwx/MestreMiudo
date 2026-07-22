'use client';
import { logger } from "@/lib/logger";

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStudentAchievements } from '@/app/actions';

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
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg'
          : 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 opacity-60'
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
  const grade = searchParams.get('grade') || '1';
  
  const [unlockedAchievements, setUnlockedAchievements] = useState<Array<{id: string, unlockDate: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const achievements = await getStudentAchievements(name);
        setUnlockedAchievements(achievements.map(a => ({ 
          id: a.achievement_id, 
          unlockDate: a.unlocked_at 
        })));
      } catch (error) {
        logger.error('Erro ao carregar conquistas:', error);
        setError('Não foi possível carregar as conquistas. Por favor tenta novamente.');
      } finally {
        setLoading(false);
      }
    };
    loadAchievements();
  }, [name]);

  const { unlockedIds, unlockedMap, progressPercentage } = useMemo(() => {
    const ids = new Set(unlockedAchievements.map((a) => a.id));
    const map = new Map(unlockedAchievements.map((a) => [a.id, a]));
    const progress = (unlockedAchievements.length / allAchievements.length) * 100;
    return { unlockedIds: ids, unlockedMap: map, progressPercentage: progress };
  }, [unlockedAchievements]);

  if (loading) {
    return (
      <div className="w-full space-y-8 p-6 max-w-6xl mx-auto">
        <div className="text-center space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border-2 p-6 text-center animate-pulse bg-gray-100 dark:bg-gray-800/50">
                <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6 p-6">
        <div className="text-6xl">😕</div>
        <div className="bg-red-50 dark:bg-red-900/20 border-4 border-red-300 rounded-2xl p-8 max-w-lg">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="h-8 w-8" />
            <p className="text-lg font-bold">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 btn-kid border-2">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-6 max-w-6xl mx-auto">
      {/* Voltar */}
      <Link href={`/dashboard?name=${name}&grade=${grade}`}>
        <button
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Voltar ao Dashboard
        </button>
      </Link>

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
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
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
          {allAchievements
            .filter((a) => unlockedIds.has(a.id))
            .map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={true}
                unlockedDate={unlockedMap.get(achievement.id)?.unlockDate}
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
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-200">💡 Como Desbloquear Mais Conquistas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <p>Completa quizzes regularmente para desbloquear badges de progresso</p>
          <p>Mantém uma streak diária para ganhar badges de consistência</p>
          <p>Consegue 100% num quiz para desbloquear a conquista &quot;Perfeição&quot;</p>
          <p>Atinge 90% de média em todas as disciplinas para ser um Mestre Completo</p>
          <p>Completa 30 desafios diários para te tornares um Campeão</p>
          <p>Sobe no ranking para desbloquear &quot;Melhor da Classe&quot;</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">A carregar conquistas...</div>}>
      <AchievementsPageContent />
    </Suspense>
  );
}