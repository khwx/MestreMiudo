export default function DashboardLoading() {
  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="text-center space-y-4 py-6">
        <div className="h-16 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-10 w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-5 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-kid border-4 border-gray-200 dark:border-gray-700">
            <div className="p-6 text-center space-y-3">
              <div className="h-10 w-10 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-8 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-4 w-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Level progress skeleton */}
      <div className="max-w-2xl mx-auto card-kid border-4 border-gray-200 dark:border-gray-700">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-5 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-md" />
        </div>
      </div>

      {/* Mission cards skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-kid border-4 border-gray-200 dark:border-gray-700">
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded-md" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-kid border-4 border-gray-200 dark:border-gray-700">
            <div className="p-6 text-center space-y-3">
              <div className="h-12 w-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-5 w-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-md" />
              <div className="h-4 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
