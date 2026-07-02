import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardLoading() {
  return (
    <div className="w-full space-y-8 p-6 max-w-4xl mx-auto">
      {/* Back */}
      <Skeleton className="h-4 w-36" />

      {/* Header */}
      <div className="text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-6 w-80 mx-auto" />
      </div>

      {/* Position Card */}
      <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6">
        <div className="space-y-4">
          <Skeleton className="h-5 w-32 bg-white/30" />
          <div className="grid grid-cols-4 gap-4 text-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-10 w-16 mx-auto bg-white/30" />
                <Skeleton className="h-4 w-16 mx-auto bg-white/30" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid w-full grid-cols-2 gap-2">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Ranking List */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-lg border-2"
            >
              <Skeleton className="h-10 w-12 rounded-lg" />
              <div className="flex-grow space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-8 w-16 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg border p-6 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
