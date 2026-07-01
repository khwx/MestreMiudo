'use client';
import { logger } from "@/lib/logger";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="card-kid border-4 border-red-300 dark:border-red-700 shadow-2xl max-w-lg w-full">
        <div className="p-8 text-center space-y-6">
          <div className="text-6xl">😵</div>
          <h2 className="text-3xl font-black text-red-600 dark:text-red-400">
            Oops! Algo correu mal...
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Não te preocupes! Podes tentar novamente ou voltar ao início.
          </p>
          {error.message && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl p-4">
              <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                {error.message}
              </p>
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={reset}
              className="btn-kid bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Tentar de Novo
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              className="btn-kid border-2 border-gray-300 dark:border-gray-700 text-lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
