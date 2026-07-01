"use server"

import { logger } from "@/lib/logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateStory } from "@/ai/flows/story-generator";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { ai } from "@/ai/genkit";
import { StoryGenerationInputSchema } from "@/app/shared-schemas";
import { z } from "zod";
import type { StoryGenerationInput } from '@/app/shared-schemas';

const GenerateStoryActionOutputSchema = z.object({
  title: z.string(),
  story: z.string(),
  audioDataUri: z.string().optional(),
  images: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

async function generateImage(prompt: string): Promise<string> {
  try {
    logger.log(`[IMAGE] Generating image with prompt: ${prompt.substring(0, 100)}...`);
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt,
      config: {
        aspectRatio: "3:4",
      }
    });
    const url = media?.url || '';
    if (url) {
      logger.log(`[IMAGE] Successfully generated image`);
    } else {
      logger.warn(`[IMAGE] No media URL returned`);
    }
    return url;
  } catch (error) {
    logger.error(`[IMAGE] Failed to generate image:`, error);
    return '';
  }
}

export async function generateStoryAction(input: StoryGenerationInput): Promise<z.infer<typeof GenerateStoryActionOutputSchema>> {
  const validatedInput = StoryGenerationInputSchema.parse(input);
  const warnings: string[] = [];

  try {
    logger.log(`[STORY_ACTION] Starting story generation for grade ${input.gradeLevel}`);
    const storyOutput = await generateStory(validatedInput);
    if (!storyOutput || !storyOutput.story) {
      throw new Error("Falha ao gerar texto da história - resposta vazia do fluxo Genkit.");
    }

    logger.log(`[STORY_ACTION] Story generated: "${storyOutput.title}"`);
    const fullText = `${storyOutput.title}. ${storyOutput.story}`;

    const [ttsResult, imagesResult] = await Promise.allSettled([
      textToSpeech(fullText),
      storyOutput.imagePrompts ? Promise.all(storyOutput.imagePrompts.map(generateImage)) : Promise.resolve([])
    ]);

    let audioDataUri: string | undefined;
    let images: string[] = [];

    if (ttsResult.status === 'fulfilled' && ttsResult.value?.audioDataUri) {
      audioDataUri = ttsResult.value.audioDataUri;
    } else {
      warnings.push('O áudio não está disponível de momento.');
      if (ttsResult.status === 'rejected') {
        logger.error("[STORY_ACTION] Text-to-speech failed:", ttsResult.reason);
      }
    }

    if (imagesResult.status === 'fulfilled') {
      images = imagesResult.value.filter((url: string) => url);
      if (images.length === 0 && (storyOutput.imagePrompts?.length || 0) > 0) {
        warnings.push('As imagens não estão disponíveis de momento.');
      }
    } else {
      warnings.push('As imagens não estão disponíveis de momento.');
      logger.error("[STORY_ACTION] Image generation failed:", imagesResult.reason);
    }

    const result = {
      title: storyOutput.title,
      story: storyOutput.story,
      audioDataUri,
      images,
      warnings: warnings.length > 0 ? warnings : undefined,
    };

    logger.log(`[STORY_ACTION] Story action complete: audio=${!!audioDataUri}, images=${images.length}, warnings=${warnings.length}`);

    // Save story to DB (non-blocking)
    if (isSupabaseConfigured() && supabase) {
      supabase.from('stories').insert({
        student_id: validatedInput.studentId,
        title: storyOutput.title,
        content: storyOutput.story,
        keywords: validatedInput.keywords.split(',').map(k => k.trim()).filter(k => k),
        grade_level: validatedInput.gradeLevel,
        image_urls: images,
        has_audio: !!audioDataUri,
      }).then(({ error }) => {
        if (error) logger.error('[STORY_ACTION] Falha ao guardar história:', error);
        else logger.log('[STORY_ACTION] Story saved to DB');
      });
    }

    return GenerateStoryActionOutputSchema.parse(result);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[STORY_ACTION] Falha ao gerar história:", err.message || error);
    const msg = err.message || '';
    if (msg.includes('API_KEY') || msg.includes('api key') || msg.includes('401') || msg.includes('403')) {
      throw new Error('A chave da API não está configurada corretamente. Contacta um adulto para resolver.');
    }
    if (msg.includes('429') || msg.includes('rate') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Demasiados pedidos! Espera um minuto e tenta novamente.');
    }
    if (msg.includes('503') || msg.includes('overloaded') || msg.includes('UNAVAILABLE')) {
      throw new Error('O serviço está sobrecarregado. Tenta novamente dentro de uns minutos.');
    }
    if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('fetch failed')) {
      throw new Error('Sem ligação ao servidor. Verifica a tua internet e tenta novamente.');
    }
    throw new Error('Não foi possível gerar a história. Tenta novamente!');
  }
}

export async function getStudentStories(studentId: string, limit = 10) {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Erro ao buscar histórias:', error);
    return [];
  }
}