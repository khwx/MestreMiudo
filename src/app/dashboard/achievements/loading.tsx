import { Skeleton } from '@/components/ui/skeleton';

export default function AchievementsLoading() {
  return (
    <div className="w-full space-y-8 p-6 max-w-6xl mx-auto">
      {/* Back */}
      <Skeleton className="h-4 w-36" />

      {/* Header */}
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      {/* Progress Card */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>

      {/* Unlocked Section */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border-2 p-6 text-center space-y-3"
            >
              <Skeleton className="h-14 w-14 mx-auto rounded-lg" />
              <Skeleton className="h-5 w-32 mx-auto" />
              <Skeleton className="h-4 w-40 mx-auto" />
              <Skeleton className="h-6 w-24 mx-auto rounded-full" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Locked Section */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border-2 p-6 text-center space-y-3 opacity-60"
            >
              <Skeleton className="h-14 w-14 mx-auto rounded-lg" />
              <Skeleton className="h-5 w-32 mx-auto" />
              <Skeleton className="h-4 w-40 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg border p-6 space-y-2">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
