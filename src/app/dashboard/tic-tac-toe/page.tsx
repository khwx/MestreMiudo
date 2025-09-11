
import { TicTacToe } from '@/components/TicTacToe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TicTacToePage() {
  return (
    <div className="flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-4xl font-headline text-primary">Jogo do Galo</CardTitle>
            </CardHeader>
            <CardContent>
                 <TicTacToe />
            </CardContent>
        </Card>
    </div>
  );
}
