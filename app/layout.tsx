import type { Metadata } from "next";
import { EB_Garamond, Playfair_Display } from "next/font/google";
import "./globals.css";

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

      <body className="font-serif antialiased text-gray-900 leading-relaxed">
        {children}
      </body>
    </html>
  );
}
