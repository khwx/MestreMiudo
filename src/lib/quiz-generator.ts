import { logger } from "./logger";
'use server';

/**
 * @fileOverview Quiz generation using direct API calls.
 * Uses official DGE curriculum descriptors from Aprendizagens Essenciais.
 * Generates child-friendly questions with correctAnswer as full text (not letter).
 */

import type { PersonalizedLearningPathInput, PersonalizedLearningPathOutput, QuizQuestion } from '@/app/shared-schemas';
import { PersonalizedLearningPathOutputSchema } from '@/app/shared-schemas';
import curriculumData from './curriculum-topics.json';
import { fetchImageForTopic } from './pixabay';
import { buildAdaptivePromptInstructions } from './adaptive-learning';
import { validateQuestionForCurriculum } from './curriculum-validator';

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
2. Questions must be FUN and ENGAGING - use stories, animals, everyday situations, humor
3. NEVER use academic jargon in the question text
4. The correctAnswer must be the EXACT TEXT of the correct option (NOT a letter like "A", "B", "C", "D")
5. All 4 options must be DIFFERENT from each other
6. Questions should be age-appropriate for the specific grade level

LANGUAGE COMPLEXITY BY GRADE:
- 1º ano: 3-5 words/sentence, simple present tense, concrete objects, animals, numbers 1-20
- 2º ano: 5-7 words/sentence, simple past/future, counting to 100, basic shapes
- 3º ano: 7-9 words/sentence, multiple verb tenses, problem-solving, abstract concepts
- 4º ano: 8-10 words/sentence, complex structures, reasoning questions, cause/effect

ENGAGEMENT TECHNIQUES:
- Use character names and familiar situations (e.g., "O João encontrou 5 maçãs...")
- Include dialogue and playful language
- Ask "Why?" and "What would happen if...?" questions (especially grades 3-4)
- Use comparisons and humor appropriate for age
- Celebrate Portuguese culture (food, traditions, animals, holidays)

IMPORTANT FORMAT:
- correctAnswer must match EXACTLY one of the options (same text, same capitalization)
- Example CORRECT: {"question":"Quanto é 2+3?","options":["4","5","6","7"],"correctAnswer":"5","topic":"Números"}
- Example WRONG: {"question":"Quanto é 2+3?","options":["4","5","6","7"],"correctAnswer":"B"} ← DO NOT use letters!

Return ONLY a valid JSON array.`;

async function generateWithOpenRouter(userPrompt: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    logger.error('[OPENROUTER] No API key found');
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
      logger.error('[OPENROUTER] API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    logger.error('[OPENROUTER] Request failed:', error);
    return null;
  }
}

async function generateWithGroq(userPrompt: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    logger.error('[GROQ] No API key found');
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
      logger.error('[GROQ] API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    logger.error('[GROQ] Request failed:', error);
    return null;
  }
}

async function generateWithGemini(userPrompt: string): Promise<string | null> {
  const apiKey = process.env.GOOGLEAI_API_KEY;
  if (!apiKey) {
    logger.error('[GEMINI] No GOOGLEAI_API_KEY found');
    return null;
  }

  try {
    logger.log('[GEMINI] Calling API with gemini-1.5-flash...');
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
      logger.error('[GEMINI] API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    logger.log('[GEMINI] Response received:', text?.substring(0, 100) || 'empty');
    return text;
  } catch (error) {
    logger.error('[GEMINI] Request failed:', error);
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

  // Add adaptive learning instructions if performance data exists
  if (input.performanceData) {
    const adaptiveInstructions = buildAdaptivePromptInstructions(input.performanceData);
    prompt += adaptiveInstructions;
  }

  // Subject-specific instructions
  const subjectInstructions: Record<string, string> = {
    'português': `
SUBJECT RULES for Português:
- Questions must be about LANGUAGE skills: reading, writing, grammar, oral expression, literature
- Examples: identify letters, syllables, rhyming words, correct spelling, sentence structure
- DO NOT include math calculations or science facts
- Example question: "Qual palavra rima com 'gato'?" (not "Quanto é 2+3?")
- For grade 1-2: focus on letter recognition, syllables, short words
- For grade 3-4: add vocabulary, comprehension, story elements`,
    'matemática': `
