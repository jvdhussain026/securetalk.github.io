'use server';

/**
 * @fileOverview Generates a README.md file with setup instructions for the application.
 *
 * - generateReadme - A function that generates the README.md content.
 * - GenerateReadmeOutput - The return type for the generateReadme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReadmeOutputSchema = z.object({
  readmeContent: z
    .string()
    .describe('The content of the README.md file, including setup instructions.'),
});

export type GenerateReadmeOutput = z.infer<typeof GenerateReadmeOutputSchema>;

export async function generateReadme(): Promise<GenerateReadmeOutput> {
  return generateReadmeFlow();
}

const prompt = ai.definePrompt({
  name: 'generateReadmePrompt',
  output: {schema: GenerateReadmeOutputSchema},
  prompt: `You are an expert software documentation writer.

  Generate a README.md file with clear setup instructions for a NextJS Firebase application.
  Include the following sections:

  - Introduction: A brief overview of the application.
  - Prerequisites: List the necessary software and tools (e.g., Node.js, npm, Firebase CLI).
  - Firebase Configuration: Explain how to set up a Firebase project and obtain the necessary credentials.
  - Installation: Provide step-by-step instructions for installing dependencies and configuring the application.
  - Build Instructions: Explain how to build the application for deployment.

  Make sure the instructions are clear, concise, and easy to follow for developers of all skill levels.
  `,
});

const generateReadmeFlow = ai.defineFlow(
  {
    name: 'generateReadmeFlow',
    outputSchema: GenerateReadmeOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
