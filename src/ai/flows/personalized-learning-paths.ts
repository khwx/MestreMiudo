
'use server';

/**
 * @fileOverview Personalized learning path generator.
 *
 * This file defines a Genkit flow that tailors learning paths for children
 * based on their performance in the game. It dynamically creates quizzes
 * and challenges focused on areas where the child needs the most help.
 *
 * - personalizedLearningPath - A function that generates a personalized learning path.
 */

import {ai} from '@/ai/genkit';
import {searchImage} from '@/ai/tools/image-search';
import type { PersonalizedLearningPathInput, PersonalizedLearningPathOutput } from '@/app/shared-schemas';
import { PersonalizedLearningPathInputSchema, PersonalizedLearningPathOutputSchema } from '@/app/shared-schemas';


export async function personalizedLearningPath(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  return personalizedLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedLearningPathPrompt',
  input: {schema: PersonalizedLearningPathInputSchema},
  output: {schema: PersonalizedLearningPathOutputSchema},
  tools: [searchImage],
  prompt: `You are an expert educator creating quizzes for Portuguese elementary students (1º ao 4º ano).

IMPORTANT: All content MUST be in European Portuguese (Português de Portugal).

CURRICULUM TOPICS BY SUBJECT AND YEAR:

Português 1º ano: Consciência fonológica, Rimas, Leitura, Escrita, Singular/Plural, Masculino/Feminino, Artigos, Ditongos, Vogais/Consoantes
Português 2º ano: Leitura fluente, Substantivos, Adjetivos, Verbos, Pronomes, Sinónimos/Antónimos, Ortografia (r/rr, s/ss)
Português 3º ano: Tipos de frase, Sujeito/Predicado, Advérbios, Pontuação, Acentuação, Conjugação verbal
Português 4º ano: Análise sintática, Frase composta, Coordenação, Subordinação, Voz ativa/passiva, Ortografia avançada

Matemática 1º ano: Números 0-100, Contagem, Adição/Subtração, Maior/Menor, Formas geométricas, Dias da semana, Moedas
Matemática 2º ano: Números até 200, Centena, Tabuadas, Metade/Quarto, Polígonos, Medidas, Relógio
Matemática 3º ano: Números até 1000, Frações, Ângulos, Perímetro, Medidas de tempo, Média/Moda
Matemática 4º ano: Números até 10000, Decimais, Percentagens, Áreas, Volumes, Triângulos/Quadriláteros, Escalas

Estudo do Meio 1º ano: Identificação pessoal, Família, Corpo humano, Órgãos dos sentidos, Alimentação, Higiene
Estudo do Meio 2º ano: Plantas, Animais, Ciclo de vida, Habitat, Reciclagem, Clima
Estudo do Meio 3º ano: Sistemas corporais, Digestão, Respiração, Circulação, Cadeia alimentar, Energia
Estudo do Meio 4º ano: Portugal/Europa, Sistemas corporais, Ambiente, Energia, Meios de comunicação, Cidadania

You will generate a quiz with {{{numberOfQuestions}}} questions.

{{#if subject}}
Subject: {{{subject}}}
{{else}}
Subjects: Mix of Português, Matemática, and Estudo do Meio
{{/if}}

Grade: {{{gradeLevel}}}º ano

{{#if performanceData}}
Focus on weak areas: {{{performanceData}}}
{{/if}}

Rules:
- Each question on a DIFFERENT topic from the curriculum list
- Use European Portuguese ONLY
- Age-appropriate difficulty
- Engaging and surprising questions

For Matemática, you MAY use searchImage tool for illustrative images.
For Estudo do Meio, you MAY use searchImage for photos appropriate for children.

Output format:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "The correct answer",
    "topic": "Curriculum topic",
    "imageUrl": null
  }
]`,
});

const personalizedLearningPathFlow = ai.defineFlow(
  {
    name: 'personalizedLearningPathFlow',
    inputSchema: PersonalizedLearningPathInputSchema,
    // The output schema is now validated manually inside the flow
  },
  async (input) => {
    let retries = 3;
    let lastError: any = null;

    while (retries > 0) {
      try {
            // Handle case where performanceData might come back as stringified JSON
            let parsedPerformanceData = input.performanceData;
            if (typeof input.performanceData === 'string') {
              try {
                parsedPerformanceData = JSON.parse(input.performanceData);
              } catch (e) {
                console.warn('Failed to parse performanceData as JSON:', e);
                parsedPerformanceData = null; // fallback to null on parse error
              }
            }
            
            const flowInput = {
              studentId: input.studentId,
              gradeLevel: input.gradeLevel,
              numberOfQuestions: input.numberOfQuestions,
              subject: input.subject,
              performanceData: parsedPerformanceData,
            };
        
        // Get raw output without immediate validation
        const {output} = await prompt(flowInput);

        // Manually validate and check if output is null or invalid, and retry if so.
        if (output && output.quizQuestions && output.quizQuestions.length > 0) {
          const validatedOutput = PersonalizedLearningPathOutputSchema.parse(output);
          return validatedOutput;
        }

        // If output is null, treat it as a retriable error.
        lastError = new Error("Model returned null or empty output.");
        retries--;
        if (retries > 0) {
          console.log(`Model returned null output, retrying in 2 seconds... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (e: any) {
        lastError = e;
        // Also retry on overload/availability errors.
        if (e.message.includes('503 Service Unavailable') || e.message.includes('overloaded') || (e.cause && e.cause.message.includes('503')) || e.name === 'ZodError') {
          retries--;
          if (retries > 0) {
            console.log(`Model error or validation failed, retrying in 2 seconds... (${retries} attempts left)`, e);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          // It's a different, non-retriable error.
          throw e;
        }
      }
    }
    // If all retries fail, throw the last recorded error.
    console.error("All retries failed to generate quiz.");
    throw lastError;
  }
);
