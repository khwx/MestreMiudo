'use server';

/**
 * @fileOverview Quiz generation using Groq API as fallback.
 * 
 * This module provides quiz generation using Groq's Llama model
 * when Google Gemini is unavailable or rate limited.
 */

import { groq, GROQ_MODEL } from '@/lib/groq';
import type { PersonalizedLearningPathInput, PersonalizedLearningPathOutput } from '@/app/shared-schemas';
import { PersonalizedLearningPathOutputSchema } from '@/app/shared-schemas';

const SYSTEM_PROMPT = `You are an expert educator specializing in creating diverse and engaging quizzes for elementary school students in Portugal. The current year is 2024.

CRITICAL RULES:
1. Generate UNIQUE questions - do NOT repeat common/generic questions like "Qual é a capital de Portugal?" or "Quanto é 2+2?"
2. Each question MUST be different from typical textbook questions
3. Use creative, unexpected topics that children find interesting
4. All content must be in European Portuguese (NOT Brazilian Portuguese)

Question structure:
- "question": Unique, engaging question text
- "options": 4 answer choices (1 correct, 3 plausible distractors)
- "correctAnswer": Exactly matches one option
- "topic": Specific topic name
- "imageUrl": null (no images needed)

Generate diverse questions across DIFFERENT topics. Do not cluster questions on the same topic.`;

export async function generateQuizWithGroq(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  const subjectText = input.subject || 'Português, Matemática e Estudo do Meio (misto)';
  
  // Topics to avoid (overused)
  const avoidTopics = [
    'capital de Portugal', 'Lisboa', 'Porto',
    'cores da bandeira', 'bandeira portuguesa',
    '2+2', '1+1', 'tabuada'
  ];
  
  const userPrompt = `Create ${input.numberOfQuestions} UNIQUE quiz questions for a student in ${input.gradeLevel}º ano.

Subject: ${subjectText}

{{#if performanceData}}
Priority topics (student struggles here): ${Object.entries(input.performanceData)
  .sort((a, b) => a[1] - b[1])
  .slice(0, 3)
  .map(([topic]) => topic)
  .join(', ')}
{{/if}}

Requirements:
- Each question must be on a DIFFERENT topic
- Avoid: ${avoidTopics.join(', ')}
- Creative and engaging questions that surprise
- Questions should be fun, not boring

Return ONLY a valid JSON array with ${input.numberOfQuestions} question objects.`;

  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    model: GROQ_MODEL,
    temperature: 1.0, // Higher temperature for more variety
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Groq returned empty response');
  }

  // Parse and validate the response
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
