'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Zap, Loader2 } from 'lucide-react';
import { getGlobalLeaderboard, getGradeLeaderboard } from '@/lib/leaderboards';

// Mock data - em produção viria do servidor
const mockGlobalLeaderboard = [
  {
    rank: 1,
    name: 'João Silva',
    grade: 3,
    points: 4850,
    quizzes: 48,
    averageScore: 94.5,
  },
  {
    rank: 2,
    name: 'Maria Santos',
    grade: 4,
    points: 4620,
    quizzes: 45,
    averageScore: 92.3,
  },
  {
    rank: 3,
    name: 'Pedro Oliveira',
    grade: 2,
    points: 4380,
    quizzes: 42,
    averageScore: 91.8,
  },
  {
    rank: 4,
    name: 'Ana Costa',
    grade: 3,
    points: 4150,
    quizzes: 40,
    averageScore: 90.1,
  },
  {
    rank: 5,
    name: 'TU', // Current user
    grade: 3,
    points: 3920,
    quizzes: 38,
    averageScore: 89.5,
    isCurrentUser: true,
  },
  {
    rank: 6,
    name: 'Carlos Martins',
    grade: 1,
    points: 3650,
    quizzes: 35,
    averageScore: 88.2,
  },
  {
    rank: 7,
    name: 'Sofia Pereira',
    grade: 2,
    points: 3420,
    quizzes: 32,
    averageScore: 87.5,
  },
  {
    rank: 8,
    name: 'Tiago Ferreira',
    grade: 4,
    points: 3180,
    quizzes: 30,
    averageScore: 86.7,
  },
];

const mockGrade3Leaderboard = [
  {
    rank: 1,
    name: 'João Silva',
    grade: 3,
    points: 4850,
    quizzes: 48,
    averageScore: 94.5,
  },
  {
    rank: 2,
    name: 'Ana Costa',
    grade: 3,
    points: 4150,
    quizzes: 40,
    averageScore: 90.1,
  },
  {
    rank: 3,
    name: 'TU',
    grade: 3,
    points: 3920,
    quizzes: 38,
    averageScore: 89.5,
    isCurrentUser: true,
  },
];

interface LeaderboardRowProps {
  entry: (typeof mockGlobalLeaderboard)[0];
}

function LeaderboardRow({ entry }: LeaderboardRowProps) {
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

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
        entry.isCurrentUser
          ? 'bg-blue-50 border-blue-300 shadow-md'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className={`text-3xl font-bold w-12 text-center ${getMedalColor(entry.rank)}`}>
        {getMedalEmoji(entry.rank)}
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold">{entry.name}</p>
          {entry.isCurrentUser && (
            <Badge className="bg-blue-600">Eu</Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {entry.grade}º ano
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          {entry.quizzes} quizzes • Média: {entry.averageScore}%
        </p>
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold text-purple-600">{entry.points}</p>
        <p className="text-xs text-gray-500">pontos</p>
      </div>
    </div>
  );
}

function LeaderboardPageContent() {
  const searchParams = useSearchParams();
  const studentName = searchParams.get('name') || 'Jogador';
  const gradeStr = searchParams.get('grade') || '1';
  const gradeLevel = parseInt(gradeStr);
  
  const [globalLeaderboard, setGlobalLeaderboard] = useState<typeof mockGlobalLeaderboard>([]);
  const [gradeLeaderboard, setGradeLeaderboard] = useState<typeof mockGrade3Leaderboard>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load real leaderboards
    setGlobalLeaderboard(mockGlobalLeaderboard);
    setGradeLeaderboard(mockGrade3Leaderboard);
    setLoading(false);
  }, [studentName, gradeLevel]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentUserRank = globalLeaderboard.find((e) => e.isCurrentUser);

  return (
    <div className="w-full space-y-8 p-6 max-w-4xl mx-auto">
      {/* Voltar */}
      <button
        onClick={() => window.history.back()}
        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
      >
        ← Voltar ao Dashboard
      </button>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl">🏆</div>
        <h1 className="text-5xl font-bold">Classificações</h1>
        <p className="text-xl text-gray-600">Vê como te compara com outros estudantes!</p>
      </div>

      {/* Tua Posição */}
      {currentUserRank && (
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
              <p className="text-3xl font-bold">{currentUserRank.points}</p>
              <p className="text-sm opacity-90">Pontos</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{currentUserRank.quizzes}</p>
              <p className="text-sm opacity-90">Quizzes</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{currentUserRank.averageScore}%</p>
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
            3º Ano
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 8 Estudantes (Global)</CardTitle>
              <CardDescription>Os melhores estudantes em toda a plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {globalLeaderboard.map((entry) => (
                <LeaderboardRow key={entry.rank} entry={entry} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grade" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 3 do 3º Ano</CardTitle>
              <CardDescription>Os melhores da tua turma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {gradeLeaderboard.map((entry) => (
                <LeaderboardRow key={entry.rank} entry={entry} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Como Subir no Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-green-800 space-y-2">
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
    <Suspense fallback={<div className="p-6 text-center">Carregando rankings...</div>}>
      <LeaderboardPageContent />
    </Suspense>
  );
}
