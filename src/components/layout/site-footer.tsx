import Link from "next/link";

import { mainNav, siteConfig, venues } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-cream/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-gold text-2xl tracking-[0.2em] uppercase">
            {siteConfig.name}
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {siteConfig.description}
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow text-gold">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-gold transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow text-gold">Where to find us</p>
          <ul className="mt-4 space-y-2 text-sm">
            {venues.map((venue) => (
              <li key={venue.slug}>
                {venue.city}, {venue.country}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-cream/10 border-t">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
