import { Suspense } from 'react';
import DashboardClientPage from './client-page';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
                <div className="text-6xl animate-bounce">🏠</div>
                <p className="text-xl text-gray-600 dark:text-gray-300 font-bold">A carregar o teu dashboard...</p>
            </div>
        }>
            <DashboardClientPage />
        </Suspense>
    );
}
