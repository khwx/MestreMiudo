'use server';

/**
 * @fileOverview Word generation for hangman game using OpenRouter.
 * No longer uses Genkit - direct API call to OpenRouter.
 */

import { z } from 'zod';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const WordGenerationInputSchema = z.object({
  category: z.string().describe('The category for the word (e.g., Animais, Frutas, Países).'),
  difficulty: z.enum(['Fácil', 'Médio', 'Difícil']).describe('The difficulty level.'),
});
export type WordGenerationInput = z.infer<typeof WordGenerationInputSchema>;

const WordGenerationOutputSchema = z.object({
  word: z.string().describe('The generated word in Portuguese.'),
  hint: z.string().describe('A simple hint for the generated word.'),
});
export type WordGenerationOutput = z.infer<typeof WordGenerationOutputSchema>;

// Try to get a cached word from Supabase
async function getCachedWord(category: string, difficulty: string): Promise<WordGenerationOutput | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('words')
      .select('word, hint')
      .eq('category', category)
      .eq('difficulty', difficulty);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Pick a random word from cached options
    const randomIndex = Math.floor(Math.random() * data.length);
    return { word: data[randomIndex].word, hint: data[randomIndex].hint };
  } catch (error) {
    console.error('Failed to get cached word:', error);
    return null;
  }
}

// Cache a generated word in Supabase
async function cacheWord(category: string, difficulty: string, word: string, hint: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const { data: existing } = await supabase
      .from('words')
      .select('id')
      .eq('word', word)
      .eq('category', category)
      .limit(1);

    if (existing && existing.length > 0) return;

    const { error } = await supabase.from('words').insert({
      category,
      difficulty,
      word,
      hint,
    });

    if (error) console.error('Failed to cache word:', error);
  } catch (error) {
    console.error('Error caching word:', error);
  }
}

// Direct OpenRouter API call
async function generateWordViaAPI(category: string, difficulty: string): Promise<WordGenerationOutput | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://mestremiudo.com',
        'X-Title': 'MestreMiudo'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          {
            role: 'system',
            content: `You generate single Portuguese words for a children's hangman game.
Return ONLY a JSON object with "word" and "hint".
Rules: 
- Single word only (no spaces, no numbers, no special chars except Portuguese accents)
- European Portuguese
- Word length based on difficulty: Fácil=4-6 letters, Médio=7-9 letters, Difícil=10+ letters
- Hint should be short and fun for children`
          },
          {
            role: 'user',
            content: `Category: ${category}, Difficulty: ${difficulty}`
          }
        ],
        temperature: 0.9,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      console.error('[WORD] OpenRouter error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const result = JSON.parse(jsonMatch[0]);
    if (result.word && result.hint) {
      return { word: result.word.toUpperCase(), hint: result.hint };
    }
    return null;
  } catch (error) {
    console.error('[WORD] API call failed:', error);
    return null;
  }
}

