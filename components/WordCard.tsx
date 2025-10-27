import { Word } from '@/lib/words';

interface WordCardProps {
  word: Word;
}

export default function WordCard({ word }: WordCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="relative bg-green-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-green-700">
      {/* Word */}
      <div className="text-center mb-6">
        <h2 className="text-5xl font-bold text-green-100 mb-2 capitalize">
          {word.word}
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"></div>
      </div>

      {/* Definition */}
      <div className="text-center mb-8">
        <p className="text-xl text-green-200 leading-relaxed">
          {word.definition}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex justify-between items-center text-green-300 text-sm">
        <div className="flex items-center gap-2">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span>Created {formatDate(word.createdAt)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" 
            />
          </svg>
          <span>Nonsense Word</span>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-2 right-2 opacity-10">
        <svg 
          className="w-16 h-16 text-green-400" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
    </div>
  );
}