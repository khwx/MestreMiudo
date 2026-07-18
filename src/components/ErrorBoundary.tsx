'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full card-kid border-4 border-red-300 dark:border-red-700 p-8 text-center">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-black text-red-700 dark:text-red-300 mb-2">
              Ups! Algo correu mal
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-6">
              Ocorreu um erro inesperado. Por favor, recarrega a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-kid bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-lg"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
