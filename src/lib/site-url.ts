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
