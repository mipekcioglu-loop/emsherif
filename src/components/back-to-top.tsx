"use client";

import { useSyncExternalStore } from "react";

/**
 * Back to the top of 128 dishes.
 *
 * It is a link to the top of the document, so it works with no JavaScript at
 * all; what JavaScript adds is keeping it out of the way until the guest has
 * scrolled far enough to want it. In Arabic and Kurdish it moves to the bottom
 * left, which `end-*` does by itself.
 */
function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > 600;

export function BackToTop({ label }: { label: string }) {
  const shown = useSyncExternalStore(subscribeToScroll, isScrolled, () => false);

  return (
    <>
      {/* With no JavaScript there is nothing to toggle it, so it simply stays. */}
      <noscript>
        <style>{".back-to-top{opacity:1;pointer-events:auto}"}</style>
      </noscript>
      <a
        href="#top"
        aria-label={label}
        className={`back-to-top bg-ink text-paper fixed end-4 bottom-4.5 z-30 flex size-11 items-center justify-center rounded-full shadow-[0_8px_22px_-6px_color-mix(in_srgb,var(--color-ink)_55%,transparent)] transition-opacity duration-200 sm:end-5 sm:bottom-5 ${
          shown ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
          <path
            d="M7 12V2.6M2.8 6.8 7 2.6l4.2 4.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </>
  );
}
