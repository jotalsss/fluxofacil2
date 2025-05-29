
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
  prompt: `Você é um especialista em finanças pessoais. Dada uma descrição de transação, você sugerirá uma categoria para a transação.

Descrição da Transação: {{{transactionDescription}}}

Responda com uma categoria sugerida e seu nível de confiança. As categorias válidas são: salary, groceries, food_dining, housing, transportation, utilities, clothing, entertainment, health_wellness, education, investments, gifts, donations, other. Retorne o ID da categoria.`,
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
