
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

async function runWithRetry(input: TranslateMessageInput, maxRetries = 3, initialDelay = 1000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries || !error.message.includes('429')) {
        console.error(`Translation failed after ${attempt} attempts.`, error);
        throw error; // Re-throw if it's not a rate limit error or if we've exhausted retries
      }
      
      console.warn(`Rate limit exceeded. Retrying attempt ${attempt} of ${maxRetries}...`);
      // Exponential backoff with jitter
      const delay = initialDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Translation failed after multiple retries.");
}


const translateMessageFlow = ai.defineFlow(
  {
    name: 'translateMessageFlow',
    inputSchema: TranslateMessageInputSchema,
    outputSchema: TranslateMessageOutputSchema,
  },
  async input => {
    return runWithRetry(input);
  }
);
