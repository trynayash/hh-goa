import { trackShareEvent } from "./analytics";
import { canvasToBlob, triggerBlobDownload } from "./download";
import { sanitizeFilename } from "./filename";
import { xShareProvider } from "./providers/x";
import type { ShareOptions, ShareResult } from "./shareTypes";
import { ShareEvent } from "./shareTypes";
import { getCleanCaption } from "./shareText";

export async function executeShareAction(
  canvas: HTMLCanvasElement | null,
  options: ShareOptions,
): Promise<ShareResult> {
  trackShareEvent(ShareEvent.Clicked, { format: options.format });

  if (!canvas) {
    trackShareEvent(ShareEvent.Failed, { reason: "no_canvas" });
    return { method: "download_failed", success: false };
  }

  const shareText = getCleanCaption(options);
  const filename = sanitizeFilename(options.name, options.format);

  // 1. Copy caption to clipboard in background
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(shareText).catch(() => {
      // Non-blocking clipboard fallback
    });
  }

  // 2. Open clean X compose intent synchronously on user gesture (no popup blockers, no blank tabs, no redirection)
  const popupOpened = xShareProvider.openIntent(shareText);

  // 3. Render and trigger PNG download
  try {
    const blob = await canvasToBlob(canvas);
    if (blob) {
      triggerBlobDownload(blob, filename);
      trackShareEvent(ShareEvent.Downloaded, { filename });
    }
  } catch {
    // Non-blocking download fallback
  }

  trackShareEvent(ShareEvent.DesktopShared, { format: options.format });
  return { method: "desktop", success: true, popupBlocked: !popupOpened };
}

