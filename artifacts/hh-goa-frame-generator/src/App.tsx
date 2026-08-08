import { useEffect, useRef, useState } from "react";
import heic2any from "heic2any";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Crop as CropIcon,
  Download,
  ExternalLink,
  FileImage,
  Info,
  Loader2,
  Monitor,
  Move,
  RotateCcw,
  Share2,
  Upload,
} from "lucide-react";
import bannerAsset from "@assets/bANNER_1785999397328.webp";
import logoAsset from "@assets/logo_1785999397329.webp";
import { useShare } from "./hooks/useShare";
import { ShareToast } from "./components/ShareToast";


type Format = "frame" | "circle" | "card";

type Crop = {
  zoom: number;
  panX: number;
  panY: number;
};


type Photo = {
  file: File;
  url: string;
  image: HTMLImageElement;
  width: number;
  height: number;
};

type BrandImages = {
  banner: HTMLImageElement | null;
  logo: HTMLImageElement | null;
};

const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "heic", "heif"];
const COLORS = {
  green: "#076b3b",
  ink: "#123d28",
  yellow: "#ffe400",
  pink: "#f7087d",
  lime: "#8fbe6d",
  cream: "#fff4c8",
};
const DEFAULT_CROP: Crop = { zoom: 1, panX: 0, panY: 0 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const FRAME_ASPECT = 1;
const CARD_PHOTO_ASPECT = 664 / 872;
const CARD_ASPECT = 1.6;

function isAcceptedFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (
    file.type.startsWith("image/") || ACCEPTED_EXTENSIONS.includes(extension)
  );
}

function isHeicFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    extension === "heic" ||
    extension === "heif"
  );
}

function getBuilderTitle(role: string) {
  const signal = role.trim().toLowerCase();
  if (signal.includes("react")) return "React Interface Builder";
  if (signal.includes("hardware")) return "Hardware Tinkerer";
  if (signal.includes("design")) return "Design Systems Maker";
  if (signal.includes("ai")) return "AI Field Builder";
  if (signal.includes("music")) return "Sound Architect";
  if (signal.includes("founder")) return "Founder in Residence";
  if (signal.includes("security")) return "Security Pathfinder";
  if (signal.includes("data")) return "Data Cartographer";
  if (signal.includes("art")) return "Artful Technologist";
  return "Coastal Builder";
}

function loadBrandImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

