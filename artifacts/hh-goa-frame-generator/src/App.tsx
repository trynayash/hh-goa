import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Download,
  FileImage,
  Info,
  RotateCcw,
  Share2,
  Sparkles,
  Upload,
} from 'lucide-react';
import bannerAsset from '@assets/bANNER_1785999397328.webp';
import logoAsset from '@assets/logo_1785999397329.webp';

type Format = 'frame' | 'card';

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

const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif'];
const COLORS = {
  green: '#076b3b',
  ink: '#123d28',
  yellow: '#ffe400',
  pink: '#f7087d',
  lime: '#8fbe6d',
  cream: '#fff4c8',
};

function isAcceptedFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return file.type.startsWith('image/') || ACCEPTED_EXTENSIONS.includes(extension);
}

function loadBrandImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  focusX = 0.5,
  focusY = 0.5,
) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) * focusX;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) * focusY;
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
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
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
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
  align: CanvasTextAlign = 'left',
) {
  context.fillStyle = color;
  context.font = '500 18px "DM Mono", monospace';
  context.textAlign = align;
  context.fillText(text, x, y);
}

function drawDots(context: CanvasRenderingContext2D, x: number, y: number, count: number, color: string) {
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
  context.imageSmoothingQuality = 'high';
  context.drawImage(logo, x, y, size, size);
  context.restore();
}

function renderFrame(
  canvas: HTMLCanvasElement,
  photo: Photo,
  format: Format,
  name: string,
  role: string,
  brandImages: BrandImages,
) {
  const isCard = format === 'card';
  const width = isCard ? 1000 : 1400;
  const height = 1400;
  const context = canvas.getContext('2d');
  if (!context) return;
  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  if (!isCard) {
    drawCover(context, photo.image, 0, 0, width, height);
    const wash = context.createLinearGradient(0, 0, width, height);
    wash.addColorStop(0, 'rgba(7, 107, 59, .10)');
    wash.addColorStop(.58, 'rgba(7, 107, 59, .03)');
    wash.addColorStop(1, 'rgba(7, 55, 35, .72)');
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);

    context.fillStyle = COLORS.green;
    context.fillRect(0, 0, width, 180);
    context.fillStyle = COLORS.yellow;
    context.fillRect(0, 180, width, 10);
    drawBrandLogo(context, brandImages.logo, 45, 18, 144);
    drawSmallType(context, 'HACKER HOUSE GOA', 222, 76, COLORS.cream);
    context.font = '600 36px "Fraunces", Georgia, serif';
    context.textAlign = 'left';
    context.fillStyle = COLORS.yellow;
    context.fillText('28—31 OCT 2026', 222, 126);
    drawSmallType(context, '#FrameInGoa', 1350, 76, COLORS.cream, 'right');

    context.strokeStyle = COLORS.yellow;
    context.lineWidth = 14;
    context.strokeRect(35, 35, width - 70, height - 70);
    context.strokeStyle = COLORS.pink;
    context.lineWidth = 4;
    context.strokeRect(58, 58, width - 116, height - 116);
    drawDots(context, 92, 226, 7, COLORS.pink);
    drawDots(context, 92, 1232, 7, COLORS.yellow);

    context.fillStyle = 'rgba(7, 55, 35, .92)';
    roundedRect(context, 88, 1080, 1224, 225, 8);
    context.fill();
    context.fillStyle = COLORS.pink;
    context.fillRect(88, 1080, 18, 225);
    if (brandImages.banner) {
      drawContain(context, brandImages.banner, 1070, 1100, 210, 175, COLORS.green);
      context.strokeStyle = COLORS.yellow;
      context.lineWidth = 3;
      context.strokeRect(1070, 1100, 210, 175);
    }
    drawSmallType(context, 'HACKER HOUSE / GOA, INDIA', 145, 1150, COLORS.lime);
    context.fillStyle = COLORS.cream;
    context.font = '700 72px "Fraunces", Georgia, serif';
    context.textAlign = 'left';
    context.fillText('FRAME IN GOA', 145, 1235);
    drawSmallType(context, '#FrameInGoa', 1035, 1270, COLORS.yellow, 'right');
    return;
  }

  context.fillStyle = COLORS.cream;
  context.fillRect(0, 0, width, height);
  context.fillStyle = COLORS.green;
  context.fillRect(0, 0, width, 770);
  drawCover(context, photo.image, 32, 32, width - 64, 706, .5, .44);
  context.fillStyle = 'rgba(7, 107, 59, .14)';
  context.fillRect(32, 32, width - 64, 706);
  context.strokeStyle = COLORS.yellow;
  context.lineWidth = 8;
  context.strokeRect(32, 32, width - 64, 706);
  context.strokeStyle = COLORS.pink;
  context.lineWidth = 3;
  context.strokeRect(51, 51, width - 102, 668);
  drawBrandLogo(context, brandImages.logo, 68, 68, 115);
  drawSmallType(context, 'HACKER HOUSE GOA', 205, 110, COLORS.cream);
  drawSmallType(context, 'BUILDER ID / 026', 932, 110, COLORS.yellow, 'right');

  context.fillStyle = COLORS.green;
  context.fillRect(0, 770, width, 630);
  context.fillStyle = COLORS.pink;
  context.fillRect(0, 770, width, 18);
  if (brandImages.banner) {
    drawContain(context, brandImages.banner, 56, 816, 888, 176, COLORS.green);
    context.strokeStyle = COLORS.yellow;
    context.lineWidth = 3;
    context.strokeRect(56, 816, 888, 176);
  }
  drawSmallType(context, 'NAME / STACK', 76, 1050, COLORS.lime);
  context.fillStyle = COLORS.cream;
  context.font = '700 72px "Fraunces", Georgia, serif';
  context.textAlign = 'left';
  const safeName = name.trim() || 'YOUR NAME';
  context.fillText(safeName.slice(0, 18), 76, 1152);
  context.fillStyle = COLORS.yellow;
  context.font = '500 32px "DM Mono", monospace';
  context.fillText((role.trim() || 'BUILDER / MAKER').slice(0, 26), 76, 1218);
  drawSmallType(context, 'GOA, INDIA · 28—31 OCT 2026', 76, 1332, COLORS.cream);
  drawSmallType(context, '#FrameInGoa', 924, 1332, COLORS.yellow, 'right');
}

