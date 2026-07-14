
import { Suspense } from 'react';
import GamesClientPage from './client-page';

export const dynamic = 'force-dynamic';

export default function GamesPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
                <div className="text-6xl animate-bounce">🎮</div>
                <p className="text-xl text-gray-600 dark:text-gray-300 font-bold">A carregar o salão de jogos...</p>
            </div>
        }>
            <GamesClientPage />
        </Suspense>
    );
}
