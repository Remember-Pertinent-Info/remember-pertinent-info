'use client';

import { useEffect } from 'react';

/**
 * Global error boundary for the root layout
 * This catches errors in the root layout itself
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: '20px',
        }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>Oops!</h1>
          <h2 style={{ marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ marginBottom: '2rem', color: '#666', maxWidth: '600px' }}>
            We encountered a critical error. Please try refreshing the page.
          </p>
          {error.digest && (
            <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#999', marginBottom: '2rem' }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
