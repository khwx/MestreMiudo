
'use server';

/**
 * @fileOverview Text-to-Speech (TTS) generator using Microsoft Edge TTS.
 *
 * This file defines a function that converts text to speech audio
 * using the free Microsoft Edge TTS service (edge-tts package).
 * Returns audio as an MP3 data URI.
 *
 * - textToSpeech - A function that handles the TTS conversion.
 */

export type TextToSpeechOutput = {
  audioDataUri: string;
  speechMarks: Array<{
    type: string;
    value: string;
    time: { seconds: string; nanos: number };
  }>;
};

export async function textToSpeech(text: string): Promise<TextToSpeechOutput> {
  try {
    // Dynamic import to avoid webpack trying to bundle the raw TS source
    const { tts } = await import('edge-tts/out/index.js');

    // Use Microsoft Edge TTS with Portuguese (Portugal) voice
    const audioBuffer: Buffer = await tts(text, {
      voice: 'pt-PT-RaquelNeural',
      rate: '-10%', // Slightly slower for children
    });

    // Convert buffer to base64 data URI (MP3 format)
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUri = `data:audio/mp3;base64,${base64Audio}`;

    return {
      audioDataUri,
      speechMarks: [], // Edge TTS doesn't provide speech marks
    };
  } catch (error) {
    console.error('Edge TTS failed:', error);
    throw new Error('Failed to generate speech audio.');
  }
}
