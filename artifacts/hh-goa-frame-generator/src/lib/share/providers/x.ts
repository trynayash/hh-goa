export interface ShareProvider {
  openIntent(text: string): boolean;
}

export const xShareProvider: ShareProvider = {
  openIntent(text: string): boolean {
    if (typeof window === "undefined") return false;
    const intentUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    try {
      // 1. Direct window.open on user click gesture - never blocked by browser popup blockers
      const win = window.open(intentUrl, "_blank", "noopener,noreferrer");
      if (win) {
        win.focus();
        return true;
      }
      // 2. Direct anchor click fallback for restricted browser contexts
      const link = document.createElement("a");
      link.href = intentUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch {
      return false;
    }
  },
};

