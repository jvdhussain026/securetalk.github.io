
'use server';
/**
 * @fileOverview A flow for translating message text.
 *
 * - translateMessage - A function that handles message translation.
 * - TranslateMessageInput - The input type for the translateMessage function.
 * - TranslateMessageOutput - The return type for the translateMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateMessageInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The language to translate the text into.'),
});
export type TranslateMessageInput = z.infer<typeof TranslateMessageInputSchema>;

const TranslateMessageOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateMessageOutput = z.infer<typeof TranslateMessageOutputSchema>;

export async function translateMessage(input: TranslateMessageInput): Promise<TranslateMessageOutput> {
  return translateMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateMessagePrompt',
  input: {schema: TranslateMessageInputSchema},
  output: {schema: TranslateMessageOutputSchema},
  prompt: `Translate the following text into '{{targetLanguage}}'.

If '{{targetLanguage}}' is 'en-IN', translate into Hinglish (a mix of Hindi and English).

If the text is already in the target language, just return the original text.
Do not add any preamble or explanation, just the translation.

Text to translate:
"{{{text}}}"`,
});

const translateMessageFlow = ai.defineFlow(
  {
    name: 'translateMessageFlow',
    inputSchema: TranslateMessageInputSchema,
    outputSchema: TranslateMessageOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      // If there's an error (e.g., 503), wait 2 seconds and retry once.
      await new Promise(resolve => setTimeout(resolve, 2000));
      const {output} = await prompt(input);
      return output!;
    }
  }
);
