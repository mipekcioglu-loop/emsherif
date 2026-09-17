import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import { categories, languages } from "@/lib/i18n";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <Wordmark width="min(210px, 60vw)" label="Em Sherif Café" />
      <h1 className="font-display text-4xl">Page not found</h1>
      <Link
        href={`/${languages[0]}/${categories[0]}`}
        className="text-sm underline underline-offset-4"
      >
        Back to the menu
      </Link>
    </main>
  );
}
