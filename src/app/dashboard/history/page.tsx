
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import HistoryClientPage from './client-page';

export default function HistoryPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <HistoryClientPage />
        </Suspense>
    );
}
