import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Noto_Naskh_Arabic,
  Noto_Sans_Arabic,
} from "next/font/google";

import { siteUrl, withBasePath } from "@/lib/site-url";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  /* 500-600 for dish names and headings, 400 for the opening passage. The
     light weights disappear on a phone, so they are not loaded. */
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/*
 * The Arabic faces carry both Arabic and Kurdish (Sorani). They are not
 * preloaded: an English guest on mobile data should never pay for them, and a
 * guest on an Arabic or Kurdish page needs them the moment the page paints,
 * which `display: swap` covers.
 */
const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-naskh-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-sans-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Em Sherif Café Erbil | Menu",
  description:
    "The menu at Em Sherif Café Erbil, in English, Kurdish and Arabic. Lebanese cooking served with the warmth of a family table.",
  openGraph: {
    type: "website",
    siteName: "Em Sherif Café Erbil",
    title: "Em Sherif Café Erbil | Menu",
  },
};

export const viewport: Viewport = {
  /* The header is navy and sits under the status bar on a phone. */
  themeColor: "#183f67",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${notoNaskhArabic.variable} ${notoSansArabic.variable} h-full scroll-smooth`}
      /* The wordmark is painted through a CSS mask in several places and the
         mask URL has to carry basePath, which only JS knows about. The mask is
         the light copy of the wordmark — see scripts/make-logo.mjs. */
      style={
        {
          "--wordmark": `url("${withBasePath("/wordmark-mask.png")}")`,
          /* Keep an anchored section heading clear of the sticky rail. */
          scrollPaddingTop: "4.5rem",
        } as React.CSSProperties
      }
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
