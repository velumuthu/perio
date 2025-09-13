'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SummaryDisplayProps {
  summary: string | null;
  isLoading: boolean;
}

function Typewriter({ text, speed = 20 }: { text: string, speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset on text change
    if (text) {
        let i = 0;
        const intervalId = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) {
            clearInterval(intervalId);
        }
        }, speed);
        return () => clearInterval(intervalId);
    }
  }, [text, speed]);

  return <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{displayedText}</p>;
}

export function SummaryDisplay({ summary, isLoading }: SummaryDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accent" />
                Generating Summary...
            </CardTitle>
            <CardDescription>The AI is analyzing the results to find trends.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/30">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
                <Sparkles className="w-6 h-6 text-accent" />
                AI-Generated Study Summary
            </CardTitle>
            <CardDescription>Key trends and potential correlations based on the provided images.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <Typewriter text={summary} />
            </div>
        </CardContent>
    </Card>
  );
}
