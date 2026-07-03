"use client";

import { MemoryGame } from '@/components/MemoryGame';
import { TicTacToe } from '@/components/TicTacToe';
import { HangmanGame } from '@/components/HangmanGameImproved';
import { CrosswordGame } from '@/components/CrosswordGame';
import { WordSearchGame } from '@/components/WordSearchGame';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Gamepad2, Brain, Skull, Grid3x3, Puzzle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';


export default function GamesClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';
  const grade = searchParams.get('grade') || '';

  return (
    <div className="flex flex-col items-center justify-center">
      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard?name=${name}&grade=${grade}`)} className="gap-2 self-start mb-4">
        ← Voltar ao Dashboard
      </Button>
      <h1 className="text-4xl font-headline font-bold text-primary mb-8">Salão de Jogos</h1>
      <Tabs defaultValue="memory" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="memory">
            <Brain className="mr-2 h-5 w-5" />
            Jogo da Memória
          </TabsTrigger>
          <TabsTrigger value="tictactoe">
            <Gamepad2 className="mr-2 h-5 w-5" />
            Jogo do Galo
          </TabsTrigger>
          <TabsTrigger value="hangman">
            <Skull className="mr-2 h-5 w-5" />
            Jogo da Forca
          </TabsTrigger>
          <TabsTrigger value="crossword">
            <Puzzle className="mr-2 h-5 w-5" />
            Palavras Cruzadas
          </TabsTrigger>
          <TabsTrigger value="wordsearch">
            <Grid3x3 className="mr-2 h-5 w-5" />
            Sopa de Letras
          </TabsTrigger>
        </TabsList>
        <TabsContent value="memory">
            <Card>
                <CardHeader>
                    <CardTitle>Jogo da Memória</CardTitle>
                    <CardDescription>Testa a tua memória e encontra os pares!</CardDescription>
                </CardHeader>
                <CardContent>
                    <MemoryGame />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="tictactoe">
            <Card>
                <CardHeader>
                    <CardTitle>Jogo do Galo</CardTitle>
                    <CardDescription>Joga contra um amigo ou contra o MestreMiúdo!</CardDescription>
                </CardHeader>
                <CardContent>
                    <TicTacToe />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="hangman">
            <Card>
                <CardHeader>
                    <CardTitle>Jogo da Forca</CardTitle>
                    <CardDescription>Adivinha a palavra secreta antes que seja tarde demais!</CardDescription>
                </CardHeader>
                <CardContent>
                    <HangmanGame />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="crossword">
            <Card>
                <CardHeader>
                    <CardTitle>Palavras Cruzadas</CardTitle>
                    <CardDescription>Resolve o cruzograma com palavras do vocabulário!</CardDescription>
                </CardHeader>
                <CardContent>
                    <CrosswordGame />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="wordsearch">
            <Card>
                <CardHeader>
                    <CardTitle>Sopa de Letras</CardTitle>
                    <CardDescription>Encontra todas as palavras escondidas na grelha!</CardDescription>
                </CardHeader>
                <CardContent>
                    <WordSearchGame />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
