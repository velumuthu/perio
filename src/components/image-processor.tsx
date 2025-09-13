'use client';
import { useState, useTransition } from 'react';
import { ImageState } from '@/types';
import { ImageUploader } from '@/components/image-uploader';
import { ResultCard } from '@/components/result-card';
import { SummaryDisplay } from '@/components/summary-display';
import { SymptomSelector } from '@/components/symptom-selector';
import { Button } from '@/components/ui/button';
import { processImage, getSummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, FileWarning } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent } from './ui/card';
import { GenerateSummaryOfResultsOutput } from '@/ai/flows/generate-summary-of-results';

const convertHeicToJpeg = async (file: File): Promise<File> => {
  const heic2any = (await import('heic2any')).default;
  return new Promise((resolve, reject) => {
    heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.8,
    })
      .then(conversionResult => {
        const convertedBlob = conversionResult as Blob;
        const newFile = new File(
          [convertedBlob],
          file.name.replace(/\.heic$/i, '.jpg'),
          {
            type: 'image/jpeg',
            lastModified: file.lastModified,
          }
        );
        resolve(newFile);
      })
      .catch(error => {
        reject(error);
      });
  });
};

const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function ImageProcessor() {
  const [images, setImages] = useState<ImageState[]>([]);
  const [summary, setSummary] =
    useState<GenerateSummaryOfResultsOutput | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isProcessing, startProcessing] = useTransition();
  const [isSummaryLoading, startSummaryLoading] = useTransition();
  const { toast } = useToast();

  const handleImageUpload = (files: File[]) => {
    const newImageStates: ImageState[] = files.map(file => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      status: 'loading',
      originalDataUrl: '', // Will be populated after reading
    }));
    setImages(prev => [...prev, ...newImageStates]);
    setSummary(null);

    startProcessing(async () => {
      const processingPromises = newImageStates.map(async imageState => {
        try {
          let fileToProcess = imageState.file;
          if (
            /\.heic$/i.test(fileToProcess.name) ||
            /\.heif$/i.test(fileToProcess.name)
          ) {
            try {
              fileToProcess = await convertHeicToJpeg(fileToProcess);
            } catch (conversionError) {
              throw new Error('Failed to convert HEIC image.');
            }
          }

          const dataUrl = await fileToDataURL(fileToProcess);

          setImages(prev =>
            prev.map(img =>
              img.id === imageState.id
                ? { ...img, originalDataUrl: dataUrl, file: fileToProcess }
                : img
            )
          );

          const result = await processImage(
            dataUrl,
            fileToProcess.name,
            selectedSymptoms
          );

          setImages(prev =>
            prev.map(img =>
              img.id === imageState.id
                ? {
                    ...img,
                    status: 'done',
                    result: {
                      name: fileToProcess.name,
                      classification: result.classification,
                      otherIssuesDescription: result.otherIssuesDescription,
                      confidence: result.confidence,
                      hasPeriodontalDisease: result.hasPeriodontalDisease,
                    },
                  }
                : img
            )
          );
        } catch (error) {
          console.error(error);
          const errorMessage =
            error instanceof Error ? error.message : 'An unknown error occurred.';
          setImages(prev =>
            prev.map(img =>
              img.id === imageState.id
                ? { ...img, status: 'error', error: errorMessage }
                : img
            )
          );
          toast({
            variant: 'destructive',
            title: `Error processing ${imageState.file.name}`,
            description: errorMessage,
          });
        }
      });
      await Promise.all(processingPromises);
    });
  };

  const handleGenerateSummary = () => {
    const successfulResults = images
      .filter(img => img.status === 'done' && img.result)
      .map(img => ({
        imageName: img.result!.name,
        classification: img.result!.classification,
        confidence: img.result!.confidence,
      }));

    if (successfulResults.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No results to summarize',
        description: 'Please process at least one image successfully.',
      });
      return;
    }

    startSummaryLoading(async () => {
      try {
        const summaryResult = await getSummary(successfulResults);
        setSummary(summaryResult);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
          variant: 'destructive',
          title: 'Summary Generation Failed',
          description: errorMessage,
        });
      }
    });
  };

  const hasSuccessfulResults = images.some(img => img.status === 'done');

  return (
    <div id="image-processor" className="w-full py-12 lg:py-20">
      <div className="container max-w-6xl mx-auto space-y-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <SymptomSelector
            selectedSymptoms={selectedSymptoms}
            onSelectedSymptomsChange={setSelectedSymptoms}
          />
          <ImageUploader onUpload={handleImageUpload} disabled={isProcessing} />
        </div>

        {images.length > 0 && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 font-headline">
              Analysis Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {images.map(image => {
                if (
                  image.status === 'loading' ||
                  (isProcessing &&
                    image.status !== 'error' &&
                    image.status !== 'done')
                ) {
                  return <SkeletonCard key={image.id} />;
                }
                if (image.status === 'error') {
                  return (
                    <ErrorCard
                      key={image.id}
                      fileName={image.file.name}
                      error={image.error}
                    />
                  );
                }
                if (image.status === 'done' && image.result) {
                  return (
                    <ResultCard
                      key={image.id}
                      result={image.result}
                      originalDataUrl={image.originalDataUrl}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {hasSuccessfulResults && !isProcessing && (
          <div className="text-center">
            <Button
              onClick={handleGenerateSummary}
              disabled={isSummaryLoading}
            >
              {isSummaryLoading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate Summary
            </Button>
          </div>
        )}

        {(isSummaryLoading || summary) && (
          <div>
            <SummaryDisplay
              summary={summary?.summary ?? null}
              isLoading={isSummaryLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const SkeletonCard = () => (
  <Card className="flex flex-col">
    <CardContent className="p-4 flex-grow flex flex-col justify-center items-center">
      <div className="w-full space-y-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </CardContent>
  </Card>
);

const ErrorCard = ({
  fileName,
  error,
}: {
  fileName: string;
  error?: string;
}) => (
  <Card className="border-destructive">
    <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
      <FileWarning className="w-12 h-12 text-destructive mb-4" />
      <p className="font-bold text-lg">{fileName}</p>
      <p className="text-destructive text-sm mt-2">Processing Failed</p>
      {error && <p className="text-muted-foreground text-xs mt-1">{error}</p>}
    </CardContent>
  </Card>
);