// Fallback word list (organized by category)
const FALLBACK_WORDS: Record<string, { word: string; hint: string }[]> = {
  'Animais': [
    { word: 'GATO', hint: 'Animal que mia' },
    { word: 'CÃO', hint: 'Melhor amigo do homem' },
    { word: 'PATO', hint: 'Animal que faz "quá quá"' },
    { word: 'RATO', hint: 'Animal pequeno que gosta de queijo' },
    { word: 'SAPO', hint: 'Animal que faz "croac" e salta' },
    { word: 'URSO', hint: 'Animal grande que hiberna' },
    { word: 'LOBO', hint: 'Animal que uiva para a lua' },
    { word: 'TIGRE', hint: 'Gato grande com riscas' },
    { word: 'ZEBRA', hint: 'Cavalo com riscas pretas e brancas' },
    { word: 'COELHO', hint: 'Animal de orelhas compridas que come cenouras' },
    { word: 'MACACO', hint: 'Animal que sobe às árvores e faz caretas' },
    { word: 'GIRAFA', hint: 'Animal com pescoço muito comprido' },
    { word: 'ELEFANTE', hint: 'Animal grande com tromba' },
    { word: 'BORBOLETA', hint: 'Inseto colorido que voa entre flores' },
    { word: 'CROCODILO', hint: 'Réptil grande que vive em rios' },
  ],
  'Frutas': [
    { word: 'MAÇÃ', hint: 'Fruta vermelha ou verde' },
    { word: 'PÊRA', hint: 'Fruta em forma de gota' },
    { word: 'UVA', hint: 'Fruta pequena em cachos' },
    { word: 'LIMÃO', hint: 'Fruta amarela e ácida' },
    { word: 'MELÃO', hint: 'Fruta grande e doce por dentro' },
    { word: 'MORANGO', hint: 'Fruta vermelha com pintinhas' },
    { word: 'BANANA', hint: 'Fruta amarela e comprida' },
    { word: 'LARANJA', hint: 'Fruta laranja cheia de sumo' },
    { word: 'CEREJA', hint: 'Fruitinha vermelha com pé' },
    { word: 'ABACAXI', hint: 'Fruta tropical com coroa' },
    { word: 'MANGA', hint: 'Fruta tropical doce' },
    { word: 'MELANCIA', hint: 'Fruta verde enorme por fora e vermelha por dentro' },
  ],
  'Cores': [
    { word: 'AZUL', hint: 'Cor do céu' },
    { word: 'VERDE', hint: 'Cor da relva' },
    { word: 'ROSA', hint: 'Cor de uma flor bonita' },
    { word: 'AMARELO', hint: 'Cor do sol' },
    { word: 'VERMELHO', hint: 'Cor do sangue e dos bombeiros' },
    { word: 'BRANCO', hint: 'Cor da neve' },
    { word: 'PRETO', hint: 'Cor da noite' },
    { word: 'CASTANHO', hint: 'Cor da terra e do chocolate' },
    { word: 'LARANJA', hint: 'Cor que tem o nome de uma fruta' },
    { word: 'ROXO', hint: 'Cor entre o azul e o vermelho' },
  ],
  'Corpo': [
    { word: 'MÃO', hint: 'Usamos para agarrar coisas' },
    { word: 'PÉ', hint: 'Usamos para andar' },
    { word: 'BOCA', hint: 'Usamos para falar e comer' },
    { word: 'NARIZ', hint: 'Usamos para cheirar' },
    { word: 'OLHO', hint: 'Usamos para ver' },
    { word: 'ORELHA', hint: 'Usamos para ouvir' },
    { word: 'CABELO', hint: 'Cresce na cabeça' },
    { word: 'DENTE', hint: 'Usamos para mastigar' },
    { word: 'CORACAO', hint: 'Órgão que bate no peito' },
    { word: 'ESTOMAGO', hint: 'Onde vai a comida depois de engolir' },
  ],
  'Escola': [
    { word: 'LÁPIS', hint: 'Usamos para escrever' },
    { word: 'LIVRO', hint: 'Tem páginas com histórias' },
    { word: 'MESA', hint: 'Onde nos sentamos para trabalhar' },
    { word: 'CANETA', hint: 'Escreve a tinta' },
    { word: 'REGUA', hint: 'Usamos para medir e traçar linhas' },
    { word: 'BORRACHA', hint: 'Usamos para apagar' },
    { word: 'MOCHILA', hint: 'Onde guardamos os materiais' },
    { word: 'CADERNO', hint: 'Onde escrevemos os trabalhos' },
    { word: 'PROFESSOR', hint: 'Quem nos ensina na escola' },
    { word: 'ESCOLA', hint: 'Onde vamos aprender' },
  ],
  'Natureza': [
    { word: 'SOL', hint: 'Brilha no céu durante o dia' },
    { word: 'LUAR', hint: 'Luz da lua à noite' },
    { word: 'MAR', hint: 'Grande massa de água salgada' },
    { word: 'RIO', hint: 'Água doce que corre para o mar' },
    { word: 'FLOR', hint: 'Parte bonita da planta' },
    { word: 'ÁRVORE', hint: 'Planta grande com tronco e folhas' },
    { word: 'NUVEM', hint: 'Algo branco que flutua no céu' },
    { word: 'CHUVA', hint: 'Água que cai do céu' },
    { word: 'VENTO', hint: 'Ar que se move e faz as folhas dançar' },
    { word: 'MONTANHA', hint: 'Grande elevação de terra' },
    { word: 'FLORESTA', hint: 'Lugar com muitas árvores' },
    { word: 'JARDIM', hint: 'Lugar com flores e relva' },
  ],
};

export async function generateWord(input: WordGenerationInput): Promise<WordGenerationOutput> {
  // Try cache first
  const cached = await getCachedWord(input.category, input.difficulty);
  if (cached) {
    console.log(`[WORD] Cache HIT: ${cached.word} (${input.category}/${input.difficulty})`);
    return cached;
  }

  console.log(`[WORD] Cache MISS, generating word for ${input.category}/${input.difficulty}`);
  
  // Try OpenRouter API
  const apiResult = await generateWordViaAPI(input.category, input.difficulty);
  if (apiResult) {
    console.log(`[WORD] API generated: ${apiResult.word}`);
    cacheWord(input.category, input.difficulty, apiResult.word, apiResult.hint)
      .catch(err => console.error('Background caching failed:', err));
    return apiResult;
  }

  // Fallback to built-in word list
  const fallbackList = FALLBACK_WORDS[input.category] || FALLBACK_WORDS['Animais'];
  const randomIndex = Math.floor(Math.random() * fallbackList.length);
  const fallback = fallbackList[randomIndex];
  
  console.log(`[WORD] Using fallback: ${fallback.word}`);
  return { word: fallback.word, hint: fallback.hint };
}
