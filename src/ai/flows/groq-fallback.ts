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

const SYSTEM_PROMPT = `You are an expert educator specializing in creating personalized quizzes for elementary school students in Portugal. The current year is 2024.

IMPORTANT: All questions and answers must be in European Portuguese (Português de Portugal). Do not use Brazilian Portuguese terms.

You will generate a quiz with a specific number of questions tailored to the student's grade level.

The quiz will be for the subject specified, or a mix of all subjects if not specified.

Structure each question as a JSON object with:
- "question": The question text in Portuguese
- "options": Array of 4 answer options (1 correct, 3 plausible wrong)
- "correctAnswer": The correct answer (must match exactly one of the options)
- "topic": The topic/subject area
- "imageUrl": (Optional) Leave as null or omit

Return ONLY a valid JSON array of question objects, no other text or explanation.

Example output:
[{"question":"Qual é a capital de Portugal?","options":["Lisboa","Porto","Coimbra","Faro"],"correctAnswer":"Lisboa","topic":"Geografia","imageUrl":null}]`;

export async function generateQuizWithGroq(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  const subjectText = input.subject || 'Português, Matemática e Estudo do Meio (misto)';
  
  const userPrompt = `Generate a quiz with ${input.numberOfQuestions} questions for a student in ${input.gradeLevel}º ano do ensino básico em Portugal.

Subject: ${subjectText}

{{#if performanceData}}
Focus on topics where the student has shown weakness (lower correctness rate).
{{/if}}

Each question should have:
- Clear, simple language appropriate for the grade level
- 4 multiple choice options
- 1 correct answer

Return ONLY a valid JSON array of question objects.`;

  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    model: GROQ_MODEL,
    temperature: 0.7,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Groq returned empty response');
  }

  // Parse and validate the response
  try {
    // Try to extract JSON from the response (in case there's extra text)
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
