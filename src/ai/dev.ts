import { config } from 'dotenv';
config();

import '@/ai/flows/classify-patient-details.ts';
import '@/ai/flows/generate-summary-of-results.ts';
