
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import GamesClientPage from './client-page';

export const dynamic = 'force-dynamic';

export default function GamesPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <GamesClientPage />
        </Suspense>
    );
}
