import { Skeleton } from '@/components/ui/skeleton';

export default function GamesLoading() {
  return (
    <div className="space-y-8 p-6 animate-pulse">
      <div className="text-center space-y-4 py-6">
        <Skeleton className="h-16 w-16 mx-auto rounded-full" />
        <Skeleton className="h-10 w-64 mx-auto rounded-xl" />
        <Skeleton className="h-5 w-48 mx-auto rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card-kid border-4 border-muted">
            <div className="p-6 text-center space-y-3">
              <div className="h-10 w-10 mx-auto bg-muted rounded-full" />
              <div className="h-8 w-16 mx-auto bg-muted rounded-lg" />
              <div className="h-4 w-20 mx-auto bg-muted rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
