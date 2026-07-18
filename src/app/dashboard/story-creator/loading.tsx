import { Skeleton } from '@/components/ui/skeleton';

export default function StoryCreatorLoading() {
  return (
    <div className="space-y-8 p-6 animate-pulse">
      <div className="text-center space-y-4 py-6">
        <Skeleton className="h-16 w-16 mx-auto rounded-full" />
        <Skeleton className="h-10 w-64 mx-auto rounded-xl" />
        <Skeleton className="h-5 w-48 mx-auto rounded-lg" />
      </div>
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
