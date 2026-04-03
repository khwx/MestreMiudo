

"use client"

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Divide, Leaf, Loader2, Shuffle, Gamepad2, Brain, BookHeart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { getFullQuizHistory } from '@/app/actions';
import type { QuizResultEntry } from '@/app/shared-schemas';

const subjects = [
  { name: 'Português', icon: Book, color: 'text-primary', bgColor: 'bg-primary/10', slug: 'portugues' },
  { name: 'Matemática', icon: Divide, color: 'text-destructive', bgColor: 'bg-destructive/10', slug: 'matematica' },
  { name: 'Estudo do Meio', icon: Leaf, color: 'text-[hsl(var(--chart-2))]', bgColor: 'bg-[hsl(var(--chart-2))]/10', slug: 'estudo-do-meio' },
];

const surpriseChallenge = {
    name: 'Desafio Surpresa', icon: Shuffle, color: 'text-accent', bgColor: 'bg-accent/10', slug: 'misto'
};

const storyCreator = {
    name: 'Oficina de Histórias', icon: BookHeart, color: 'text-[hsl(var(--chart-4))]', bgColor: 'bg-[hsl(var(--chart-4))]/10'
};

const gamesRoom = {
    name: 'Salão de Jogos', icon: Gamepad2, color: 'text-[hsl(var(--chart-3))]', bgColor: 'bg-[hsl(var(--chart-3))]/10'
};

const levelThresholds = [
    { level: 1, points: 0 },
    { level: 2, points: 100 },
    { level: 3, points: 300 },
    { level: 4, points: 600 },
    { level: 5, points: 1000 },
    { level: 6, points: 1500 },
    // Add more levels as needed
];

const calculateLevel = (totalPoints: number) => {
    let currentLevel = 1;
    let pointsForNextLevel = 100;
    let pointsAtCurrentLevel = 0;

    for (let i = levelThresholds.length - 1; i >= 0; i--) {
        if (totalPoints >= levelThresholds[i].points) {
            currentLevel = levelThresholds[i].level;
            pointsAtCurrentLevel = levelThresholds[i].points;
            if (i < levelThresholds.length - 1) {
                pointsForNextLevel = levelThresholds[i + 1].points;
            } else {
                pointsForNextLevel = Infinity; // Max level reached
            }
            break;
        }
    }

    const pointsToNext = pointsForNextLevel - pointsAtCurrentLevel;
    const progressInLevel = totalPoints - pointsAtCurrentLevel;
    const progressPercentage = pointsToNext > 0 && pointsToNext !== Infinity ? (progressInLevel / pointsToNext) * 100 : 100;
    
    return {
        level: currentLevel,
        nextLevel: currentLevel + 1,
        progressPercentage,
        pointsNeeded: pointsToNext === Infinity ? 0 : pointsToNext - progressInLevel,
    };
};

export default function DashboardClientPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Amigo';
  const grade = searchParams.get('grade');

  const [history, setHistory] = useState<QuizResultEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name) {
      getFullQuizHistory(name)
        .then(setHistory)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [name]);
  
  // Each correct answer gives 10 points
  const totalPoints = history.reduce((acc, entry) => acc + entry.score * 10, 0);
  const { level, nextLevel, progressPercentage, pointsNeeded } = calculateLevel(totalPoints);

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-headline font-bold">Olá, {name}!</h2>
        <p className="text-muted-foreground text-xl">Pronto para uma nova aventura do conhecimento?</p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>O Teu Progresso Geral</CardTitle>
          <CardDescription>Ganha pontos e sobe de nível ao completar desafios!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            {loading ? (
                <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="font-bold text-lg">Nível {level}</span>
                        {pointsNeeded > 0 && (
                            <span className="font-bold text-lg">Nível {nextLevel}</span>
                        )}
                    </div>
                    <Progress value={progressPercentage} />
                    <p className="text-sm text-muted-foreground text-center pt-2">
                        {pointsNeeded > 0 ? `Faltam ${pointsNeeded} pontos para o próximo nível!` : "Parabéns! Alcançaste o nível máximo!"}
                    </p>
                </>
            )}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-2xl font-bold text-center mb-6">Escolhe a tua próxima missão!</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <Link key={subject.name} href={`/quiz/${subject.slug}?name=${name}&grade=${grade}`} passHref>
              <Card className="hover:shadow-xl hover:border-primary transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-2xl font-bold">{subject.name}</CardTitle>
                  <div className={`p-3 rounded-full ${subject.bgColor}`}>
                    <subject.icon className={`h-8 w-8 ${subject.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">Desafios de {subject.name} esperam por ti!</p>
                </CardContent>
              </Card>
            </Link>
          ))}
          <Link key={surpriseChallenge.name} href={`/quiz/${surpriseChallenge.slug}?name=${name}&grade=${grade}`} passHref>
              <Card className="hover:shadow-xl hover:border-accent transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-2xl font-bold">{surpriseChallenge.name}</CardTitle>
                  <div className={`p-3 rounded-full ${surpriseChallenge.bgColor}`}>
                    <surpriseChallenge.icon className={`h-8 w-8 ${surpriseChallenge.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">Testa os teus conhecimentos em todas as áreas!</p>
                </CardContent>
              </Card>
            </Link>
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
             <Link href={`/dashboard/story-creator?name=${name}&grade=${grade}`} passHref>
               <Card className="hover:shadow-xl hover:border-[hsl(var(--chart-4))] transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col bg-[hsl(var(--chart-4))]/10">
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-2xl font-bold text-[hsl(var(--chart-4))]">{storyCreator.name}</CardTitle>
                   <div className={`p-3 rounded-full ${storyCreator.bgColor}`}>
                     <storyCreator.icon className={`h-8 w-8 ${storyCreator.color}`} />
                   </div>
                 </CardHeader>
                 <CardContent className="flex-grow">
                   <p className="text-[hsl(var(--chart-4))]">Usa a tua imaginação e cria uma história única!</p>
                 </CardContent>
               </Card>
            </Link>
            <Link href={`/dashboard/games?name=${name}&grade=${grade}`} passHref>
               <Card className="hover:shadow-xl hover:border-[hsl(var(--chart-3))] transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col bg-[hsl(var(--chart-3))]/10">
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-2xl font-bold text-[hsl(var(--chart-3))]">{gamesRoom.name}</CardTitle>
                   <div className={`p-3 rounded-full ${gamesRoom.bgColor}`}>
                     <gamesRoom.icon className={`h-8 w-8 ${gamesRoom.color}`} />
                   </div>
                 </CardHeader>
                 <CardContent className="flex-grow">
                   <p className="text-[hsl(var(--chart-3))]">Faz uma pausa e diverte-te a jogar!</p>
                 </CardContent>
               </Card>
            </Link>
        </div>
    </div>
  );
}
