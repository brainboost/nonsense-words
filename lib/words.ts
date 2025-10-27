import fs from 'fs';
import path from 'path';

export interface Word {
  id: string;
  word: string;
  definition: string;
  createdAt: string;
}

export interface WordsDatabase {
  words: Word[];
  lastUpdated: string;
}

const WORDS_FILE_PATH = path.join(process.cwd(), 'data', 'words.json');

export async function readWordsDatabase(): Promise<WordsDatabase> {
  try {
    const fileContents = await fs.promises.readFile(WORDS_FILE_PATH, 'utf8');
    return JSON.parse(fileContents) as WordsDatabase;
  } catch (error) {
    console.error('Error reading words database:', error);
    return { words: [], lastUpdated: new Date().toISOString() };
  }
}

export async function writeWordsDatabase(data: WordsDatabase): Promise<void> {
  try {
    await fs.promises.writeFile(WORDS_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing words database:', error);
    throw error;
  }
}

export async function addWords(newWords: Omit<Word, 'id' | 'createdAt'>[]): Promise<void> {
  const database = await readWordsDatabase();
  
  const wordsWithMetadata: Word[] = newWords.map((wordData) => ({
    ...wordData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }));

  database.words.push(...wordsWithMetadata);
  database.lastUpdated = new Date().toISOString();

  await writeWordsDatabase(database);
}

export async function getRandomWordFromLastFifty(): Promise<Word | null> {
  const database = await readWordsDatabase();
  
  if (database.words.length === 0) {
    return null;
  }

  const lastFiftyWords = database.words.slice(-50);
  const randomIndex = Math.floor(Math.random() * lastFiftyWords.length);
  
  return lastFiftyWords[randomIndex];
}

export async function getWordByName(wordName: string): Promise<Word | null> {
  const database = await readWordsDatabase();
  return database.words.find(w => w.word.toLowerCase() === wordName.toLowerCase()) || null;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}