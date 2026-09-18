"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { DishCard } from "@/components/dish-card";
import { SpreadRailCount } from "@/components/spread-rail-count";
import { normalise, useSearchQuery } from "@/components/menu-filter-store";
import { useHydrated } from "@/components/use-hydrated";
import type { Category, Dictionary, Language } from "@/lib/i18n";
import type { DishView, SectionView } from "@/lib/menu";

/** Cards revealed at a time as the guest scrolls. */
const PAGE_SIZE = 12;
/** Cards loaded eagerly, because they are on screen when the page paints. */
const EAGER = 3;

type Group = { section: SectionView | null; dishes: DishView[] };

function limit(groups: Group[], budget: number): Group[] {
  const out: Group[] = [];
  let left = budget;
  for (const group of groups) {
    if (left <= 0) break;
    out.push({ section: group.section, dishes: group.dishes.slice(0, left) });
    left -= group.dishes.length;
  }
  return out;
}

/**
 * The menu itself: the sticky sub-category rail, and the cards under it.
 *
 * Everything is rendered on the server, so a guest with no JavaScript gets the
 * whole category — every section, every dish — and the filter pills work as
 * what they are, links to the sections below. Where JavaScript runs, the pills
 * filter in place, search narrows the grid, and the cards past the first screen
 * are held back and revealed as the guest scrolls, which is what the client
 * asked for in place of a "load more" button.
 */
