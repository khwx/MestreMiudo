
import { MemoryGame } from '@/components/MemoryGame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MemoryGamePage() {
  return (
    <div className="flex flex-col items-center justify-center">
        <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-4xl font-headline text-primary">Jogo da Memória</CardTitle>
            </CardHeader>
            <CardContent>
                 <MemoryGame />
            </CardContent>
        </Card>
    </div>
  );
}
