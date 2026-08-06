import { useEffect, useRef, useState } from "react";
import heic2any from "heic2any";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
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
import { ShareModal } from "./components/ShareModal";

type Format = "frame" | "card";

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

  if (!isCard) {
    drawCover(context, photo.image, 0, 0, width, height, crop);
    const wash = context.createLinearGradient(0, 0, width, height);
    wash.addColorStop(0, "rgba(7, 107, 59, .10)");
    wash.addColorStop(0.58, "rgba(7, 107, 59, .03)");
    wash.addColorStop(1, "rgba(7, 55, 35, .72)");
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);

    context.fillStyle = COLORS.green;
    context.fillRect(0, 0, width, 180);
    context.fillStyle = COLORS.yellow;
    context.fillRect(0, 180, width, 10);
    drawBrandLogo(context, brandImages.logo, 45, 18, 144);
    drawSmallType(context, "HACKER HOUSE GOA", 222, 76, COLORS.cream);
    context.font = '600 36px "Fraunces", Georgia, serif';
    context.textAlign = "left";
    context.fillStyle = COLORS.yellow;
    context.fillText("28—31 OCT 2026", 222, 126);
    drawSmallType(context, "#FrameInGoa", 1350, 76, COLORS.cream, "right");

    context.strokeStyle = COLORS.pink;
    context.lineWidth = 12;
    context.strokeRect(40, 40, width - 80, height - 80);
    drawDots(context, 92, 226, 7, COLORS.pink);
    drawDots(context, 92, 1232, 7, COLORS.pink);

    context.fillStyle = "rgba(7, 55, 35, .92)";
    roundedRect(context, 88, 1080, 1224, 225, 8);
    context.fill();
    context.fillStyle = COLORS.pink;
    context.fillRect(88, 1080, 18, 225);
    if (brandImages.banner) {
      drawContain(
        context,
        brandImages.banner,
        1070,
        1100,
        210,
        175,
        COLORS.green,
      );
      context.strokeStyle = COLORS.pink;
      context.lineWidth = 3;
      context.strokeRect(1070, 1100, 210, 175);
    }
    drawSmallType(context, "HACKER HOUSE / GOA, INDIA", 145, 1150, COLORS.lime);
    context.fillStyle = COLORS.cream;
    context.font = '700 72px "Fraunces", Georgia, serif';
    context.textAlign = "left";
    context.fillText("FRAME IN GOA", 145, 1235);
    drawSmallType(context, "#FrameInGoa", 1035, 1270, COLORS.yellow, "right");
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
        format === "frame"
          ? "hacker-house-goa-2026-frame.png"
          : "hacker-house-goa-2026-builder-card.png";
      anchor.click();
      URL.revokeObjectURL(href);
      setNotice("Saved to your downloads. Keep it close.");
    }, "image/png");
  };

  const {
    isSharing,
    toastMessage,
    showModal,
    lastOptions,
    copied,
    handleShare,
    closeModal,
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
    format === "frame" || Boolean(name.trim() && role.trim());
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
                    ? "1:1 profile"
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
                aria-label={`${format === "frame" ? "Square profile frame" : "Wide builder card"} crop viewport. Drag the photo to reposition it.`}
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
                <span className="crop-format-label">
                  {format === "frame" ? "PROFILE FRAME" : "BUILDER ID PHOTO"}
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
                <span className="format-name">Profile frame</span>
                <span className="format-description">
                  Square, loud, ready for your profile.
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
              <span className="format-glyph card">B</span>
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
              ? "Your square crop becomes the full profile frame, with the Goa signal built around it."
              : "Your details stay in this browser and are painted into the image only when you export."}
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
          <p className="share-popup-hint" data-testid="text-share-popup-hint">
            Note: Allow pop-ups for this site so X compose can open automatically in a new tab.
          </p>
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
      <ShareModal
        isOpen={showModal}
        options={lastOptions}
        copied={copied}
        onClose={closeModal}
        onCopyCaption={copyCaptionToClipboard}
      />
    </main>
  );
}

export default App;
