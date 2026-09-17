"use client";

import { useEffect } from "react";

import { setSearchQuery, useSearchQuery } from "@/components/menu-filter-store";
import { useHydrated } from "@/components/use-hydrated";

/**
 * Search sits in the hero rather than in the sticky rail, at both widths, so
 * the bar that follows the guest down 128 dishes stays 54px tall.
 *
 * Filtering happens in the browser, over the category already on the page, so
 * there is nothing for it to do before hydration — until then the field is
 * disabled rather than a box that swallows typing. A guest with no JavaScript
 * at all keeps the whole menu, every section rendered.
 */
export function SearchField({
  label,
  clearLabel,
  controls,
}: {
  label: string;
  clearLabel: string;
  /** id of the region the results appear in. */
  controls: string;
}) {
  const query = useSearchQuery();
  const ready = useHydrated();

  /* Leaving the page with a query set would filter the next category too. */
  useEffect(() => () => setSearchQuery(""), []);

  return (
    <div
      role="search"
      className="border-ink/15 text-ink/45 flex w-full items-center gap-2.5 rounded-full border bg-[color-mix(in_srgb,var(--color-ink)_2%,transparent)] px-4 py-2.5 sm:w-[290px]"
    >
      <svg
        viewBox="0 0 16 16"
        width="13"
        height="13"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle
          cx="6.8"
          cy="6.8"
          r="4.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10.3 10.3 14 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <input
        type="search"
        value={query}
        disabled={!ready}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder={label}
        aria-label={label}
        aria-controls={controls}
        enterKeyHint="search"
        autoComplete="off"
        className="text-ink placeholder:text-ink/45 w-full min-w-0 border-0 bg-transparent p-0 text-[12.5px] outline-none disabled:cursor-not-allowed"
      />

      {query ? (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label={clearLabel}
          className="text-ink/45 hover:text-ink -me-1 shrink-0 px-1 text-[15px] leading-none transition-colors"
        >
          &times;
        </button>
      ) : null}
    </div>
  );
}
