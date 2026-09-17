import type { MetadataRoute } from "next";

import { categories, languages } from "@/lib/i18n";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

/**
 * Only the nine menu pages. "/" and "/en" exist to send a guest on to a menu
 * and carry `noindex`, so listing them here would ask for them to be indexed
 * and then tell the crawler not to.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return languages.flatMap((lang) =>
    categories.map((category) => ({
      url: `${siteUrl}/${lang}/${category}`,
      lastModified,
      alternates: {
        languages: Object.fromEntries(
          languages.map((code) => [code, `${siteUrl}/${code}/${category}`]),
        ),
      },
    })),
  );
}
