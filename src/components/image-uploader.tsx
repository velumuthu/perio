'use client';

import { useState, useCallback, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

export function ImageUploader({ onUpload, disabled }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files) {
        const fileArray = Array.from(files).filter(
          (file) =>
            file.type.startsWith('image/') ||
            /\.heic$/i.test(file.name) ||
            /\.heif$/i.test(file.name)
        );
        setUploadedFiles(fileArray);
        onUpload(fileArray);
      }
    },
    [onUpload]
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300',
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={!disabled ? handleDrop : undefined}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDragEnter={!disabled ? handleDragEnter : undefined}
        onDragLeave={!disabled ? handleDragLeave : undefined}
      >
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="mb-2 font-semibold">
          Drag & drop your dental images here
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          (X-rays, clinical photos, HEIC/HEIF)
        </p>
        <Button asChild variant="outline" disabled={disabled}>
          <label htmlFor="file-upload">
            Browse Files
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,.heic,.heif"
              className="sr-only"
              onChange={handleInputChange}
              disabled={disabled}
            />
          </label>
        </Button>
      </div>
    </div>
  );
}
