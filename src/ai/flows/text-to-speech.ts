
'use server';

/**
 * @fileOverview Text-to-Speech (TTS) generator.
 *
 * This file defines a Genkit flow that converts a given text string
 * into speech audio and returns it as a WAV data URI. It also returns
 * speech marks for word highlighting.
 *
 * - textToSpeech - A function that handles the TTS conversion.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';

// Schema for the input of the TTS flow
const TextToSpeechInputSchema = z.string().describe('The text to convert to speech.');
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const SpeechMarkSchema = z.object({
  type: z.string(),
  value: z.string(),
  time: z.object({
    seconds: z.string(),
    nanos: z.number(),
  }),
});

// Schema for the output of the TTS flow
const TextToSpeechOutputSchema = z.object({
    audioDataUri: z.string().url().describe("The generated audio as a data URI in WAV format. Format: 'data:audio/wav;base64,<encoded_data>'"),
    speechMarks: z.array(SpeechMarkSchema).describe('An array of speech marks with timing information for each word.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
    return new Promise((resolve, reject) => {
        const writer = new wav.Writer({
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        });

        const bufs: any[] = [];
        writer.on('error', reject);
        writer.on('data', function (d) {
            bufs.push(d);
        });
        writer.on('end', function () {
            resolve(Buffer.concat(bufs).toString('base64'));
        });

        writer.write(pcmData);
        writer.end();
    });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (text) => {
    const { media, speechMarks } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            languageCode: 'pt-PT',
          },
          enableTimepoints: true, // Enable speech marks
        },
      },
      prompt: text,
    });
    
    if (!media) {
      throw new Error('No audio media was returned from the TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
      speechMarks: speechMarks || [],
    };
  }
);
