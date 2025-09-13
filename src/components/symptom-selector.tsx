'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const symptoms = [
  'Bleeding while brushing or flossing',
  'Loose or shifting teeth',
  'Bad breath (halitosis)',
  'Pain or tenderness in gums',
];

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSelectedSymptomsChange: (symptoms: string[]) => void;
}

export function SymptomSelector({
  selectedSymptoms,
  onSelectedSymptomsChange,
}: SymptomSelectorProps) {
  const handleSymptomChange = (symptom: string, checked: boolean) => {
    if (checked) {
      onSelectedSymptomsChange([...selectedSymptoms, symptom]);
    } else {
      onSelectedSymptomsChange(selectedSymptoms.filter((s) => s !== symptom));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Symptoms</CardTitle>
        <CardDescription>
          Check any symptoms you are experiencing to improve the analysis
          accuracy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {symptoms.map((symptom) => (
          <div key={symptom} className="flex items-center space-x-3">
            <Checkbox
              id={symptom}
              checked={selectedSymptoms.includes(symptom)}
              onCheckedChange={(checked) =>
                handleSymptomChange(symptom, !!checked)
              }
            />
            <Label
              htmlFor={symptom}
              className="font-normal text-sm text-muted-foreground"
            >
              {symptom}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
