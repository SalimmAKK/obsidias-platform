import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

/* Atelier Zero's four families, each with exactly one job:
     Inter Tight      display headlines and UI labels
     Inter            running body text
     Playfair Display italic emphasis inside headlines only
     JetBrains Mono   meta lines, coordinates, index numbers
   Loading them through next/font means they're self-hosted and preloaded —
   no render-blocking request to fonts.googleapis.com, no layout shift. */

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter-tight",
});

// Running text only, so 400 and 500 cover it. 300 and 600 were loaded and
// never used — nothing in the codebase sets a 300 weight, and semibold UI
// text is Inter Tight, not Inter.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

// Italic only, and deliberately so: every single --serif usage in the
// codebase sets font-style: italic (verified across all 12 call sites — the
// headline <em>, the roman numerals, the method numerals, the logo mark).
// Loading the normal style shipped ~16 @font-face declarations that could
// never render.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
  variable: "--font-playfair",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
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
  const fontVars = `${interTight.variable} ${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`;

  return (
    // suppressHydrationWarning because the inline script below deliberately
    // mutates this element's className before React hydrates — that's the
    // whole point of it running pre-paint, and it's the one documented case
    // where a server/client attribute mismatch is intended.
    <html lang="en" className={fontVars} suppressHydrationWarning>
      {/* No external stylesheet here on purpose.
          This used to load the Tabler icon webfont from jsDelivr. A
          third-party <link rel="stylesheet"> in <head> is render-blocking on
          every single page: the browser will not paint until it resolves, so
          a slow, throttled, or blocked CDN stalls first paint of the whole
          app, and different engines recover from that differently — which is
          exactly the shape of a flash-of-unstyled-content report. It was also
          pinned to @latest, meaning the styling of a signed-in product page
          could change without a deploy, and it leaked a request to a third
          party on every visit.

          It was buying six glyphs. All six exist in lucide-react, which is
          already in the bundle. */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE }} />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
