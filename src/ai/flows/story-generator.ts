
import { ai } from '@/ai/genkit';
import { StoryGenerationOutputSchema, type StoryGenerationOutput } from '@/ai/schemas';
import type { StoryGenerationInput } from '@/app/shared-schemas';
import { StoryGenerationInputSchema } from '@/app/shared-schemas';


export async function generateStory(input: StoryGenerationInput): Promise<StoryGenerationOutput> {
  return storyGeneratorFlow(input);
}


const prompt = ai.definePrompt({
  name: 'storyGeneratorPrompt',
  input: { schema: StoryGenerationInputSchema },
  output: { schema: StoryGenerationOutputSchema },
  prompt: `You are a master storyteller for children in Portugal.

Write a short, creative, and engaging story for a child in grade {{{gradeLevel}}}. The story must be in Portuguese and appropriate for their age.

The story should be based on these keywords: {{{keywords}}}.

The story must have a clear beginning, middle, and end, with paragraphs separated by a newline character. It should be positive and have a simple, gentle moral or a happy resolution. Do not make it too complex.

Also, create a short, catchy title for the story.

Finally, create exactly 3 short, simple, descriptive prompts (in Portuguese) that an image generation AI can use to create illustrations for the story. The prompts should describe key scenes.

The story should be around 150-200 words.

Example:
Input: { keywords: "gato, lua, estrelas", gradeLevel: 1 }
Output: {
  title: "O Gato que Queria Tocar na Lua",
  story: "Era uma vez um gatinho chamado Miko que adorava a noite. Ele passava horas a olhar para a lua e a sonhar em tocar-lhe.\n\nUma noite, ele subiu ao telhado mais alto da sua casa e esticou a pata o mais que conseguiu. De repente, uma estrela cadente passou e deixou um rasto de poeira brilhante.\n\nA poeira caiu sobre Miko e ele começou a flutuar! Ele flutuou para perto da lua, disse-lhe 'olá' e depois voltou para casa, muito feliz por ter realizado o seu sonho.",
  imagePrompts: ["um gatinho preto a olhar para a lua a partir de um telhado", "um gatinho a flutuar no céu noturno com estrelas a brilhar", "um gatinho feliz a dormir na sua cama quentinha"]
}
`,
});

const storyGeneratorFlow = ai.defineFlow(
  {
    name: 'storyGeneratorFlow',
    inputSchema: StoryGenerationInputSchema,
    outputSchema: StoryGenerationOutputSchema,
  },
  async (input) => {
    let retries = 3;
    let lastError: any = null;

    while (retries > 0) {
      try {
        console.log(`[STORY] Generating story for grade ${input.gradeLevel} with keywords: ${input.keywords}`);
        const { output } = await prompt(input);
        
      if (output?.title && output.story) {
        if (!output.imagePrompts || output.imagePrompts.length === 0) {
          output.imagePrompts = [];
        }
        console.log(`[STORY] Successfully generated story: "${output.title}"`);
        return output;
      }

          lastError = new Error("Model returned invalid output (e.g., missing title, story, or 3 image prompts).");
          console.warn(`[STORY] Invalid output from model:`, output);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        
      } catch (e: any) {
        lastError = e;
        console.error(`[STORY] Error generating story (attempt ${4 - retries}/3):`, e.message);
        if (e.message.includes('503 Service Unavailable') || e.message.includes('overloaded')) {
          retries--;
          if (retries > 0) {
            console.log(`[STORY] Model is overloaded, retrying in 2 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          // Non-retriable error
          console.error(`[STORY] Non-retriable error, giving up:`, e.message);
          throw e;
        }
      }
    }
    console.error("[STORY] All retries failed to generate a story.", lastError?.message);
    throw lastError;
  }
);
