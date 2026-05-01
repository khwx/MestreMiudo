export type TextToSpeechOutput = {
  audioDataUri: string;
};

export async function textToSpeech(text: string): Promise<TextToSpeechOutput> {
  try {
    const edgeTts = require('edge-tts/index.js');
    const ttsFn = edgeTts.tts || edgeTts.default?.tts;

    if (!ttsFn || typeof ttsFn !== 'function') {
      throw new Error('TTS function not found in edge-tts');
    }

    const audioBuffer: Buffer = await ttsFn(text, {
      voice: 'pt-PT-RaquelNeural',
      rate: '-10%',
    });

    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUri = `data:audio/mp3;base64,${base64Audio}`;

    return { audioDataUri };
  } catch (error) {
    console.error('[TTS] Failed:', error);
    throw new Error('Failed to generate speech audio.');
  }
}
