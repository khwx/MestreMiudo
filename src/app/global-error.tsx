'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'linear-gradient(135deg, #eff6ff, #faf5ff, #fdf2f8)',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '400px',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dc2626', marginBottom: '1rem' }}>
              Algo correu mal!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              A página encontrou um erro. Tenta recarregar.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🔄 Tentar de Novo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
