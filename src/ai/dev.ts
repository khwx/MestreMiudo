'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-learning-paths.ts';
import '@/ai/flows/word-generation.ts';
import '@/ai/tools/image-search';
import '@/ai/flows/story-generator';
import '@/ai/flows/text-to-speech';
