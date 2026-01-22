import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Exactly AI - Grow your business with AI',
  description: 'Exactly AI Solutions builds and runs agentic systems that guarantee outcomes.',
  // Block search engine indexing during pre-launch
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
