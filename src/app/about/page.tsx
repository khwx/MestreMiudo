import { Suspense } from 'react';

import AboutContent from './about-content';

function AboutSkeleton() {
  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-muted rounded-lg" />
        <div>
          <div className="h-10 w-64 bg-muted rounded-xl" />
          <div className="h-5 w-48 bg-muted rounded-lg mt-2" />
        </div>
      </div>
      <div className="h-64 bg-muted rounded-3xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-muted rounded-2xl" />
    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<AboutSkeleton />}>
      <AboutContent />
    </Suspense>
  );
}
