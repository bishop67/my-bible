import type { Metadata } from "next";
import { EB_Garamond, Playfair_Display } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "KJV Bible",
  description: "A clean, reader-friendly King James Version Bible with the Apocrypha.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${garamond.variable} ${playfair.variable}`}>

      <body className="font-sans antialiased text-gray-900 leading-relaxed">

        <header className="font-serif font-bold text-3xl p-6 text-center border-b">
          <Link href="/" className="font-display">KJV + Apocrypha</Link>
        </header>

        {children}

      </body>
    </html>
  );
}