SUBJECT RULES for Matemática:
- Questions must be about NUMBERS, OPERATIONS, GEOMETRY, DATA
- Examples: counting, addition, subtraction, shapes, patterns, measurements
- DO NOT include grammar questions or history facts
- Example question: "Se tens 3 maçãs e comes 1, quantas ficam?" (not "Qual é o feminino de 'menino'?")
- For grade 1-2: focus on numbers to 20, basic addition/subtraction
- For grade 3-4: add multiplication/division, geometry, word problems`,
    'estudo do meio': `
SUBJECT RULES for Estudo do Meio:
- Questions must be about SOCIETY, NATURE, TECHNOLOGY, environment, body, family, community
- Examples: body parts, family members, animals, plants, weather, safety, daily routines
- DO NOT include math calculations or grammar exercises
- Example question: "O que faz o Sol?" (not "Quanto é 2+3?")
- For grade 1-2: focus on immediate environment, animals, family, seasons
- For grade 3-4: add communities, jobs, healthy living, technology, safety`
  };

  prompt += `
${subjectInstructions[subject.toLowerCase()] || ''}

STYLE GUIDE for ${grade}º ano:
${grade === 1 ? `
- Use VERY simple words (2-4 letters, common objects: gato, cão, sol, lua, casa, árvore)
- Short sentences: 3-5 words maximum
- Focus on: animals, colors, numbers 1-20, family, body parts, daily routines
- Questions about: "Qual é...?" "Quantos...?" "Que cor...?"
- Use concrete examples and familiar situations (A Maria tem um cão...)
- Make questions playful and fun! Include animal sounds, colors, movement
- Avoid: past tense, complex sentences, abstract concepts, big numbers` : ''}
${grade === 2 ? `
- Use simple words (3-6 letters, familiar topics from 1º ano)
- Sentences: 5-7 words, can use simple past and future
- Focus on: counting to 100, simple addition/subtraction, favorite foods, seasons, animals
- Question types: comparisons ("Qual é maior?"), sequences ("O que vem a seguir?")
- Include relatable scenarios (O João tem 3 livros, a Maria tem 2...)
- Still playful but slightly more structured
- Avoid: complex grammar, difficult vocabulary, abstract reasoning` : ''}
${grade === 3 ? `
- Use moderately complex words (4-8 letters, varied vocabulary)
- Sentences: 7-9 words, multiple verb tenses (present, past, future)
- Focus on: multiplication/division, geometry, problem-solving, reading comprehension
- Question types: "Why...?" "What would happen if...?" "How do you...?"
- Incorporate cause-and-effect, ordering, categorization
- Make connections to real-world situations (shopping, time, distances)
- Include some challenges but keep it achievable` : ''}
${grade === 4 ? `
- Use advanced vocabulary (5-10 letters, diverse topics)
- Sentences: 8-10 words, complex structures with conjunctions (because, but, so)
- Focus on: division/fractions, geometry, comprehension, reasoning, scientific thinking
- Question types: "Why...?" "Compare and contrast" "Explain..." "What is the effect of...?"
- Require multi-step thinking and justification
- Connect to real-world applications (science, health, environment, technology)
- Challenge students while remaining age-appropriate and fun` : ''}

SPECIFIC REQUIREMENTS:
- Each question on a DIFFERENT topic from the curriculum descriptors above
- European Portuguese ONLY - NO BRAZILIAN PORTUGUESE
- Creative, fun, and age-appropriate
- correctAnswer must be the EXACT TEXT of the correct option (not a letter!)
- No duplicate options within a question
- STAY STRICTLY within the subject area defined above

