import type { Metadata } from "next";

import { LanguageLanding } from "@/components/language-landing";

/* The menu is the site; this page only points at it. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function RootPage() {
  return <LanguageLanding />;
}
