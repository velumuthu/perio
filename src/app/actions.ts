'use server';

import {
  classifyPatientDetails,
  ClassifyPatientDetailsOutput,
} from '@/ai/flows/classify-patient-details';
import {
  generateSummaryOfResults,
  GenerateSummaryOfResultsOutput,
} from '@/ai/flows/generate-summary-of-results';
import { ClassificationResult } from '@/types';

export async function processImage(
  photoDataUri: string,
  fileName: string,
  symptoms: string[]
): Promise<ClassificationResult> {
  const maxRetries = 3;
  const retryDelayMs = 2000; // 2 seconds
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const classificationResult: ClassifyPatientDetailsOutput =
        await classifyPatientDetails({ photoDataUri, symptoms });
      return {
        ...classificationResult,
        name: fileName,
      };
    } catch (error) {
      lastError = error;
      // Check for Gemini 503 error
      const message = error instanceof Error ? error.message : String(error);
      if (
        message.includes('503') ||
        message.includes('model is overloaded') ||
        message.includes('Service Unavailable')
      ) {
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
          continue;
        }
      }
      // For other errors or after max retries, rethrow
      console.error('Error processing image:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error(
        'An unknown error occurred while processing the image with AI.'
      );
    }
  }
  // If we reach here, all retries failed
  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : 'An unknown error occurred while processing the image with AI.'
  );
}

export async function getSummary(
  results: {
    imageName: string;
    classification: string;
    confidence: number;
  }[]
): Promise<GenerateSummaryOfResultsOutput> {
  if (results.length === 0) {
    throw new Error('No results available to generate a summary.');
  }

  try {
    const response = await generateSummaryOfResults({
      results: results.map(({ imageName, classification, confidence }) => ({
        imageName,
        classification,
        confidence,
      })),
      studyDetails:
        'This is a cross-sectional study evaluating the impact of diabetes on periodontal health using dental X-ray images. The analysis classifies periodontal health status and diabetes status.',
    });
    return response;
  } catch (error) {
    console.error('Error generating summary:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to generate summary with AI.');
  }
}
