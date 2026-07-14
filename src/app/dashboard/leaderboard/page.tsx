'use client';
import { logger } from "@/lib/logger";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Zap } from 'lucide-react';
import { getGlobalLeaderboard, getGradeLeaderboard, getStudentRankContext } from '@/lib/leaderboards';

interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  gradeLevel?: number;
  totalPoints: number;
  totalQuizzes: number;
  averageScore: number;
  rank: number;
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  currentUserId?: string;
}

function LeaderboardRow({ entry, currentUserId }: LeaderboardRowProps) {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-600';
      default:
        return 'text-gray-300';
    }
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const isCurrentUser = entry.studentId === currentUserId;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
        isCurrentUser
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 shadow-md'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className={`text-3xl font-bold w-12 text-center ${getMedalColor(entry.rank)}`}>
        {getMedalEmoji(entry.rank)}
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold">{entry.studentName}</p>
          {isCurrentUser && (
            <Badge className="bg-blue-600">Eu</Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {entry.gradeLevel}º ano
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {entry.totalQuizzes} quizzes • Média: {entry.averageScore.toFixed(1)}%
        </p>
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold text-purple-600">{entry.totalPoints}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">pontos</p>
      </div>
    </div>
  );
}

function LeaderboardPageContent() {
  const searchParams = useSearchParams();
  const studentName = searchParams.get('name') || 'Jogador';
  const studentId = searchParams.get('studentId') || '';
  const gradeStr = searchParams.get('grade') || '1';
  const gradeLevel = parseInt(gradeStr);
  
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gradeLeaderboard, setGradeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [studentRankContext, setStudentRankContext] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboards = async () => {
      try {
        // Load real leaderboards from Supabase
        const [globalData, gradeData, rankContext] = await Promise.all([
          getGlobalLeaderboard(50), // Get top 50 for global leaderboard
          getGradeLeaderboard(gradeLevel, 10), // Get top 10 for grade leaderboard
          getStudentRankContext(studentId || studentName, 2) // Get context around current student
        ]);
        
        setGlobalLeaderboard(globalData);
        setGradeLeaderboard(gradeData);
        setStudentRankContext(rankContext);
      } catch (error) {
        logger.error('Falha ao carregar classificações:', error);
        setError('Não foi possível carregar as classificações.');
      } finally {
        setLoading(false);
      }
    };

    if (studentName || studentId) {
      loadLeaderboards();
    } else {
      setLoading(false);
    }
  }, [studentName, studentId, gradeLevel]);

  if (loading) {
    return (
      <div className="w-full space-y-8 p-6 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">🏆</div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-kid border-4 border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-kid border-4 border-red-300 dark:border-red-700 max-w-md mx-auto mt-8 p-8 text-center">
        <Trophy className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-red-700 dark:text-red-300 mb-2">Erro ao carregar</h2>
        <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
      </div>
    );
  }

  // Find current user in global leaderboard for the position card
  const currentUserInGlobal = globalLeaderboard.find(
    entry => entry.studentName === studentName
  );

  // Create a local "current user rank" for display
  const currentUserRank = currentUserInGlobal || {
    rank: studentRankContext.length > 0 ? studentRankContext[0].rank : 0,
    totalPoints: 0,
    totalQuizzes: 0,
    averageScore: 0
  };

  return (
    <div className="w-full space-y-8 p-6 max-w-4xl mx-auto">
      {/* Voltar */}
      <Link href={`/dashboard?name=${studentName}&grade=${gradeStr}`}>
        <button
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Voltar ao Dashboard
        </button>
      </Link>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl">🏆</div>
        <h1 className="text-5xl font-bold">Classificações</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Vê como te compara com outros estudantes!</p>
      </div>

      {/* Tua Posição */}
      {currentUserRank && currentUserRank.rank > 0 && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle>A Tua Posição</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">#{currentUserRank.rank}</p>
              <p className="text-sm opacity-90">Posição</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{currentUserInGlobal?.totalPoints || 0}</p>
              <p className="text-sm opacity-90">Pontos</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{currentUserInGlobal?.totalQuizzes || 0}</p>
              <p className="text-sm opacity-90">Quizzes</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{currentUserInGlobal?.averageScore.toFixed(0) || 0}%</p>
              <p className="text-sm opacity-90">Média</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global" className="gap-2">
            <Trophy className="w-4 h-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="grade" className="gap-2">
            <Medal className="w-4 h-4" />
            {gradeLevel}º Ano
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 8 Estudantes (Global)</CardTitle>
              <CardDescription>Os melhores estudantes em toda a plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {globalLeaderboard.length > 0 ? (
                globalLeaderboard.map((entry) => (
                  <LeaderboardRow key={entry.rank} entry={entry} currentUserId={studentId || currentUserInGlobal?.studentId} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-semibold">Ainda não há classificações disponíveis.</p>
                  <p className="text-sm mt-1">Completa quizzes para apareceres no ranking!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grade" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 3 do {gradeLevel}º Ano</CardTitle>
              <CardDescription>Os melhores da tua turma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {gradeLeaderboard.length > 0 ? (
                gradeLeaderboard.map((entry) => (
                  <LeaderboardRow key={entry.rank} entry={entry} currentUserId={studentId || currentUserInGlobal?.studentId} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-semibold">Ainda não há classificações para este ano.</p>
                  <p className="text-sm mt-1">Sê o primeiro a completar um quiz!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
        <CardHeader>
          <CardTitle className="text-green-900 dark:text-green-200 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Como Subir no Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-green-800 dark:text-green-300 space-y-2">
          <p>✅ Completa quizzes para ganhar pontos</p>
          <p>⭐ Acerta mais questões para aumentar a tua média</p>
          <p>🔥 Mantém uma streak diária para bónus extra</p>
          <p>🎯 Completa desafios diários para 50 pontos extra</p>
          <p>💪 Compete amigavelmente com colegas da tua turma</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">A carregar rankings...</div>}>
      <LeaderboardPageContent />
    </Suspense>
  );
}
