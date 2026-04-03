'use server';

/**
 * @fileOverview Quiz generation using Groq API with curriculum support.
 * 
 * This module provides quiz generation using Groq's Llama model
 * when Google Gemini is unavailable or rate limited.
 * Uses official Portuguese curriculum topics.
 */

import { groq, GROQ_MODEL } from '@/lib/groq';
import type { PersonalizedLearningPathInput, PersonalizedLearningPathOutput } from '@/app/shared-schemas';
import { PersonalizedLearningPathOutputSchema } from '@/app/shared-schemas';

// Official curriculum topics by subject and year
const CURRICULUM_TOPICS = {
  português: {
    1: ["Consciência fonológica", "Rimas e aliterações", "Segmentação silábica", "Leitura de palavras", "Compreensão de textos", "Escrita do nome próprio", "Singular e plural", "Masculino e feminino", "Artigo o, a", "Palavras com m/n", "Ditongos"],
    2: ["Leitura fluente", "Compreensão de narrativas", "Escrita de frases", "Substantivos", "Adjetivos", "Verbo", "Pronomes", "Palavras com r/rr", "Palavras com s/ss", "Sinónimos e antónimos"],
    3: ["Leitura expressiva", "Tipos de frase", "Sujeito e predicado", "Advérbios", "Pontuação", "Palavras com ç", "Acentuação", "Conjugação verbal"],
    4: ["Análise sintática", "Frase composta", "Coordenação", "Subordinação", "Voz ativa e passiva", "Ortografia avançada", "Polissemia", "Expressões idiomáticas"]
  },
  matemática: {
    1: ["Números 0-100", "Contagem", "Adição até 20", "Subtração", "Maior menor igual", "Formas geométricas", "Dias da semana", "Moedas", "Números ordinais"],
    2: ["Números até 200", "Centena", "Tabuadas 2,5,10", "Multiplicação", "Metade e quarto", "Polígonos", "Medidas de comprimento", "Relógio", "Gráfico de barras"],
    3: ["Números até 1000", "Adição e subtração", "Multiplicação", "Divisão", "Frações", "Ângulos", "Perímetro", "Medidas de tempo", "Média e moda"],
    4: ["Números até 10000", "Multiplicação", "Divisão", "Frações equivalentes", "Decimais", "Percentagens", "Triângulos e quadriláteros", "Área e volume", "Escalas"]
  },
  "estudo do meio": {
    1: ["Identificação pessoal", "Família", "Partes do corpo", "Órgãos dos sentidos", "Alimentação saudável", "Higiene", "Dias da semana", "Meses", "Escola"],
    2: ["Plantas", "Animais", "Ciclo de vida", "Habitat", "Reciclagem", "Sol Lua estrelas", "Clima", "Localidade", "Transportes"],
    3: ["Sistema digestivo", "Sistema respiratório", "Sistema circulatório", "Classificação animais", "Cadeia alimentar", "Rochas e solos", "Fontes de energia", "Electricidade"],
    4: ["Portugal na Europa", "Continentes oceanos", "Corpo humano", "Doenças prevenção", "Problemas ambientais", "Desenvolvimento sustentável", "Meios comunicação", "Cidadania", "Pontos cardeais"]
  }
};

const SYSTEM_PROMPT = `You are an expert educator creating quizzes for Portuguese elementary students (1º ao 4º ano).

CRITICAL RULES:
1. ALL questions MUST be in European Portuguese (NOT Brazilian)
2. Questions must be age-appropriate for the specific year
3. Use topics from the official curriculum provided
4. Each question must be on a DIFFERENT topic - NO repetitions
5. Questions should be engaging and surprising, not boring

Question format (JSON):
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The correct option",
  "topic": "Specific curriculum topic",
  "imageUrl": null
}`;

export async function generateQuizWithGroq(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  const grade = input.gradeLevel as 1 | 2 | 3 | 4;
  const subject = input.subject || 'misto';
  
  // Get curriculum topics for this grade
  const getTopicsForSubject = (subj: string, yr: number): string[] => {
    if (subj === 'Português') return CURRICULUM_TOPICS.português[yr] || [];
    if (subj === 'Matemática') return CURRICULUM_TOPICS.matematica[yr] || [];
    if (subj === 'Estudo do Meio') return CURRICULUM_TOPICS["estudo do meio"][yr] || [];
    return [];
  };

  const subjects = subject === 'Misto' 
    ? ['Português', 'Matemática', 'Estudo do Meio'] 
    : [subject];
  
  const topicsPerSubject: Record<string, string[]> = {};
  subjects.forEach(subj => {
    topicsPerSubject[subj] = getTopicsForSubject(subj, grade);
  });

  const allTopics = Object.values(topicsPerSubject).flat();
  const questionsPerSubject = Math.ceil(input.numberOfQuestions / subjects.length);

  const userPrompt = `Create ${input.numberOfQuestions} quiz questions for ${grade}º ano do ensino básico em Portugal.

SUBJECT(S): ${subjects.join(', ')}

CURRICULUM TOPICS available:
${Object.entries(topicsPerSubject).map(([subj, topics]) => 
  `${subj}: ${topics.slice(0, 10).join(', ')}`
).join('\n')}

{{#if performanceData}}
FOCUS ON weak areas: ${Object.entries(input.performanceData)
  .sort((a, b) => a[1] - b[1])
  .slice(0, 5)
  .map(([topic]) => topic)
  .join(', ')}
{{/if}}

Requirements:
- Generate ${questionsPerSubject} questions per subject
- Use ONLY topics from the curriculum list above
- Each topic can only be used ONCE
- Questions must be in European Portuguese
- Age-appropriate difficulty for ${grade}º ano
- Creative and surprising questions

Return ONLY a valid JSON array with ${input.numberOfQuestions} question objects.
Each question MUST have: question, options, correctAnswer, topic, imageUrl (null).`;

  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    model: GROQ_MODEL,
    temperature: 0.8,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Groq returned empty response');
  }

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    const validated = PersonalizedLearningPathOutputSchema.parse({ quizQuestions: parsed });
    return validated;
  } catch (parseError) {
    console.error('Failed to parse Groq response:', parseError);
    console.error('Raw response:', content);
    throw new Error('Failed to generate valid quiz questions');
  }
}
