'use client';

import { Suspense } from 'react';
import StoryGalleryClientPage from './client-page';

export default function StoryGalleryPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto animate-pulse">
        <div className="text-center space-y-4 py-6">
          <div className="h-16 w-16 mx-auto bg-muted rounded-full" />
          <div className="h-10 w-64 mx-auto bg-muted rounded-xl" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-kid border-4 border-muted">
              <div className="p-6 space-y-3">
                <div className="h-7 w-40 bg-muted rounded-lg" />
                <div className="h-5 w-full bg-muted rounded-md" />
                <div className="h-4 w-32 bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <StoryGalleryClientPage />
    </Suspense>
  );
}
