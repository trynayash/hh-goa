export interface ShareProvider {
  openBlankWindow(): Window | null;
  redirectToIntent(popup: Window | null, text: string): boolean;
}

export const xShareProvider: ShareProvider = {
  openBlankWindow(): Window | null {
    if (typeof window === "undefined") return null;
    try {
      return window.open("about:blank", "_blank", "noopener,noreferrer");
    } catch {
      return null;
    }
  },

  redirectToIntent(popup: Window | null, text: string): boolean {
    const intentUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    if (popup && !popup.closed) {
      try {
        popup.location.href = intentUrl;
        return true;
      } catch {
        // Fallback open if location mutation failed
        window.open(intentUrl, "_blank", "noopener,noreferrer");
        return true;
      }
    } else {
      // Synchronous popup fallback
      const fallbackWin = window.open(intentUrl, "_blank", "noopener,noreferrer");
      return Boolean(fallbackWin);
    }
  },
};
