// src/ai/flows/ai-chatbot-math-mindmap.ts
'use server';

/**
 * @fileOverview AI chatbot flow to create a mind map for a specific math topic.
 *
 * - generateMathMindMap - A function that handles the math mind map generation process.
 * - GenerateMathMindMapInput - The input type for the generateMathMindMap function.
 * - GenerateMathMindMapOutput - The return type for the generateMathMindMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMathMindMapInputSchema = z.object({
  gradeLevel: z
    .number()
    .int()
    .min(1)
    .max(12)
    .describe('The grade level of the student (1-12).'),
  learningGoal: z
    .string()
    .describe('The specific learning goal or math topic the student wants to learn.'),
});

export type GenerateMathMindMapInput = z.infer<typeof GenerateMathMindMapInputSchema>;

const GenerateMathMindMapOutputSchema = z.object({
  mindMap: z
    .string()
    .describe(
      'A mind map for the specified math topic, formatted as a string.'
    ),
});

export type GenerateMathMindMapOutput = z.infer<typeof GenerateMathMindMapOutputSchema>;

export async function generateMathMindMap(
  input: GenerateMathMindMapInput
): Promise<GenerateMathMindMapOutput> {
  return generateMathMindMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMathMindMapPrompt',
  input: {schema: GenerateMathMindMapInputSchema},
  output: {schema: GenerateMathMindMapOutputSchema},
  prompt: `You are an AI assistant designed to help students learn math.

  The student is in grade {{gradeLevel}} and wants to learn about {{learningGoal}}.

  Create a mind map for this topic. The mind map should include the key concepts,
  definitions, and relationships within the topic.
  Format the mindmap as a string.
  Make sure the mindmap includes at least 4 concepts related to the learning goal.
  Example Format: "Main Topic: Definition, Concept 1: Definition, Concept 2: Definition, Concept 3: Definition"
  `,
});

const generateMathMindMapFlow = ai.defineFlow(
  {
    name: 'generateMathMindMapFlow',
    inputSchema: GenerateMathMindMapInputSchema,
    outputSchema: GenerateMathMindMapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
