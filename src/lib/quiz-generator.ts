'use server';

/**
 * @fileOverview Quiz generation using direct API calls (no Genkit dependency).
 * This is a simpler, more reliable approach.
 */

import type { PersonalizedLearningPathInput, PersonalizedLearningPathOutput } from '@/app/shared-schemas';
import { PersonalizedLearningPathOutputSchema } from '@/app/shared-schemas';

const CURRICULUM_TOPICS = {
  português: {
    1: ["Consciência fonológica", "Rimas e aliterações", "Leitura de palavras", "Compreensão de textos", "Escrita", "Singular e plural", "Masculino e feminino", "Artigos", "Ditongos", "Vogais e consoantes"],
    2: ["Leitura fluente", "Compreensão de narrativas", "Escrita de frases", "Substantivos", "Adjetivos", "Verbos", "Pronomes", "Sinónimos e antónimos", "Ortografia"],
    3: ["Tipos de frase", "Sujeito e predicado", "Advérbios", "Pontuação", "Acentuação", "Conjugação verbal", "Palavras com ç"],
    4: ["Análise sintática", "Frase composta", "Coordenação", "Subordinação", "Voz ativa e passiva", "Ortografia avançada"]
  },
  matemática: {
    1: ["Números 0-100", "Contagem", "Adição até 20", "Subtração", "Maior menor igual", "Formas geométricas", "Dias da semana", "Moedas", "Números ordinais"],
    2: ["Números até 200", "Centena", "Tabuadas", "Multiplicação", "Metade e quarto", "Polígonos", "Medidas de comprimento", "Relógio"],
    3: ["Números até 1000", "Adição e subtração", "Multiplicação", "Divisão", "Frações", "Ângulos", "Perímetro", "Medidas de tempo"],
    4: ["Números até 10000", "Multiplicação", "Divisão", "Frações equivalentes", "Decimais", "Percentagens", "Áreas", "Volumes"]
  },
  "estudo do meio": {
    1: ["Identificação pessoal", "Família", "Partes do corpo", "Órgãos dos sentidos", "Alimentação saudável", "Higiene", "Dias da semana", "Meses"],
    2: ["Plantas", "Animais", "Ciclo de vida", "Habitat", "Reciclagem", "Clima", "Localidade", "Transportes"],
    3: ["Sistema digestivo", "Sistema respiratório", "Sistema circulatório", "Classificação de animais", "Cadeia alimentar", "Energia"],
    4: ["Portugal na Europa", "Continentes e oceanos", "Corpo humano", "Problemas ambientais", "Meios de comunicação", "Cidadania"]
  }
};

const SYSTEM_PROMPT = `You are an expert educator creating quizzes for Portuguese elementary students (1º ao 4º ano).

CRITICAL RULES:
1. ALL content in European Portuguese (NOT Brazilian)
2. Questions appropriate for the student's grade level
3. Each question on a DIFFERENT topic
4. NO boring or generic questions

JSON format:
[{"question":"text","options":["A","B","C","D"],"correctAnswer":"A","topic":"topic name","imageUrl":null}]`;

async function generateWithGemini(userPrompt: string): Promise<string | null> {
  const apiKey = process.env.GOOGLEAI_API_KEY;
  if (!apiKey) {
    console.error('[GEMINI] No GOOGLEAI_API_KEY found');
    return null;
  }

  try {
    console.log('[GEMINI] Calling API with gemini-1.5-flash...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4096,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GEMINI] API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    console.log('[GEMINI] Response received:', text?.substring(0, 100) || 'empty');
    return text;
  } catch (error) {
    console.error('[GEMINI] Request failed:', error);
    return null;
  }
}

async function generateWithGroq(userPrompt: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[GROQ] No API key found');
    return null;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4096,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GROQ] API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('[GROQ] Request failed:', error);
    return null;
  }
}

function buildPrompt(input: PersonalizedLearningPathInput): string {
  const grade = input.gradeLevel as 1 | 2 | 3 | 4;
  const subject = input.subject || 'Misto';
  
  const subjects = subject === 'Misto' 
    ? ['português', 'matemática', 'estudo do meio'] 
    : [subject.toLowerCase()];
  
  const topics: string[] = [];
  subjects.forEach(subj => {
    const topicList = CURRICULUM_TOPICS[subj as keyof typeof CURRICULUM_TOPICS]?.[grade] || [];
    topics.push(...topicList);
  });

  const uniqueTopics = [...new Set(topics)].slice(0, 15);
  const questionsPerSubject = Math.ceil(input.numberOfQuestions / subjects.length);

  let prompt = `Create ${input.numberOfQuestions} quiz questions for ${grade}º ano do ensino básico.

Subject: ${subject}

Available topics (use these, one per question):
${uniqueTopics.join(', ')}

`;

  if (input.performanceData) {
    const weakAreas = Object.entries(input.performanceData)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([topic]) => topic);
    prompt += `\nFocus on these weak areas: ${weakAreas.join(', ')}\n`;
  }

  prompt += `
Requirements:
- Each question on a DIFFERENT topic from the list
- European Portuguese only
- Age-appropriate for ${grade}º ano
- Creative and engaging questions

Return ONLY a valid JSON array with ${input.numberOfQuestions} objects.
Format: [{"question":"...","options":["A","B","C","D"],"correctAnswer":"A","topic":"...","imageUrl":null}]`;

  return prompt;
}

function parseResponse(content: string): any[] {
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No JSON array found');
  }
  return JSON.parse(jsonMatch[0]);
}

export async function generateQuizDirect(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  console.log('[QUIZ] Starting quiz generation...');
  console.log('[QUIZ] Input:', JSON.stringify(input));
  console.log('[QUIZ] GOOGLEAI_API_KEY exists:', !!process.env.GOOGLEAI_API_KEY);
  console.log('[QUIZ] GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
  
  const prompt = buildPrompt(input);
  console.log('[QUIZ] Prompt built, length:', prompt.length);
  
  // Try Gemini first
  console.log('[QUIZ] Trying Gemini...');
  let content = await generateWithGemini(prompt);
  
  if (!content) {
    console.log('[QUIZ] Gemini failed or returned empty, trying Groq...');
    content = await generateWithGroq(prompt);
  } else {
    console.log('[QUIZ] Gemini succeeded!');
  }
  
  if (!content) {
    console.error('[QUIZ] Both APIs failed or returned empty');
    throw new Error('Não foi possível gerar o quiz. Por favor tenta novamente.');
  }
  
  console.log('[QUIZ] Response received, parsing...');
  
  try {
    const questions = parseResponse(content);
    const validated = PersonalizedLearningPathOutputSchema.parse({ quizQuestions: questions });
    console.log('[QUIZ] Success! Generated', validated.quizQuestions.length, 'questions');
    return validated;
  } catch (error) {
    console.error('[QUIZ] Parse error:', error);
    console.error('[QUIZ] Raw content:', content);
    throw new Error('Erro ao processar perguntas. Por favor tenta novamente.');
  }
}
