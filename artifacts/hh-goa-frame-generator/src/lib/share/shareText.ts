import { APP_URL, HASHTAG, HH_URL } from "./constants";
import type { ShareOptions } from "./shareTypes";

export function getShareText(options: ShareOptions): string {
  const { format, name, role, builderTitle } = options;

  if (format === "frame") {
    return (
      `🚀 Just generated my official Hacker House Goa 2026 Profile Frame!\n\n` +
      `Built using the HH Goa Frame & Builder ID Generator.\n\n` +
      `Generate yours:\n${APP_URL}\n\n` +
      `Official event:\n${HH_URL}\n\n` +
      `${HASHTAG}`
    );
  }

  const safeName = name?.trim() || "a builder";
  const titleInfo = builderTitle
    ? ` (${builderTitle})`
    : role?.trim()
      ? ` (${role.trim()})`
      : "";

  return (
    `🚀 Just generated my official Hacker House Goa 2026 Builder ID as ${safeName}${titleInfo}!\n\n` +
    `Built using the HH Goa Frame & Builder ID Generator.\n\n` +
    `Generate yours:\n${APP_URL}\n\n` +
    `Official event:\n${HH_URL}\n\n` +
    `${HASHTAG}`
  );
}

export function getCleanCaption(options: ShareOptions): string {
  const { format, name, role, builderTitle } = options;
  if (format === "frame") {
    return `Framed for Hacker House Goa 2026. ${HASHTAG}\n\nGenerate your frame & ID card: ${APP_URL}\nEvent details: ${HH_URL}`;
  }
  const safeName = name?.trim() || "a builder";
  const titleInfo = builderTitle
    ? ` (${builderTitle})`
    : role?.trim()
      ? ` (${role.trim()})`
      : "";
  return `Heading to Hacker House Goa 2026 as ${safeName}${titleInfo}. ${HASHTAG}\n\nGenerate your ID card & frame: ${APP_URL}\nEvent details: ${HH_URL}`;
}