export function MenuBrowser({
  language,
  categoryLabel,
  otherCategories,
  sections,
  currency,
  dictionary,
  strings,
}: {
  language: Language;
  categoryLabel: string;
  otherCategories: { category: Category; label: string }[];
  sections: SectionView[];
  currency: string;
  /** Handed down for the spread's controls, which sit inside the cards. */
  dictionary: Dictionary;
  strings: {
    all: string;
    sections: string;
    noResults: string;
    loadingMore: string;
  };
}) {
  const query = useSearchQuery();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinel = useRef<HTMLDivElement>(null);
  const bodyTop = useRef<HTMLDivElement>(null);

  /* Before this flips, the page is the whole category — which is exactly what
     a guest with no JavaScript keeps for good. */
  const enhanced = useHydrated();

  const searching = query.trim().length > 0;

  const groups = useMemo<Group[]>(() => {
    if (searching) {
      const needle = normalise(query.trim());
      const hits = sections.flatMap((section) =>
        section.dishes.filter(
          (dish) =>
            normalise(dish.name).includes(needle) ||
            normalise(dish.description ?? "").includes(needle) ||
            normalise(section.title).includes(needle),
        ),
      );
      return [{ section: null, dishes: hits }];
    }
    const shown = activeSection
      ? sections.filter((section) => section.id === activeSection)
      : sections;
    return shown.map((section) => ({ section, dishes: section.dishes }));
  }, [searching, query, sections, activeSection]);

  const total = groups.reduce((n, group) => n + group.dishes.length, 0);
  /* A new filter starts again from the first card. Adjusted during the render
     that notices the change, rather than in an effect afterwards. */
  const filter = JSON.stringify([activeSection, query]);
  const [lastFilter, setLastFilter] = useState(filter);
  if (lastFilter !== filter) {
    setLastFilter(filter);
    setVisible(PAGE_SIZE);
  }

  const shown = enhanced ? limit(groups, visible) : groups;
  const hasMore = enhanced && visible < total;

  useEffect(() => {
    if (!hasMore) return;
    const target = sentinel.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible((current) => current + PAGE_SIZE);
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore]);

  function chooseSection(id: string | null) {
    setActiveSection(id);
    const top = bodyTop.current;
    if (top && top.getBoundingClientRect().top < 0) {
      top.scrollIntoView({ block: "start" });
    }
  }

  let eagerLeft = EAGER;

  return (
    <>
      <div
        className="bg-paper/93 border-ink/15 sticky top-0 z-20 border-y backdrop-blur-[10px]"
        /* The rail is the only thing that follows the guest down the page:
           54px, not a pinned header. */
      >
        <div className="mx-auto flex max-w-[1040px] items-center gap-2.5 ps-3.5 sm:gap-3.5 sm:px-8">
          <details className="relative shrink-0 [&[open]_.chev]:rotate-180">
            <summary className="eyebrow bg-ink text-paper my-2.5 flex cursor-pointer list-none items-center gap-[7px] rounded-full px-[13px] py-2 leading-[normal] tracking-[0.16em] [&::-webkit-details-marker]:hidden">
              {categoryLabel}
              <svg
                viewBox="0 0 10 6"
                width="9"
                height="6"
                aria-hidden="true"
                className="chev opacity-70 transition-transform"
              >
                <path
                  d="M1 1l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <nav
              aria-label={strings.sections}
              className="bg-paper border-ink/15 absolute start-0 top-full z-30 min-w-[10rem] overflow-hidden rounded-md border shadow-[0_16px_34px_-16px_color-mix(in_srgb,var(--color-ink)_40%,transparent)]"
            >
              {otherCategories.map((other) => (
                <Link
                  key={other.category}
                  href={`/${language}/${other.category}`}
                  className="eyebrow text-ink/72 hover:bg-ink/5 hover:text-ink block px-4 py-3 tracking-[0.16em] transition-colors"
                >
                  {other.label}
                </Link>
              ))}
            </nav>
          </details>

          <div className="rail-fade no-scrollbar flex gap-[7px] overflow-x-auto py-2.5">
            <Chip
              href="#menu"
              active={!activeSection && !searching}
              onSelect={enhanced ? () => chooseSection(null) : undefined}
            >
              {strings.all}
            </Chip>
            {sections.map((section) => (
              <Chip
                key={section.id}
                href={`#${section.id}`}
                active={activeSection === section.id}
                onSelect={enhanced ? () => chooseSection(section.id) : undefined}
              >
                {section.title}
              </Chip>
            ))}
          </div>

          {/* The header has scrolled away by now, so the way back into the
              spread comes with the rail. Outside the scrolling strip, so it
              stays put while the chips scroll under the fade. */}
          <div className="ms-auto flex shrink-0 items-center pe-3.5 sm:pe-0">
            <SpreadRailCount dictionary={dictionary} />
          </div>
        </div>
      </div>

      {/* `w-full` is load-bearing: this is a flex item, and `mx-auto` on a flex
          item makes it shrink to fit its content instead of stretching. It
          used to be propped up to full width by the intrinsic width of a dish
          photograph, which stopped being true once the photographs were taken
          out of the flow. */}
      <main
        id="menu"
        className="mx-auto w-full max-w-[1040px] px-4.5 pb-1.5 sm:px-8"
        aria-busy={hasMore || undefined}
      >
        <div ref={bodyTop} />

        {/* Search filters in place, so tell a screen reader what happened. */}
        <p aria-live="polite" className="sr-only">
          {searching ? (total === 0 ? strings.noResults : total) : ""}
        </p>

        {searching && total === 0 ? (
          <p className="body-rtl text-ink/72 py-16 text-center text-sm">
            {strings.noResults}
          </p>
        ) : null}

        {shown.map((group, index) => (
          <section
            key={group.section?.id ?? "results"}
            aria-labelledby={group.section ? `${group.section.id}-heading` : undefined}
          >
            {group.section ? (
              <div
                id={group.section.id}
                className="flex items-center gap-3 pt-7 pb-4 sm:gap-4.5 sm:pt-10 sm:pb-5.5"
              >
                <h2 id={`${group.section.id}-heading`} className="section-heading">
                  {group.section.title}
                </h2>
                <span className="bg-ink/15 h-px flex-1" />
                <span className="eyebrow text-ink/28 tabular-nums">
                  {group.section.dishes.length}
                </span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5.5 lg:grid-cols-3">
              {group.dishes.map((dish, dishIndex) => {
                const priority = index === 0 && eagerLeft-- > 0;
                return (
                  <DishCard
                    key={`${dish.name}-${dishIndex}`}
                    dish={dish}
                    currency={currency}
                    dictionary={dictionary}
                    showSection={group.section === null}
                    priority={priority}
                  />
                );
              })}
            </div>
          </section>
        ))}

        <div ref={sentinel} aria-hidden="true" />

        {hasMore ? (
          <p className="flex justify-center gap-[7px] py-10" role="status">
            <span className="sr-only">{strings.loadingMore}</span>
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                aria-hidden="true"
                className="loader-dot bg-ink size-[5px] rounded-full opacity-[0.22]"
                style={{ animationDelay: `${dot * 0.16}s` }}
              />
            ))}
          </p>
        ) : (
          <div className="py-10" />
        )}
      </main>
    </>
  );
}

function Chip({
  href,
  active,
  onSelect,
  children,
}: {
  href: string;
  active: boolean;
  onSelect?: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-current={active ? "true" : undefined}
      onClick={
        onSelect
          ? (event) => {
              event.preventDefault();
              onSelect();
            }
          : undefined
      }
      className={`chip-label shrink-0 rounded-full border px-[15px] pt-1.5 pb-[7px] whitespace-nowrap transition-colors ${
        active
          ? "bg-ink border-ink text-paper font-semibold"
          : "border-ink/15 text-ink/72 hover:border-ink/28 hover:text-ink"
      }`}
    >
      {children}
    </a>
  );
}
