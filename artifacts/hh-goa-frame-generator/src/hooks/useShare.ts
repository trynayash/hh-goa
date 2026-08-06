import { useCallback, useRef, useState } from "react";
import { getCleanCaption } from "../lib/share/shareText";
import { executeShareAction } from "../lib/share/share";
import type { ShareOptions, ShareResult } from "../lib/share/shareTypes";

export function useShare() {
  const [isSharing, setIsSharing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [lastOptions, setLastOptions] = useState<ShareOptions | null>(null);
  const [lastResult, setLastResult] = useState<ShareResult | null>(null);
  const [copied, setCopied] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleShare = useCallback(
    async (canvas: HTMLCanvasElement | null, options: ShareOptions) => {
      if (isSharing || !canvas) return;

      // Abort any ongoing share action
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsSharing(true);
      setToastMessage(null);
      setShowModal(false);
      setLastOptions(options);
      setCopied(false);

      try {
        const result = await executeShareAction(canvas, options);
        setLastResult(result);

        if (result.method === "webshare" && result.success) {
          setToastMessage("Shared natively with your image attached!");
        } else if (result.method === "desktop" && result.success) {
          // Toast -> 500ms delay -> Modal UX Sequence
          setToastMessage("Image downloaded & X compose ready!");
          setTimeout(() => {
            setShowModal(true);
          }, 500);
        } else if (result.method === "popup_blocked") {
          setToastMessage("Popup blocked by browser. Click to copy caption & retry!");
          setShowModal(true);
        } else if (result.method === "download_failed") {
          setToastMessage("Image export failed. Please try downloading again.");
        }
      } catch {
        setToastMessage("An unexpected error occurred while sharing.");
      } finally {
        setIsSharing(false);
      }
    },
    [isSharing],
  );

  const copyCaptionToClipboard = useCallback(async () => {
    if (!lastOptions) return;
    const text = getCleanCaption(lastOptions);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }, [lastOptions]);

  const closeModal = useCallback(() => setShowModal(false), []);
  const closeToast = useCallback(() => setToastMessage(null), []);

  return {
    isSharing,
    toastMessage,
    showModal,
    lastOptions,
    lastResult,
    copied,
    handleShare,
    closeModal,
    closeToast,
    copyCaptionToClipboard,
  };
}
