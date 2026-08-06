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

type Format = 'frame' | 'card';

type Photo = {
  file: File;
  url: string;
  image: HTMLImageElement;
  width: number;
  height: number;
};

const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif'];

function isAcceptedFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return file.type.startsWith('image/') || ACCEPTED_EXTENSIONS.includes(extension);
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
  context.letterSpacing = '2px';
  context.fillText(text, x, y);
  context.letterSpacing = '0px';
}

function renderFrame(
  canvas: HTMLCanvasElement,
  photo: Photo,
  format: Format,
  name: string,
  role: string,
) {
  const isCard = format === 'card';
  const width = isCard ? 1000 : 1400;
  const height = isCard ? 1400 : 1400;
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
    wash.addColorStop(0, 'rgba(8, 22, 48, .17)');
    wash.addColorStop(.48, 'rgba(8, 22, 48, .04)');
    wash.addColorStop(1, 'rgba(8, 22, 48, .6)');
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = '#6ff0de';
    context.lineWidth = 14;
    context.strokeRect(35, 35, width - 70, height - 70);
    context.strokeStyle = 'rgba(255, 219, 135, .86)';
    context.lineWidth = 3;
    context.strokeRect(57, 57, width - 114, height - 114);

    context.save();
    context.translate(1190, 205);
    context.rotate(.18);
    context.strokeStyle = '#ff815b';
    context.lineWidth = 8;
    context.beginPath();
    context.arc(0, 0, 105, -.8, 2.3);
    context.stroke();
    context.strokeStyle = 'rgba(255, 219, 135, .8)';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, 0, 123, -.7, 2.1);
    context.stroke();
    context.restore();

    context.fillStyle = 'rgba(8, 22, 48, .84)';
    roundedRect(context, 88, 1060, 1224, 245, 16);
    context.fill();
    context.fillStyle = '#ff815b';
    context.fillRect(88, 1060, 17, 245);
    drawSmallType(context, 'HH GOA / 2026', 145, 1134, '#6ff0de');
    context.fillStyle = '#fff3d5';
    context.font = '700 72px "Space Grotesk", sans-serif';
    context.textAlign = 'left';
    context.fillText('FRAME IN GOA', 145, 1220);
    drawSmallType(context, '#FrameInGoa', 1255, 1254, '#ffdb87', 'right');

    context.save();
    context.strokeStyle = 'rgba(111, 240, 222, .85)';
    context.lineWidth = 5;
    context.setLineDash([12, 14]);
    context.beginPath();
    context.moveTo(102, 220);
    context.bezierCurveTo(285, 410, 164, 585, 370, 740);
    context.bezierCurveTo(529, 860, 630, 726, 775, 842);
    context.stroke();
    context.restore();
    context.fillStyle = '#ffdb87';
    context.beginPath();
    context.arc(370, 740, 12, 0, Math.PI * 2);
    context.fill();
    drawSmallType(context, 'BUILDERS ON THE COAST', 101, 170, '#fff3d5');
    drawSmallType(context, '01 / KEEP THIS ONE', 1298, 100, '#fff3d5', 'right');
    return;
  }

  context.fillStyle = '#fff3d5';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#10203e';
  context.fillRect(0, 0, width, 790);
  drawCover(context, photo.image, 32, 32, width - 64, 726, .5, .44);
  context.fillStyle = 'rgba(16, 32, 62, .18)';
  context.fillRect(32, 32, width - 64, 726);

  context.strokeStyle = '#6ff0de';
  context.lineWidth = 8;
  context.strokeRect(32, 32, width - 64, 726);
  context.strokeStyle = '#ff815b';
  context.lineWidth = 3;
  context.strokeRect(51, 51, width - 102, 688);
  drawSmallType(context, 'HH GOA 2026', 76, 102, '#fff3d5');
  drawSmallType(context, 'BUILDER ID / 026', 924, 102, '#6ff0de', 'right');

  context.fillStyle = '#10203e';
  context.fillRect(0, 790, width, 610);
  context.fillStyle = '#ff815b';
  context.fillRect(0, 790, width, 18);
  context.fillStyle = '#6ff0de';
  context.beginPath();
  context.arc(850, 1070, 175, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#10203e';
  context.beginPath();
  context.arc(850, 1070, 131, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#ffdb87';
  context.lineWidth = 4;
  context.beginPath();
  context.arc(850, 1070, 190, -.8, 1.5);
  context.stroke();
  context.save();
  context.strokeStyle = 'rgba(255, 219, 135, .45)';
  context.lineWidth = 3;
  context.setLineDash([8, 12]);
  context.beginPath();
  context.moveTo(61, 1244);
  context.bezierCurveTo(270, 1140, 300, 1330, 520, 1238);
  context.stroke();
  context.restore();
  drawSmallType(context, 'NAME / STACK', 76, 894, '#6ff0de');
  context.fillStyle = '#fff3d5';
  context.font = '700 74px "Space Grotesk", sans-serif';
  context.textAlign = 'left';
  const safeName = name.trim() || 'YOUR NAME';
  context.fillText(safeName.slice(0, 18), 76, 1005);
  context.fillStyle = '#ffdb87';
  context.font = '500 34px "DM Mono", monospace';
  context.fillText((role.trim() || 'BUILDER / MAKER').slice(0, 26), 76, 1076);
  drawSmallType(context, 'MADE IN GOA', 76, 1325, '#fff3d5');
  drawSmallType(context, '#FrameInGoa', 924, 1325, '#ffdb87', 'right');
}

function App() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [format, setFormat] = useState<Format>('frame');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const renderFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (renderFrameRef.current) cancelAnimationFrame(renderFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!photo || !canvasRef.current) return;
    setIsRendering(true);
    if (renderFrameRef.current) cancelAnimationFrame(renderFrameRef.current);
    renderFrameRef.current = requestAnimationFrame(() => {
      renderFrame(canvasRef.current!, photo, format, name, role);
      setIsRendering(false);
    });
  }, [photo, format, name, role]);

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
      anchor.download = format === 'frame' ? 'hh-goa-2026-frame.png' : 'hh-goa-2026-builder-card.png';
      anchor.click();
      URL.revokeObjectURL(href);
      setNotice('Saved to your downloads. Keep it close.');
    }, 'image/png');
  };

  const share = () => {
    const text = format === 'frame'
      ? 'Just framed my HH Goa 2026 moment. #FrameInGoa'
      : `I am headed to HH Goa 2026 as ${name.trim() || 'a builder'}. #FrameInGoa`;
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
          <span className="brand-mark" aria-hidden="true">HH</span>
          <span className="brand-text">Hack Club / Goa</span>
        </div>
        <div className="topbar-meta" data-testid="text-event-meta">
          <span>personal artifact station</span>
          <strong>04—07 APR 2026</strong>
        </div>
      </header>

      <section className="hero-strip" aria-labelledby="page-title">
        <p className="hero-kicker"><span className="signal-dot" aria-hidden="true" /> signal found / builders welcome</p>
        <h1 id="page-title" className="hero-title">Make your<br /><em>Goa proof.</em></h1>
        <p className="hero-subtitle">
          Drop in a photo. Pick your signal. Leave with a little piece of HH Goa 2026 made entirely yours.
        </p>
        <div className="hero-route" aria-hidden="true">
          <svg width="220" height="80" viewBox="0 0 220 80" fill="none">
            <path d="M6 60C34 13 64 71 97 37C129 4 154 58 214 12" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
            <circle cx="6" cy="60" r="5" fill="currentColor" />
            <circle cx="214" cy="12" r="5" fill="#FFDB87" />
          </svg>
        </div>
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
            {photo && isRendering && (
              <div className="rendering-state" data-testid="status-rendering">
                <span className="rendering-bars" aria-hidden="true"><i /><i /><i /><i /></span>
                composing your signal
              </div>
            )}
            <canvas ref={canvasRef} className={`canvas-preview${!photo || isRendering ? ' sr-only' : ''}`} aria-label="Generated HH Goa preview" data-testid="canvas-preview" />
          </div>
          <div className="action-bar">
            <button type="button" className="action-button primary" onClick={download} disabled={!photo || isRendering || !hasCardDetails} data-testid="button-download">
              <Download size={17} /> download PNG
            </button>
            <button type="button" className="action-button secondary" onClick={share} disabled={!photo || isRendering || !hasCardDetails} data-testid="button-share">
              <Share2 size={17} /> share on X
            </button>
          </div>
          {notice && <p className="notice" role="status" data-testid="status-notice"><Info size={15} /> {notice}</p>}
          {photo && format === 'card' && !hasCardDetails && <p className="notice" data-testid="status-card-details"><FileImage size={15} /> Add your name and role to unlock this card.</p>}
          {photo && <button type="button" className="action-button ghost" onClick={reset} style={{ width: '100%', marginTop: '9px' }} data-testid="button-reset"><RotateCcw size={16} /> start over with a new photo</button>}
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
