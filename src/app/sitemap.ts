import type { MetadataRoute } from "next";

import { mainNav, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", ...mainNav.map((item) => item.href)];

  return routes.map((route) => ({
    url: new URL(route, siteConfig.url).toString(),
    lastModified: new Date(),
  }));
}
