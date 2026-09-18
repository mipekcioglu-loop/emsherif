"use client";

import { useSyncExternalStore } from "react";

import type { DishKey } from "@/lib/menu/dish-keys";

/**
 * على السفرة — what the guest has picked so far.
 *
 * Deliberately not a cart. Nothing is bought, nothing is sent, and nothing
 * leaves the browser: this is a list a guest builds while they browse so they
 * can order from it out loud. The whole store is one object in sessionStorage.
 *
 * It lives outside React so the header entry, the rail count, every card
 * control and the sheet all read one source and re-render together;
 * `useSyncExternalStore` gives each of them the server's empty snapshot until
 * hydration, which is what keeps a no-JS guest seeing today's card.
 */

const KEY = "em-sherif-spread";
const VERSION = 1;
/**
 * A spread belongs to one sitting. Longer than this and it is somebody else's
 * lunch — the phone was put down, the table turned over — so it is dropped on
 * load rather than resumed.
 */
const SITTING_MS = 4 * 60 * 60 * 1000;
/** Nobody orders a hundred of anything, and three digits break the pill. */
export const MAX_QUANTITY = 99;

export type Spread = Readonly<Record<DishKey, number>>;

type Stored = { v: number; at: number; items: Record<DishKey, number> };

const EMPTY: Spread = Object.freeze({});

let state: Spread = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

/** sessionStorage throws in a private window and in some embedded browsers. */
function session(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function read(): Spread {
  const store = session();
  if (!store) return EMPTY;
  let raw: string | null = null;
  try {
    raw = store.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed || parsed.v !== VERSION || typeof parsed.at !== "number") return EMPTY;
    if (Date.now() - parsed.at > SITTING_MS) {
      // Not this sitting. Drop it rather than resume somebody else's lunch.
      try {
        store.removeItem(KEY);
      } catch {
        /* nothing to do */
      }
      return EMPTY;
    }
    const items: Record<string, number> = {};
    for (const [id, qty] of Object.entries(parsed.items ?? {})) {
      const n = Math.floor(Number(qty));
      if (Number.isFinite(n) && n > 0) items[id] = Math.min(n, MAX_QUANTITY);
    }
    return Object.freeze(items);
  } catch {
    return EMPTY;
  }
}

function write(next: Spread) {
  const store = session();
  if (!store) return;
  try {
    if (Object.keys(next).length === 0) store.removeItem(KEY);
    else
      store.setItem(
        KEY,
        JSON.stringify({ v: VERSION, at: Date.now(), items: next } as Stored),
      );
  } catch {
    /* A full or blocked store must not break the menu. */
  }
}

function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  state = read();
}

function set(next: Spread) {
  state = Object.freeze(next);
  write(state);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function snapshot(): Spread {
  ensureLoaded();
  return state;
}

/** The server has no session, so it always renders the empty spread. */
const serverSnapshot = (): Spread => EMPTY;

/** The whole spread. */
export function useSpread(): Spread {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/** How many of one dish. */
export function useQuantity(id: DishKey): number {
  return useSyncExternalStore(
    subscribe,
    () => snapshot()[id] ?? 0,
    () => 0,
  );
}

/** The sum of the quantities — what the header shows. Not the number of rows. */
export function useCount(): number {
  return useSyncExternalStore(subscribe, countSnapshot, () => 0);
}

let countCache = { from: EMPTY as Spread, value: 0 };
function countSnapshot(): number {
  const now = snapshot();
  // useSyncExternalStore compares snapshots by identity, so the number has to
  // be derived from a stable reference rather than recomputed every call.
  if (countCache.from !== now) {
    countCache = { from: now, value: Object.values(now).reduce((a, b) => a + b, 0) };
  }
  return countCache.value;
}

export function setQuantity(id: DishKey, quantity: number) {
  ensureLoaded();
  const next = { ...state };
  const n = Math.min(Math.max(Math.floor(quantity), 0), MAX_QUANTITY);
  if (n <= 0) delete next[id];
  else next[id] = n;
  set(next);
}

export function add(id: DishKey) {
  ensureLoaded();
  setQuantity(id, (state[id] ?? 0) + 1);
}

export function remove(id: DishKey) {
  ensureLoaded();
  setQuantity(id, (state[id] ?? 0) - 1);
}

export function clear() {
  set(EMPTY);
}

/** Fills `{dish}` and `{n}` in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in values ? String(values[name]) : whole,
  );
}

/* ------------------------------------------------------------------ *
 * Opening the sheet
 * ------------------------------------------------------------------ */

/**
 * The header entry and the sticky-rail count both open the same sheet, and the
 * sheet is mounted once, elsewhere in the tree. Rather than thread a context
 * through the header, a request is a number that goes up; the sheet watches it
 * and calls `showModal()`. A counter rather than a boolean so that asking twice
 * in a row still registers as two requests.
 */
let openRequests = 0;
const openListeners = new Set<() => void>();

export function openSpread() {
  openRequests += 1;
  for (const listener of openListeners) listener();
}

function subscribeOpen(listener: () => void) {
  openListeners.add(listener);
  return () => {
    openListeners.delete(listener);
  };
}

export function useOpenRequests(): number {
  return useSyncExternalStore(
    subscribeOpen,
    () => openRequests,
    () => 0,
  );
}
