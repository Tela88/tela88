import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tela88.pt"),
  title: "Tela 88 - Parceiro de Crescimento Digital",
  description:
    "Construímos infraestruturas digitais orientadas à performance para negócios que já existem e querem escalar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body className="min-h-screen bg-surface text-on-surface antialiased">
        <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
