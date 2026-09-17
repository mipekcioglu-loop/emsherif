"use client";

import { useSyncExternalStore } from "react";

/**
 * The search box sits in the hero and the grid it filters sits below the
 * sticky rail, with server-rendered markup in between. Rather than make the
 * whole page one client component to share a `useState`, the two islands share
 * this tiny store.
 */

type FilterState = { query: string };

/* A stable object, so the server snapshot never changes identity. */
const EMPTY: FilterState = { query: "" };

let state: FilterState = EMPTY;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSearchQuery(query: string) {
  if (query === state.query) return;
  state = query ? { query } : EMPTY;
  for (const listener of listeners) listener();
}

export function useSearchQuery(): string {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  ).query;
}

/**
 * Normalises a dish name or a typed query for comparison: case, the Arabic
 * diacritics the printed menus set, and the alef and yeh forms that Arabic and
 * Sorani spell differently from one keyboard to the next.
 */
export function normalise(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ًͯ-ْٰ]/g, "")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/[ىی]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ک/g, "ك");
}
