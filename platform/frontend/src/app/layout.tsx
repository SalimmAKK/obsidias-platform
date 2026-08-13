import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

// Geist for display and body, Geist Mono for meta labels. Inter is
// deliberately not loaded — it's banned by the design system this is built
// to, and leaving it out means nothing can silently fall back to it.
const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Obsidias — Real Estate Automation Dashboard",
  description: "AI-powered lead matching and proposal automation for real estate agencies.",
  icons: {
    icon: "/favicon.svg",
  }
};

// Runs before first paint, so JS-gated motion primitives (.m-reveal,
// .m-lines) only ever hide content on a browser that can also un-hide it.
// Without JS this class is never added, the gated rules never match, and
// everything renders in its final readable state — animation stays strictly
// progressive enhancement.
const MOTION_GATE = `try{document.documentElement.classList.add('m-js')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning because the inline script below deliberately
    // mutates this element's className before React hydrates — that's the
    // whole point of it running pre-paint, and it's the one documented case
    // where a server/client attribute mismatch is intended.
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE }} />
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
