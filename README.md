This web application is totally built from scratch by GLM-4.6 using following prompt:
```
Your task is to create a web app with a nonsense word generator using Next.js. This directory contains code from previous attempt, the  app should be located here.
Under the hood is the OpenAI API, which makes 5 requests to the AI using​​ scheduled background task every 20 minutes. Each request generates 10 nonsense words in English and their definitions. The word and its definition are saved to a local JSON file, which is used as a base for UI word output. The database update strategy - append new words to existing file.
When the main app page is opened, a random word from the last 50 is taken from the database and the user is redirected to the page for that word, which already has a definition and a share button. Accordingly, when the page for a specific word is opened, its definition is loaded from the database and displayed. Simple design using tailwind/shadcn-ui, in dark green tones.
```

During manual review and debugging several additional smaller prompts were applied, with error responses and improvements (eg added configuration params). Working application is deployed to [https://nonsense-words-7h0nh603z-brainboosts-projects.vercel.app/](https://nonsense-words-delta.vercel.app)  
After this line, the documentation is also created by the model. 

# Nonsense Word Generator

A Next.js web application that generates unique nonsense words with creative definitions using OpenAI's API. Words are automatically generated every 20 minutes and stored in a local JSON database.

## Features

- **Automatic Word Generation**: Generates 50 new nonsense words every 20 minutes using OpenAI API
- **Random Word Discovery**: Main page redirects to a random word from the last 50 generated
- **Individual Word Pages**: Each word has its own page with definition and sharing functionality
- **Dark Green Theme**: Beautiful dark green design using Tailwind CSS
- **Share Functionality**: Easy sharing of words via native share API or clipboard
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark green theme
- **API**: OpenAI GPT-3.5-turbo for word generation
- **Storage**: Local JSON file with append strategy
- **Deployment**: Ready for Vercel or other Next.js hosting

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nonsense-word-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/
│   │   └── cron/          # Cron job endpoint for word generation
│   ├── words/
│   │   └── [word]/        # Dynamic word pages
│   ├── globals.css        # Global styles with dark green theme
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page with random word redirect
│   └── not-found.tsx      # 404 page
├── components/
│   ├── WordCard.tsx       # Word display component
│   └── ShareButton.tsx    # Share functionality component
├── lib/
│   ├── openai.ts          # OpenAI API integration
│   ├── utils.ts           # Utility functions
│   └── words.ts           # Word database operations
├── data/
│   └── words.json         # Local word storage
└── public/                # Static assets
```

## How It Works

1. **Cron Job**: Every 20 minutes, Next.js cron job triggers `/api/cron`
2. **Word Generation**: Makes 5 parallel requests to OpenAI API, each generating 10 words
3. **Storage**: New words are appended to `data/words.json`
4. **Main Page**: When visited, selects a random word from the last 50 and redirects
5. **Word Pages**: Individual pages display word definitions with share functionality

## API Endpoints

### GET /api/cron
- **Purpose**: Generates new nonsense words
- **Frequency**: Every 20 minutes (configured via cron)
- **Authentication**: Requires `CRON_SECRET` environment variable
- **Response**: JSON with generation status and word count

## Environment Variables

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# App URL for sharing (required)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron secret for authentication (optional but recommended)
CRON_SECRET=your_cron_secret_here

# Word Generation Configuration (optional)
CRON_INTERVAL_MINUTES=20          # Minutes between automatic generation runs
WORD_GENERATION_BATCHES=5             # Number of batches to generate (default: 5)
WORDS_PER_BATCH=10                  # Words per batch (default: 10)
```

### Configuration Details

- **CRON_INTERVAL_MINUTES**: Delay in minutes between automatic generation runs
- **WORD_GENERATION_BATCHES**: Number of parallel API requests to make during generation
- **WORDS_PER_BATCH**: Number of words each API request should generate

Default configuration generates 50 words every 20 minutes (5 batches × 10 words each).

**Production Cron Jobs**: Use node-cron with `scripts/cron.js` for reliable scheduling.
**Development**: Next.js cron jobs work fine for local development.

**To start cron job in production**:
```bash
npm run cron
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy - Vercel will automatically handle cron jobs

### Other Platforms

Ensure your hosting platform supports:
- Next.js 14 with App Router
- Cron jobs or scheduled tasks
- Environment variables
- File system access for JSON storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.
