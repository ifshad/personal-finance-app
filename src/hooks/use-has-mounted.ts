import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * True only once the component has hydrated on the client. Needed for
 * anything that reads client-only state (e.g. next-themes' resolved theme)
 * to avoid a server/client render mismatch — `useSyncExternalStore` with a
 * no-op subscription is the hydration-safe way to do this (unlike a
 * `useEffect` that calls `setState` on mount, which works but triggers an
 * avoidable extra render).
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
