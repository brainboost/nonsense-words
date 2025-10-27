'use client';

import { useRouter } from 'next/navigation';

interface ClientHomePageProps {
  error?: string;
}

export default function ClientHomePage({ error }: ClientHomePageProps) {
  const router = useRouter();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 to-green-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold text-green-100 mb-4">
            Nonsense Word Generator
          </h1>
          <p className="text-green-200 mb-8">
            Something went wrong while loading words. 
            Please refresh the page to try again.
          </p>
          <button 
            onClick={() => router.refresh()}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return null; // This should not be reached in normal flow
}