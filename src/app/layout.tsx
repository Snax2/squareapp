import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Local Inventory Finder - Find Products in Nearby Stores',
  description: 'Find specific products in nearby stores with real-time inventory data. Search by location and discover what\'s available in Byron Bay and surrounding areas.',
  keywords: 'local shopping, inventory search, Byron Bay, product finder, nearby stores',
  authors: [{ name: 'Local Inventory Finder' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Local Inventory Finder',
    description: 'Find products in nearby stores with real-time inventory',
    type: 'website',
    locale: 'en_AU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Local Inventory Finder',
    description: 'Find products in nearby stores with real-time inventory',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}

