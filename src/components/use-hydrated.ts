"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * False while the server-rendered markup is what the guest is looking at, true
 * once React has taken over in the browser.
 *
 * Several pieces of the menu are links and plain markup that only become
 * interactive once there is JavaScript to make them so, and they need to render
 * identically on both sides of hydration until that moment.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
