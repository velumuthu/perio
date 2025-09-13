'use client';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClassificationResult } from '@/types';
import { Progress } from '@/components/ui/progress';

interface ResultCardProps {
  result: ClassificationResult;
  originalDataUrl: string;
}

const classificationText: Record<string, string> = {
  non_diabetic_healthy: 'Healthy (Non-Diabetic)',
  diabetic_mild: 'Mild (Diabetic)',
  diabetic_moderate: 'Moderate (Diabetic)',
  diabetic_severe: 'Severe (Diabetic)',
  other_gums_issues: 'Other Gums Issues',
};

export function ResultCard({ result, originalDataUrl }: ResultCardProps) {
  const getBadgeVariant = (classification: string) => {
    if (classification.startsWith('diabetic')) {
      return 'destructive';
    }
    if (classification === 'non_diabetic_healthy') {
      return 'default';
    }
    return 'secondary';
  };

  const confidencePercentage = Math.round(result.confidence * 100);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="truncate text-xl md:text-2xl">{result.name}</CardTitle>
        <CardDescription>AI Clinical Analysis Complete</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="aspect-video relative mt-2 rounded-md overflow-hidden border">
          <Image
            src={originalDataUrl}
            alt="Original input image"
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-[1fr,auto] items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Periodontal Disease
            </span>
            <Badge
              variant={result.hasPeriodontalDisease ? 'destructive' : 'default'}
              className="text-base justify-self-end"
            >
              {result.hasPeriodontalDisease ? 'Detected' : 'Not Detected'}
            </Badge>
          </div>

          <div className="grid grid-cols-[1fr,auto] items-start gap-4">
            <span className="text-sm font-medium text-muted-foreground mt-0.5">
              Classification
            </span>
            <div className="text-right">
              <Badge
                variant={getBadgeVariant(result.classification)}
                className="text-base"
              >
                {classificationText[result.classification] ||
                  result.classification}
              </Badge>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">
                Matching Percentage
              </span>
              <span className="font-semibold">{confidencePercentage}%</span>
            </div>
            <Progress value={confidencePercentage} />
          </div>
          {result.classification === 'other_gums_issues' &&
            result.otherIssuesDescription && (
              <div className="pt-2">
                <p className="text-sm font-medium text-destructive text-center">
                  {result.otherIssuesDescription}
                </p>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
