import { ShareEvent } from "./shareTypes";

export function trackShareEvent(
  event: ShareEvent,
  metadata?: Record<string, unknown>,
): void {
  // Production analytics logger
  if (typeof window !== "undefined") {
    // Custom event dispatch for analytics integrations (Google Analytics, Plausible, PostHog, etc.)
    window.dispatchEvent(
      new CustomEvent("hh_share_event", {
        detail: { event, metadata, timestamp: Date.now() },
      }),
    );
  }
}
