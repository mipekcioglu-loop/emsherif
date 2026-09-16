import Image from "next/image";

import type { Language } from "@/lib/i18n";
import { pagePath } from "@/lib/menu";

/**
 * Fallback rendering for languages that have not been transcribed yet: the
 * original printed pages, shown full width.
 */
export function MenuPages({
  language,
  pages,
  label,
}: {
  language: Language;
  pages: number[];
  label: string;
}) {
  return (
    <div className="space-y-4">
      {pages.map((page, index) => (
        <Image
          key={page}
          src={pagePath(language, page)}
          alt={`${label} — ${index + 1}`}
          width={1191}
          height={1684}
          priority={index === 0}
          sizes="(min-width: 1024px) 900px, 100vw"
          className="h-auto w-full"
        />
      ))}
    </div>
  );
}
