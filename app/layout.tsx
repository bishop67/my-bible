import type { Metadata } from 'next';
import { EB_Garamond, Playfair_Display } from 'next/font/google';
import './globals.css';

const garamond = EB_Garamond({ subsets: ['latin'], variable: '--font-garamond' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

const description = 'A clean, reader-friendly King James Version Bible with the Apocrypha.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.URL ?? 'https://livingwine.netlify.app'),
  title: 'Holy Bible',
  description,
  openGraph: { title: 'Holy Bible', description, siteName: 'Holy Bible', type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${garamond.variable} ${playfair.variable}`}>
      <body className="font-serif antialiased text-gray-900 leading-relaxed">{children}</body>
    </html>
  );
}