Return ONLY a valid JSON array with ${input.numberOfQuestions} objects.
Format: [{"question":"...","options":["A","B","C","D"],"correctAnswer":"exact text of correct option","topic":"topic name"}]`;

  return prompt;
}

function parseResponse(content: string): QuizQuestion[] {
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No JSON array found');
  }
  return JSON.parse(jsonMatch[0]) as QuizQuestion[];
}

function normalizeQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.map(q => {
    // Ensure correctAnswer is the text, not a letter
    if (q.correctAnswer && /^[A-D]$/.test(q.correctAnswer) && q.options) {
      const index = q.correctAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q as any).correctAnswer = q.options[index] || q.correctAnswer;
    }
    
    // Ensure imageUrl is nullish not undefined
    if (!q.imageUrl) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q as any).imageUrl = null;
    }
    
    // Ensure topic exists
    if (!q.topic) {
      q.topic = 'Geral';
    }
    
    // Ensure 4 unique options
    if (q.options && q.options.length === 4) {
      const uniqueOptions = [...new Set(q.options)];
      if (uniqueOptions.length < 4) {
        logger.warn('[QUIZ] Question had duplicate options:', q.question);
      }
    }
    
    return q;
  });
}

async function addImagesToQuestions(questions: QuizQuestion[]): Promise<QuizQuestion[]> {
  logger.log('[PIXABAY] Fetching images for questions...');
  
  const enrichedQuestions: QuizQuestion[] = [];
  
  for (const question of questions) {
    try {
      const imageUrl = await fetchImageForTopic(question.topic);
      if (imageUrl) {
        question.imageUrl = imageUrl;
        logger.log(`[PIXABAY] Added image for topic: ${question.topic}`);
      }
    } catch (error) {
      logger.warn(`[PIXABAY] Failed to fetch image for topic ${question.topic}:`, error);
    }
    enrichedQuestions.push(question);
  }
  
  return enrichedQuestions;
}

export async function generateQuizDirect(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  logger.log('[QUIZ] Starting quiz generation...');
  logger.log('[QUIZ] Input:', JSON.stringify(input));
  
  const prompt = buildPrompt(input);
  
  // Try OpenRouter first (best limits)
  logger.log('[QUIZ] Trying OpenRouter...');
  let content = await generateWithOpenRouter(prompt);
  
  if (!content) {
    logger.log('[QUIZ] OpenRouter failed, trying Groq...');
    content = await generateWithGroq(prompt);
  } else {
    logger.log('[QUIZ] OpenRouter succeeded!');
  }
  
  if (!content) {
    logger.log('[QUIZ] Groq failed, trying Gemini...');
    content = await generateWithGemini(prompt);
  } else if (content) {
    logger.log('[QUIZ] Groq succeeded!');
  }
  
  if (!content) {
    logger.error('[QUIZ] All APIs failed');
    throw new Error('Não foi possível gerar o quiz. Por favor tenta novamente.');
  }
  
  logger.log('[QUIZ] Response received, parsing...');
  
  try {
    let questions = parseResponse(content);
    
    // Normalize: convert letter answers to text
    questions = normalizeQuestions(questions);
    
    // ⚠️ CURRICULUM VALIDATION - Ensure questions are age-appropriate
    logger.log('[CURRICULUM] Validating questions for Grade', input.gradeLevel);
    for (const q of questions) {
      const validationResult = validateQuestionForCurriculum(
        q.question,
        input.gradeLevel,
        input.subject || 'Português'
      );
      
      if (!validationResult.isValid) {
        logger.warn(`[CURRICULUM] Question out of alignment for Grade ${input.gradeLevel}:`);
        logger.warn(`  Question: "${q.question}"`);
        logger.warn(`  Issues: ${validationResult.issues.join('; ')}`);
      }
      
      if (validationResult.warnings.length > 0) {
        logger.warn(`[CURRICULUM] Warnings for Grade ${input.gradeLevel}:`);
        validationResult.warnings.forEach(w => logger.warn(`  - ${w}`));
      }
    }
    
    // Add images from Pixabay (non-blocking, runs in background)
    addImagesToQuestions(questions).catch(err => 
      logger.error('[PIXABAY] Background image fetching failed:', err)
    );
    
    const validated = PersonalizedLearningPathOutputSchema.parse({ quizQuestions: questions });
    logger.log('[QUIZ] Success! Generated', validated.quizQuestions.length, 'questions');
    return validated;
  } catch (error) {
    logger.error('[QUIZ] Parse error:', error);
    logger.error('[QUIZ] Raw content:', content);
    throw new Error('Erro ao processar perguntas. Por favor tenta novamente.');
  }
}
