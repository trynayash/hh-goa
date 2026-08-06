import React from "react";
import { CheckCircle2, X } from "lucide-react";

interface ShareToastProps {
  message: string | null;
  onClose: () => void;
}

export const ShareToast: React.FC<ShareToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      className="share-toast"
      role="status"
      aria-live="polite"
      data-testid="status-share-toast"
    >
      <CheckCircle2 size={18} className="share-toast-icon" />
      <span className="share-toast-text">{message}</span>
      <button
        type="button"
        className="share-toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};
