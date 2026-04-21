import type { Metadata } from 'next';
import { Bricolage_Grotesque, Space_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

const bricolage = Bricolage_Grotesque({ 
  subsets: ['latin'],
  variable: '--font-bricolage'
});

const spaceMono = Space_Mono({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono'
});

export const metadata: Metadata = {
  title: 'FlashMind - Maximize Retention',
  description: 'AI-powered spaced repetition flashcards for brutal efficiency',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${spaceMono.variable}`}>
      <body className="font-mono bg-background text-foreground min-h-screen flex flex-col selection:bg-primary selection:text-background overflow-x-hidden border-t-4 border-solid border-primary">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
