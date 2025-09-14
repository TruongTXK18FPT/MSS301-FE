'use server';
/**
 * @fileOverview An AI-powered hint generator for math exercises.
 *
 * - generateHint - A function that generates hints for a given math problem.
 * - GenerateHintInput - The input type for the generateHint function.
 * - GenerateHintOutput - The return type for the generateHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHintInputSchema = z.object({
  problem: z.string().describe('The math problem for which a hint is needed.'),
  studentLevel: z.number().describe('The grade level of the student (1-12).'),
  topic: z.string().describe('The math topic of the problem.'),
});
export type GenerateHintInput = z.infer<typeof GenerateHintInputSchema>;

const GenerateHintOutputSchema = z.object({
  hint: z.string().describe('The AI-generated hint for the math problem.'),
});
export type GenerateHintOutput = z.infer<typeof GenerateHintOutputSchema>;

export async function generateHint(input: GenerateHintInput): Promise<GenerateHintOutput> {
  return generateHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHintPrompt',
  input: {schema: GenerateHintInputSchema},
  output: {schema: GenerateHintOutputSchema},
  prompt: `You are an AI-powered math tutor. You are helping a student in grade {{{studentLevel}}} understand a problem in the topic of {{{topic}}}.  The student is stuck on the following problem:

Problem: {{{problem}}}

Provide a helpful hint to guide the student towards solving the problem independently. The hint should not give away the answer directly, but rather provide a step-by-step approach or a relevant concept that can help the student solve the problem themselves.  Present the hint in a way that is easy to understand and encouraging. Make sure the hint is presented in a glass hint box.
`,
});

const generateHintFlow = ai.defineFlow(
  {
    name: 'generateHintFlow',
    inputSchema: GenerateHintInputSchema,
    outputSchema: GenerateHintOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
