/**
 * Where the site is served from.
 *
 * `basePath` is the subpath the app is mounted under — empty on a normal host,
 * "/emsherif" on GitHub Pages. Next prefixes it onto <Link> and next/image
 * automatically, but not onto a plain <a href>, so those use `withBasePath`.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export function withBasePath(path: string): string {
  return `${basePath}${path}`;
}

/**
 * The static export writes `/en/food/index.html` and is served from a plain
 * file host, so a hand-written URL has to carry the trailing slash the export
 * was built with. `<Link>` handles this itself; raw hrefs do not.
 */
export const trailingSlash = process.env.STATIC_EXPORT === "true";

export function routeHref(path: string): string {
  return `${withBasePath(path)}${trailingSlash && !path.endsWith("/") ? "/" : ""}`;
}
