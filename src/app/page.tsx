import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/hero';
import { ImageProcessor } from '@/components/image-processor';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col">
        <Hero />
        <ImageProcessor />
      </main>
      <Footer />
    </div>
  );
}
