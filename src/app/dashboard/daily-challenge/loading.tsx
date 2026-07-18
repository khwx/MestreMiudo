import { Skeleton } from '@/components/ui/skeleton';

export default function DailyChallengeLoading() {
  return (
    <div className="space-y-8 p-6 animate-pulse">
      <div className="text-center space-y-4 py-6">
        <Skeleton className="h-16 w-16 mx-auto rounded-full" />
        <Skeleton className="h-10 w-64 mx-auto rounded-xl" />
        <Skeleton className="h-5 w-48 mx-auto rounded-lg" />
      </div>
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
