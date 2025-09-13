import Link from 'next/link';

const ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.34 2.155C10.27 1.22 11.5 1 12.52 1c1.02 0 2.25.22 3.18.972.93.752 1.6 1.943 1.6 3.028 0 1.302-.79 2.404-1.84 2.89a2.23 2.23 0 0 1-1.34.195" />
    <path d="M6.13 8.068C4.65 7.94 4 8.5 4 9.513c0 1.314.94 2.487 2.29 2.487 1.35 0 2.29-1.173 2.29-2.487 0-1.012-.65-1.572-2.13-1.445Z" />
    <path d="m18.13 8.068-2.13-.123c-1.48.13-2.13.56-2.13 1.572 0 1.314.94 2.487 2.29 2.487 1.35 0 2.29-1.173 2.29-2.487 0-1.013-.65-1.573-2.32-1.447Z" />
    <path d="M12.52 1C11.5 1 10.27 1.22 9.34 2.155a4.23 4.23 0 0 0-1.6 3.028c0 1.05.62 2.17 1.56 2.86" />
    <path d="M12.52 1c1.02 0 2.25.22 3.18.972.93.752 1.6 1.943 1.6 3.028 0 1.05-.62 2.17-1.56 2.86" />
    <path d="M15.93 12c.32.32.51.75.51 1.21 0 .97-.78 1.76-1.74 1.76h-4.38c-.96 0-1.74-.79-1.74-1.76 0-.46.19-.89.51-1.21" />
    <path d="M18 16c-1 1-2.5 2-4 2s-3-1-4-2" />
    <path d="M20 12h-4" />
    <path d="M8 12H4" />
    <path d="M12.5 15.5v3.5c0 1.1-2.52 1-2.52 1H10c-1.1 0-2-.9-2-2" />
    <path d="M12.5 15.5v3.5c0 1.1 2.52 1 2.52 1H16c1.1 0 2-.9 2-2" />
  </svg>
);

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-center">
        <div className="flex">
          <Link href="/" className="flex items-center space-x-2">
            <ToothIcon className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-bold sm:inline-block">
              PerioClassify
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
