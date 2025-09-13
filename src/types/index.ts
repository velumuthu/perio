export type ClassificationResult = {
  classification: string;
  otherIssuesDescription?: string;
  confidence: number;
  name: string;
  hasPeriodontalDisease: boolean;
};

export type ImageState = {
  id: string;
  file: File;
  status: 'pending' | 'loading' | 'done' | 'error';
  originalDataUrl: string;
  result?: ClassificationResult;
  error?: string;
  symptoms?: string[];
};
