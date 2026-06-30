import { Suspense } from 'react';
import LessonDetailClient from './client-page';

export default function LessonPage() {
  return (
    <Suspense fallback={<div>A carregar...</div>}>
      <LessonDetailClient />
    </Suspense>
  );
}
