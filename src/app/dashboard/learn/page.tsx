'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Divide, Leaf, CheckCircle } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { getLessonStats } from '@/lib/lessons';
import { logger } from '@/lib/logger';

const subjects = [
  {
    name: 'Português',
    icon: Book,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    slug: 'portugues',
    description: 'Aprenda a ler, escrever e falar português com lições divertidas!',
  },
  {
    name: 'Matemática',
    icon: Divide,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    slug: 'matematica',
    description: 'Domine números, operações e problemas matemáticos passo a passo.',
  },
  {
    name: 'Estudo do Meio',
    icon: Leaf,
    color: 'text-[hsl(var(--chart-2))]',
    bgColor: 'bg-[hsl(var(--chart-2))]/10',
    slug: 'estudo-do-meio',
    description: 'Explora o mundo, a natureza, a história e a geografia!',
  },
];

export default function LearnPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Amigo';
  const grade = searchParams.get('grade') || '1';

  const [stats, setStats] = useState<Record<string, { completed: number; total: number }>>({});
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getLessonStats(name);
        if (data?.bySubject) {
          const statsMap: Record<string, { completed: number; total: number }> = {
            'Português': { completed: 0, total: 0 },
            'Matemática': { completed: 0, total: 0 },
            'Estudo do Meio': { completed: 0, total: 0 },
          };
          Object.entries(data.bySubject).forEach(([subject, count]) => {
            statsMap[subject] = { completed: count as number, total: 0 };
          });
          setStats(statsMap);
        }
      } catch (err) {
        logger.error('Erro ao carregar estatísticas das lições:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [name]);

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard?name=${name}&grade=${grade}`}>
          <button aria-label="Voltar" className="p-2 hover:bg-secondary rounded-lg transition">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-4xl font-headline font-bold">Aprender a Brincar</h1>
          <p className="text-muted-foreground">Escolhe uma disciplina para começar a tua aventura educativa!</p>
        </div>
      </div>

      {/* Subject cards */}
      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const subjectStats = stats[subject.name];
          const completedCount = subjectStats?.completed || 0;
          
          return (
            <Link
              key={subject.name}
              href={`/dashboard/learn/${subject.slug}?name=${name}&grade=${grade}`}
              passHref
            >
              <Card className="hover:shadow-xl hover:border-primary transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-2xl font-bold">{subject.name}</CardTitle>
                  <div className={`p-3 rounded-full ${subject.bgColor}`}>
                    <subject.icon className={`h-8 w-8 ${subject.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-muted-foreground">{subject.description}</p>
                  {!loadingStats && completedCount > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>{completedCount} lições concluídas</span>
                    </div>
                  )}
                  {!loadingStats && completedCount === 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                      <Book className="h-4 w-4" />
                      <span>Ainda não começaste</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Info section */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-200">💡 Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-300 space-y-2">
          <p>✨ Cada lição tem uma história para tornar a aprendizagem divertida.</p>
          <p>🎯 Completa os desafios para ganhar moedas e desbloquear recompensas.</p>
          <p>⭐ Ganha 1, 2 ou 3 estrelas dependendo do teu desempenho!</p>
          <p>🎁 Quanto melhor, mais moedas ganhas para usar na loja!</p>
        </CardContent>
      </Card>
    </div>
  );
}
