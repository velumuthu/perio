'use client';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="py-12 lg:py-20">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="grid place-items-center gap-8">
          <div className="text-center space-y-6">
            <main className="text-4xl md:text-5xl font-headline font-bold">
              <h1 className="inline">
                <span className="inline bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
                  PerioClassify
                </span>{' '}
                AI-Powered
              </h1>{' '}
              Periodontal Analysis
            </main>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload dental X-rays or clinical photos to evaluate the impact of
              diabetes on periodontal health using our advanced CNN model. Get
              instant classifications and insights.
            </p>

            <div className="pt-4 flex justify-center">
              <a href="#image-processor">
                <Button size="lg" className="w-auto min-w-[200px]">
                  Get Started
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
