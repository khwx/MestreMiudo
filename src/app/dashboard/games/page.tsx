
import { MemoryGame } from '@/components/MemoryGame';
import { TicTacToe } from '@/components/TicTacToe';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Brain } from 'lucide-react';


export default function GamesPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-headline font-bold text-primary mb-8">Salão de Jogos</h1>
      <Tabs defaultValue="memory" className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="memory">
            <Brain className="mr-2 h-5 w-5" />
            Jogo da Memória
          </TabsTrigger>
          <TabsTrigger value="tictactoe">
            <Gamepad2 className="mr-2 h-5 w-5" />
            Jogo do Galo
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
      </Tabs>
    </div>
  );
}

