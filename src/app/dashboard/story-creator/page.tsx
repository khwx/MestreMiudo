import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import StoryCreatorClientPage from './client-page';

export const dynamic = 'force-dynamic';

export default function StoryCreatorPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        }>
            <StoryCreatorClientPage />
        </Suspense>
    );
}
