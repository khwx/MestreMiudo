"use client"

import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, BrainCircuit, History } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Jogador';
  const grade = searchParams.get('grade') || '1';
  const avatarUrl = `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={`/dashboard?name=${encodeURIComponent(name)}&grade=${grade}`} className="flex items-center gap-3">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <h1 className="font-headline text-3xl font-bold text-primary">MestreMiúdo</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/history?name=${encodeURIComponent(name)}&grade=${grade}`} passHref>
                <Button variant="ghost">
                    <History className="mr-2 h-5 w-5" />
                    Histórico
                </Button>
            </Link>
            <div className="text-right hidden sm:block">
              <p className="font-bold text-lg">{name}</p>
              <p className="text-sm text-muted-foreground">{grade}º Ano</p>
            </div>
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8 flex-1">
        {children}
      </main>
    </div>
  );
}
