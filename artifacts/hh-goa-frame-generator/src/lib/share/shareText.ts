import { APP_URL, HASHTAG, HH_URL } from "./constants";
import type { ShareOptions } from "./shareTypes";

export function getShareText(options: ShareOptions): string {
  return getCleanCaption(options);
}

export function getCleanCaption(options: ShareOptions): string {
  const { format, name, role, builderTitle } = options;

  if (format === "frame") {
    return (
      `Happy to join the Hacker House Goa 2026 community! Excited to connect and build alongside incredible minds. ${HASHTAG}\n\n` +
      `Generate your frame & ID card: ${APP_URL}\n` +
      `Official event: ${HH_URL}`
    );
  }

  const safeName = name?.trim() || "a builder";
  const titleInfo = builderTitle
    ? ` (${builderTitle})`
    : role?.trim()
      ? ` (${role.trim()})`
      : "";

  return (
    `Happy to join Hacker House Goa 2026 as ${safeName}${titleInfo}! Excited to connect and build alongside incredible minds. ${HASHTAG}\n\n` +
    `Generate your ID card & frame: ${APP_URL}\n` +
    `Official event: ${HH_URL}`
  );
}
