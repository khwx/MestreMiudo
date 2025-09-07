"use client"

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Divide, Leaf } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const subjects = [
  { name: 'Português', icon: Book, color: 'text-primary', bgColor: 'bg-primary/10', slug: 'Português' },
  { name: 'Matemática', icon: Divide, color: 'text-destructive', bgColor: 'bg-destructive/10', slug: 'Matemática' },
  { name: 'Estudo do Meio', icon: Leaf, color: 'text-[hsl(var(--chart-2))]', bgColor: 'bg-[hsl(var(--chart-2))]/10', slug: 'Estudo do Meio' },
];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Amigo';
  const grade = searchParams.get('grade');

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-headline font-bold">Olá, {name}!</h2>
        <p className="text-muted-foreground text-xl">Pronto para uma nova aventura do conhecimento?</p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>O Teu Progresso Geral</CardTitle>
          <CardDescription>Completa desafios para subir de nível!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Nível 1</span>
            <span className="font-bold">Nível 2</span>
          </div>
          <Progress value={30} />
          <p className="text-sm text-muted-foreground text-center pt-2">Faltam 70 pontos para o próximo nível!</p>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-2xl font-bold text-center mb-6">Escolhe a tua próxima missão!</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link key={subject.name} href={`/quiz/${subject.slug.toLowerCase()}?name=${name}&grade=${grade}`} passHref>
              <Card className="hover:shadow-xl hover:border-primary transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-2xl font-bold">{subject.name}</CardTitle>
                  <div className={`p-3 rounded-full ${subject.bgColor}`}>
                    <subject.icon className={`h-8 w-8 ${subject.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Desafios de {subject.name} esperam por ti!</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
