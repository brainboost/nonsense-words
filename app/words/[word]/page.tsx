import { notFound } from 'next/navigation';
import { getWordByName } from '@/lib/words';
import ShareButton from '@/components/ShareButton';
import WordCard from '@/components/WordCard';

interface WordPageProps {
  params: Promise<{
    word: string;
  }>;
}

export default async function WordPage({ params }: WordPageProps) {
  const { word } = await params;
  const decodedWord = decodeURIComponent(word);
  
  const wordData = await getWordByName(decodedWord);

  if (!wordData) {
    notFound();
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/words/${encodeURIComponent(wordData.word)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 to-green-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-green-100 mb-4">
              Nonsense Word Generator
            </h1>
            <p className="text-green-200">
              Discover unique words with whimsical definitions
            </p>
          </header>

          {/* Word Card */}
          <WordCard word={wordData} />

          {/* Share Button */}
          <div className="flex justify-center mt-8">
            <ShareButton url={shareUrl} word={wordData.word} />
          </div>

          {/* Navigation */}
          <div className="flex justify-center mt-12">
            <a 
              href="/"
              className="bg-green-700 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Discover Another Word
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}