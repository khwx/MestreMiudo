import { Skeleton } from '@/components/ui/skeleton';

export default function ParentLoading() {
  return (
    <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-12 w-80 mx-auto" />
        <Skeleton className="h-6 w-72 mx-auto" />
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="card-kid border-4 border-teal-300 dark:border-teal-700"
          >
            <div className="p-6 space-y-4">
              {/* Student Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-7 w-40" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>

              {/* Last Activity */}
              <Skeleton className="h-4 w-56" />

              {/* Score Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="rounded-xl p-3 text-center space-y-1"
                  >
                    <Skeleton className="h-5 w-5 mx-auto" />
                    <Skeleton className="h-6 w-12 mx-auto" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export Button */}
      <div className="text-center pt-4">
        <Skeleton className="h-14 w-56 mx-auto rounded-xl" />
      </div>
    </div>
  );
}
