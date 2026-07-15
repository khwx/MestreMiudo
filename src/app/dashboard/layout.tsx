"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, BrainCircuit, History } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/DarkModeToggle';

function DashboardHeader() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Jogador';
  const grade = searchParams.get('grade') || '1';
  const avatarUrl = `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}`;

  return (
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
          <div className="flex items-center gap-2">
            <DarkModeToggle />
          </div>
          <div className="text-right hidden sm:block">
            <p className="font-bold text-lg">{name}</p>
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
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Suspense fallback={<div className="bg-card border-b p-4 h-20 animate-pulse" />}>
        <DashboardHeader />
      </Suspense>
      <main id="main-content" className="container mx-auto p-4 md:p-8 flex-1">
        <Suspense fallback={
          <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
            <div className="text-center space-y-4 py-6">
              <div className="h-16 w-16 mx-auto bg-muted rounded-full" />
              <div className="h-10 w-64 mx-auto bg-muted rounded-xl" />
              <div className="h-5 w-48 mx-auto bg-muted rounded-lg" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-kid border-4 border-muted">
                  <div className="p-6 text-center space-y-3">
                    <div className="h-10 w-10 mx-auto bg-muted rounded-full" />
                    <div className="h-8 w-16 mx-auto bg-muted rounded-lg" />
                    <div className="h-4 w-20 mx-auto bg-muted rounded-md" />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-kid border-4 border-muted">
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-7 w-40 bg-muted rounded-lg" />
                      <div className="h-14 w-14 bg-muted rounded-full" />
                    </div>
                    <div className="h-5 w-full bg-muted rounded-md" />
                    <div className="h-4 w-32 bg-muted rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
