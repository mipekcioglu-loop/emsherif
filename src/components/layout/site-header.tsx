"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { mainNav, siteConfig } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-burgundy text-cream sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-gold text-2xl tracking-[0.2em] uppercase"
          onClick={() => setIsOpen(false)}
        >
          {siteConfig.name}
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`eyebrow hover:text-gold transition-colors ${
                    pathname === item.href ? "text-gold" : "text-cream/80"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="eyebrow text-cream/80 md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>

      {isOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-cream/15 border-t md:hidden"
        >
          <ul className="mx-auto max-w-6xl px-6 py-4">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="eyebrow text-cream/80 block py-3"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
