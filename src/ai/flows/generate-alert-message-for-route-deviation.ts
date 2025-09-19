'use server';
/**
 * @fileOverview Generates an alert message for route deviation, suggesting possible explanations and inviting user input.
 *
 * - generateAlertMessage - A function that generates the alert message.
 * - GenerateAlertMessageInput - The input type for the generateAlertMessage function.
 * - GenerateAlertMessageOutput - The return type for the generateAlertMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAlertMessageInputSchema = z.object({
  driverId: z.string().describe('The ID of the driver.'),
  shipmentId: z.string().describe('The ID of the shipment.'),
  deviationDistance: z.number().describe('The distance the driver has deviated from the route in meters.'),
  likelyExplanations: z.array(z.string()).describe('A list of likely explanations for the deviation, such as heavy traffic, road closure, etc.'),
});
export type GenerateAlertMessageInput = z.infer<typeof GenerateAlertMessageInputSchema>;

const GenerateAlertMessageOutputSchema = z.object({
  alertMessage: z.string().describe('The generated alert message for the route deviation.'),
});
export type GenerateAlertMessageOutput = z.infer<typeof GenerateAlertMessageOutputSchema>;

export async function generateAlertMessage(input: GenerateAlertMessageInput): Promise<GenerateAlertMessageOutput> {
  return generateAlertMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAlertMessagePrompt',
  input: {schema: GenerateAlertMessageInputSchema},
  output: {schema: GenerateAlertMessageOutputSchema},
  prompt: `You are an AI assistant helping to generate alert messages for a route deviation. A driver has deviated from their planned route.

  Driver ID: {{{driverId}}}
  Shipment ID: {{{shipmentId}}}
  Deviation Distance: {{{deviationDistance}}} meters
  Likely Explanations: {{#each likelyExplanations}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Generate a concise and professional alert message to the driver. The message should:
  1.  Inform the driver about the route deviation.
  2.  Suggest the following likely explanations for the deviation: {{#each likelyExplanations}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  3.  Invite the driver to confirm, deny, or augment the explanations with additional factors (e.g., mechanical breakdown, detour).  The message must be in Persian.
  4. Focus on conciseness to ensure the driver can read it quickly and respond safely.
  `,
});

const generateAlertMessageFlow = ai.defineFlow(
  {
    name: 'generateAlertMessageFlow',
    inputSchema: GenerateAlertMessageInputSchema,
    outputSchema: GenerateAlertMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
