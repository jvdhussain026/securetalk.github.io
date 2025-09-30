
'use server';
/**
 * @fileOverview A flow for detecting the language of a given text.
 *
 * - detectLanguage - A function that handles language detection.
 * - DetectLanguageInput - The input type for the detectLanguage function.
 * - DetectLanguageOutput - The return type for the detectLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectLanguageInputSchema = z.object({
  text: z.string().describe('The text whose language needs to be detected.'),
});
export type DetectLanguageInput = z.infer<typeof DetectLanguageInputSchema>;

const DetectLanguageOutputSchema = z.object({
  languageCode: z.string().describe('The ISO 639-1 code for the detected language (e.g., "en", "es", "ja").'),
});
export type DetectLanguageOutput = z.infer<typeof DetectLanguageOutputSchema>;

export async function detectLanguage(input: DetectLanguageInput): Promise<DetectLanguageOutput> {
  return detectLanguageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectLanguagePrompt',
  input: {schema: DetectLanguageInputSchema},
  output: {schema: DetectLanguageOutputSchema},
  prompt: `Detect the language of the following text and return only its two-letter ISO 639-1 language code.

Text:
"{{{text}}}"`,
});

const detectLanguageFlow = ai.defineFlow(
  {
    name: 'detectLanguageFlow',
    inputSchema: DetectLanguageInputSchema,
    outputSchema: DetectLanguageOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error("Language detection failed:", error);
      // Return a generic code on failure
      return { languageCode: 'und' };
    }
  }
);
