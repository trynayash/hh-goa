export type ShareFormat = "frame" | "circle" | "card";

export type ShareProviderType = "x" | "linkedin" | "bluesky";

export interface ShareOptions {
  format: ShareFormat;
  name?: string;
  role?: string;
  builderTitle?: string;
  provider?: ShareProviderType;
}

export type ShareResult =
  | { method: "webshare"; success: true }
  | { method: "desktop"; success: true; popupBlocked?: boolean }
  | { method: "popup_blocked"; success: false }
  | { method: "download_failed"; success: false }
  | { method: "cancelled"; success: false };

export enum ShareEvent {
  Clicked = "share_clicked",
  Downloaded = "share_downloaded",
  NativeShared = "share_native_shared",
  DesktopShared = "share_desktop_shared",
  PopupBlocked = "share_popup_blocked",
  Cancelled = "share_cancelled",
  Failed = "share_failed",
}
