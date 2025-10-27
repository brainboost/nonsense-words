import OpenAI from 'openai';
import { Word } from './words';

// Custom error types for better error handling
export class OpenAIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentValidationError';
  }
}

// Configuration with environment-based defaults
const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.9'),
  requestTimeout: parseInt(process.env.OPENAI_REQUEST_TIMEOUT_MS || '30000'),
} as const;

if (!OPENAI_CONFIG.apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// Simplified OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
  timeout: OPENAI_CONFIG.requestTimeout,
});

// Type definitions for better type safety
interface GeneratedWord {
  word: string;
  definition: string;
}

// Simplified JSON parser with basic error recovery
function parseJsonResponse(content: string): GeneratedWord[] {
  try {
    // Clean up potential markdown code blocks and whitespace
    // const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();

    // Try to parse directly first
    const parsed = JSON.parse(content);

    // Handle both direct array and nested array formats
    let wordsArray: GeneratedWord[];

    if (Array.isArray(parsed)) {
      wordsArray = parsed;
    } else if (parsed && Array.isArray(parsed.words)) {
      wordsArray = parsed.words;
    } else if (parsed && typeof parsed === 'object') {
      // Try to find array properties in the object
      const arrayProps = Object.keys(parsed).filter(key => Array.isArray(parsed[key]));
      if (arrayProps.length > 0) {
        wordsArray = parsed[arrayProps[0]];
        console.warn(`Found array in property '${arrayProps[0]}' instead of expected format`);
      } else {
        throw new ContentValidationError('Invalid response format: expected array of words');
      }
    } else {
      throw new ContentValidationError('Invalid response format: expected array of words');
    }

    // Validate structure and content
    const validWords = wordsArray.filter((item) => {
      return item &&
        typeof item === 'object' &&
        typeof item.word === 'string' &&
        item.word.trim().length > 0 &&
        typeof item.definition === 'string' &&
        item.definition.trim().length > 0;
    });

    if (validWords.length === 0) {
      throw new ContentValidationError('No valid words found in response');
    }

    return validWords.map(item => ({
      word: item.word.trim(),
      definition: item.definition.trim()
    }));

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ContentValidationError(`Invalid JSON response: ${error.message}. Content preview: ${content.substring(0, 200)}...`);
    }
    if (error instanceof ContentValidationError) {
      throw error;
    }
    throw new ContentValidationError(`Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}. Content preview: ${content.substring(0, 200)}...`);
  }
}

// Simplified OpenAI call wrapper
async function callOpenAI(prompt: string, wordCount: number): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: "system",
          content: `You are a creative linguist who specializes in generating funny fictional words with charming definitions. Generate ${wordCount} words. Always respond with valid JSON.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: OPENAI_CONFIG.temperature,
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new OpenAIError('No content received from OpenAI', 'NO_CONTENT', 400);
    }

    // Log token usage for monitoring
    if (completion.usage) {
      console.log(`Token usage - Prompt: ${completion.usage.prompt_tokens}, Completion: ${completion.usage.completion_tokens}, Total: ${completion.usage.total_tokens}`);
    }
    // console.log(content);
    return content;

  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new OpenAIError(
        error.message,
        error.code || 'API_ERROR',
        error.status,
        error.status === 429 || error.status >= 500
      );
    }
    throw error;
  }
}

// Simplified main function
export async function generateNonsenseWords(wordCount: number): Promise<Omit<Word, 'id' | 'createdAt'>[]> {
  // Input validation
  if (!wordCount || wordCount < 1 || wordCount > 50) {
    throw new Error('Word count must be between 1 and 50');
  }

  const GENERATE_WORDS_PROMPT = `
Generate ${wordCount} completely unique nonsense words that sound plausible but don't exist in English. 
For each word, provide a creative, whimsical definition that makes it sound like a real word.

Format your response as a JSON array with objects containing "word" and "definition" keys.
Example format:
[
  {"word": "flummoxify", "definition": "To confuse someone in a delightfully charming way"},
  {"word": "glimmerwick", "definition": "A small spark of inspiration that appears just before falling asleep"}
]

Requirements:
- Words should be 6-12 letters long
- Words should be easy to pronounce
- Definitions should be 10-25 words long
- Make them creative and memorable
- Ensure all words are completely fictional
`;

  const startTime = Date.now();
  console.log(`Generating ${wordCount} nonsense words...`);

  try {
    // Make the OpenAI call
    const content = await callOpenAI(GENERATE_WORDS_PROMPT, wordCount);

    // Parse and validate the response
    const result = parseJsonResponse(content);

    const duration = Date.now() - startTime;
    console.log(`Successfully generated ${result.length} words in ${duration}ms`);

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;

    // Enhanced error logging
    if (error instanceof OpenAIError) {
      console.error(`OpenAI API Error (${error.code}): ${error.message}`, {
        statusCode: error.statusCode,
        retryable: error.retryable,
        duration,
        wordCount
      });
    } else if (error instanceof ContentValidationError) {
      console.error(`Content Validation Error: ${error.message}`, { duration, wordCount });
    } else {
      console.error(`Unexpected error generating nonsense words:`, error, { duration, wordCount });
    }

    throw error;
  }
}

export async function generateMultipleBatches(batchCount?: number): Promise<Omit<Word, 'id' | 'createdAt'>[]> {
  // Configuration with validation
  const wordsPerBatch = Math.min(
    Math.max(parseInt(process.env.WORDS_PER_BATCH || '5'), 1),
    20 // Maximum words per batch for safety
  );

  const totalBatches = Math.min(
    Math.max(batchCount || parseInt(process.env.WORD_GENERATION_BATCHES || '5'), 1),
    10 // Maximum batches for safety
  );

  console.log(`Starting generation of ${totalBatches} batches with ${wordsPerBatch} words each`);

  const startTime = Date.now();
  const batches = await Promise.allSettled(
    Array.from({ length: totalBatches }, (_, index) =>
      generateNonsenseWords(wordsPerBatch).catch(error => {
        // Add batch context to error
        if (error instanceof Error) {
          error.message = `Batch ${index + 1} error: ${error.message}`;
        }
        throw error;
      })
    )
  );

  const allWords: Omit<Word, 'id' | 'createdAt'>[] = [];
  const successfulBatches: number[] = [];
  const failedBatches: Array<{ index: number; error: unknown }> = [];

  batches.forEach((batch, index) => {
    if (batch.status === 'fulfilled') {
      allWords.push(...batch.value);
      successfulBatches.push(index + 1);
    } else {
      failedBatches.push({ index: index + 1, error: batch.reason });
      console.error(`Batch ${index + 1} failed:`, batch.reason);
    }
  });

  const duration = Date.now() - startTime;
  const successRate = (successfulBatches.length / totalBatches) * 100;

  console.log(`Batch generation completed: ${successfulBatches.length}/${totalBatches} batches successful (${successRate.toFixed(1)}%)`);
  console.log(`Total words generated: ${allWords.length} in ${duration}ms`);

  // If too many batches failed, throw an error
  if (successRate < 50) {
    throw new Error(`Too many batches failed: ${failedBatches.length}/${totalBatches}. Consider reducing batch size or checking API limits.`);
  }

  // Log failed batches for monitoring
  if (failedBatches.length > 0) {
    console.warn(`Failed batches: ${failedBatches.map(b => b.index).join(', ')}`);
  }

  return allWords;
}