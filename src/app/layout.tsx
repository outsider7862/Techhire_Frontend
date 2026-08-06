import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeScript from "@/components/ThemeScript";
import Providers from "@/components/Providers";

const sans = DM_Sans({
  variable: "--font-sans-src",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TechHire Copilot",
  description: "AI-powered resume screening and technical recruiting pipeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // ThemeScript adds `dark` to <html> before React hydrates, so the
      // client class list intentionally differs from the server's. Scope the
      // hydration warning suppression to this one element only.
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
