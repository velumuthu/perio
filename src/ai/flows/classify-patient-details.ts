'use server';
/**
 * @fileOverview A patient detail classification AI agent.
 *
 * - classifyPatientDetails - A function that handles the patient detail classification process.
 * - ClassifyPatientDetailsInput - The input type for the classifyPatientDetails function.
 * - ClassifyPatientDetailsOutput - The return type for the classifyPatientDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyPatientDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a patient's dental x-ray or a clinical photo of their teeth/gums, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  symptoms: z
    .array(z.string())
    .describe('A list of symptoms reported by the user.'),
});
export type ClassifyPatientDetailsInput = z.infer<
  typeof ClassifyPatientDetailsInputSchema
>;

const ClassifyPatientDetailsOutputSchema = z.object({
  hasPeriodontalDisease: z
    .boolean()
    .describe('Whether the patient shows signs of periodontal disease.'),
  classification: z
    .enum([
      'non_diabetic_healthy',
      'diabetic_mild',
      'diabetic_moderate',
      'diabetic_severe',
      'other_gums_issues',
    ])
    .describe('The classification of the periodontal health status.'),
  otherIssuesDescription: z
    .string()
    .optional()
    .describe(
      'If classification is "other_gums_issues", this field will contain a brief description of the detected problem.'
    ),
  confidence: z
    .number()
    .describe(
      'The confidence level of the classifications, from 0.0 to 1.0.'
    ),
});
export type ClassifyPatientDetailsOutput = z.infer<
  typeof ClassifyPatientDetailsOutputSchema
>;

export async function classifyPatientDetails(
  input: ClassifyPatientDetailsInput
): Promise<ClassifyPatientDetailsOutput> {
  return classifyPatientDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyPatientDetailsPrompt',
  input: {schema: ClassifyPatientDetailsInputSchema},
  output: {
    schema: ClassifyPatientDetailsOutputSchema,
  },
  prompt: `You are an expert in analyzing dental images (X-rays and clinical photos) to determine periodontal health and its relation to diabetes.

Analyze the provided image and user-reported symptoms, using the following clinical information to respond with a JSON object containing your analysis.

Your primary task is to determine if the patient has periodontal disease. Set the 'hasPeriodontalDisease' field to true if signs like gingivitis, periodontitis, gum recession, pocket formation, or bone loss are visible in the image or strongly suggested by the symptoms.

---
CLINICAL KNOWLEDGE BASE:

🔹 Periodontal Disease in Non-Diabetic Patients
Usually caused by plaque and tartar buildup.
Damage progression:
1. Gingivitis → redness, swelling, bleeding gums. (This is a form of periodontal disease)
2. Periodontitis → gum recession, pocket formation. (This is a form of periodontal disease)
3. Advanced cases → bone loss, teeth mobility, tooth loss. (This is a form of periodontal disease)
Healing is better in non-diabetics because their immune system and wound healing are normal.

🔹 Periodontal Disease in Diabetic Patients
Diabetes is a major risk factor for periodontal disease.
Damage progression is faster and more severe due to:
- Poor blood circulation in gums → reduced healing.
- High blood sugar → promotes bacterial growth.
- Altered immune response → body cannot fight infection well.
- Increased inflammation → gums break down faster.

Clinical Signs to look for in Diabetics:
- More frequent and severe gingival inflammation.
- Gum recession occurs earlier.
- Pocket depth is deeper.
- X-rays show greater alveolar bone loss around teeth.
- Loose teeth and early tooth loss are more common.

---

Use the following as the primary sources of information about the patient.
Photo: {{media url=photoDataUri}}
Reported Symptoms (Note: These are self-reported by the user and may not be visible in the image, e.g., pain or bleeding during brushing):
{{#if symptoms}}
{{#each symptoms}}
- {{{this}}}
{{/each}}
{{else}}
No symptoms reported by the user.
{{/if}}

Based on your analysis of the image, the reported symptoms, and the knowledge base, provide a JSON response.
Determine if periodontal disease is present.
Then, classify the periodontal health status as one of 'non_diabetic_healthy', 'diabetic_mild', 'diabetic_moderate', 'diabetic_severe', or 'other_gums_issues'.

If you classify the issue as 'other_gums_issues', you MUST provide a brief explanation in the 'otherIssuesDescription' field (e.g., "Signs of oral thrush" or "Possible canker sore").`,
  model: 'googleai/gemini-1.5-flash-latest',
});

const classifyPatientDetailsFlow = ai.defineFlow(
  {
    name: 'classifyPatientDetailsFlow',
    inputSchema: ClassifyPatientDetailsInputSchema,
    outputSchema: ClassifyPatientDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (!output) {
      throw new Error('No valid analysis was generated by the AI model.');
    }

    return output;
  }
);