function App() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [format, setFormat] = useState<Format>('frame');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [brandsReady, setBrandsReady] = useState(false);
  const [brandImages, setBrandImages] = useState<BrandImages>({ banner: null, logo: null });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const renderFrameRef = useRef<number | null>(null);

  useEffect(() => {
    Promise.allSettled([loadBrandImage(bannerAsset), loadBrandImage(logoAsset)]).then((results) => {
      const banner = results[0].status === 'fulfilled' ? results[0].value : null;
      const logo = results[1].status === 'fulfilled' ? results[1].value : null;
      setBrandImages({ banner, logo });
      setBrandsReady(true);
      if (!banner || !logo) {
        setNotice('Some event artwork could not load, so the generator is using its accessible color fallback.');
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
      renderFrame(canvasRef.current!, photo, format, name, role, brandImages);
      setIsRendering(false);
    });
  }, [photo, format, name, role, brandsReady, brandImages]);

  const loadFile = (file?: File) => {
    if (!file) return;
    setError('');
    setNotice('');
    if (!isAcceptedFile(file)) {
      setError('That file is not an image we can use. Choose a JPG, PNG, or HEIC photo.');
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = url;
      setPhoto({ file, url, image, width: image.naturalWidth, height: image.naturalHeight });
      setError('');
      setNotice('Photo loaded. Your crop is automatic and ready to frame.');
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'heic' || extension === 'heif') {
        setError('This browser cannot decode HEIC yet. Export the photo as JPG or PNG from your camera app, then try again.');
      } else {
        setError('We could not read that image. Try a different JPG or PNG.');
      }
    };
    image.src = url;
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    loadFile(event.dataTransfer.files[0]);
  };

  const reset = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPhoto(null);
    setName('');
    setRole('');
    setFormat('frame');
    setError('');
    setNotice('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const download = () => {
    if (!canvasRef.current || !photo) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        setError('The image could not be exported. Please try once more.');
        return;
      }
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = format === 'frame' ? 'hacker-house-goa-2026-frame.png' : 'hacker-house-goa-2026-builder-card.png';
      anchor.click();
      URL.revokeObjectURL(href);
      setNotice('Saved to your downloads. Keep it close.');
    }, 'image/png');
  };

  const share = () => {
    const text = format === 'frame'
      ? 'Just framed my Hacker House Goa 2026 moment. #FrameInGoa'
      : `I am headed to Hacker House Goa 2026 as ${name.trim() || 'a builder'}. #FrameInGoa`;
    const shareUrl = 'https://goa.hackclub.com';
    const target = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    const popup = window.open(target, '_blank', 'noopener,noreferrer,width=640,height=520');
    if (!popup) {
      setNotice('Your browser blocked the share window. Allow pop-ups for this page, then press share again.');
    } else {
      setNotice('X compose is ready with your #FrameInGoa caption.');
    }
  };

  const hasCardDetails = format === 'frame' || Boolean(name.trim() && role.trim());

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
        <div className="topbar-meta" data-testid="text-event-meta">
          <span>GOA, INDIA</span>
          <strong>28—31 OCT 2026</strong>
        </div>
      </header>

      <section className="hero-strip" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="hero-kicker"><span className="signal-dot" aria-hidden="true" /> event poster / personal artifact</p>
          <h1 id="page-title" className="hero-title">Make your<br /><em>Goa proof.</em></h1>
          <p className="hero-subtitle">
            Drop in a photo and leave with a small piece of Hacker House Goa 2026 made entirely yours.
          </p>
          <div className="hero-details">
            <span>28—31 Oct 2026</span>
            <span className="hero-details-rule" aria-hidden="true" />
            <span>Goa, India</span>
          </div>
        </div>
        <figure className="hero-poster">
          <img src={bannerAsset} alt="Hacker House Goa, India, 28–31 Oct 2026 event banner" />
          <figcaption><span>OFFICIAL EVENT ARTWORK</span><span>HH / 026</span></figcaption>
        </figure>
      </section>

      <section className="workspace" aria-label="Frame generator workspace">
        <aside className="panel controls-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">01 / input signal</p>
              <h2 className="panel-title">Bring a photo</h2>
            </div>
            <span className="step-chip">{photo ? 'loaded' : 'waiting'}</span>
          </div>

          {!photo ? (
            <div
              className={`upload-zone${isDragging ? ' is-dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              data-testid="dropzone-photo"
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click(); }}
            >
              <div className="upload-content">
                <span className="upload-icon"><Upload size={21} strokeWidth={2.5} /></span>
                <p className="upload-title">Drop your face / work / sky here</p>
                <p className="upload-caption">JPG, PNG, or HEIC · under 20 MB</p>
                <button
                  type="button"
                  className="text-button"
                  onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }}
                  data-testid="button-choose-photo"
                >
                  choose from device
                </button>
              </div>
            </div>
          ) : (
            <div className="photo-loaded" data-testid="status-photo-loaded">
              <img className="photo-thumb" src={photo.url} alt="Uploaded source preview" data-testid="img-photo-thumbnail" />
              <div className="photo-meta">
                <p className="photo-name" data-testid="text-photo-name">{photo.file.name}</p>
                <p className="photo-dimensions" data-testid="text-photo-dimensions">{photo.width} × {photo.height} px · auto cover crop</p>
                <button type="button" className="replace-button" onClick={() => fileInputRef.current?.click()} data-testid="button-replace-photo">
                  replace photo
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept="image/*,.heic,.heif"
            onChange={(event) => loadFile(event.target.files?.[0])}
            data-testid="input-photo-file"
          />

          {error && <p className="error-message" role="alert" data-testid="status-upload-error">{error}</p>}

          <hr className="section-divider" />
          <p className="format-label">02 / choose your signal</p>
          <div className="format-options" role="radiogroup" aria-label="Output format">
            <button
              type="button"
              className={`format-option${format === 'frame' ? ' is-selected' : ''}`}
              onClick={() => setFormat('frame')}
              role="radio"
              aria-checked={format === 'frame'}
              data-testid="button-format-frame"
            >
              <span className="format-glyph">A</span>
              <span>
                <span className="format-name">Profile frame</span>
                <span className="format-description">Square, loud, ready for your profile.</span>
              </span>
              <Check className="check-mark" size={17} />
            </button>
            <button
              type="button"
              className={`format-option${format === 'card' ? ' is-selected' : ''}`}
              onClick={() => setFormat('card')}
              role="radio"
              aria-checked={format === 'card'}
              data-testid="button-format-card"
            >
              <span className="format-glyph card">B</span>
              <span>
                <span className="format-name">Builder ID card</span>
                <span className="format-description">Portrait card with your name and stack.</span>
              </span>
              <Check className="check-mark" size={17} />
            </button>
          </div>

          {format === 'card' && (
            <div data-testid="section-card-details">
              <div className="field-group">
                <label className="field-label" htmlFor="builder-name">Your name</label>
                <input id="builder-name" className="field-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Mira Shah" maxLength={26} data-testid="input-builder-name" />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="builder-role">Role / stack</label>
                <input id="builder-role" className="field-input" value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. hardware + poetry" maxLength={30} data-testid="input-builder-role" />
              </div>
            </div>
          )}

          <p className="helper-text">
            {format === 'frame'
              ? 'The crop keeps the centre of your photo in focus and builds the Goa signal around it.'
              : 'Your details stay in this browser and are painted into the image only when you export.'}
          </p>
        </aside>

        <section className="panel preview-panel" aria-labelledby="preview-title">
          <div className="preview-header">
            <div>
              <p className="eyebrow">03 / live artifact</p>
              <h2 id="preview-title" className="sr-only">Live preview</h2>
            </div>
            <div className="preview-status" data-testid="status-render">
              <span className="status-light" aria-hidden="true" />
              {isRendering ? 'rendering' : photo ? 'canvas live' : 'awaiting photo'}
            </div>
          </div>
          <div className="canvas-stage">
            {!photo && (
              <div className="empty-preview" data-testid="empty-preview">
                <div className="empty-preview-art" aria-hidden="true" />
                <h3 className="empty-preview-title">Your artifact starts here</h3>
                <p className="empty-preview-copy">Upload a photo to light up the preview. Every crop and detail is rendered on this device.</p>
              </div>
            )}
            {photo && (!brandsReady || isRendering) && (
              <div className="rendering-state" data-testid="status-rendering">
                <span className="rendering-bars" aria-hidden="true"><i /><i /><i /><i /></span>
                {!brandsReady ? 'loading event artwork' : 'composing your signal'}
              </div>
            )}
            <canvas ref={canvasRef} className={`canvas-preview${!photo || isRendering || !brandsReady ? ' sr-only' : ''}`} aria-label="Generated Hacker House Goa preview" data-testid="canvas-preview" />
          </div>
          <div className="action-bar">
            <button type="button" className="action-button primary" onClick={download} disabled={!photo || isRendering || !brandsReady || !hasCardDetails} data-testid="button-download">
              <Download size={17} /> download PNG
            </button>
            <button type="button" className="action-button secondary" onClick={share} disabled={!photo || isRendering || !brandsReady || !hasCardDetails} data-testid="button-share">
              <Share2 size={17} /> share on X
            </button>
          </div>
          {notice && <p className="notice" role="status" data-testid="status-notice"><Info size={15} /> {notice}</p>}
          {photo && format === 'card' && !hasCardDetails && <p className="notice" data-testid="status-card-details"><FileImage size={15} /> Add your name and role to unlock this card.</p>}
          {photo && <button type="button" className="action-button ghost" onClick={reset} data-testid="button-reset"><RotateCcw size={16} /> start over with a new photo</button>}
        </section>
      </section>

      <footer className="footer-note">
        <span><Sparkles size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} /> made for builders, not databases</span>
        <strong>#FrameInGoa</strong>
      </footer>
    </main>
  );
}

export default App;