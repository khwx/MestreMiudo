'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageSearchInputSchema = z.object({
  query: z.string().describe('The search query for the image.'),
});

const ImageSearchOutputSchema = z.string().url().describe('The URL of the found image.');

export const searchImage = ai.defineTool(
  {
    name: 'searchImage',
    description: 'Searches for a photo-realistic image on Pixabay and returns its URL.',
    inputSchema: ImageSearchInputSchema,
    outputSchema: ImageSearchOutputSchema,
  },
  async ({query}) => {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
      console.warn('Pixabay API key is not configured. Returning placeholder image.');
      return 'https://placehold.co/600x400/EEE/31343C?text=Imagem+indispon%C3%ADvel';
    }

    const url = new URL('https://pixabay.com/api/');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('q', query);
    url.searchParams.append('image_type', 'photo');
    url.searchParams.append('lang', 'pt');
    url.searchParams.append('per_page', '3');

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Pixabay API request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (data.hits && data.hits.length > 0) {
        return data.hits[0].webformatURL;
      }
      return 'https://placehold.co/600x400/EEE/31343C?text=Imagem+n%C3%A3o+encontrada';
    } catch (error) {
      console.error('Error searching image on Pixabay:', error);
      return 'https://placehold.co/600x400/EEE/31343C?text=Erro+ao+carregar';
    }
  }
);
