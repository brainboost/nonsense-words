import { generateMultipleBatches } from '@/lib/openai';
import { addWords } from '@/lib/words';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron job request (optional security measure)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting scheduled word generation...');

    // Generate configurable batches of words
    const batchCount = parseInt(process.env.WORD_GENERATION_BATCHES || '5');
    const newWords = await generateMultipleBatches(batchCount);

    if (newWords.length === 0) {
      throw new Error('No words were generated');
    }

    // Add the new words to the database
    await addWords(newWords);

    console.log(`Successfully generated and saved ${newWords.length} new words`);

    return NextResponse.json({
      success: true,
      wordsGenerated: newWords.length,
      message: `Generated ${newWords.length} new nonsense words`
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json({
      error: 'Failed to generate words',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// This endpoint will be called by Next.js cron jobs every 20 minutes
export const dynamic = 'force-dynamic';