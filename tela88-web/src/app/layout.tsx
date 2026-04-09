import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-headline",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tela88.pt"),
  title: "Tela 88 — Parceiro de Crescimento Digital",
  description:
    "Construímos infraestruturas digitais orientadas à performance para negócios que já existem — e querem escalar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-surface text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
