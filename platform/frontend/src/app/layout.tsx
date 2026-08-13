import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

// Inter is the shared typeface across the dashboard (see src/styles/
// tokens.css). It previously wasn't loaded anywhere in the app, so
// Landing.css's `font-family: 'Inter'` was silently falling back to the
// system font the whole time.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter"
});

// Plus Jakarta Sans is the marketing site's typeface (landing, features,
// how-it-works), per the warm/organic design pass — scoped to those pages
// via --font-jakarta rather than replacing Inter everywhere, so the
// dashboard is unaffected until/unless that gets its own redesign pass.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains-mono"
});

export const metadata: Metadata = {
  title: "Obsidias — Real Estate Automation Dashboard",
  description: "AI-powered lead matching and proposal automation for real estate agencies.",
  icons: {
    icon: "/favicon.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
