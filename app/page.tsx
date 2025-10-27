import { getRandomWordFromLastFifty } from '@/lib/words';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  let randomWord;

  try {
    randomWord = await getRandomWordFromLastFifty();
  } catch (error) {
    console.error('Error loading random word:', error);
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
          <form>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!randomWord) {
    // If no words exist, show a welcome message
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 to-green-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold text-green-100 mb-4">
            Nonsense Word Generator
          </h1>
          <p className="text-green-200 mb-8">
            Welcome! Words are being generated in the background.
            Please check back in a few minutes.
          </p>
          <div className="animate-pulse">
            <div className="inline-block h-8 w-8 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to the word page - this should not be in try-catch
  redirect(`/words/${encodeURIComponent(randomWord.word)}`);
}

// Force dynamic rendering to avoid prerendering issues with redirect
export const dynamic = 'force-dynamic';