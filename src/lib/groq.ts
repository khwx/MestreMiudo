import Groq from 'groq-sdk';

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function generateWithGroq(prompt: string, systemPrompt?: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const response = await groq.chat.completions.create({
    messages: [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: prompt }
    ],
    model: GROQ_MODEL,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return response.choices[0]?.message?.content || '';
}
