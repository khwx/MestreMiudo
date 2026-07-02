import { Skeleton } from '@/components/ui/skeleton';

export default function ShopLoading() {
  return (
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-12 w-40 mx-auto rounded-full" />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="card-kid border-4 border-yellow-300 dark:border-yellow-700"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 dark:border-gray-700">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-10 w-28 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div className="text-center pt-6">
        <Skeleton className="h-12 w-48 mx-auto rounded-xl" />
      </div>
    </div>
  );
}
