import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RDF Web Components Demo",
  description: "A Next.js application scaffolded with AI, featuring TypeScript, Tailwind CSS, shadcn/ui, and RDF Web Components for Semantic Web development.",
  keywords: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React", "RDF", "Semantic Web", "Web Components"],
  authors: [{ name: "Decruw Cedric" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "RDF Web Components Demo",
    description: "A Next.js application scaffolded with AI, featuring TypeScript, Tailwind CSS, shadcn/ui, and RDF Web Components for Semantic Web development.",
    siteName: "RDF Web Components Demo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RDF Web Components Demo",
    description: "A Next.js application scaffolded with AI, featuring TypeScript, Tailwind CSS, shadcn/ui, and RDF Web Components for Semantic Web development.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
