'use server';

/**
 * @fileOverview Quiz generation using direct API calls.
 * Uses official DGE curriculum descriptors from Aprendizagens Essenciais.
 * Generates child-friendly questions with correctAnswer as full text (not letter).
 */

import type { PersonalizedLearningPathInput, PersonalizedLearningPathOutput } from '@/app/shared-schemas';
import { PersonalizedLearningPathOutputSchema } from '@/app/shared-schemas';
import curriculumData from './curriculum-topics.json';

interface CurriculumDomain {
  name: string;
  descriptors: string[];
}

interface CurriculumGrade {
  domains: CurriculumDomain[];
}

interface CurriculumSubject {
  [grade: string]: CurriculumGrade;
}

interface CurriculumData {
  [subject: string]: CurriculumSubject;
}

const CURRICULUM = curriculumData as CurriculumData;

const SYSTEM_PROMPT = `You are an expert elementary school teacher creating fun, engaging quizzes for Portuguese children (1º ao 4º ano).

CRITICAL RULES:
1. ALL content in EUROPEAN Portuguese (Portugal, NOT Brazil)
2. Questions must be FUN and ENGAGING - use stories, animals, everyday situations
3. NEVER use academic jargon in the question text
4. The correctAnswer must be the EXACT TEXT of the correct option (NOT a letter like "A", "B", "C", "D")
5. All 4 options must be DIFFERENT from each other
6. Questions should be appropriate for the specific grade level

IMPORTANT FORMAT:
- correctAnswer must match EXACTLY one of the options (same text, same capitalization)
- Example of CORRECT: {"question":"Quanto é 2+3?","options":["4","5","6","7"],"correctAnswer":"5","topic":"Números"}
- Example of WRONG: {"question":"Quanto é 2+3?","options":["4","5","6","7"],"correctAnswer":"B"} ← DO NOT use letters!

Return ONLY a valid JSON array.`;

async function generateWithOpenRouter(userPrompt: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('[OPENROUTER] No API key found');
    return null;
  }

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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4096,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OPENROUTER] API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('[OPENROUTER] Request failed:', error);
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

function buildPrompt(input: PersonalizedLearningPathInput): string {
  const grade = input.gradeLevel as 1 | 2 | 3 | 4;
  const subject = input.subject || 'Misto';
  
  const subjects = subject === 'Misto' 
    ? ['português', 'matemática', 'estudo do meio'] 
    : [subject.toLowerCase()];
  
  // Get curriculum descriptors for this grade and subjects
  const descriptors: { topic: string; descriptor: string }[] = [];
  
  subjects.forEach(subj => {
    const gradeData = CURRICULUM[subj]?.[grade.toString()];
    if (gradeData && gradeData.domains) {
      gradeData.domains.forEach(domain => {
        domain.descriptors.forEach(desc => {
          descriptors.push({
            topic: domain.name,
            descriptor: desc
          });
        });
      });
    }
  });

  // Format descriptors for the prompt
  const descriptorList = descriptors.map(d => `- [${d.topic}] ${d.descriptor.substring(0, 100)}...`).join('\n');

  let prompt = `Create ${input.numberOfQuestions} fun quiz questions for a ${grade}º ano student in Portugal.

Subject: ${subject}

These are the OFFICIAL curriculum descriptors from the Portuguese Ministry of Education (DGE) that students must learn:

${descriptorList}

`;

  if (input.performanceData) {
    const weakAreas = Object.entries(input.performanceData)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([topic]) => topic);
    prompt += `\nThe student struggles with: ${weakAreas.join(', ')}. Focus more on these areas.\n`;
  }

  prompt += `
STYLE GUIDE for ${grade}º ano:
${grade === 1 ? `- Use very simple words and short sentences
- Focus on counting, basic addition (1-10), shapes, family, body parts, animals
- Make it playful: "O gato tem 4 patas. Se chegar mais 1, quantas tem?"` : ''}
${grade === 2 ? `- Slightly more complex but still fun
- Include simple word problems, basic multiplication, plants, recycling
- Example: "A Maria tem 3 maçãs. O João deu-lhe mais 4. Quantas tem agora?"` : ''}
${grade === 3 ? `- More challenging but still engaging
- Include division, fractions, body systems, animal classification
- Example: "Um bolo foi dividido em 4 partes iguais. O Pedro comeu 1 parte. Que fração comeu?"` : ''}
${grade === 4 ? `- More complex concepts but keep it fun
- Include decimals, percentages, areas, Portuguese geography
- Example: "Portugal tem 18 distritos. Se visitaste 9, que percentagem já visitaste?"` : ''}

REQUIREMENTS:
- Each question on a DIFFERENT topic from the curriculum descriptors above
- European Portuguese ONLY
- Creative, fun, and age-appropriate
- correctAnswer must be the EXACT TEXT of the correct option (not a letter!)
- No duplicate options within a question

Return ONLY a valid JSON array with ${input.numberOfQuestions} objects.
Format: [{"question":"...","options":["A","B","C","D"],"correctAnswer":"exact text of correct option","topic":"topic name"}]`;

  return prompt;
}

function parseResponse(content: string): any[] {
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No JSON array found');
  }
  return JSON.parse(jsonMatch[0]);
}

function normalizeQuestions(questions: any[]): any[] {
  return questions.map(q => {
    // Ensure correctAnswer is the text, not a letter
    if (q.correctAnswer && /^[A-D]$/.test(q.correctAnswer) && q.options) {
      const index = q.correctAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      q.correctAnswer = q.options[index] || q.correctAnswer;
    }
    
    // Ensure imageUrl is nullish not undefined
    if (!q.imageUrl) {
      q.imageUrl = null;
    }
    
    // Ensure topic exists
    if (!q.topic) {
      q.topic = 'Geral';
    }
    
    // Ensure 4 unique options
    if (q.options && q.options.length === 4) {
      const uniqueOptions = [...new Set(q.options)];
      if (uniqueOptions.length < 4) {
        console.warn('[QUIZ] Question had duplicate options:', q.question);
      }
    }
    
    return q;
  });
}

export async function generateQuizDirect(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  console.log('[QUIZ] Starting quiz generation...');
  console.log('[QUIZ] Input:', JSON.stringify(input));
  
  const prompt = buildPrompt(input);
  
  // Try OpenRouter first (best limits)
  console.log('[QUIZ] Trying OpenRouter...');
  let content = await generateWithOpenRouter(prompt);
  
  if (!content) {
    console.log('[QUIZ] OpenRouter failed, trying Groq...');
    content = await generateWithGroq(prompt);
  } else {
    console.log('[QUIZ] OpenRouter succeeded!');
  }
  
  if (!content) {
    console.log('[QUIZ] Groq failed, trying Gemini...');
    content = await generateWithGemini(prompt);
  } else if (content) {
    console.log('[QUIZ] Groq succeeded!');
  }
  
  if (!content) {
    console.error('[QUIZ] All APIs failed');
    throw new Error('Não foi possível gerar o quiz. Por favor tenta novamente.');
  }
  
  console.log('[QUIZ] Response received, parsing...');
  
  try {
    let questions = parseResponse(content);
    
    // Normalize: convert letter answers to text
    questions = normalizeQuestions(questions);
    
    const validated = PersonalizedLearningPathOutputSchema.parse({ quizQuestions: questions });
    console.log('[QUIZ] Success! Generated', validated.quizQuestions.length, 'questions');
    return validated;
  } catch (error) {
    console.error('[QUIZ] Parse error:', error);
    console.error('[QUIZ] Raw content:', content);
    throw new Error('Erro ao processar perguntas. Por favor tenta novamente.');
  }
}