function cropAspect(format: Format) {
  return format === "frame" ? FRAME_ASPECT : CARD_PHOTO_ASPECT;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCoverMetrics(
  image: HTMLImageElement,
  targetAspect: number,
  zoom: number,
) {
  const imageWidth = image.naturalWidth;
  const imageHeight = image.naturalHeight;
  const sourceRatio = imageWidth / imageHeight;
  const baseWidth =
    sourceRatio > targetAspect ? imageHeight * targetAspect : imageWidth;
  const baseHeight =
    sourceRatio > targetAspect ? imageHeight : imageWidth / targetAspect;
  const visibleWidth = baseWidth / zoom;
  const visibleHeight = baseHeight / zoom;
  return {
    visibleWidth,
    visibleHeight,
    maxOffsetX: Math.max(0, (imageWidth - visibleWidth) / 2),
    maxOffsetY: Math.max(0, (imageHeight - visibleHeight) / 2),
  };
}

function clampCrop(
  crop: Crop,
  image: HTMLImageElement | null,
  targetAspect: number,
): Crop {
  const zoom = clamp(crop.zoom, MIN_ZOOM, MAX_ZOOM);
  if (!image)
    return {
      zoom,
      panX: clamp(crop.panX, -1, 1),
      panY: clamp(crop.panY, -1, 1),
    };
  const metrics = getCoverMetrics(image, targetAspect, zoom);
  return {
    zoom,
    panX: metrics.maxOffsetX > 0 ? clamp(crop.panX, -1, 1) : 0,
    panY: metrics.maxOffsetY > 0 ? clamp(crop.panY, -1, 1) : 0,
  };
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  crop: Crop,
) {
  const targetRatio = width / height;
  const safeCrop = clampCrop(crop, image, targetRatio);
  const metrics = getCoverMetrics(image, targetRatio, safeCrop.zoom);
  const centerX = image.naturalWidth / 2 + safeCrop.panX * metrics.maxOffsetX;
  const centerY = image.naturalHeight / 2 + safeCrop.panY * metrics.maxOffsetY;
  const sourceWidth = metrics.visibleWidth;
  const sourceHeight = metrics.visibleHeight;
  const sourceX = clamp(
    centerX - sourceWidth / 2,
    0,
    image.naturalWidth - sourceWidth,
  );
  const sourceY = clamp(
    centerY - sourceHeight / 2,
    0,
    image.naturalHeight - sourceHeight,
  );

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

function drawContain(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  background = COLORS.green,
) {
  context.fillStyle = background;
  context.fillRect(x, y, width, height);
  const scale = Math.min(
    width / image.naturalWidth,
    height / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawSmallType(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = "left",
) {
  context.fillStyle = color;
  context.font = '500 18px "DM Mono", monospace';
  context.textAlign = align;
  context.fillText(text, x, y);
}

function drawDots(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  count: number,
  color: string,
) {
  context.fillStyle = color;
  for (let index = 0; index < count; index += 1) {
    context.beginPath();
    context.arc(x + index * 26, y, 4, 0, Math.PI * 2);
    context.fill();
  }
}

function drawBrandLogo(
  context: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
) {
  if (!logo) return;
  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(logo, x, y, size, size);
  context.restore();
}

function drawCoastalWaves(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  amplitude: number = 6,
  wavelength: number = 32,
  color: string = "rgba(143, 190, 109, 0.7)",
  lineWidth: number = 2.5,
) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(x, y);
  const count = Math.ceil(width / wavelength);
  for (let i = 0; i < count; i++) {
    const startX = x + i * wavelength;
    const cpX1 = startX + wavelength * 0.25;
    const cpY1 = y - amplitude;
    const cpX2 = startX + wavelength * 0.75;
    const cpY2 = y + amplitude;
    const endX = startX + wavelength;
    const endY = y;
    context.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, endX, endY);
  }
  context.stroke();
  context.restore();
}

function drawCornerBrackets(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  length: number,
  color: string,
  lineWidth: number = 3,
) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = "square";

  // Top-Left
  context.beginPath();
  context.moveTo(x, y + length);
  context.lineTo(x, y);
  context.lineTo(x + length, y);
  context.stroke();

  // Top-Right
  context.beginPath();
  context.moveTo(x + w - length, y);
  context.lineTo(x + w, y);
  context.lineTo(x + w, y + length);
  context.stroke();

  // Bottom-Left
  context.beginPath();
  context.moveTo(x, y + h - length);
  context.lineTo(x, y + h);
  context.lineTo(x + length, y + h);
  context.stroke();

  // Bottom-Right
  context.beginPath();
  context.moveTo(x + w - length, y + h);
  context.lineTo(x + w, y + h);
  context.lineTo(x + w, y + h - length);
  context.stroke();

  context.restore();
}

function renderProfileFrame(
  context: CanvasRenderingContext2D,
  photo: Photo,
  name: string,
  role: string,
  builderTitle: string,
  brandImages: BrandImages,
  crop: Crop,
  width: number,
  height: number,
) {
  // 1. Draw User Photo with Smooth Cover Crop
  drawCover(context, photo.image, 0, 0, width, height, crop);

  // 2. Coastal Atmosphere Lighting & Cinematic Depth
  const sunGlow = context.createRadialGradient(
    width - 160,
    140,
    40,
    width - 160,
    140,
    650,
  );
  sunGlow.addColorStop(0, "rgba(255, 228, 0, 0.16)");
  sunGlow.addColorStop(0.5, "rgba(247, 8, 125, 0.05)");
  sunGlow.addColorStop(1, "rgba(7, 107, 59, 0)");
  context.fillStyle = sunGlow;
  context.fillRect(0, 0, width, height);

  // Perimeter vignette for contrast & text readability
  const perimeterWash = context.createLinearGradient(0, 0, 0, height);
  perimeterWash.addColorStop(0, "rgba(7, 45, 28, 0.42)");
  perimeterWash.addColorStop(0.18, "rgba(7, 45, 28, 0.04)");
  perimeterWash.addColorStop(0.68, "rgba(7, 45, 28, 0.10)");
  perimeterWash.addColorStop(1, "rgba(4, 24, 15, 0.88)");
  context.fillStyle = perimeterWash;
  context.fillRect(0, 0, width, height);

  // 3. Double Outer Frame Borders & Precision Corner Notches
  context.strokeStyle = "rgba(255, 228, 0, 0.45)";
  context.lineWidth = 3;
  context.strokeRect(36, 36, width - 72, height - 72);

  context.strokeStyle = "rgba(247, 8, 125, 0.55)";
  context.lineWidth = 1.5;
  context.strokeRect(48, 48, width - 96, height - 96);

  // Precision Hacker Corner Brackets
  drawCornerBrackets(context, 28, 28, width - 56, height - 56, 44, COLORS.yellow, 6);
  drawCornerBrackets(context, 40, 40, width - 80, height - 80, 24, COLORS.pink, 3);

  // Subtle Geo-Coordinates at frame edges
  drawSmallType(context, "15°29'50\" N · 73°49'33\" E", 58, 30, COLORS.lime);
  drawSmallType(context, "GOA, INDIA · HH/026", width - 58, 30, COLORS.yellow, "right");

  // 4. Floating Coastal Header Pill (Top Island)
  const topX = 84;
  const topY = 64;
  const topW = width - 168;
  const topH = 114;

  context.save();
  context.fillStyle = "rgba(7, 45, 28, 0.88)";
  roundedRect(context, topX, topY, topW, topH, 20);
  context.fill();
  context.strokeStyle = COLORS.yellow;
  context.lineWidth = 2.5;
  context.stroke();

  // Top accent bar in pink
  context.fillStyle = COLORS.pink;
  context.beginPath();
  context.roundRect(topX + 16, topY + topH - 5, topW - 32, 3, 2);
  context.fill();

  // Logo & Header Brand
  drawBrandLogo(context, brandImages.logo, topX + 18, topY + 16, 82);

  context.fillStyle = COLORS.cream;
  context.font = '700 30px "Fraunces", Georgia, serif';
  context.textAlign = "left";
  context.fillText("HACKER HOUSE GOA", topX + 116, topY + 54);

  drawSmallType(
    context,
    "COASTAL BUILDER EDITION · 2026",
    topX + 118,
    topY + 86,
    COLORS.lime,
  );

  // Top Right Dates Pill
  const datePillW = 210;
  const datePillH = 48;
  const datePillX = topX + topW - datePillW - 18;
  const datePillY = topY + 33;
  context.fillStyle = "rgba(7, 107, 59, 0.9)";
  roundedRect(context, datePillX, datePillY, datePillW, datePillH, 12);
  context.fill();
  context.strokeStyle = COLORS.yellow;
  context.lineWidth = 1.5;
  context.stroke();

  context.fillStyle = COLORS.yellow;
  context.font = '700 17px "DM Mono", monospace';
  context.textAlign = "center";
  context.fillText("28—31 OCT 2026", datePillX + datePillW / 2, datePillY + 30);
  context.restore();

  // 5. Floating Coastal Footer Badge (Bottom Waves & Signature Sash)
  const botX = 84;
  const botY = height - 296;
  const botW = width - 168;
  const botH = 224;

  context.save();
  context.fillStyle = "rgba(5, 32, 20, 0.94)";
  roundedRect(context, botX, botY, botW, botH, 24);
  context.fill();
  context.strokeStyle = COLORS.yellow;
  context.lineWidth = 3;
  context.stroke();

  // Left Pink Accent Notch
  context.fillStyle = COLORS.pink;
  context.fillRect(botX, botY + 24, 10, botH - 48);

  // Arabian Sea Wave Ribbons across the badge top
  drawCoastalWaves(context, botX + 28, botY + 16, botW - 56, 6, 36, "rgba(143, 190, 109, 0.7)", 2.5);
  drawCoastalWaves(context, botX + 28, botY + 24, botW - 56, 5, 36, "rgba(255, 228, 0, 0.5)", 2);

  // Kicker Line
  drawSmallType(
    context,
    "● COASTAL HACKER · GOA, INDIA",
    botX + 32,
    botY + 64,
    COLORS.lime,
  );

  // Main Event Serif Title
  context.fillStyle = COLORS.cream;
  context.font = '700 58px "Fraunces", Georgia, serif';
  context.textAlign = "left";
  context.fillText("FRAME IN GOA", botX + 32, botY + 134);

  // Subtitle / User Name or Tagline
  const hasUser = Boolean(name.trim());
  const sublineText = hasUser
    ? `${name.trim().toUpperCase()} · ${role.trim() || builderTitle}`
    : "HACKER HOUSE GOA 2026 · HHGOA.COM";

  context.fillStyle = COLORS.yellow;
  context.font = '600 20px "DM Mono", monospace';
  context.fillText(sublineText.slice(0, 42), botX + 34, botY + 182);

  // Right Side: #FrameInGoa Badge & Banner Stamp
  const badgeW = 220;
  const badgeH = 76;
  const badgeX = botX + botW - badgeW - 24;
  const badgeY = botY + 76;

  context.fillStyle = "rgba(7, 107, 59, 0.95)";
  roundedRect(context, badgeX, badgeY, badgeW, badgeH, 14);
  context.fill();
  context.strokeStyle = COLORS.pink;
  context.lineWidth = 2.5;
  context.stroke();

  context.fillStyle = COLORS.yellow;
  context.font = '700 24px "DM Mono", monospace';
  context.textAlign = "center";
  context.fillText("#FrameInGoa", badgeX + badgeW / 2, badgeY + 46);

  // Small date stamp under badge
  drawSmallType(
    context,
    "28—31 OCT 2026",
    badgeX + badgeW / 2,
    badgeY + 104,
    COLORS.cream,
    "center",
  );

  context.restore();
}

function renderCircleAvatar(
  context: CanvasRenderingContext2D,
  photo: Photo,
  name: string,
  role: string,
  builderTitle: string,
  brandImages: BrandImages,
  crop: Crop,
  width: number,
  height: number,
) {
  const cx = width / 2;
  const cy = height / 2;
  const avatarRadius = 490;

  // 1. Deep Emerald Coastal Gradient Backdrop
  const bgGrad = context.createRadialGradient(cx, cy, 100, cx, cy, 720);
  bgGrad.addColorStop(0, "rgba(7, 55, 35, 1)");
  bgGrad.addColorStop(0.65, "rgba(5, 32, 20, 1)");
  bgGrad.addColorStop(1, "rgba(3, 18, 11, 1)");
  context.fillStyle = bgGrad;
  context.fillRect(0, 0, width, height);

  // Subtle Outer Grid / Geo-Coordinates along square corners
  drawCornerBrackets(context, 28, 28, width - 56, height - 56, 44, COLORS.yellow, 4);
  drawCornerBrackets(context, 40, 40, width - 80, height - 80, 24, COLORS.pink, 2);
  drawSmallType(context, "15°29'50\" N · 73°49'33\" E", 58, 30, COLORS.lime);
  drawSmallType(context, "GOA, INDIA · CIRCULAR BADGE", width - 58, 30, COLORS.yellow, "right");
  drawSmallType(context, "OFFICIAL AVATAR / 2026", 58, height - 30, COLORS.yellow);
  drawSmallType(context, "#FrameInGoa", width - 58, height - 30, COLORS.lime, "right");

  // 2. Outer Concentric Wave Arcs & Compass Rings
  context.save();
  // Ambient Sun Glow
  const glow = context.createRadialGradient(cx, cy, avatarRadius - 40, cx, cy, avatarRadius + 140);
  glow.addColorStop(0, "rgba(255, 228, 0, 0.22)");
  glow.addColorStop(0.5, "rgba(247, 8, 125, 0.08)");
  glow.addColorStop(1, "rgba(7, 107, 59, 0)");
  context.fillStyle = glow;
  context.beginPath();
  context.arc(cx, cy, avatarRadius + 140, 0, Math.PI * 2);
  context.fill();

  // Dotted Compass Ring
  context.strokeStyle = "rgba(143, 190, 109, 0.6)";
  context.lineWidth = 3;
  context.setLineDash([8, 12]);
  context.beginPath();
  context.arc(cx, cy, avatarRadius + 44, 0, Math.PI * 2);
  context.stroke();
  context.setLineDash([]);

  // Pink Accent Ring
  context.strokeStyle = "rgba(247, 8, 125, 0.75)";
  context.lineWidth = 3;
  context.beginPath();
  context.arc(cx, cy, avatarRadius + 22, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  // 3. Clipped Circular Avatar Photo
  context.save();
  context.beginPath();
  context.arc(cx, cy, avatarRadius, 0, Math.PI * 2);
  context.closePath();
  context.clip();

  // Draw user photo with cover crop centered
  drawCover(context, photo.image, cx - avatarRadius, cy - avatarRadius, avatarRadius * 2, avatarRadius * 2, crop);

  // Coastal atmospheric wash over the photo
  const wash = context.createLinearGradient(0, cy - avatarRadius, 0, cy + avatarRadius);
  wash.addColorStop(0, "rgba(7, 45, 28, 0.30)");
  wash.addColorStop(0.2, "rgba(7, 45, 28, 0.02)");
  wash.addColorStop(0.7, "rgba(7, 45, 28, 0.08)");
  wash.addColorStop(1, "rgba(4, 24, 15, 0.85)");
  context.fillStyle = wash;
  context.fillRect(cx - avatarRadius, cy - avatarRadius, avatarRadius * 2, avatarRadius * 2);

  // Golden Sunbeam Shimmer
  const sunWash = context.createRadialGradient(cx + 200, cy - 200, 20, cx + 200, cy - 200, 450);
  sunWash.addColorStop(0, "rgba(255, 228, 0, 0.18)");
  sunWash.addColorStop(1, "rgba(7, 107, 59, 0)");
  context.fillStyle = sunWash;
  context.fillRect(cx - avatarRadius, cy - avatarRadius, avatarRadius * 2, avatarRadius * 2);
  context.restore();

  // 4. Primary Solid Gold Border Ring around Avatar
  context.save();
  context.strokeStyle = COLORS.yellow;
  context.lineWidth = 10;
  context.beginPath();
  context.arc(cx, cy, avatarRadius, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  // 5. Top Curved Island / Header Ribbon (Positioned inside the top arch of the circle)
  const topPillW = 620;
  const topPillH = 92;
  const topPillX = cx - topPillW / 2;
  const topPillY = cy - avatarRadius + 44;

  context.save();
  context.fillStyle = "rgba(5, 32, 20, 0.94)";
  roundedRect(context, topPillX, topPillY, topPillW, topPillH, 20);
  context.fill();
  context.strokeStyle = COLORS.yellow;
  context.lineWidth = 2.5;
  context.stroke();

  // Pink Accent line under pill
  context.fillStyle = COLORS.pink;
  context.fillRect(topPillX + 18, topPillY + topPillH - 4, topPillW - 36, 3);

  // Brand Logo on top pill
  drawBrandLogo(context, brandImages.logo, topPillX + 16, topPillY + 12, 68);

  context.fillStyle = COLORS.cream;
  context.font = '700 24px "Fraunces", Georgia, serif';
  context.textAlign = "left";
  context.fillText("HACKER HOUSE GOA", topPillX + 96, topPillY + 44);

  drawSmallType(
    context,
    "● 28—31 OCT 2026 · GOA, INDIA",
    topPillX + 98,
    topPillY + 70,
    COLORS.lime,
  );
  context.restore();

  // 6. Bottom Coastal Wave Badge (Positioned inside the bottom arch of the circle)
  const botPillW = 760;
  const botPillH = 170;
  const botPillX = cx - botPillW / 2;
  const botPillY = cy + avatarRadius - botPillH - 36;

  context.save();
  context.fillStyle = "rgba(4, 25, 16, 0.95)";
  roundedRect(context, botPillX, botPillY, botPillW, botPillH, 24);
  context.fill();
  context.strokeStyle = COLORS.yellow;
  context.lineWidth = 3;
  context.stroke();

  // Coastal wave lines across badge top
  drawCoastalWaves(context, botPillX + 24, botPillY + 14, botPillW - 48, 5, 30, "rgba(143, 190, 109, 0.7)", 2.5);
  drawCoastalWaves(context, botPillX + 24, botPillY + 22, botPillW - 48, 4, 30, "rgba(255, 228, 0, 0.5)", 2);

  // Kicker Line
  drawSmallType(
    context,
    "● COASTAL BUILDER · HH/026",
    botPillX + 28,
    botPillY + 54,
    COLORS.lime,
  );

  // Main Title
  context.fillStyle = COLORS.cream;
  context.font = '700 48px "Fraunces", Georgia, serif';
  context.textAlign = "left";
  context.fillText("FRAME IN GOA", botPillX + 28, botPillY + 106);

  // Tagline or user name
  const hasUser = Boolean(name.trim());
  const tagText = hasUser
    ? `${name.trim().toUpperCase()} · ${role.trim() || builderTitle}`
    : "HACKER HOUSE GOA · 28—31 OCT 2026";
  context.fillStyle = COLORS.yellow;
  context.font = '600 17px "DM Mono", monospace';
  context.fillText(tagText.slice(0, 36), botPillX + 30, botPillY + 144);

  // Right Hashtag Badge
  const tagBadgeW = 180;
  const tagBadgeH = 64;
  const tagBadgeX = botPillX + botPillW - tagBadgeW - 20;
  const tagBadgeY = botPillY + 58;

  context.fillStyle = "rgba(7, 107, 59, 0.95)";
  roundedRect(context, tagBadgeX, tagBadgeY, tagBadgeW, tagBadgeH, 12);
  context.fill();
  context.strokeStyle = COLORS.pink;
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = COLORS.yellow;
  context.font = '700 20px "DM Mono", monospace';
  context.textAlign = "center";
  context.fillText("#FrameInGoa", tagBadgeX + tagBadgeW / 2, tagBadgeY + 40);
  context.restore();
}

function renderFrame(
  canvas: HTMLCanvasElement,
  photo: Photo,
  format: Format,
  name: string,
  role: string,
  builderTitle: string,
  brandImages: BrandImages,
  crop: Crop,
) {
  const isCard = format === "card";
  const width = isCard ? 1600 : 1400;
  const height = isCard ? Math.round(width / CARD_ASPECT) : 1400;
  const context = canvas.getContext("2d");
  if (!context) return;
  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  if (format === "circle") {
    renderCircleAvatar(
      context,
      photo,
      name,
      role,
      builderTitle,
      brandImages,
      crop,
      width,
      height,
    );
    return;
  }

  if (format === "frame") {
    renderProfileFrame(
      context,
      photo,
      name,
      role,
      builderTitle,
      brandImages,
      crop,
      width,
      height,
    );
    return;
  }


  context.fillStyle = COLORS.cream;
  context.fillRect(0, 0, width, height);
  context.fillStyle = COLORS.green;
  context.fillRect(28, 28, width - 56, height - 56);
  context.strokeStyle = COLORS.pink;
  context.lineWidth = 6;
  context.strokeRect(48, 48, width - 96, height - 96);

  const photoX = 76;
  const photoY = 76;
  const photoWidth = 664;
  const photoHeight = 848;
  drawCover(
    context,
    photo.image,
    photoX,
    photoY,
    photoWidth,
    photoHeight,
    crop,
  );
  const photoWash = context.createLinearGradient(
    photoX,
    photoY,
    photoX + photoWidth,
    photoY + photoHeight,
  );
  photoWash.addColorStop(0, "rgba(7, 107, 59, .03)");
  photoWash.addColorStop(1, "rgba(7, 55, 35, .28)");
  context.fillStyle = photoWash;
  context.fillRect(photoX, photoY, photoWidth, photoHeight);
  context.strokeStyle = COLORS.pink;
  context.lineWidth = 8;
  context.strokeRect(photoX, photoY, photoWidth, photoHeight);

  const infoX = 802;
  const infoRight = 1518;
  drawBrandLogo(context, brandImages.logo, infoX, 78, 112);
  drawSmallType(context, "HACKER HOUSE GOA", infoX + 136, 119, COLORS.cream);
  drawSmallType(
    context,
    "BUILDER ID / 026",
    infoRight,
    119,
    COLORS.yellow,
    "right",
  );
  context.fillStyle = COLORS.yellow;
  context.fillRect(infoX, 162, infoRight - infoX, 4);

  drawSmallType(
    context,
    "BUILDER / " + builderTitle.toUpperCase().slice(0, 31),
    infoX,
    225,
    COLORS.lime,
  );
  const safeName = name.trim() || "YOUR NAME";
  context.fillStyle = COLORS.cream;
  context.font = '700 86px "Fraunces", Georgia, serif';
  context.textAlign = "left";
  context.fillText(safeName.slice(0, 19), infoX, 330);
  context.fillStyle = COLORS.yellow;
  context.font = '500 30px "DM Mono", monospace';
  context.fillText((role.trim() || "BUILDER / MAKER").slice(0, 32), infoX, 387);

  context.fillStyle = "rgba(255, 244, 200, .12)";
  context.fillRect(infoX, 454, infoRight - infoX, 2);
  drawSmallType(context, "EVENT LOCATION", infoX, 505, COLORS.lime);
  drawSmallType(context, "GOA, INDIA", infoX, 544, COLORS.cream);
  drawSmallType(context, "EVENT DATES", 1174, 505, COLORS.lime);
  drawSmallType(context, "28—31 OCT 2026", 1174, 544, COLORS.cream);

  context.fillStyle = COLORS.pink;
  context.fillRect(infoX, 626, infoRight - infoX, 10);
  drawSmallType(context, "HACKER HOUSE GOA / 2026", infoX, 690, COLORS.cream);
  drawSmallType(context, "#FrameInGoa", infoRight, 690, COLORS.yellow, "right");
  if (brandImages.banner) {
    drawContain(
      context,
      brandImages.banner,
      infoX,
      742,
      infoRight - infoX,
      128,
      COLORS.green,
    );
    context.strokeStyle = COLORS.yellow;
    context.lineWidth = 2;
    context.strokeRect(infoX, 742, infoRight - infoX, 128);
  }
  drawSmallType(
    context,
    "MADE FOR BUILDERS, NOT DATABASES",
    infoX,
    907,
    COLORS.lime,
  );
}

function App() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [format, setFormat] = useState<Format>("frame");
  const [crop, setCrop] = useState<Crop>(DEFAULT_CROP);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isCropDragging, setIsCropDragging] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [brandsReady, setBrandsReady] = useState(false);
  const [brandImages, setBrandImages] = useState<BrandImages>({
    banner: null,
    logo: null,
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const fileLoadRef = useRef(0);
  const renderFrameRef = useRef<number | null>(null);
  const cropPointerRef = useRef<{ id: number; x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    Promise.allSettled([
      loadBrandImage(bannerAsset),
      loadBrandImage(logoAsset),
    ]).then((results) => {
      const banner =
        results[0].status === "fulfilled" ? results[0].value : null;
      const logo = results[1].status === "fulfilled" ? results[1].value : null;
      setBrandImages({ banner, logo });
      setBrandsReady(true);
      if (!banner || !logo) {
        setNotice(
          "Some event artwork could not load, so the generator is using its accessible color fallback.",
        );
      }
    });
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (renderFrameRef.current) cancelAnimationFrame(renderFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!photo || !canvasRef.current || !brandsReady) return;
    setIsRendering(true);
    if (renderFrameRef.current) cancelAnimationFrame(renderFrameRef.current);
    renderFrameRef.current = requestAnimationFrame(() => {
      renderFrame(
        canvasRef.current!,
        photo,
        format,
        name,
        role,
        getBuilderTitle(role),
        brandImages,
        crop,
      );
      setIsRendering(false);
    });
  }, [photo, format, name, role, brandsReady, brandImages, crop]);

  const loadFile = async (file?: File) => {
    if (!file) return;
    const loadToken = ++fileLoadRef.current;
    setError("");
    setNotice("");
    if (!isAcceptedFile(file)) {
      setIsLoadingFile(false);
      setError(
        "That file is not an image we can use. Choose a JPG, PNG, or HEIC photo.",
      );
      return;
    }
    setIsLoadingFile(true);
    let url: string | null = null;
    try {
      if (isHeicFile(file)) {
        setNotice("Converting HEIC locally for the crop studio…");
        const converted = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.92,
        });
        const convertedBlob = Array.isArray(converted)
          ? converted[0]
          : converted;
        if (!(convertedBlob instanceof Blob))
          throw new Error("HEIC conversion returned no image");
        url = URL.createObjectURL(convertedBlob);
      } else {
        url = URL.createObjectURL(file);
      }
    } catch {
      if (loadToken !== fileLoadRef.current) return;
      setIsLoadingFile(false);
      setError(
        "We could not convert that HEIC photo in this browser. Try exporting it as JPG or PNG, then upload it again.",
      );
      setNotice("");
      return;
    }
    if (!url) {
      setIsLoadingFile(false);
      setError("We could not prepare that image. Try a JPG or PNG instead.");
      return;
    }
    if (loadToken !== fileLoadRef.current) {
      URL.revokeObjectURL(url);
      return;
    }
    const image = new Image();
    image.onload = () => {
      if (loadToken !== fileLoadRef.current) {
        URL.revokeObjectURL(url!);
        return;
      }
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = url;
      setPhoto({
        file,
        url,
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setCrop(DEFAULT_CROP);
      setIsLoadingFile(false);
      setError("");
      setNotice(
        isHeicFile(file)
          ? "HEIC converted locally. Crop studio ready — your original photo stays on-device."
          : "Photo loaded. Crop studio ready — adjust locally on-device.",
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url!);
      if (loadToken !== fileLoadRef.current) return;
      setIsLoadingFile(false);
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension === "heic" || extension === "heif") {
        setError(
          "The HEIC preview could not be decoded after conversion. Export the photo as JPG or PNG from your camera app, then try again.",
        );
      } else {
        setError("We could not read that image. Try a different JPG or PNG.");
      }
    };
    image.src = url;
  };

  const changeFormat = (nextFormat: Format) => {
    setFormat(nextFormat);
    setCrop((currentCrop) =>
      clampCrop(currentCrop, photo?.image ?? null, cropAspect(nextFormat)),
    );
  };

  const resetCrop = () => {
    setCrop(DEFAULT_CROP);
    setNotice("Crop reset to the cover view. Your photo stays on this device.");
  };

  const nudgeCrop = (direction: "up" | "down" | "left" | "right") => {
    if (!photo) return;
    const adjustment = 0.14;
    const offset = {
      up: { panY: adjustment },
      down: { panY: -adjustment },
      left: { panX: adjustment },
      right: { panX: -adjustment },
    }[direction];
    setCrop((currentCrop) =>
      clampCrop(
        {
          ...currentCrop,
          panX: currentCrop.panX + (offset.panX ?? 0),
          panY: currentCrop.panY + (offset.panY ?? 0),
        },
        photo.image,
        cropAspect(format),
      ),
    );
  };

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!photo || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    cropPointerRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    setIsCropDragging(true);
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = cropPointerRef.current;
    if (!pointer || pointer.id !== event.pointerId || !photo) return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const deltaX = ((event.clientX - pointer.x) / bounds.width) * 2;
    const deltaY = ((event.clientY - pointer.y) / bounds.height) * 2;
    cropPointerRef.current = {
      id: pointer.id,
      x: event.clientX,
      y: event.clientY,
    };
    setCrop((currentCrop) =>
      clampCrop(
        {
          ...currentCrop,
          panX: currentCrop.panX - deltaX,
          panY: currentCrop.panY - deltaY,
        },
        photo.image,
        cropAspect(format),
      ),
    );
  };

  const finishCropPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (cropPointerRef.current?.id !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    cropPointerRef.current = null;
    setIsCropDragging(false);
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextZoom = Number(event.target.value);
    setCrop((currentCrop) =>
      clampCrop(
        { ...currentCrop, zoom: nextZoom },
        photo?.image ?? null,
        cropAspect(format),
      ),
    );
  };

  const cropImageStyle = photo
    ? (() => {
        const targetAspect = cropAspect(format);
        const sourceAspect = photo.width / photo.height;
        const imageWidth =
          sourceAspect > targetAspect
            ? (sourceAspect / targetAspect) * crop.zoom * 100
            : crop.zoom * 100;
        const imageHeight =
          sourceAspect > targetAspect
            ? crop.zoom * 100
            : (targetAspect / sourceAspect) * crop.zoom * 100;
        const overflowX = Math.max(0, (imageWidth - 100) / 2);
        const overflowY = Math.max(0, (imageHeight - 100) / 2);
        return {
          width: `${imageWidth}%`,
          height: `${imageHeight}%`,
          left: `${50 - imageWidth / 2 - crop.panX * overflowX}%`,
          top: `${50 - imageHeight / 2 - crop.panY * overflowY}%`,
        };
      })()
    : undefined;

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void loadFile(event.dataTransfer.files[0]);
  };

  const reset = () => {
    fileLoadRef.current += 1;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPhoto(null);
    setCrop(DEFAULT_CROP);
    setName("");
    setRole("");
    setFormat("frame");
    setIsLoadingFile(false);
    setError("");
    setNotice("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const download = () => {
    if (!canvasRef.current || !photo) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        setError("The image could not be exported. Please try once more.");
        return;
      }
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download =
        format === "card"
          ? "hacker-house-goa-2026-builder-card.png"
          : format === "circle"
            ? "hacker-house-goa-2026-circle-avatar.png"
            : "hacker-house-goa-2026-frame.png";
      anchor.click();
      URL.revokeObjectURL(href);
      setNotice("Saved to your downloads. Keep it close.");
    }, "image/png");
  };

  const {
    isSharing,
    toastMessage,
    copied,
    handleShare,
    closeToast,
    copyCaptionToClipboard,
  } = useShare();

  const share = () => {
    handleShare(canvasRef.current, {
      format,
      name,
      role,
      builderTitle,
    });
  };

  const hasCardDetails =
    format !== "card" || Boolean(name.trim() && role.trim());
  const builderTitle = getBuilderTitle(role);

  return (
    <main className="app-shell">
      <header className="topbar" data-testid="header-app">
        <div className="brand-lockup" data-testid="text-brand">
          <span className="brand-image-wrap">
            <img className="brand-image" src={logoAsset} alt="Hacker House" />
          </span>
          <span className="brand-copy">
            <strong>Hacker House</strong>
            <small>Goa / 2026</small>
          </span>
        </div>
        <div className="topbar-right">
          <a
            href="https://hhgoa.com"
            target="_blank"
            rel="noopener noreferrer"
            className="topbar-event-link"
            data-testid="link-event-website"
            title="Visit official Hacker House Goa event website"
          >
            <span>Event Website</span>
            <strong>hhgoa.com</strong>
            <ExternalLink size={13} />
          </a>
          <div className="topbar-meta" data-testid="text-event-meta">
            <span>GOA, INDIA</span>
            <strong>28—31 OCT 2026</strong>
          </div>
        </div>
      </header>

      <section className="hero-strip" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="hero-kicker">
            <span className="signal-dot" aria-hidden="true" /> event poster /
            personal artifact
          </p>
          <h1 id="page-title" className="hero-title">
            Make your
            <br />
            <em>Goa proof.</em>
          </h1>
          <p className="hero-subtitle">
            Drop in a photo and leave with a small piece of Hacker House Goa
            2026 made entirely yours.
          </p>
          <div className="hero-details">
            <span>28—31 Oct 2026</span>
            <span className="hero-details-rule" aria-hidden="true" />
            <span>Goa, India</span>
          </div>
          <div className="capability-row" aria-label="Generator capabilities">
            <span>
              <Monitor size={13} aria-hidden="true" /> local render
            </span>
            <span>
              <CropIcon size={13} aria-hidden="true" /> custom crop
            </span>
            <span>
              <Share2 size={13} aria-hidden="true" /> share-ready
            </span>
          </div>
          <p className="privacy-line">Your photo never leaves this device.</p>
        </div>
        <figure className="hero-poster">
          <img
            src={bannerAsset}
            alt="Hacker House Goa, India, 28–31 Oct 2026 event banner"
          />
          <figcaption>
            <span>OFFICIAL EVENT ARTWORK</span>
            <span>HH / 026</span>
          </figcaption>
        </figure>
      </section>

      <section className="workspace" aria-label="Frame generator workspace">
        <aside className="panel controls-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">01 / input signal</p>
              <h2 className="panel-title">Bring a photo</h2>
            </div>
            <span className="step-chip">{photo ? "loaded" : "waiting"}</span>
          </div>

          {!photo ? (
            <div
              className={`upload-zone${isDragging ? " is-dragging" : ""}`}
              onDrop={handleDrop}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              data-testid="dropzone-photo"
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ")
                  fileInputRef.current?.click();
              }}
            >
              <div className="upload-content">
                <span className="upload-icon">
                  <Upload size={21} strokeWidth={2.5} />
                </span>
                <p className="upload-title">Drop your face / work / sky here</p>
                <p className="upload-caption">
                  {isLoadingFile
                    ? "converting locally…"
                    : "JPG, PNG, or HEIC · under 20 MB"}
                </p>
                <button
                  type="button"
                  className="text-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  data-testid="button-choose-photo"
                >
                  choose from device
                </button>
                <p className="upload-resolution-hint">
                  Recommended: 1400 × 1400 px or higher for best export clarity
                </p>
              </div>
            </div>
          ) : (
            <div className="photo-loaded" data-testid="status-photo-loaded">
              <img
                className="photo-thumb"
                src={photo.url}
                alt="Uploaded source preview"
                data-testid="img-photo-thumbnail"
              />
              <div className="photo-meta">
                <p className="photo-name" data-testid="text-photo-name">
                  {photo.file.name}
                </p>
                <p
                  className="photo-dimensions"
                  data-testid="text-photo-dimensions"
                >
                  {photo.width} × {photo.height} px ·{" "}
                  {crop.zoom === 1 && crop.panX === 0 && crop.panY === 0
                    ? "automatic cover crop"
                    : `custom crop at ${Math.round(crop.zoom * 100)} percent`}
                </p>
                <button
                  type="button"
                  className="replace-button"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-replace-photo"
                >
                  replace photo
                </button>
              </div>
            </div>
          )}

          {photo && (
            <section
              className="crop-studio"
              aria-labelledby="crop-studio-title"
            >
              <div className="crop-studio-heading">
                <div>
                  <p className="crop-eyebrow">crop studio</p>
                  <h3 id="crop-studio-title">Set the frame</h3>
                </div>
                <span className="crop-format-tag">
                  {format === "frame"
                    ? "1:1 square frame"
                    : format === "circle"
                      ? "1:1 circular avatar"
                      : "portrait photo / wide ID"}
                </span>
              </div>
              <div
                className={`crop-viewport${isCropDragging ? " is-dragging" : ""}`}
                style={{ aspectRatio: cropAspect(format) }}
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={finishCropPointer}
                onPointerCancel={finishCropPointer}
                role="application"
                aria-label={`${format === "frame" ? "Square profile frame" : format === "circle" ? "Circular profile avatar" : "Wide builder card"} crop viewport. Drag the photo to reposition it.`}
                data-testid="crop-viewport"
              >
                <img
                  className="crop-photo"
                  src={photo.url}
                  alt=""
                  style={cropImageStyle}
                  draggable={false}
                />
                <span className="crop-boundary" aria-hidden="true" />
                {(format === "frame" || format === "circle") && (
                  <span
                    className="crop-circle-guide"
                    aria-hidden="true"
                    title="X / Twitter circular avatar area"
                  />
                )}
                <span className="crop-format-label">
                  {format === "frame"
                    ? "SQUARE PROFILE FRAME"
                    : format === "circle"
                      ? "CIRCULAR AVATAR BADGE"
                      : "BUILDER ID PHOTO"}
                </span>
                <span className="crop-drag-affordance">
                  <Move size={14} />{" "}
                  {isCropDragging ? "repositioning" : "drag to reposition"}
                </span>
              </div>
              <div className="crop-control-row">
                <label className="zoom-control" htmlFor="crop-zoom">
                  <span>
                    Zoom{" "}
                    <output htmlFor="crop-zoom">
                      {Math.round(crop.zoom * 100)}%
                    </output>
                  </span>
                  <input
                    id="crop-zoom"
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step="0.01"
                    value={crop.zoom}
                    onChange={handleZoomChange}
                    aria-label="Crop zoom"
                    data-testid="input-crop-zoom"
                  />
                </label>
                <button
                  type="button"
                  className="reset-crop-button"
                  onClick={resetCrop}
                  data-testid="button-reset-crop"
                >
                  <RotateCcw size={14} /> reset crop
                </button>
              </div>
              <div
                className="crop-position-controls"
                role="group"
                aria-label="Move photo position"
              >
                <span className="crop-position-label">Move photo</span>
                <div className="crop-direction-pad">
                  <span aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => nudgeCrop("up")}
                    aria-label="Move photo up"
                    title="Move photo up"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <span aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => nudgeCrop("left")}
                    aria-label="Move photo left"
                    title="Move photo left"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <span className="crop-direction-center" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => nudgeCrop("right")}
                    aria-label="Move photo right"
                    title="Move photo right"
                  >
                    <ArrowRight size={15} />
                  </button>
                  <span aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => nudgeCrop("down")}
                    aria-label="Move photo down"
                    title="Move photo down"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <span aria-hidden="true" />
                </div>
              </div>
              <p className="crop-helper">
                Drag the photo directly, or use the arrows for precise
                horizontal and vertical positioning. Everything stays local.
              </p>
            </section>
          )}

          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept="image/*,.heic,.heif"
            onChange={(event) => {
              void loadFile(event.target.files?.[0]);
            }}
            data-testid="input-photo-file"
          />

          {error && (
            <p
              className="error-message"
              role="alert"
              data-testid="status-upload-error"
            >
              {error}
            </p>
          )}

          <hr className="section-divider" />
          <p className="format-label">02 / choose your signal</p>
          <div
            className="format-options"
            role="radiogroup"
            aria-label="Output format"
          >
            <button
              type="button"
              className={`format-option${format === "frame" ? " is-selected" : ""}`}
              onClick={() => changeFormat("frame")}
              role="radio"
              aria-checked={format === "frame"}
              data-testid="button-format-frame"
            >
              <span className="format-glyph">A</span>
              <span>
                <span className="format-name">Square profile frame</span>
                <span className="format-description">
                  1:1 square frame with coastal waves & geo-coordinates.
                </span>
              </span>
              <Check className="check-mark" size={17} />
            </button>
            <button
              type="button"
              className={`format-option${format === "circle" ? " is-selected" : ""}`}
              onClick={() => changeFormat("circle")}
              role="radio"
              aria-checked={format === "circle"}
              data-testid="button-format-circle"
            >
              <span className="format-glyph circle">B</span>
              <span>
                <span className="format-name">Circular profile avatar</span>
                <span className="format-description">
                  1:1 concentric circle badge tailored for X, Telegram & Discord.
                </span>
              </span>
              <Check className="check-mark" size={17} />
            </button>
            <button
              type="button"
              className={`format-option${format === "card" ? " is-selected" : ""}`}
              onClick={() => changeFormat("card")}
              role="radio"
              aria-checked={format === "card"}
              data-testid="button-format-card"
            >
              <span className="format-glyph card">C</span>
              <span>
                <span className="format-name">Builder ID card</span>
                <span className="format-description">
                  Landscape credential with your photo and event details.
                </span>
              </span>
              <Check className="check-mark" size={17} />
            </button>
          </div>

          {format === "card" && (
            <div data-testid="section-card-details">
              <div className="field-group">
                <label className="field-label" htmlFor="builder-name">
                  Your name
                </label>
                <input
                  id="builder-name"
                  className="field-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Mira Shah"
                  maxLength={26}
                  data-testid="input-builder-name"
                />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="builder-role">
                  Role / stack
                </label>
                <input
                  id="builder-role"
                  className="field-input"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="e.g. hardware + poetry"
                  maxLength={30}
                  data-testid="input-builder-role"
                />
              </div>
              <div
                className="builder-title-preview"
                aria-live="polite"
                data-testid="text-builder-title"
              >
                <span className="field-label">Generated builder title</span>
                <strong>{builderTitle}</strong>
                <small>Based on your role / stack, updated live.</small>
              </div>
            </div>
          )}

          <p className="helper-text">
            {format === "frame"
              ? "Your square crop becomes the full profile frame with coastal wave ribbons & Goa coordinates."
              : format === "circle"
                ? "Your photo is framed inside concentric coastal avatar rings tailored for X, Telegram & Discord."
                : "Your portrait crop is placed on the left side of the official wide Builder ID card."}
          </p>
        </aside>

        <section
          className="panel preview-panel"
          aria-labelledby="preview-title"
        >
          <div className="preview-header">
            <div>
              <p className="eyebrow">03 / live artifact</p>
              <h2 id="preview-title" className="sr-only">
                Live preview
              </h2>
            </div>
            <div className="preview-status" data-testid="status-render">
              <span className="status-light" aria-hidden="true" />
              {isRendering
                ? "rendering"
                : photo
                  ? "canvas live"
                  : "awaiting photo"}
            </div>
          </div>
          <div className="canvas-stage">
            {!photo && (
              <div className="empty-preview" data-testid="empty-preview">
                <div className="empty-preview-art" aria-hidden="true" />
                <h3 className="empty-preview-title">
                  Your artifact starts here
                </h3>
                <p className="empty-preview-copy">
                  Upload a photo to light up the preview. Every crop and detail
                  is rendered on this device.
                </p>
              </div>
            )}
            {photo && (!brandsReady || isRendering) && (
              <div className="rendering-state" data-testid="status-rendering">
                <span className="rendering-bars" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                {!brandsReady
                  ? "loading event artwork"
                  : "composing your signal"}
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={`canvas-preview${!photo || isRendering || !brandsReady ? " sr-only" : ""}`}
              aria-label="Generated Hacker House Goa preview"
              data-testid="canvas-preview"
            />
          </div>
          <div className="action-bar">
            <button
              type="button"
              className="action-button primary"
              onClick={download}
              disabled={
                !photo ||
                isLoadingFile ||
                isRendering ||
                !brandsReady ||
                !hasCardDetails
              }
              data-testid="button-download"
            >
              <Download size={17} /> download PNG
            </button>
            <button
              type="button"
              className="action-button secondary"
              onClick={share}
              disabled={
                !photo ||
                isLoadingFile ||
                isRendering ||
                !brandsReady ||
                !hasCardDetails ||
                isSharing
              }
              data-testid="button-share"
            >
              {isSharing ? (
                <>
                  <Loader2 size={17} className="animate-spin" /> preparing...
                </>
              ) : (
                <>
                  <Share2 size={17} /> share on X
                </>
              )}
            </button>
          </div>
          {photo && hasCardDetails && (
            <button
              type="button"
              className="action-button ghost caption-btn"
              onClick={() =>
                copyCaptionToClipboard({
                  format,
                  name,
                  role,
                  builderTitle,
                })
              }
              data-testid="button-copy-caption"
              title="Copy formatted post caption to clipboard"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "caption copied to clipboard!" : "copy caption text"}
            </button>
          )}
          {notice && (
            <p className="notice" role="status" data-testid="status-notice">
              <Info size={15} /> {notice}
            </p>
          )}
          {photo && format === "card" && !hasCardDetails && (
            <p className="notice" data-testid="status-card-details">
              <FileImage size={15} /> Add your name and role to unlock this
              card.
            </p>
          )}
          {photo && (
            <button
              type="button"
              className="action-button ghost"
              onClick={reset}
              data-testid="button-reset"
            >
              <RotateCcw size={16} /> start over with a new photo
            </button>
          )}
        </section>
      </section>

      <footer className="footer-note">
        <span>Built by Yash Suthar</span>
        <strong>#FrameInGoa</strong>
      </footer>

      <ShareToast message={toastMessage} onClose={closeToast} />
    </main>
  );
}

export default App;

