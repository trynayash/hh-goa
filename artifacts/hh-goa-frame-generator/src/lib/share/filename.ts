import type { ShareFormat } from "./shareTypes";

export function sanitizeFilename(name: string | undefined, format: ShareFormat): string {
  const prefix = format === "frame" ? "hh-goa-frame" : "hh-goa-builder-id";

  if (!name || !name.trim()) {
    return `${prefix}.png`;
  }

  const cleanName = name
    .trim()
    .normalize("NFD") // Decompose accents
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .replace(/[^\w\s-]/g, "") // Remove non-alphanumeric except spaces and hyphens
    .toLowerCase()
    .replace(/[\s_]+/g, "-") // Convert spaces/underscores to hyphens
    .replace(/-+/g, "-") // Collapse consecutive hyphens
    .replace(/^-|-$/g, ""); // Strip leading/trailing hyphens

  return cleanName ? `${prefix}-${cleanName}.png` : `${prefix}.png`;
}
