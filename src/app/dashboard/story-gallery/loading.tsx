import { Skeleton } from '@/components/ui/skeleton';

export default function StoryGalleryLoading() {
  return (
    <div className="space-y-8 p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div>
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-5 w-48 rounded-lg mt-2" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card-kid border-4 border-muted">
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
