import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
  themeColor: "#fffff5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
