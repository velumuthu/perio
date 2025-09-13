'use server';

/**
 * @fileOverview Generates a summary of the classification results across a set of uploaded images, highlighting key trends and potential correlations between diabetes and periodontal health.
 *
 * - generateSummaryOfResults - A function that generates a summary of the classification results.
 * - GenerateSummaryOfResultsInput - The input type for the generateSummaryOfResults function.
 * - GenerateSummaryOfResultsOutput - The return type for the generateSummaryOfresults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryOfResultsInputSchema = z.object({
  results: z
    .array(
      z.object({
        imageName: z.string().describe('The name of the image file.'),
        classification: z
          .string()
          .describe('The classification result for the image.'),
        confidence: z
          .number()
          .describe('The confidence level of the classification.'),
      })
    )
    .describe('An array of classification results for the uploaded images.'),
  studyDetails: z
    .string()

    .describe(
      'Details about the study, including the focus on diabetes and periodontal health.'
    ),
});
export type GenerateSummaryOfResultsInput = z.infer<
  typeof GenerateSummaryOfResultsInputSchema
>;

const GenerateSummaryOfResultsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the classification results, highlighting key trends and potential correlations.'
    ),
});
export type GenerateSummaryOfResultsOutput = z.infer<
  typeof GenerateSummaryOfResultsOutputSchema
>;

export async function generateSummaryOfResults(
  input: GenerateSummaryOfResultsInput
): Promise<GenerateSummaryOfResultsOutput> {
  return generateSummaryOfResultsFlow(input);
}

const summaryPrompt = ai.definePrompt({
  name: 'generateSummaryOfResultsPrompt',
  input: {schema: GenerateSummaryOfResultsInputSchema},
  output: {schema: GenerateSummaryOfResultsOutputSchema},
  prompt: `You are an expert medical researcher summarizing the findings of a study on periodontal health and diabetes.

  Given the following classification results from a set of dental X-ray images and the study details, generate a concise summary highlighting key trends and potential correlations between diabetes and periodontal health.

  Study Details: {{{studyDetails}}}

  Classification Results:
  {{#each results}}
  - Image: {{{imageName}}}, Classification: {{{classification}}}, Confidence: {{{confidence}}}
  {{/each}}

  Your summary should be easy to understand for a non-expert.

  IMPORTANT:
  - If you see any results classified as 'diabetic_severe' or 'other_gums_issues', your summary MUST include a clear recommendation to consult a dental professional or doctor for a formal diagnosis and treatment plan.
  - For classifications indicating any level of disease, provide general, safe precautions such as maintaining good oral hygiene, managing blood sugar levels (if diabetic), and scheduling regular dental check-ups.
  - Analyze the trends. For example, do diabetic cases show more severe classifications?

  Generate the summary now.

  Summary:`,
  model: 'googleai/gemini-1.5-flash-latest',
});

const generateSummaryOfResultsFlow = ai.defineFlow(
  {
    name: 'generateSummaryOfResultsFlow',
    inputSchema: GenerateSummaryOfResultsInputSchema,
    outputSchema: GenerateSummaryOfResultsOutputSchema,
  },
  async input => {
    const {output} = await summaryPrompt(input);

    if (!output?.summary) {
      throw new Error('Failed to generate summary.');
    }

    return {
      summary: output.summary,
    };
  }
);
