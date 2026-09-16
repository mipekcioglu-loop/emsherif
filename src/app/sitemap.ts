import type { MetadataRoute } from "next";

import { categories, languages } from "@/lib/i18n";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    ...languages.flatMap((lang) => [
      `/${lang}`,
      ...categories.map((category) => `/${lang}/${category}`),
    ]),
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));
}
