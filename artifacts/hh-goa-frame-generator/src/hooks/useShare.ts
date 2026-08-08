import { useCallback, useRef, useState, useEffect } from "react";
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
  const toastTimeoutRef = useRef<number | null>(null);

  const showToastWithTimeout = useCallback((message: string, durationMs = 4500) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleShare = useCallback(
    async (canvas: HTMLCanvasElement | null, options: ShareOptions) => {
      if (isSharing || !canvas) return;

      setIsSharing(true);
      setShowModal(false);
      setLastOptions(options);
      setCopied(false);

      try {
        const result = await executeShareAction(canvas, options);
        setLastResult(result);

        if (result.success) {
          setCopied(true);
          showToastWithTimeout(
            "✨ X compose opened! Caption copied & graphic downloaded.",
          );
          setTimeout(() => setCopied(false), 3000);
        } else if (result.method === "download_failed") {
          showToastWithTimeout("Image export failed. Please try downloading again.");
        }
      } catch {
        showToastWithTimeout("An error occurred while sharing. Please try again.");
      } finally {
        setIsSharing(false);
      }
    },
    [isSharing, showToastWithTimeout],
  );

  const copyCaptionToClipboard = useCallback(
    async (customOptions?: ShareOptions) => {
      const opts = customOptions || lastOptions;
      if (!opts) return;
      const text = getCleanCaption(opts);
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          showToastWithTimeout("✨ Caption copied to clipboard!");
          setTimeout(() => setCopied(false), 2500);
        }
      } catch {
        setCopied(false);
      }
    },
    [lastOptions, showToastWithTimeout],
  );

  const closeModal = useCallback(() => setShowModal(false), []);
  const closeToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(null);
  }, []);

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

