// noinspection JSUnusedLocalSymbols
'use server';
/**
 * @fileOverview AI agent that suggests transaction categories based on the transaction description.
 *
 * - suggestTransactionCategory - A function that suggests transaction categories.
 * - SuggestTransactionCategoryInput - The input type for the suggestTransactionCategory function.
 * - SuggestTransactionCategoryOutput - The return type for the suggestTransactionCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTransactionCategoryInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction to categorize.'),
});
export type SuggestTransactionCategoryInput = z.infer<
  typeof SuggestTransactionCategoryInputSchema
>;

const SuggestTransactionCategoryOutputSchema = z.object({
  suggestedCategory: z
    .string()
    .describe('The AI suggested category for the transaction.'),
  confidence: z
    .number()
    .describe(
      'The confidence level of the suggestion, from 0 to 1.  Higher values indicate higher confidence that the suggestion is correct.'
    ),
});
export type SuggestTransactionCategoryOutput = z.infer<
  typeof SuggestTransactionCategoryOutputSchema
>;

export async function suggestTransactionCategory(
  input: SuggestTransactionCategoryInput
): Promise<SuggestTransactionCategoryOutput> {
  return suggestTransactionCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTransactionCategoryPrompt',
  input: {schema: SuggestTransactionCategoryInputSchema},
  output: {schema: SuggestTransactionCategoryOutputSchema},
  prompt: `You are a personal finance expert. Given a transaction description, you will suggest a category for the transaction.

Transaction Description: {{{transactionDescription}}}

Respond with a suggested category and your confidence level.`,
});

const suggestTransactionCategoryFlow = ai.defineFlow(
  {
    name: 'suggestTransactionCategoryFlow',
    inputSchema: SuggestTransactionCategoryInputSchema,
    outputSchema: SuggestTransactionCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
