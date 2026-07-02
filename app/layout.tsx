import type { Metadata } from "next";
import { Mukta } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider, themeInitScript } from "@/components/site/theme-provider";
import { NavLoader } from "@/components/site/nav-loader";
import { Suspense } from "react";

// Nepali / Devanagari primary UI font.
const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mukta",
  display: "swap",
});

// Yakthung (Limbu / Sirijonga) script. Noto Sans Limbu covers the full Unicode
// Limbu block (U+1900–U+194F), so Limbu keyboard input renders correctly.
const notoLimbu = localFont({
  src: "./fonts/NotoSansLimbu-Regular.ttf",
  variable: "--font-noto-limbu",
  display: "swap",
  fallback: ["Noto Sans Limbu", "sans-serif"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Chhathare Limbu Sahitya";
const SITE_DESC =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Chhathare Limbu literature";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "छथरे लिम्बु साहित्य",
    template: `%s · छथरे लिम्बु साहित्य`,
  },
  description: SITE_DESC,
  openGraph: {
    type: "website",
    locale: "ne_NP",
    siteName: SITE_NAME,
    title: "छथरे लिम्बु साहित्य",
    description: SITE_DESC,
    url: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ne"
      className={`${mukta.variable} ${notoLimbu.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavLoader />
          </Suspense>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
