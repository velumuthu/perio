'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface CameraDialogProps {
  onCapture: (file: File) => void;
  trigger?: React.ReactNode;
}

export function CameraDialog({ onCapture, trigger }: CameraDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsStreamReady(false);
  }, [stream]);

  const startCamera = async () => {
    setIsLoading(true);
    setIsStreamReady(false);
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported.');
      }
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(ms);
      if (videoRef.current) {
        videoRef.current.srcObject = ms;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.log("Auto-play prevented, waiting for user interaction");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera error');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
  }, [isOpen, capturedImage]);

  useEffect(() => {
    if (!isOpen || !!capturedImage) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  }, [isOpen, capturedImage, stream]);

  const handleVideoLoad = () => {
    setIsStreamReady(true);
    setIsLoading(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          onCapture(file);
          setIsOpen(false);
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => {
      setIsOpen(open);
      if (!open) setCapturedImage(null);
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Take Photo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-zinc-950 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Capture Image</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Take a clear photo of your teeth for analysis.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-900 flex items-center justify-center">
          {error ? (
            <div className="p-4 text-center">
              <X className="mx-auto h-12 w-12 text-destructive mb-2" />
              <p>{error}</p>
              <Button onClick={startCamera} variant="link" className="text-primary mt-2">Try Again</Button>
            </div>
          ) : capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={handleVideoLoad}
                onPlay={() => setIsStreamReady(true)}
                className="h-full w-full object-cover"
              />
              {(isLoading || !isStreamReady) && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 flex-col gap-2 cursor-pointer z-10"
                  onClick={() => {
                    if (videoRef.current) videoRef.current.play().catch(console.error);
                  }}
                >
                   <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                   <p className="text-xs text-white/70">Starting camera...</p>
                   {!isLoading && (
                     <p className="text-[10px] text-primary mt-2">Tap here if video doesn't start</p>
                   )}
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-center gap-4 mt-4">
          {!capturedImage ? (
            <Button
              onClick={capturePhoto}
              className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center border-4 border-white/20"
              disabled={isLoading || !isStreamReady || !!error}
            >
              <div className="h-8 w-8 rounded-full bg-white" />
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="rounded-full h-12 w-12 p-0 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button
                onClick={confirmPhoto}
                className="rounded-full h-12 w-12 p-0 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
