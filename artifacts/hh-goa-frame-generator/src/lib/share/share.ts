import { trackShareEvent } from "./analytics";
import { canvasToBlob, triggerBlobDownload } from "./download";
import { sanitizeFilename } from "./filename";
import { xShareProvider } from "./providers/x";
import type { ShareOptions, ShareResult } from "./shareTypes";
import { ShareEvent } from "./shareTypes";
import { getCleanCaption } from "./shareText";
import { isNativeFileShareSupported, shareFileNatively } from "./webShare";

export async function executeShareAction(
  canvas: HTMLCanvasElement | null,
  options: ShareOptions,
): Promise<ShareResult> {
  trackShareEvent(ShareEvent.Clicked, { format: options.format });

  if (!canvas) {
    trackShareEvent(ShareEvent.Failed, { reason: "no_canvas" });
    return { method: "download_failed", success: false };
  }

  // 1. Synchronously open blank window on initial user click to bypass popup blockers
  const blankPopup = xShareProvider.openBlankWindow();

  // 2. Generate PNG Blob (reused once across download & native share)
  const blob = await canvasToBlob(canvas);
  if (!blob) {
    if (blankPopup && !blankPopup.closed) blankPopup.close();
    trackShareEvent(ShareEvent.Failed, { reason: "blob_failed" });
    return { method: "download_failed", success: false };
  }

  const filename = sanitizeFilename(options.name, options.format);
  const shareText = getCleanCaption(options);
  const file = new File([blob], filename, { type: "image/png" });

  // 3. Feature-check for native Web Share API with file support (Mobile / supported devices)
  if (isNativeFileShareSupported(file)) {
    if (blankPopup && !blankPopup.closed) blankPopup.close();

    const shared = await shareFileNatively(
      file,
      "Hacker House Goa 2026 #FrameInGoa",
      shareText,
    );

    if (shared) {
      trackShareEvent(ShareEvent.NativeShared, { format: options.format });
      return { method: "webshare", success: true };
    }
    // If native share was cancelled or failed, fall through to desktop fallback
  }

  // 4. Desktop / Fallback Flow: trigger PNG download + redirect popup window to X intent
  triggerBlobDownload(blob, filename);
  trackShareEvent(ShareEvent.Downloaded, { filename });

  const popupOpened = xShareProvider.redirectToIntent(blankPopup, shareText);

  if (!popupOpened) {
    trackShareEvent(ShareEvent.PopupBlocked);
    return { method: "popup_blocked", success: false };
  }

  trackShareEvent(ShareEvent.DesktopShared, { format: options.format });
  return { method: "desktop", success: true, popupBlocked: !popupOpened };
}
