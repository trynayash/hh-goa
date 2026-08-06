import React, { useEffect } from "react";
import { Check, Copy, ExternalLink, FileImage, FolderDown, MessageSquare, X } from "lucide-react";
import { sanitizeFilename } from "../lib/share/filename";
import { getCleanCaption } from "../lib/share/shareText";
import type { ShareOptions } from "../lib/share/shareTypes";

interface ShareModalProps {
  isOpen: boolean;
  options: ShareOptions | null;
  copied: boolean;
  onClose: () => void;
  onCopyCaption: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  options,
  copied,
  onClose,
  onCopyCaption,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !options) return null;

  const filename = sanitizeFilename(options.name, options.format);
  const captionText = getCleanCaption(options);

  return (
    <div
      className="share-modal-overlay"
      onClick={onClose}
      role="presentation"
      data-testid="modal-share-overlay"
    >
      <div
        className="share-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        data-testid="modal-share-content"
      >
        <button
          type="button"
          className="share-modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="share-modal-header">
          <div className="share-modal-badge">
            <Check size={20} />
          </div>
          <div>
            <h3 id="share-modal-title" className="share-modal-title">
              Ready to Share on X!
            </h3>
            <p className="share-modal-subtitle">
              Follow these 3 quick steps to publish your post on X.
            </p>
          </div>
        </div>

        <div className="share-steps">
          {/* Step 1 */}
          <div className="share-step-card is-complete">
            <span className="step-num">1</span>
            <div className="step-icon">
              <FolderDown size={20} />
            </div>
            <div className="step-content">
              <strong>PNG Downloaded</strong>
              <span className="step-filename">{filename}</span>
            </div>
            <span className="step-status">Saved</span>
          </div>

          {/* Step 2 */}
          <div className="share-step-card is-active">
            <span className="step-num">2</span>
            <div className="step-icon">
              <MessageSquare size={20} />
            </div>
            <div className="step-content">
              <strong>X Compose Window Opened</strong>
              <span>Caption & links pre-filled automatically</span>
            </div>
            <span className="step-status">Ready</span>
          </div>

          {/* Step 3 */}
          <div className="share-step-card highlight">
            <span className="step-num">3</span>
            <div className="step-icon">
              <FileImage size={20} />
            </div>
            <div className="step-content">
              <strong>Attach Your Graphic</strong>
              <span>Drag your downloaded image into X or click the image icon</span>
            </div>
          </div>
        </div>

        {/* Copy Caption Fallback Section */}
        <div className="share-modal-footer">
          <div className="caption-preview-box">
            <span className="caption-label">Pre-filled Caption</span>
            <p className="caption-text">{captionText}</p>
          </div>

          <div className="share-modal-actions">
            <button
              type="button"
              className={`action-button ${copied ? "secondary" : "primary"}`}
              onClick={onCopyCaption}
              data-testid="button-copy-caption"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Caption Copied!" : "Copy Caption"}
            </button>
            <button
              type="button"
              className="action-button ghost"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
