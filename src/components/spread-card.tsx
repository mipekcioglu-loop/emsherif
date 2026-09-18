"use client";

import type { ReactNode } from "react";

import { useQuantity } from "@/lib/spread";
import { useHydrated } from "@/components/use-hydrated";
import type { DishKey } from "@/lib/menu";

/**
 * The card's own element, which deepens its border once the dish is on the
 * spread.
 *
 * Reinforcement only. The filled navy pill in the price row is the signal — the
 * border alone is 2.42:1 against the paper, under the 3:1 bar for a UI cue, so
 * it must never be the only thing distinguishing a picked card.
 */
export function SpreadCard({
  dishKey,
  className,
  children,
}: {
  dishKey: DishKey;
  className: string;
  children: ReactNode;
}) {
  const hydrated = useHydrated();
  const quantity = useQuantity(dishKey);
  const picked = hydrated && quantity > 0;
  return (
    <article className={picked ? `${className} spread-picked` : className}>
      {children}
    </article>
  );
}
