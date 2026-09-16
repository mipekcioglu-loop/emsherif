import type { MetadataRoute } from "next";

import { categories, languages } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    ...languages.flatMap((lang) => [
      `/${lang}`,
      ...categories.map((category) => `/${lang}/${category}`),
    ]),
  ];

  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified: new Date(),
  }));
}
